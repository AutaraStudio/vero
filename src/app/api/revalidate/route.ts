import { revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';
import { createHmac, timingSafeEqual } from 'node:crypto';

/**
 * Sanity → Next.js revalidation webhook.
 *
 * Wired up so that when an editor publishes a change in Sanity Studio,
 * the corresponding page on the live site rebuilds within a few seconds —
 * no manual deploy needed.
 *
 * ── How it works ────────────────────────────────────────────────────
 * 1. Sanity Studio fires a webhook to this endpoint on any document
 *    publish / update / delete (configured in Sanity → Manage → API → Webhooks).
 * 2. We verify the shared secret (sent in the Authorization header).
 * 3. We inspect the document type + slug to decide which page(s) to invalidate.
 * 4. revalidatePath() flushes Next.js's static cache for those routes —
 *    the next visitor gets fresh content.
 *
 * ── Environment variable required ───────────────────────────────────
 *   SANITY_REVALIDATE_SECRET=<long-random-string>
 *
 * Set this in Netlify → Site Settings → Environment variables, AND in
 * Sanity Studio → Manage → API → Webhooks → Secret. The two must match.
 *
 * ── Sanity Studio webhook config ────────────────────────────────────
 *   • Name:          Live revalidation
 *   • URL:           https://www.veroassess.com/api/revalidate
 *   • Dataset:       production
 *   • Trigger on:    Create + Update + Delete
 *   • Filter:        (leave blank — all document types)
 *   • Projection:    {_id, _type, "slug": slug.current}
 *   • Status:        Enabled
 *   • HTTP method:   POST
 *   • API version:   v2024-09-01 (or latest)
 *   • Secret:        same value as SANITY_REVALIDATE_SECRET above
 */

interface SanityWebhookPayload {
  _id?: string;
  _type?: string;
  slug?: string | null;
}

/* Map Sanity document types → site paths to invalidate. Singletons map
   to a single fixed path; collection types (jobCategory, role) map to
   the listing + the per-item slug. */
function pathsForDocument(doc: SanityWebhookPayload): { paths: string[]; layoutScopes: string[] } {
  const paths: string[] = [];
  const layoutScopes: string[] = [];

  /* pageSeo docs are companion documents with deterministic IDs like
     "homePage.seo", "aboutPage.seo". Map them back to the parent page
     type and recurse so the SEO change invalidates the right route. */
  if (doc._type === 'pageSeo' && doc._id?.endsWith('.seo')) {
    const parentType = doc._id.replace(/\.seo$/, '');
    return pathsForDocument({ _type: parentType });
  }

  switch (doc._type) {
    case 'homePage':
      paths.push('/');
      break;
    case 'aboutPage':
      paths.push('/about');
      break;
    case 'pricingPage':
      paths.push('/pricing');
      break;
    case 'contactPage':
      paths.push('/contact');
      break;
    case 'howItWorksPage':
      paths.push('/how-it-works');
      break;
    case 'sciencePage':
      paths.push('/resources/science');
      break;
    case 'compliancePage':
      paths.push('/resources/compliance');
      break;
    case 'assessmentsPage':
      paths.push('/assessments');
      break;

    case 'jobCategory':
      paths.push('/assessments');
      if (doc.slug) paths.push(`/assessments/${doc.slug}`);
      break;

    case 'role':
      /* Roles render inside their parent category page — no individual
         route. We don't know the parent category from the webhook payload,
         so just bust the listing as a safe net. The category page picks
         up roles via reference + will rebuild on its next request. */
      paths.push('/assessments');
      break;

    case 'pricingTier':
      paths.push('/pricing');
      break;

    case 'siteSettings':
      /* Site settings affect the global header, footer, and SEO defaults
         on every page — invalidate the root layout so all pages refresh. */
      layoutScopes.push('/');
      break;

    default:
      /* Unknown type — be safe, invalidate everything via root layout. */
      layoutScopes.push('/');
      break;
  }

  return { paths, layoutScopes };
}

/**
 * Verify Sanity's HMAC signature header.
 * Format: `sanity-webhook-signature: t=<timestamp>,v1=<base64url-sig>`
 * Signature is HMAC-SHA256 of `${timestamp}.${rawBody}` using the secret.
 */
function verifySanitySignature(
  signatureHeader: string,
  rawBody: string,
  secret: string,
): boolean {
  const parts = Object.fromEntries(
    signatureHeader.split(',').map((p) => {
      const [k, ...rest] = p.trim().split('=');
      return [k, rest.join('=')];
    }),
  );
  const timestamp = parts.t;
  const provided  = parts.v1;
  if (!timestamp || !provided) return false;

  const expected = createHmac('sha256', secret)
    .update(`${timestamp}.${rawBody}`)
    .digest('base64url');

  /* Constant-time compare to prevent timing attacks */
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export async function POST(req: NextRequest) {
  /* ── 1. Authorise ──
     Three accepted modes (any one passes):
     a) Sanity HMAC signature header (sanity-webhook-signature) — what
        real Sanity webhooks actually send when you set the Secret field
        in the webhook config. This is the secure default.
     b) Authorization: Bearer <secret> — for compatibility / curl tests
     c) ?secret=<secret> query string — for the GET handler + curl tests
  */
  const expectedSecret = process.env.SANITY_REVALIDATE_SECRET;
  if (!expectedSecret) {
    return NextResponse.json(
      { ok: false, error: 'SANITY_REVALIDATE_SECRET not configured on the server' },
      { status: 500 },
    );
  }

  /* Read the raw body once — both signature verification AND JSON parsing
     need it. NextRequest.json() consumes the stream so we can't use it
     after also calling .text(). */
  const rawBody = await req.text();

  const sigHeader     = req.headers.get('sanity-webhook-signature');
  const authHeader    = req.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
  const querySecret   = req.nextUrl.searchParams.get('secret');

  const isAuthorised =
    (sigHeader && verifySanitySignature(sigHeader, rawBody, expectedSecret)) ||
    authHeader === expectedSecret ||
    querySecret === expectedSecret;

  if (!isAuthorised) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  /* ── 2. Parse + decide what to invalidate ── */
  let body: SanityWebhookPayload;
  try {
    body = JSON.parse(rawBody || '{}') as SanityWebhookPayload;
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON body' }, { status: 400 });
  }

  const { paths, layoutScopes } = pathsForDocument(body);

  /* ── 3. Invalidate ── */
  for (const path of paths) {
    revalidatePath(path);
  }
  for (const path of layoutScopes) {
    revalidatePath(path, 'layout');
  }

  /* (Tag-based revalidation skipped — Next.js's revalidateTag signature
     varies across versions and our fetches don't currently use tags
     anyway. revalidatePath above is sufficient.) */

  return NextResponse.json({
    ok: true,
    revalidated: { paths, layoutScopes },
    docType: body._type,
    docId: body._id,
  });
}

/* GET handler — useful for manually testing the endpoint from a browser
   without firing a real Sanity webhook. Visit:
     https://www.veroassess.com/api/revalidate?secret=YOUR_SECRET&type=homePage
   to manually invalidate a doc type. */
export async function GET(req: NextRequest) {
  const expectedSecret = process.env.SANITY_REVALIDATE_SECRET;
  const querySecret    = req.nextUrl.searchParams.get('secret');
  const docType        = req.nextUrl.searchParams.get('type');
  const slug           = req.nextUrl.searchParams.get('slug');

  if (!expectedSecret || querySecret !== expectedSecret) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }
  if (!docType) {
    return NextResponse.json(
      { ok: false, error: 'Missing ?type=<documentType> query param' },
      { status: 400 },
    );
  }

  const { paths, layoutScopes } = pathsForDocument({ _type: docType, slug });

  for (const path of paths) revalidatePath(path);
  for (const path of layoutScopes) revalidatePath(path, 'layout');

  return NextResponse.json({
    ok: true,
    manual: true,
    revalidated: { paths, layoutScopes },
    docType,
    slug,
  });
}
