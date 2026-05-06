import { NextRequest, NextResponse } from 'next/server';
import { createClient, type SanityClient } from 'next-sanity';
import { apiVersion } from '@/sanity/env';

/**
 * POST /api/backup
 *
 * Snapshots every production document into a single `siteBackup`
 * document stored in the `staging` dataset. Backups live in staging
 * deliberately — if production is corrupted or wiped, the backups
 * still exist next door.
 *
 * Request body: { name?: string }
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

  let body: { name?: string };
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  try {
    const production = productionClient();
    const staging = stagingClient();

    /* Pull every document from production except other backups (which
       only live in staging anyway, but defence in depth) and Sanity
       system docs that re-create themselves on import. */
    const docs = await production.fetch<unknown[]>(
      `*[!(_type match "system.*") && _type != "siteBackup"]`,
    );

    const now = new Date().toISOString();
    const id = `siteBackup-${now.replace(/[:.]/g, '-')}`;

    await staging.createOrReplace({
      _id: id,
      _type: 'siteBackup',
      name: body.name ?? `Snapshot — ${new Date(now).toLocaleString('en-GB')}`,
      createdAt: now,
      docCount: docs.length,
      snapshotJson: JSON.stringify(docs),
    });

    return NextResponse.json({ ok: true, backup: { _id: id, docCount: docs.length, createdAt: now } });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: (err as Error).message ?? 'Unknown error' },
      { status: 500 },
    );
  }
}
