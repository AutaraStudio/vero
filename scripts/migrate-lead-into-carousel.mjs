#!/usr/bin/env node
/**
 * One-shot migration: for every jobCategory, take the lead-card content
 * (featureCardsHeading + featureCardsSubheading + featureCardsLeadImage)
 * and prepend it as the first entry of featureCards[]. Then unset the
 * three legacy lead fields.
 *
 * Run BEFORE the schema/frontend change that removes the lead fields.
 */

import { createClient } from '@sanity/client';
import { config as loadEnv } from 'dotenv';
import { randomUUID } from 'node:crypto';

loadEnv({ path: '.env.local' });

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: 'staging',
  apiVersion: '2024-01-01',
  token: process.env.SANITY_UPLOAD_TOKEN || process.env.SANITY_API_TOKEN,
  useCdn: false,
});

function newKey() {
  return randomUUID().replace(/-/g, '').slice(0, 12);
}

async function main() {
  const docs = await client.fetch(
    `*[_type=="jobCategory"]{_id, "slug": slug.current, featureCardsHeading, featureCardsSubheading, featureCardsLeadImage, featureCards}`,
  );

  for (const doc of docs) {
    process.stdout.write(`  ${doc.slug}: `);

    if (!doc.featureCardsHeading) {
      console.log('no lead heading — skipping');
      continue;
    }

    /* Build the new carousel entry from the lead fields. Same object shape
       as existing featureCards items: heading + body + image. */
    const newCard = {
      _type: 'object',
      _key: newKey(),
      heading: doc.featureCardsHeading,
      ...(doc.featureCardsSubheading ? { body: doc.featureCardsSubheading } : {}),
      ...(doc.featureCardsLeadImage?.asset ? { image: doc.featureCardsLeadImage } : {}),
    };

    /* Prepend to the array and clear the legacy fields. setIfMissing handles
       docs where featureCards is absent. */
    await client
      .patch(doc._id)
      .setIfMissing({ featureCards: [] })
      .insert('before', 'featureCards[0]', [newCard])
      .unset(['featureCardsHeading', 'featureCardsSubheading', 'featureCardsLeadImage'])
      .commit();

    /* Also clear lead fields on any draft, otherwise re-publish would
       resurrect them. */
    const draftId = `drafts.${doc._id}`;
    const draft = await client.getDocument(draftId);
    if (draft) {
      await client.patch(draftId).unset(['featureCardsHeading', 'featureCardsSubheading', 'featureCardsLeadImage']).commit();
    }

    console.log(`prepended "${newCard.heading}" — now ${(doc.featureCards?.length || 0) + 1} cards`);
  }

  console.log('\nMigration complete.');
}

main().catch((e) => {
  console.error('FAILED:', e?.message || e);
  process.exit(1);
});
