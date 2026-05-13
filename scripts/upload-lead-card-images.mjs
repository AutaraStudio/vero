#!/usr/bin/env node
/**
 * Uploads the 10 "lead-card" images (one per jobCategory) — the leftover
 * filename in each vero-images/ folder that matches the category's
 * featureCardsHeading. Sets featureCardsLeadImage on the published doc.
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

/* Hand-mapped: each jobCategory slug → the leftover image file that
   corresponds to its featureCardsHeading. Confirmed against the live
   data and the screenshot the user shared. */
const ASSIGNMENTS = [
  { slug: 'administration',                  file: 'vero-images/Admin roles/keeping your team on track.jpg' },
  { slug: 'apprentices',                     file: 'vero-images/Apprentices/uncover potential.jpg' },
  { slug: 'claims-and-collections',          file: 'vero-images/Claims and collections/clarity and care.jpg' },
  { slug: 'field-service-and-technicians',   file: 'vero-images/Field and service technicians/putting quality in the field.jpg' },
  { slug: 'graduates',                       file: 'vero-images/graduates/graduates ready to grow.jpg' },
  { slug: 'health-and-social-care',          file: 'vero-images/health and social care/compassion in action.jpg' },
  { slug: 'interns',                         file: 'vero-images/Interns/new talent new ideas.jpg' },
  { slug: 'operations-and-logistics',        file: 'vero-images/opreations and logistics/operational talent.jpg' },
  { slug: 'retail-and-hospitality',          file: 'vero-images/retail and hospitality/high calibre customer service.jpg' },
  { slug: 'sales',                           file: 'vero-images/sales/sales talent that makes sense.jpg' },
];

async function main() {
  for (const { slug, file } of ASSIGNMENTS) {
    const docId = `jobCategory-${slug}`;
    process.stdout.write(`  ${slug}: uploading ${file.split('/').pop()} ... `);
    const asset = await client.assets.upload('image', readFileSync(file), {
      filename: file.split('/').pop(),
      contentType: 'image/jpeg',
    });
    await client.patch(docId).set({
      featureCardsLeadImage: {
        _type: 'image',
        asset: { _type: 'reference', _ref: asset._id },
        alt: ALT,
      },
    }).commit();
    console.log('done');
  }
  console.log('\nAll 10 lead-card images uploaded and assigned.');
}

main().catch((e) => {
  console.error('FAILED:', e?.message || e);
  process.exit(1);
});
