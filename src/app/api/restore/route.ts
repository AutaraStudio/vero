import { NextRequest, NextResponse } from 'next/server';
import { createClient, type SanityClient } from 'next-sanity';
import { apiVersion } from '@/sanity/env';

/**
 * POST /api/restore
 *
 * Restores production from a `siteBackup` document stored in the
 * `staging` dataset. Replays every document in the snapshot back
 * into production via createOrReplace.
 *
 * Request body: { backupId: string }
 *
 * Asset references inside restored docs continue to resolve as long
 * as the asset binaries themselves still exist in production. We
 * don't re-upload binaries here — Sanity's per-doc history already
 * covers single-doc edits, and a restore is the right tool when the
 * documents are wrong, not the asset library.
 *
 * Auth: same origin allow-list as /api/promote.
 */

export const maxDuration = 60;

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!;
const adminToken = process.env.SANITY_API_TOKEN!;

const stagingClient = (): SanityClient =>
  createClient({ projectId, dataset: 'staging', apiVersion, token: adminToken, useCdn: false });

const productionClient = (): SanityClient =>
  createClient({ projectId, dataset: 'production', apiVersion, token: adminToken, useCdn: false });

const ALLOWED_ORIGINS = new Set<string>([
  'http://localhost:3000',
  'http://localhost:3001',
  'https://www.veroassess.com',
  'https://veroassess.com',
  'https://staging--vero-assess-staging.netlify.app',
  'https://vero-assess-staging.netlify.app',
]);

function isOriginAllowed(req: NextRequest): boolean {
  const origin = req.headers.get('origin') ?? '';
  if (!origin) {
    const referer = req.headers.get('referer') ?? '';
    try {
      return ALLOWED_ORIGINS.has(new URL(referer).origin);
    } catch {
      return false;
    }
  }
  return ALLOWED_ORIGINS.has(origin);
}

interface SanityDoc {
  _id: string;
  _type: string;
  _rev?: string;
  _createdAt?: string;
  _updatedAt?: string;
  [key: string]: unknown;
}

function stripSystemFields(doc: SanityDoc): SanityDoc {
  const { _rev: _r, _updatedAt: _u, _createdAt: _c, ...rest } = doc;
  void _r; void _u; void _c;
  return rest as SanityDoc;
}

export async function POST(req: NextRequest) {
  if (!projectId || !adminToken) {
    return NextResponse.json(
      { ok: false, error: 'Server missing NEXT_PUBLIC_SANITY_PROJECT_ID or SANITY_API_TOKEN' },
      { status: 500 },
    );
  }
  if (!isOriginAllowed(req)) {
    return NextResponse.json({ ok: false, error: 'Origin not allowed' }, { status: 403 });
  }

  let body: { backupId?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON' }, { status: 400 });
  }

  const backupId = body.backupId;
  if (!backupId || typeof backupId !== 'string') {
    return NextResponse.json({ ok: false, error: 'Missing backupId' }, { status: 400 });
  }

  try {
    const staging = stagingClient();
    const production = productionClient();

    const backup = await staging.getDocument(backupId);
    if (!backup || (backup as { _type?: string })._type !== 'siteBackup') {
      return NextResponse.json(
        { ok: false, error: `Backup "${backupId}" not found in staging` },
        { status: 404 },
      );
    }

    const json = (backup as { snapshotJson?: string }).snapshotJson;
    if (!json) {
      return NextResponse.json(
        { ok: false, error: 'Backup has no snapshot data' },
        { status: 422 },
      );
    }

    let docs: SanityDoc[];
    try {
      docs = JSON.parse(json) as SanityDoc[];
    } catch {
      return NextResponse.json(
        { ok: false, error: 'Backup snapshot data is not valid JSON' },
        { status: 422 },
      );
    }
    if (!Array.isArray(docs)) {
      return NextResponse.json(
        { ok: false, error: 'Backup snapshot is not an array of documents' },
        { status: 422 },
      );
    }

    /* Restore in a single transaction so it either fully applies or
       fully fails. createOrReplace is idempotent — re-running a
       restore from the same snapshot is safe. */
    const tx = production.transaction();
    for (const doc of docs) {
      if (!doc?._id || !doc?._type) continue;
      tx.createOrReplace(stripSystemFields(doc));
    }
    await tx.commit();

    return NextResponse.json({
      ok: true,
      restored: { backupId, docCount: docs.length },
    });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: (err as Error).message ?? 'Unknown error' },
      { status: 500 },
    );
  }
}
