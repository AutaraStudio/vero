/**
 * Backfill the new `headline` field on howItWorksPage.steps[] so the
 * existing 7 steps render exactly the same text they did when the
 * headlines were hardcoded in page.tsx — but now fully editable in Studio.
 *
 * Usage:
 *   node --env-file=.env.local scripts/backfill-how-it-works-step-headlines.mjs --dataset staging
 *   node --env-file=.env.local scripts/backfill-how-it-works-step-headlines.mjs --dataset production
 */
import { createClient } from '@sanity/client';

const HEADLINES = [
  'Add your team',
  'Configure your campaign',
  'Brand your candidate portal',
  'Sign and pay',
  'Get your portal access',
  'Meet your CSM',
  'Go live',
];

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

for (const id of ['howItWorksPage', 'drafts.howItWorksPage']) {
  const doc = await client.getDocument(id);
  if (!doc) { console.log(`  ${id}: does not exist — skipped`); continue; }
  const steps = doc.steps ?? [];
  if (steps.length === 0) { console.log(`  ${id}: no steps — skipped`); continue; }

  const patched = steps.map((step, i) => ({
    ...step,
    headline: step.headline ?? HEADLINES[i] ?? `Step ${i + 1}`,
  }));

  await client.patch(id).set({ steps: patched }).commit();
  console.log(`  ${id}: backfilled ${patched.length} step headline(s)`);
}

console.log('\nDone.');
