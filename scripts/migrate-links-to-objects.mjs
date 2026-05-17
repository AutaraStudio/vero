/**
 * Migrate every string href field in the dataset to the new `link` object
 * structure. Run once per dataset after the schema/query changes are in
 * place.
 *
 * What it does for each href:
 *   - Already an object (has `.type`) → leaves it alone (idempotent)
 *   - "" / null / undefined → sets to empty link object
 *   - Starts with http:// https:// mailto: tel: → external
 *   - Matches a Sanity-backed dynamic route (/legal/x, /assessments/x,
 *     /assessments/x/y) → resolves to a reference if the slug exists
 *   - Otherwise → internal (static route value)
 *
 * For nav/footer link arrays the script also folds the legacy `external`
 * boolean into the new link's `openInNewTab` and removes the orphan
 * boolean field.
 *
 * Idempotent — safe to re-run; already-migrated fields are skipped.
 *
 * Usage:
 *   node --env-file=.env.local scripts/migrate-links-to-objects.mjs --dataset staging
 *   node --env-file=.env.local scripts/migrate-links-to-objects.mjs --dataset production
 *   add --dry-run to see what would change without writing
 */
import { createClient } from '@sanity/client';

const datasetFlag = process.argv.indexOf('--dataset');
const dataset = datasetFlag >= 0 ? process.argv[datasetFlag + 1] : null;
const dryRun = process.argv.includes('--dry-run');

if (!dataset) {
  console.error('Missing --dataset flag. Pass --dataset staging or --dataset production.');
  process.exit(1);
}
if (dataset !== 'staging' && dataset !== 'production') {
  console.error(`Refusing to run against dataset "${dataset}".`);
  process.exit(1);
}

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset,
  apiVersion: '2024-09-01',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
});

/* ──────────────────────────────────────────────────────────────
   Per-doc-type migration plan.
   `simple` = top-level href fields.
   `arrays` = arrays of objects, with the href field inside each entry,
              plus an optional legacy `external` boolean to fold in.
   `sectionObjects` = embedded contentSection-style objects whose
              `ctaHref` field needs migrating in place.
────────────────────────────────────────────────────────────── */
const PLAN = {
  homePage: {
    simple: ['heroCTAHref', 'heroSecondaryCTAHref', 'uspsCtaHref', 'pricingCtaHref'],
    arrays: [{ path: 'steps', href: 'ctaHref' }],
    sectionObjects: ['introSection'],
  },
  pricingPage: { simple: ['heroCTAHref', 'heroSecondaryCTAHref', 'bespokeCtaHref'] },
  assessmentsPage: { simple: ['heroCTAHref', 'heroSecondaryCTAHref'] },
  aboutPage: {
    simple: ['heroCTAHref', 'heroSecondaryCTAHref'],
    sectionObjects: ['tazioEvolutionSection', 'candidateExperiencesSection'],
  },
  howItWorksPage: {
    simple: ['heroCTAHref', 'heroSecondaryCTAHref', 'benefitsLinkHref'],
    sectionObjects: ['gettingStartedSection', 'candidateExperienceSection'],
  },
  sciencePage: {
    simple: ['heroCTAHref', 'heroSecondaryCTAHref', 'ctaHref'],
    sectionObjects: ['authenticSection', 'insightsSection'],
  },
  compliancePage: {
    simple: ['heroCTAHref', 'heroSecondaryCTAHref'],
    sectionObjects: ['aiSection'],
  },
  jobCategory: {
    simple: ['heroCTAHref', 'heroSecondaryCTAHref', 'bespokeCTAHref'],
    sectionObjects: ['dimensionsSectionContent'],
  },
  globalNav: {
    simple: ['ctaHref', 'secondaryCtaHref'],
    sectionObjects: ['companyCard'],
    arrays: [
      { path: 'topItems', href: 'href', legacyExternal: 'external' },
      { path: 'companyColumns', innerArray: 'links', href: 'href', legacyExternal: 'external' },
    ],
  },
  globalFooter: {
    simple: ['ctaPrimaryHref', 'ctaSecondaryHref'],
    arrays: [
      { path: 'linkColumns', innerArray: 'links', href: 'href', legacyExternal: 'external' },
      { path: 'legalLinks', href: 'href', legacyExternal: 'external' },
    ],
  },
};

