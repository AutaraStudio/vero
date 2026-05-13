#!/usr/bin/env node
/**
 * Administration has a lingering draft with 5 cards while the published
 * doc has 4. Our earlier upload script touched only the published doc.
 *
 * This script:
 *  1. Reads the published doc to capture the 4 already-uploaded image
 *     asset refs (per card _key).
 *  2. Uploads the missing 5th image: keeping your team on track.jpg
 *  3. Patches the draft so every card has its correct image + dummy alt.
 *  4. Publishes the draft (replacing the 4-card published doc with the
 *     5-card version).
 */

import { createClient } from '@sanity/client';
import { config as loadEnv } from 'dotenv';
import { readFileSync } from 'node:fs';

loadEnv({ path: '.env.local' });

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: 'staging',
  apiVersion: '2024-01-01',
  token: process.env.SANITY_UPLOAD_TOKEN || process.env.SANITY_API_TOKEN,
  useCdn: false,
});

const ALT = 'This is a dummy Description - Needs to be updated';
const PUBLISHED_ID = 'jobCategory-administration';
const DRAFT_ID = 'drafts.jobCategory-administration';

/* Map of draft card heading → filename of correct image. The 4 already
   uploaded come from the published doc; the 5th is uploaded here. */
const HEADING_TO_FILE = {
  'Find natural-born organisers':    'vero-images/Admin roles/natural born organisers.jpg',
  'Problem-solvers assemble':        'vero-images/Admin roles/problem solvers assemble.jpg',
  'Streamline your systems':         'vero-images/Admin roles/streamline your systems.jpg',
  'Hire for people skills':          'vero-images/Admin roles/hire for people skills.jpg',
  'Keeping your team on track':      'vero-images/Admin roles/keeping your team on track.jpg',
};

async function main() {
  const published = await client.getDocument(PUBLISHED_ID);
  const draft = await client.getDocument(DRAFT_ID);
  if (!draft) throw new Error('draft document not found');

  /* Build heading → assetId from published (4 cards already done). */
  const headingToAssetId = {};
  for (const c of published.featureCards || []) {
    if (c.image?.asset?._ref) headingToAssetId[c.heading] = c.image.asset._ref;
  }

  /* Upload missing image(s) — only those whose heading isn't yet covered. */
  for (const [heading, file] of Object.entries(HEADING_TO_FILE)) {
    if (headingToAssetId[heading]) continue;
    process.stdout.write(`  uploading ${file} → "${heading}" ... `);
    const asset = await client.assets.upload('image', readFileSync(file), {
      filename: file.split('/').pop(),
      contentType: 'image/jpeg',
    });
    headingToAssetId[heading] = asset._id;
    console.log('done');
  }

  /* Patch the draft: set image on every card whose heading we recognise. */
  const patch = client.patch(DRAFT_ID);
  draft.featureCards.forEach((card, i) => {
    const assetId = headingToAssetId[card.heading];
    if (!assetId) {
      console.warn(`  ⚠ no image for card[${i}] "${card.heading}"`);
      return;
    }
    patch.set({
      [`featureCards[${i}].image`]: {
        _type: 'image',
        asset: { _type: 'reference', _ref: assetId },
        alt: ALT,
      },
    });
  });
  await patch.commit();
  console.log('  draft patched');

  /* Publish the draft. Sanity action: createOrReplace published with the
     draft's contents, then delete the draft. */
  const tx = client.transaction()
    .createOrReplace({ ...draft, _id: PUBLISHED_ID, featureCards: draft.featureCards })
    .delete(DRAFT_ID);

  /* The draft has been patched in the previous commit, so we need to re-read
     it before publishing to include the new image refs. */
  const freshDraft = await client.getDocument(DRAFT_ID);
  await client.transaction()
    .createOrReplace({ ...freshDraft, _id: PUBLISHED_ID })
    .delete(DRAFT_ID)
    .commit();

  console.log('  draft published → 5 cards live');
}

main().catch((e) => {
  console.error('FAILED:', e?.message || e);
  process.exit(1);
});
