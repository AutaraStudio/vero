import { NextRequest, NextResponse } from 'next/server';
import { createClient, type SanityClient } from 'next-sanity';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { apiVersion } from '@/sanity/env';

/**
 * POST /api/sync-coming-soon
 *
 * Auto-mirror the comingSoon singleton from `staging` → `production`.
 * Triggered by a Sanity webhook on the staging dataset filtered to
 * `_type == "comingSoon"` (drafts + published, all CRUD operations).
 *
 * The whole point of the comingSoon toggle is "flip and it's live" —
 * no Push to Live Site click. The (site) layout already reads the doc
 * from the drafts perspective with cache: 'no-store', so once the doc
 * lands in the production dataset the live site picks it up on the
 * next request. This endpoint is what gets it from staging → production
 * automatically.
 *
 * Mirrors BOTH draft and published states so the perspective:'drafts'
 * lookup behaves identically in both environments. The webhook payload
 * `_id` may have a `drafts.` prefix (draft event) or none (published
 * event); we normalise to the underlying id and sync both versions
 * every time, regardless of which event fired.
 *
 * Auth: reuses SANITY_REVALIDATE_SECRET (same pattern as /api/sync-role
 * and /api/revalidate).
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

async function mirrorVersion(
  staging: SanityClient,
  production: SanityClient,
  fullId: string,
): Promise<'upserted' | 'deleted' | 'noop'> {
  const stagingDoc = await staging.getDocument(fullId);
  const prodDoc = await production.getDocument(fullId);

  if (!stagingDoc) {
    if (!prodDoc) return 'noop';
    if ((prodDoc as { _type?: string })._type !== 'comingSoon') {
      throw new Error(`Refusing to delete production doc of type ${(prodDoc as { _type?: string })._type}`);
    }
    await production.delete(fullId);
    return 'deleted';
  }

  if ((stagingDoc as { _type?: string })._type !== 'comingSoon') {
    throw new Error(`sync-coming-soon only handles comingSoon documents, got ${(stagingDoc as { _type?: string })._type}`);
  }

  const docToWrite = { ...stripSystemFields(stagingDoc as Record<string, unknown>), _id: fullId };
  await production.createOrReplace(docToWrite as { _id: string; _type: string });
  return 'upserted';
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

  try {
    /* Mirror BOTH the draft and the published version of the doc every
       time the webhook fires. Cheaper to do four reads + maybe two
       writes than to track which state changed and miss a delete. */
    const draftAction = await mirrorVersion(staging, production, draftId);
    const publishedAction = await mirrorVersion(staging, production, publishedId);

    return NextResponse.json({
      ok: true,
      _id: publishedId,
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
