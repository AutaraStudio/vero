/**
 * Phase 1b migration — copy legacy section field groups into the new
 * unified `contentSection` shape.
 *
 * For each entry in MIGRATIONS, the script:
 *   1. Reads the legacy fields off every matching doc (published + draft if it exists)
 *   2. Builds a contentSection object — eyebrow / heading / body / media / cta / layout
 *   3. Writes it to the new target field on both versions
 *
 * Legacy fields are NOT removed yet. Phase 3 will retire them after the
 * frontend has switched over and the live result has been verified.
 *
 * Re-running is safe — the target field is overwritten with the same
 * value derived from the legacy fields, so the operation is idempotent
 * as long as no editor has hand-written into the new field in between.
 *
 * Usage:
 *   node --env-file=.env.local scripts/migrate-content-sections.mjs --dataset staging
 *   node --env-file=.env.local scripts/migrate-content-sections.mjs --dataset production
 */
import { createClient } from '@sanity/client';
import { randomBytes } from 'node:crypto';

const datasetFlag = process.argv.indexOf('--dataset');
const dataset = datasetFlag >= 0 ? process.argv[datasetFlag + 1] : null;
if (!dataset) {
  console.error('Missing --dataset flag. Pass --dataset staging or --dataset production.');
  process.exit(1);
}
if (dataset !== 'staging' && dataset !== 'production') {
  console.error(`Refusing to run against dataset "${dataset}" — only staging or production are allowed.`);
  process.exit(1);
}

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset,
  apiVersion: '2024-09-01',
  token:     process.env.SANITY_API_TOKEN,
  useCdn:    false,
});

/* ──────────────────────────────────────────────────────────────
   MIGRATION TABLE
   Each entry describes one section → contentSection mapping.
   `eyebrow` can be a string literal (hardcoded in today's frontend)
   or a field name read off the doc. Layout matches what the
   current page.tsx passes to <IntroBlock />. */
const MIGRATIONS = [
  {
    type: 'homePage',
    target: 'introSection',
    eyebrowField: 'introBlockEyebrow',
    heading: 'introBlockHeading',
    body:    'introBlockBody',
    media:   'introBlockMedia',
    cta:     { label: 'introBlockCtaLabel', href: 'introBlockCtaHref' },
    layout:  'split',
  },
  {
    type: 'aboutPage',
    target: 'tazioEvolutionSection',
    eyebrow: 'Tazio',
    heading: 'tazioEvolutionHeading',
    body:    'tazioEvolutionBody',
    media:   'tazioEvolutionMedia',
    cta:     { label: 'tazioEvolutionCTALabel', href: 'tazioEvolutionCTAHref' },
    layout:  'centered',
  },
  {
    type: 'aboutPage',
    target: 'candidateExperiencesSection',
    eyebrow: 'Candidate experience',
    heading: 'candidateExperiencesHeading',
    body:    'candidateExperiencesBody',
    media:   'candidateExperiencesMedia',
    layout:  'split',
  },
  {
    type: 'howItWorksPage',
    target: 'gettingStartedSection',
    eyebrow: 'Getting started',
    heading: 'gettingStartedHeading',
    body:    'gettingStartedBody',
    media:   'gettingStartedMedia',
    cta:     { label: 'gettingStartedLinkLabel', href: 'gettingStartedLinkHref' },
    layout:  'split',
  },
  {
    type: 'howItWorksPage',
    target: 'candidateExperienceSection',
    eyebrow: 'Candidate experience',
    heading: 'candidateExpHeading',
    body:    'candidateExpBody',
    media:   'candidateExpMedia',
    layout:  'split',
  },
  {
    type: 'sciencePage',
    target: 'authenticSection',
    eyebrow: 'Vero',
    heading: 'authenticHeading',
    body:    'authenticBody',
    layout:  'split',
  },
  {
    type: 'sciencePage',
    target: 'dimensionsSectionContent',
    eyebrow: 'Dimensions',
    heading: 'dimensionsHeading',
    body:    'dimensionsBody',
    media:   'dimensionsMedia',
    layout:  'split',
  },
  {
    type: 'sciencePage',
    target: 'insightsSection',
    eyebrow: 'The dashboard',
    heading: 'insightsHeading',
    body:    'insightsBody',
    media:   'insightsMedia',
    layout:  'centered',
  },
  {
    type: 'compliancePage',
    target: 'securitySection',
    eyebrow: 'Data security',
    heading: 'securityHeading',
    body:    'securityBody',
    media:   'securityBadgesMedia',
    layout:  'split',
  },
  {
    type: 'compliancePage',
    target: 'aiSection',
    eyebrow: 'AI',
    heading: 'aiHeading',
    body:    'aiBody',
    media:   'aiMedia',
    layout:  'centered',
  },
  {
    type: 'jobCategory',
    target: 'dimensionsSectionContent',
    eyebrow: 'Dimensions',
    heading: 'dimensionsSectionHeading',
    body:    'dimensionsSectionBody',
    media:   'dimensionsSectionMedia',
    layout:  'split',
  },
  {
    type: 'jobCategory',
    target: 'bespokeSectionContent',
    eyebrow: 'Bespoke',
    heading: 'bespokeSectionHeading',
    body:    'bespokeSectionBody',
    media:   'bespokeSectionMedia',
    cta:     { label: 'bespokeCTALabel', href: 'bespokeCTAHref' },
    layout:  'split',
  },
];

