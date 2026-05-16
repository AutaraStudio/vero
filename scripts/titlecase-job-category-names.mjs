/**
 * Convert every jobCategory.name to Title Case with proper small-word
 * handling — e.g. "Field service and technicians" → "Field Service and
 * Technicians". Joining words ("and", "of", "the", "or", "for", "to",
 * "in", "on", "a", "an") stay lowercase unless they're the first word.
 *
 * jobCategory.name is the display string used in MegaNav, Footer,
 * /assessments cards, and the per-category hero, so this single change
 * propagates everywhere.
 *
 * Usage:
 *   node --env-file=.env.local scripts/titlecase-job-category-names.mjs --dataset staging
 *   node --env-file=.env.local scripts/titlecase-job-category-names.mjs --dataset production
 */
import { createClient } from '@sanity/client';

const SMALL_WORDS = new Set([
  'and', 'or', 'but', 'nor',
  'a', 'an', 'the',
  'of', 'to', 'in', 'on', 'at', 'by', 'for', 'with',
]);

function titleCase(input) {
  if (!input) return input;
  const words = input.trim().split(/\s+/);
  return words
    .map((word, i) => {
      const lower = word.toLowerCase();
      if (i !== 0 && SMALL_WORDS.has(lower)) return lower;
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    })
    .join(' ');
}

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

const docs = await client.fetch(`*[_type == "jobCategory"]{ _id, name }`);
console.log(`Found ${docs.length} jobCategory doc(s) on "${dataset}".\n`);

let patched = 0;
let unchanged = 0;

for (const doc of docs) {
  const next = titleCase(doc.name);
  if (next === doc.name) {
    console.log(`  unchanged  ${doc._id}  "${doc.name}"`);
    unchanged++;
    continue;
  }
  await client.patch(doc._id).set({ name: next }).commit();
  console.log(`  patched    ${doc._id}  "${doc.name}" → "${next}"`);
  patched++;
}

console.log(`\nDone. ${patched} patched, ${unchanged} already correct.`);
