import { NextRequest, NextResponse } from 'next/server';
import { createClient, type SanityClient } from 'next-sanity';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { apiVersion } from '@/sanity/env';

/**
 * POST /api/sync-role
 *
 * Auto-mirror documents from `staging` → `production`. Despite the name
 * (kept for backwards-compatibility with the existing webhook URL), this
 * endpoint handles two document types that bypass the Push to Live
 * workflow:
 *
 *   • `role` — assets cloned, published version mirrored. Roles are
 *     reference data (small, frequently edited) where the per-role
 *     publish-and-promote cycle is friction.
 *
 *   • `comingSoon` — both draft and published versions mirrored. The
 *     toggle-and-it's-live UX hinges on production reading the staging
 *     draft via perspective:'drafts'; this sync is what lands the draft
 *     in the production dataset for that read to find.
 *
 * Triggered by a single Sanity webhook on the staging dataset filtered to
 * `_type in ["role", "comingSoon"]` (Create + Update + Delete + drafts).
 * Sharing one webhook keeps us under Sanity's free webhook quota.
 *
 * Auth: reuses SANITY_REVALIDATE_SECRET (same pattern as /api/revalidate).
 */

const ALLOWED_TYPES = ['role', 'comingSoon'] as const;
type AllowedType = (typeof ALLOWED_TYPES)[number];

function isAllowedType(t: unknown): t is AllowedType {
  return typeof t === 'string' && (ALLOWED_TYPES as readonly string[]).includes(t);
}

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
  const draftId = `drafts.${publishedId}`;

  const staging = stagingClient();
  const production = productionClient();

  /* Identify the doc type. The staging draft (if present) is the most
     authoritative because the comingSoon toggle is edited as a draft;
     fall back to published, then to the production-side doc as a last
     resort for delete events where everything's gone from staging. */
  const stagingDraft = await staging.getDocument(draftId);
  const stagingPublished = await staging.getDocument(publishedId);
  const productionPublished = await production.getDocument(publishedId);

  const docType =
    (stagingDraft as { _type?: string } | null)?._type ??
    (stagingPublished as { _type?: string } | null)?._type ??
    (productionPublished as { _type?: string } | null)?._type;

  if (!isAllowedType(docType)) {
    return NextResponse.json(
      { ok: false, error: `sync only handles ${ALLOWED_TYPES.join(', ')} documents (got ${docType})` },
      { status: 400 },
    );
  }

  try {
    if (docType === 'role') {
      /* Roles: only the published version matters on production. The
         staging Studio's publish-on-save flow already collapses drafts
         into published before we see the webhook. */
      if (!stagingPublished) {
        if (!productionPublished) {
          return NextResponse.json({ ok: true, action: 'noop-already-absent', _id: publishedId });
        }
        await production.delete(publishedId);
        return NextResponse.json({ ok: true, action: 'deleted', _id: publishedId });
      }

      const assetIds = Array.from(collectAssetRefs(stagingPublished));
      await cloneMissingAssets(assetIds, staging, production);

      const docToWrite = { ...stripSystemFields(stagingPublished as Record<string, unknown>), _id: publishedId };
      await production.createOrReplace(docToWrite as { _id: string; _type: string });
      return NextResponse.json({ ok: true, action: 'upserted', _id: publishedId, assetCount: assetIds.length });
    }

    /* comingSoon — mirror BOTH draft and published states so the
       perspective:'drafts' lookup on production behaves identically
       to staging. The toggle's UX is "flip and it's live" without a
       publish click, which means the draft IS the source of truth. */
    const draftAction = await mirrorComingSoonVersion(staging, production, draftId, stagingDraft);
    const publishedAction = await mirrorComingSoonVersion(
      staging,
      production,
      publishedId,
      stagingPublished,
    );
    return NextResponse.json({
      ok: true,
      _id: publishedId,
      type: 'comingSoon',
      draft: draftAction,
      published: publishedAction,
    });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: (err as Error).message ?? 'Unknown error' },
      { status: 500 },
    );
  }
}

async function mirrorComingSoonVersion(
  staging: SanityClient,
  production: SanityClient,
  fullId: string,
  stagingDoc: unknown,
): Promise<'upserted' | 'deleted' | 'noop'> {
  if (!stagingDoc) {
    const prodDoc = await production.getDocument(fullId);
    if (!prodDoc) return 'noop';
    if ((prodDoc as { _type?: string })._type !== 'comingSoon') {
      throw new Error(`Refusing to delete production doc of type ${(prodDoc as { _type?: string })._type}`);
    }
    await production.delete(fullId);
    return 'deleted';
  }
  void staging;
  const docToWrite = { ...stripSystemFields(stagingDoc as Record<string, unknown>), _id: fullId };
  await production.createOrReplace(docToWrite as { _id: string; _type: string });
  return 'upserted';
}