/* ──────────────────────────────────────────────────────────────
   Helpers */

/** Some legacy bodies are stored as `type: 'text'` (plain string).
 *  Wrap those into a single Portable Text block so the new
 *  contentSection.body field (which is Portable Text) accepts them. */
function normaliseBody(value) {
  if (value == null) return undefined;
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') {
    return [
      {
        _type: 'block',
        _key: randomBytes(6).toString('hex'),
        style: 'normal',
        children: [
          {
            _type: 'span',
            _key: randomBytes(6).toString('hex'),
            text: value,
            marks: [],
          },
        ],
      },
    ];
  }
  return undefined;
}

/** Build the contentSection object from legacy field values. */
function buildSection(doc, mapping) {
  const eyebrow = mapping.eyebrow
    ? mapping.eyebrow
    : (mapping.eyebrowField ? doc[mapping.eyebrowField] : undefined);

  const heading = doc[mapping.heading];
  const body    = normaliseBody(doc[mapping.body]);
  const media   = mapping.media ? doc[mapping.media] : undefined;
  const ctaLabel = mapping.cta?.label ? doc[mapping.cta.label] : undefined;
  const ctaHref  = mapping.cta?.href  ? doc[mapping.cta.href]  : undefined;

  /* Heading is the only required field on contentSection — skip if missing.
     Editors can still fill it in later. */
  if (!heading) return null;

  const section = { _type: 'contentSection', layout: mapping.layout, heading };
  if (eyebrow)        section.eyebrow  = eyebrow;
  if (body)           section.body     = body;
  if (media)          section.media    = media;
  if (ctaLabel)       section.ctaLabel = ctaLabel;
  if (ctaHref)        section.ctaHref  = ctaHref;
  return section;
}

/* ──────────────────────────────────────────────────────────────
   Main */
async function main() {
  console.log(`Migrating contentSection fields on dataset: ${dataset}\n`);

  let totalWrites = 0;
  let totalSkips  = 0;

  /* Group migrations by doc type so we fetch each doc once and apply all
     its section updates in a single patch (atomicity + fewer requests). */
  const byType = MIGRATIONS.reduce((acc, m) => {
    (acc[m.type] ??= []).push(m);
    return acc;
  }, {});

  for (const [docType, mappings] of Object.entries(byType)) {
    console.log(`▶ ${docType}`);
    /* Fetch published + draft variants of every doc of this type. */
    const docs = await client.fetch(
      `*[_type == $docType || (_id in path("drafts.**") && _type == $docType)]`,
      { docType },
    );

    if (docs.length === 0) {
      console.log(`  (no docs)`);
      continue;
    }

    for (const doc of docs) {
      const patch = client.patch(doc._id);
      let writes = 0;
      const skipped = [];

      for (const m of mappings) {
        const section = buildSection(doc, m);
        if (!section) {
          skipped.push(`${m.target} (no heading)`);
          continue;
        }
        patch.set({ [m.target]: section });
        writes += 1;
      }

      if (writes > 0) {
        await patch.commit();
        console.log(`  ✓ ${doc._id}  (${writes} section${writes !== 1 ? 's' : ''} written)`);
        totalWrites += writes;
      } else {
        console.log(`  -- ${doc._id}  (no migratable sections)`);
      }
      totalSkips += skipped.length;
      for (const s of skipped) console.log(`     skip: ${s}`);
    }
  }

  console.log(`\nDone. ${totalWrites} sections written, ${totalSkips} skipped.`);
}

main().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