/* The static-route picker on the new link type. Used to flag whether
   a string path is one of the curated internal options (so the editor
   sees the right radio + dropdown selection after migration). */
const STATIC_ROUTES = new Set([
  '/',
  '/pricing',
  '/how-it-works',
  '/assessments',
  '/about',
  '/contact',
  '/resources/science',
  '/resources/compliance',
  '/get-started',
  '/get-started/bespoke',
]);

/* ──────────────────────────────────────────────────────────────
   Build a slug-to-ref map for every dynamic-route doc type so the
   migration can upgrade a string like "/legal/privacy" into a proper
   reference (which then follows the doc if the slug ever changes).
────────────────────────────────────────────────────────────── */
async function buildSlugMaps() {
  const [legal, categories, roles] = await Promise.all([
    client.fetch(`*[_type == "legalPage" && defined(slug.current)]{ _id, "slug": slug.current }`),
    client.fetch(`*[_type == "jobCategory" && defined(slug.current)]{ _id, "slug": slug.current }`),
    client.fetch(
      `*[_type == "role" && defined(slug.current) && defined(parentCategory)]{
        _id,
        "slug": slug.current,
        "categorySlug": parentCategory->slug.current
      }`,
    ),
  ]);

  const legalMap = new Map(legal.map((d) => [d.slug, d._id]));
  const categoryMap = new Map(categories.map((d) => [d.slug, d._id]));
  const roleMap = new Map(
    roles
      .filter((d) => d.categorySlug)
      .map((d) => [`${d.categorySlug}/${d.slug}`, d._id]),
  );

  return { legalMap, categoryMap, roleMap };
}

/* ──────────────────────────────────────────────────────────────
   Convert one string value into a link object. Returns null if the
   value is already a link object (so the caller can skip the patch). */
