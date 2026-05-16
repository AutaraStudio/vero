/**
 * Restore the 7-step "How It Works" process section content from the
 * pre-deletion siteBackup snapshot.
 *
 * The fields (`stepsHeading`, `stepsIntro`, `steps[]`) were unset on
 * staging + production in PR #76. The schema + frontend rendering have
 * since been restored on `restore-how-it-works-steps`; this script
 * patches the original content back from the snapshot.
 *
 * Source snapshot: siteBackup-2026-05-13T05-57-20-809Z (staging dataset).
 *
 * Usage:
 *   node --env-file=.env.local scripts/restore-how-it-works-steps.mjs --dataset staging
 *   node --env-file=.env.local scripts/restore-how-it-works-steps.mjs --dataset production
 */
import { createClient } from '@sanity/client';

const SNAPSHOT_ID = 'siteBackup-2026-05-13T05-57-20-809Z';

const datasetFlag = process.argv.indexOf('--dataset');
const dataset = datasetFlag >= 0 ? process.argv[datasetFlag + 1] : null;
if (!dataset || (dataset !== 'staging' && dataset !== 'production')) {
  console.error('Usage: --dataset staging | --dataset production');
  process.exit(1);
}

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const token = process.env.SANITY_API_TOKEN;
if (!projectId || !token) {
  console.error('Missing NEXT_PUBLIC_SANITY_PROJECT_ID or SANITY_API_TOKEN env vars.');
  process.exit(1);
}

// Snapshot always lives on staging (per the backup design)
const stagingClient = createClient({
  projectId, dataset: 'staging', apiVersion: '2024-09-01', token, useCdn: false,
});
const targetClient = createClient({
  projectId, dataset, apiVersion: '2024-09-01', token, useCdn: false,
});

console.log(`Fetching snapshot ${SNAPSHOT_ID} from staging…`);
const snapshot = await stagingClient.getDocument(SNAPSHOT_ID);
if (!snapshot?.snapshotJson) {
  console.error(`Snapshot ${SNAPSHOT_ID} not found or missing snapshotJson.`);
  process.exit(1);
}

const parsed = typeof snapshot.snapshotJson === 'string'
  ? JSON.parse(snapshot.snapshotJson)
  : snapshot.snapshotJson;

// snapshotJson is typically { documents: [...] } from an `exportDataset`-style dump
const docs = Array.isArray(parsed) ? parsed : (parsed.documents ?? parsed.docs ?? []);
const hiw = docs.find((d) => d._id === 'howItWorksPage' || d._type === 'howItWorksPage');
if (!hiw) {
  console.error('No howItWorksPage document found in snapshot.');
  process.exit(1);
}

const { stepsHeading, stepsIntro, steps } = hiw;
console.log(`From snapshot:
  stepsHeading = ${JSON.stringify(stepsHeading)}
  stepsIntro   = ${JSON.stringify(stepsIntro)}
  steps        = ${steps?.length ?? 0} step(s)`);

if (!stepsHeading && !stepsIntro && (!steps || steps.length === 0)) {
  console.error('Snapshot has no steps data to restore — aborting.');
  process.exit(1);
}

const patch = {};
if (stepsHeading !== undefined) patch.stepsHeading = stepsHeading;
if (stepsIntro !== undefined)   patch.stepsIntro   = stepsIntro;
if (steps !== undefined)        patch.steps        = steps;

console.log(`\nPatching howItWorksPage on dataset "${dataset}"…`);

// Patch both the published doc and any draft
const ids = ['howItWorksPage', 'drafts.howItWorksPage'];
for (const id of ids) {
  const exists = await targetClient.getDocument(id);
  if (!exists) {
    console.log(`  ${id}: does not exist — skipped`);
    continue;
  }
  await targetClient.patch(id).set(patch).commit();
  console.log(`  ${id}: patched`);
}

console.log('\nDone. Verify in Studio that stepsHeading / stepsIntro / steps are restored.');
