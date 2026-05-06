import { NextRequest, NextResponse } from 'next/server';
import { createClient, type SanityClient } from 'next-sanity';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { apiVersion } from '@/sanity/env';

/**
 * POST /api/sync-role
 *
 * Auto-mirror a single role document from `staging` → `production`.
 * Triggered by a Sanity webhook on the staging dataset filtered to
 * `_type == "role"` (Create + Update + Delete).
 *
 * Roles intentionally bypass the Push to Live workflow — they are simple
 * reference data, not pages, and an extra confirmation step per role is
 * friction the editor doesn't need. The website + HubSpot dropdown both
 * follow staging directly, so a delete in Studio cleans up everywhere.
 *
 * For create/update: assets are cloned, doc is createOrReplaced.
 * For delete: webhook payload still has _id, doc no longer exists in
 * staging, so we delete from production.
 *
 * Auth: reuses SANITY_REVALIDATE_SECRET (same pattern as /api/revalidate).
 */

export const maxDuration = 30;

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!;
const adminToken = process.env.SANITY_API_TOKEN!;

const stagingClient = (): SanityClient =>
  createClient({ projectId, dataset: 'staging', apiVersion, token: adminToken, useCdn: false });

const productionClient = (): SanityClient =>
  createClient({ projectId, dataset: 'production', apiVersion, token: adminToken, useCdn: false });

interface WebhookPayload {
  _id?: string;
  _type?: string;
}

function collectAssetRefs(value: unknown, refs: Set<string> = new Set()): Set<string> {
  if (!value || typeof value !== 'object') return refs;
  if (Array.isArray(value)) {
    for (const item of value) collectAssetRefs(item, refs);
    return refs;
  }
  const obj = value as Record<string, unknown>;
  if (typeof obj._ref === 'string' && (obj._ref.startsWith('image-') || obj._ref.startsWith('file-'))) {
    refs.add(obj._ref);
  }
  for (const v of Object.values(obj)) collectAssetRefs(v, refs);
  return refs;
}

async function cloneMissingAssets(
  assetIds: string[],
  staging: SanityClient,
  production: SanityClient,
): Promise<void> {
  for (const id of assetIds) {
    const existing = await production.getDocument(id);
    if (existing) continue;

    const stagingAsset = await staging.getDocument(id);
    if (!stagingAsset) continue;

    const sourceUrl = (stagingAsset as { url?: string }).url;
    if (!sourceUrl) continue;

    const res = await fetch(sourceUrl);
    if (!res.ok) throw new Error(`Failed to download asset ${id}: ${res.status}`);
    const buffer = Buffer.from(await res.arrayBuffer());
    const kind = id.startsWith('image-') ? 'image' : 'file';
    const filename = (stagingAsset as { originalFilename?: string }).originalFilename;
    await production.assets.upload(kind, buffer, filename ? { filename } : undefined);
  }
}

function stripSystemFields<T extends Record<string, unknown>>(doc: T): Record<string, unknown> {
  const { _rev: _r, _updatedAt: _u, _createdAt: _c, ...rest } = doc;
  void _r; void _u; void _c;
  return rest;
}

function verifySanitySignature(signatureHeader: string, rawBody: string, secret: string): boolean {
  const parts = Object.fromEntries(
    signatureHeader.split(',').map((p) => {
      const [k, ...rest] = p.trim().split('=');
      return [k, rest.join('=')];
    }),
  );
  const timestamp = parts.t;
  const provided = parts.v1;
  if (!timestamp || !provided) return false;
  const expected = createHmac('sha256', secret).update(`${timestamp}.${rawBody}`).digest('base64url');
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export async function POST(req: NextRequest) {
  if (!projectId || !adminToken) {
    return NextResponse.json(
      { ok: false, error: 'Server missing NEXT_PUBLIC_SANITY_PROJECT_ID or SANITY_API_TOKEN' },
      { status: 500 },
    );
  }

  const expectedSecret = process.env.SANITY_REVALIDATE_SECRET;
  if (!expectedSecret) {
    return NextResponse.json(
      { ok: false, error: 'SANITY_REVALIDATE_SECRET not configured on the server' },
      { status: 500 },
    );
  }

  const rawBody = await req.text();

  const sigHeader = req.headers.get('sanity-webhook-signature');
  const authHeader = req.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
  const isAuthorised =
    (sigHeader && verifySanitySignature(sigHeader, rawBody, expectedSecret)) ||
    authHeader === expectedSecret;
  if (!isAuthorised) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  let body: WebhookPayload;
  try {
    body = JSON.parse(rawBody || '{}') as WebhookPayload;
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON body' }, { status: 400 });
  }

  const rawId = body._id;
  if (!rawId) {
    return NextResponse.json({ ok: false, error: 'Missing _id in payload' }, { status: 400 });
  }
  const publishedId = rawId.replace(/^drafts\./, '');

  const staging = stagingClient();
  const production = productionClient();

  try {
    const sourceDoc = await staging.getDocument(publishedId);

    if (!sourceDoc) {
      /* Deleted in staging — remove from production too. Defensive: only
         delete if the production doc is still a role, never something we
         got tricked into deleting via a forged payload. */
      const prodDoc = await production.getDocument(publishedId);
      if (!prodDoc) {
        return NextResponse.json({ ok: true, action: 'noop-already-absent', _id: publishedId });
      }
      if ((prodDoc as { _type?: string })._type !== 'role') {
        return NextResponse.json(
          { ok: false, error: `Refusing to delete production doc of type ${(prodDoc as { _type?: string })._type}` },
          { status: 400 },
        );
      }
      await production.delete(publishedId);
      return NextResponse.json({ ok: true, action: 'deleted', _id: publishedId });
    }

    if ((sourceDoc as { _type?: string })._type !== 'role') {
      return NextResponse.json(
        { ok: false, error: 'sync-role only handles role documents' },
        { status: 400 },
      );
    }

    const assetIds = Array.from(collectAssetRefs(sourceDoc));
    await cloneMissingAssets(assetIds, staging, production);

    const docToWrite = { ...stripSystemFields(sourceDoc as Record<string, unknown>), _id: publishedId };
    await production.createOrReplace(docToWrite as { _id: string; _type: string });

    return NextResponse.json({ ok: true, action: 'upserted', _id: publishedId, assetCount: assetIds.length });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: (err as Error).message ?? 'Unknown error' },
      { status: 500 },
    );
  }
}