function stringToLink(value, slugMaps, legacyExternal = false) {
  // Already migrated — leave it
  if (value && typeof value === 'object' && typeof value.type === 'string') {
    return null;
  }

  // Empty → empty link object
  if (!value || typeof value !== 'string' || value.trim() === '') {
    return { _type: 'link', type: 'internal', internal: '/', openInNewTab: false };
  }

  const trimmed = value.trim();

  // External URL
  if (/^(https?:|mailto:|tel:)/i.test(trimmed)) {
    return { _type: 'link', type: 'external', external: trimmed, openInNewTab: legacyExternal };
  }

  // Sanity-backed reference: /legal/[slug]
  const legalMatch = trimmed.match(/^\/legal\/([^/?#]+)\/?$/);
  if (legalMatch) {
    const docId = slugMaps.legalMap.get(legalMatch[1]);
    if (docId) {
      return {
        _type: 'link',
        type: 'reference',
        reference: { _type: 'reference', _ref: docId },
        openInNewTab: legacyExternal,
      };
    }
  }

  // Sanity-backed reference: /assessments/[catSlug]/[roleSlug]
  const roleMatch = trimmed.match(/^\/assessments\/([^/?#]+)\/([^/?#]+)\/?$/);
  if (roleMatch) {
    const key = `${roleMatch[1]}/${roleMatch[2]}`;
    const docId = slugMaps.roleMap.get(key);
    if (docId) {
      return {
        _type: 'link',
        type: 'reference',
        reference: { _type: 'reference', _ref: docId },
        openInNewTab: legacyExternal,
      };
    }
  }

  // Sanity-backed reference: /assessments/[catSlug]
  const catMatch = trimmed.match(/^\/assessments\/([^/?#]+)\/?$/);
  if (catMatch) {
    const docId = slugMaps.categoryMap.get(catMatch[1]);
    if (docId) {
      return {
        _type: 'link',
        type: 'reference',
        reference: { _type: 'reference', _ref: docId },
        openInNewTab: legacyExternal,
      };
    }
  }

  // Internal — drop trailing slash and normalize to a known route if possible
  const normalized = trimmed === '/' ? '/' : trimmed.replace(/\/$/, '');
  const matchedStatic = STATIC_ROUTES.has(normalized) ? normalized : trimmed;

  return {
    _type: 'link',
    type: 'internal',
    internal: matchedStatic,
    openInNewTab: legacyExternal,
  };
}

/* Patch-builder for a single document. Returns null if nothing to change. */
function buildPatch(doc, slugMaps) {
  const plan = PLAN[doc._type];
  if (!plan) return null;

  const set = {};
  const unset = [];

  // Top-level simple fields
  for (const field of plan.simple ?? []) {
    const link = stringToLink(doc[field], slugMaps);
    if (link !== null) set[field] = link;
  }

  // Section objects (contentSection-shaped) — patch their inner ctaHref
  for (const sectionField of plan.sectionObjects ?? []) {
    const section = doc[sectionField];
    if (section && typeof section === 'object') {
      const innerLink = stringToLink(section.ctaHref, slugMaps);
      if (innerLink !== null) set[`${sectionField}.ctaHref`] = innerLink;
    }
  }

  // Array members (nav/footer-style)
  for (const arr of plan.arrays ?? []) {
    const items = doc[arr.path];
    if (!Array.isArray(items)) continue;

    items.forEach((item, i) => {
      if (arr.innerArray) {
        // Nested case: e.g. companyColumns[].links[]
        const inner = item?.[arr.innerArray];
        if (!Array.isArray(inner)) return;
        inner.forEach((innerItem, j) => {
          const legacyExt = arr.legacyExternal
            ? Boolean(innerItem?.[arr.legacyExternal])
            : false;
          const link = stringToLink(innerItem?.[arr.href], slugMaps, legacyExt);
          if (link !== null) {
            set[`${arr.path}[${i}].${arr.innerArray}[${j}].${arr.href}`] = link;
            if (arr.legacyExternal && arr.legacyExternal in (innerItem ?? {})) {
              unset.push(`${arr.path}[${i}].${arr.innerArray}[${j}].${arr.legacyExternal}`);
            }
          }
        });
      } else {
        const legacyExt = arr.legacyExternal
          ? Boolean(item?.[arr.legacyExternal])
          : false;
        const link = stringToLink(item?.[arr.href], slugMaps, legacyExt);
        if (link !== null) {
          set[`${arr.path}[${i}].${arr.href}`] = link;
          if (arr.legacyExternal && arr.legacyExternal in (item ?? {})) {
            unset.push(`${arr.path}[${i}].${arr.legacyExternal}`);
          }
        }
      }
    });
  }

  if (Object.keys(set).length === 0 && unset.length === 0) return null;
  return { set, unset };
}

/* ──────────────────────────────────────────────────────────────
   MAIN
────────────────────────────────────────────────────────────── */
async function main() {
  console.log(`\n🔗 Link migration — dataset "${dataset}"${dryRun ? ' (dry run)' : ''}\n`);

  const slugMaps = await buildSlugMaps();
  console.log(
    `  Resolved slugs: ${slugMaps.legalMap.size} legal · ${slugMaps.categoryMap.size} categories · ${slugMaps.roleMap.size} roles\n`,
  );

  const docTypes = Object.keys(PLAN);
  const docs = await client.fetch(
    `*[_type in $types]{ ..., _type, _id }`,
    { types: docTypes },
  );

  let touched = 0;
  let unchanged = 0;

  for (const doc of docs) {
    const patch = buildPatch(doc, slugMaps);
    if (!patch) {
      unchanged++;
      continue;
    }

    const summary = [
      ...Object.keys(patch.set).map((k) => `set ${k}`),
      ...patch.unset.map((k) => `unset ${k}`),
    ].join(', ');
    console.log(`  ${doc._type} ${doc._id} — ${summary}`);

    if (!dryRun) {
      let p = client.patch(doc._id);
      if (Object.keys(patch.set).length) p = p.set(patch.set);
      if (patch.unset.length) p = p.unset(patch.unset);
      await p.commit({ autoGenerateArrayKeys: true });
    }
    touched++;
  }

  console.log(
    `\n✓ Done — ${touched} doc${touched === 1 ? '' : 's'} patched, ${unchanged} unchanged${dryRun ? ' (no writes performed)' : ''}\n`,
  );
}

main().catch((err) => {
  console.error('\n✗ Migration failed:', err);
  process.exit(1);
});
