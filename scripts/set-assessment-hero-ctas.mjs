/**
 * Set heroCTALabel = "Get Started" and heroCTAHref = "/get-started?category=<slug>"
 * on every jobCategory document (the per-category /assessments/<slug> pages).
 *
 * Mirrors the hardcoded fallback that previously lived in page.tsx, now stored
 * in Sanity so editors can change it per category.
 *
 * Skips docs that already have a heroCTALabel set so editors who customised
 * it aren't overwritten.
 *
 * Usage:
 *   node --env-file=.env.local scripts/set-assessment-hero-ctas.mjs --dataset staging
 *   node --env-file=.env.local scripts/set-assessment-hero-ctas.mjs --dataset production
 */
import { createClient } from '@sanity/client';

const datasetFlag = process.argv.indexOf('--dataset');
const dataset = datasetFlag >= 0 ? process.argv[datasetFlag + 1] : null;
if (!dataset || (dataset !== 'staging' && dataset !== 'production')) {
  console.error('Usage: --dataset staging | --dataset production');
  process.exit(1);
}

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset,
  apiVersion: '2024-09-01',
  token:     process.env.SANITY_API_TOKEN,
  useCdn:    false,
});

const docs = await client.fetch(`*[_type == "jobCategory"]{ _id, name, "slug": slug.current, heroCTALabel, heroCTAHref }`);
console.log(`Found ${docs.length} jobCategory doc(s) on "${dataset}".\n`);

let patched = 0;
let skipped = 0;

for (const doc of docs) {
  if (doc.heroCTALabel) {
    console.log(`  skip   ${doc._id} (${doc.name}) — already has label "${doc.heroCTALabel}"`);
    skipped++;
    continue;
  }
  const href = `/get-started?category=${doc.slug}`;
  await client.patch(doc._id).set({ heroCTALabel: 'Get Started', heroCTAHref: href }).commit();
  console.log(`  patch  ${doc._id} (${doc.name}) → ${href}`);
  patched++;
}

console.log(`\nDone. ${patched} patched, ${skipped} skipped.`);
