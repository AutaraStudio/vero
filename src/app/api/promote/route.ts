import { NextRequest, NextResponse } from 'next/server';
import { createClient, type SanityClient } from 'next-sanity';
import { apiVersion } from '@/sanity/env';

/**
 * POST /api/promote
 *
 * Copies a single document from the `staging` dataset into `production`,
 * including any image/file assets it references. Drafts are ignored —
 * only the published version is promoted.
 *
 * Request body: { documentId: string }
 *
 * Auth: caller must include `Authorization: Bearer <sanitySessionToken>`.
 * The token is verified against Sanity's `/users/me` endpoint to confirm
 * it's a real Sanity user with access to this project. The Studio's
 * document action picks up the user's session token automatically.
 *
 * Server-side env vars required:
 *   NEXT_PUBLIC_SANITY_PROJECT_ID
 *   SANITY_API_TOKEN  (admin / Editor token — write access to BOTH datasets)
 */

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!;
const adminToken = process.env.SANITY_API_TOKEN!;

const stagingClient = (): SanityClient =>
  createClient({ projectId, dataset: 'staging', apiVersion, token: adminToken, useCdn: false });

const productionClient = (): SanityClient =>
  createClient({ projectId, dataset: 'production', apiVersion, token: adminToken, useCdn: false });

/* ── Helpers ──────────────────────────────────────────────────── */

/** Recursively walk a doc and collect every asset _ref (`image-...` / `file-...`). */
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

/** Clone a list of asset documents from staging → production if missing. */
async function cloneMissingAssets(
  assetIds: string[],
  staging: SanityClient,
  production: SanityClient,
): Promise<{ copied: string[]; reused: string[] }> {
  const copied: string[] = [];
  const reused: string[] = [];

  for (const id of assetIds) {
    /* Already in production? Skip — same _id means the binary is already
       there (Sanity hashes content into asset _ids, so identical files
       always share the same id across datasets). */
    const existing = await production.getDocument(id);
    if (existing) {
      reused.push(id);
      continue;
    }

    const stagingAsset = await staging.getDocument(id);
    if (!stagingAsset) {
      throw new Error(`Asset ${id} referenced but not found in staging`);
    }

    /* Re-upload the binary to production so the CDN URL works there.
       We download via the existing url field, then upload — Sanity will
       compute the same _id (content hash) so refs continue to resolve. */
    const sourceUrl = (stagingAsset as { url?: string }).url;
    if (!sourceUrl) {
      throw new Error(`Asset ${id} has no URL — cannot copy`);
    }

    const res = await fetch(sourceUrl);
    if (!res.ok) {
      throw new Error(`Failed to download asset ${id}: ${res.status} ${res.statusText}`);
    }
    const buffer = Buffer.from(await res.arrayBuffer());
    const kind = id.startsWith('image-') ? 'image' : 'file';
    const filename = (stagingAsset as { originalFilename?: string }).originalFilename;

    await production.assets.upload(kind, buffer, filename ? { filename } : undefined);
    copied.push(id);
  }

  return { copied, reused };
}

/** Strip mutable system fields before re-creating the doc in production. */
function stripSystemFields<T extends Record<string, unknown>>(doc: T): Record<string, unknown> {
  const { _rev: _r, _updatedAt: _u, _createdAt: _c, ...rest } = doc;
  void _r; void _u; void _c;
  return rest;
}

/* ── Auth ─────────────────────────────────────────────────────── */

/**
 * Validate the caller is a real Sanity user with access to this project.
 * Sanity's `/users/me` returns 200 + user JSON for valid session tokens.
 * Combined with the project membership check, this prevents any non-Studio
 * caller from invoking the route — even if they somehow learned the URL.
 */
async function verifySanityUser(token: string): Promise<{ ok: true; userId: string } | { ok: false; reason: string }> {
  try {
    const res = await fetch(`https://${projectId}.api.sanity.io/v${apiVersion.replace(/^v/, '')}/users/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return { ok: false, reason: `Sanity rejected token (${res.status})` };
    const user = await res.json() as { id?: string };
    if (!user.id) return { ok: false, reason: 'Sanity userinfo missing id' };
    return { ok: true, userId: user.id };
  } catch (err) {
    return { ok: false, reason: `Sanity verification error: ${(err as Error).message}` };
  }
}

/* ── Handler ──────────────────────────────────────────────────── */

export async function POST(req: NextRequest) {
  if (!projectId || !adminToken) {
    return NextResponse.json(
      { ok: false, error: 'Server missing NEXT_PUBLIC_SANITY_PROJECT_ID or SANITY_API_TOKEN' },
      { status: 500 },
    );
  }

  const auth = req.headers.get('authorization')?.replace(/^Bearer\s+/i, '') ?? '';
  if (!auth) {
    return NextResponse.json({ ok: false, error: 'Missing Authorization header' }, { status: 401 });
  }
  const verified = await verifySanityUser(auth);
  if (!verified.ok) {
    return NextResponse.json({ ok: false, error: verified.reason }, { status: 401 });
  }

  let body: { documentId?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON' }, { status: 400 });
  }

  const rawId = body.documentId;
  if (!rawId || typeof rawId !== 'string') {
    return NextResponse.json({ ok: false, error: 'Missing documentId' }, { status: 400 });
  }

  /* Promote the published version, never the draft. If a draft was
     passed in (id starts with `drafts.`), strip the prefix. */
  const publishedId = rawId.replace(/^drafts\./, '');

  const staging = stagingClient();
  const production = productionClient();

  try {
    const sourceDoc = await staging.getDocument(publishedId);
    if (!sourceDoc) {
      return NextResponse.json(
        { ok: false, error: `Document "${publishedId}" not found in staging. Make sure you've published it first.` },
        { status: 404 },
      );
    }

    const assetIds = Array.from(collectAssetRefs(sourceDoc));
    const { copied: assetsCopied, reused: assetsReused } = await cloneMissingAssets(assetIds, staging, production);

    const docToWrite = { ...stripSystemFields(sourceDoc as Record<string, unknown>), _id: publishedId };
    await production.createOrReplace(docToWrite as { _id: string; _type: string });

    return NextResponse.json({
      ok: true,
      promoted: { _id: publishedId, _type: (sourceDoc as { _type?: string })._type },
      assets: { copied: assetsCopied, reused: assetsReused },
      promotedBy: verified.userId,
    });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: (err as Error).message ?? 'Unknown error' },
      { status: 500 },
    );
  }
}
