/**
 * One-off migration: flip every mediaBlock currently set to
 * `type: 'video'` back to `type: 'image'` across all page documents.
 *
 * Run with:
 *   node --env-file=.env.local scripts/flip-video-to-image.mjs
 */
import { createClient } from '@sanity/client';

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset:   process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: '2024-09-01',
  token:     process.env.SANITY_API_TOKEN,
  useCdn:    false,
});

/** All possible mediaBlock field names across our document types. */
const MEDIA_FIELDS = [
  'heroMedia',
  'introBlockMedia',
  'tazioEvolutionMedia',
  'candidateExperiencesMedia',
  'gettingStartedMedia',
  'candidateExpMedia',
  'dimensionsMedia',
  'insightsMedia',
  'securityBadgesMedia',
  'aiMedia',
  'dimensionsSectionMedia',
  'bespokeSectionMedia',
];

async function main() {
  /* Pull every page-ish document */
  const docs = await client.fetch(
    `*[_type in ["homePage","aboutPage","howItWorksPage","sciencePage","compliancePage","jobCategory"]]{
      _id,
      _type,
      ${MEDIA_FIELDS.map((f) => `${f}{type}`).join(',\n      ')}
    }`,
  );

  const transaction = client.transaction();
  let totalFlipped = 0;
  const docsAffected = [];

  for (const doc of docs) {
    const fieldsToFlip = MEDIA_FIELDS.filter((f) => doc[f]?.type === 'video');
    if (fieldsToFlip.length === 0) continue;

    const setOps = {};
    for (const f of fieldsToFlip) setOps[`${f}.type`] = 'image';

    transaction.patch(doc._id, (p) => p.set(setOps));
    docsAffected.push({ id: doc._id, fields: fieldsToFlip });
    totalFlipped += fieldsToFlip.length;
  }

  if (totalFlipped === 0) {
    console.log('Nothing to flip — no video-mode mediaBlocks found.');
    return;
  }

  console.log(`Flipping ${totalFlipped} field(s) across ${docsAffected.length} document(s):`);
  for (const d of docsAffected) {
    console.log(`  ${d.id}: ${d.fields.join(', ')}`);
  }

  const result = await transaction.commit();
  console.log(`\n✓ Done. ${result.results.length} mutations committed.`);
}

main().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
