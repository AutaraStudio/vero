#!/usr/bin/env node
/**
 * Bulk-uploads carousel-card images for every jobCategory document.
 *
 *  • Reads each folder under vero-images/ (one per category).
 *  • Fuzzy-matches each image filename to a card heading.
 *  • Uploads the file as a Sanity image asset.
 *  • Patches the card's image field with the asset reference + dummy alt.
 *  • Publishes each updated document.
 *
 * Folder ↔ category mapping is hard-coded below to handle minor name
 * variations (typos, casing, "admin roles" → "administration", etc).
 *
 * Run with:
 *   node scripts/upload-category-card-images.mjs
 *
 * Requires SANITY_UPLOAD_TOKEN (write scope) in .env.local.
 */

import { createClient } from '@sanity/client';
import { config as loadEnv } from 'dotenv';
import { readFileSync, readdirSync } from 'node:fs';
import { extname, join, basename } from 'node:path';

loadEnv({ path: '.env.local' });

const PROJECT_ID = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const DATASET = 'staging';
const TOKEN = process.env.SANITY_UPLOAD_TOKEN || process.env.SANITY_API_TOKEN;

if (!PROJECT_ID || !TOKEN) {
  console.error('Missing NEXT_PUBLIC_SANITY_PROJECT_ID or SANITY_UPLOAD_TOKEN');
  process.exit(1);
}

const client = createClient({
  projectId: PROJECT_ID,
  dataset: DATASET,
  apiVersion: '2024-01-01',
  token: TOKEN,
  useCdn: false,
});

const ALT = 'This is a dummy Description - Needs to be updated';

/* Folder ↔ category slug map. The repo has a typo in
   "opreations and logistics" — normalised here. */
const FOLDER_TO_CATEGORY = {
  'Admin roles': 'administration',
  'Apprentices': 'apprentices',
  'Claims and collections': 'claims-and-collections',
  'Field and service technicians': 'field-service-and-technicians',
  'graduates': 'graduates',
  'health and social care': 'health-and-social-care',
  'Interns': 'interns',
  'opreations and logistics': 'operations-and-logistics',
  'retail and hospitality': 'retail-and-hospitality',
  'sales': 'sales',
};

/* Normalise a string for fuzzy match: lower-cased, hyphens / underscores /
   punctuation stripped, multiple spaces collapsed. */
function normalise(str) {
  return str
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/* Score how well a filename matches a card heading. Uses token overlap
   over the union — Jaccard-ish but rewards extra coverage. */
function score(filename, heading) {
  const f = new Set(normalise(filename).split(' ').filter(Boolean));
  const h = new Set(normalise(heading).split(' ').filter(Boolean));
  // Drop common filler so 'find the X' matches 'X'
  for (const filler of ['the', 'a', 'an', 'for', 'of', 'to', 'in']) {
    f.delete(filler);
    h.delete(filler);
  }
  let overlap = 0;
  for (const t of f) if (h.has(t)) overlap++;
  return overlap / Math.max(f.size, h.size, 1);
}

async function uploadImage(filePath) {
  const buf = readFileSync(filePath);
  const filename = basename(filePath);
  const asset = await client.assets.upload('image', buf, {
    filename,
    contentType: 'image/jpeg',
  });
  return asset._id;
}

async function processCategory(folderName, slug) {
  const docId = `jobCategory-${slug}`;
  const folder = join('vero-images', folderName);

  const doc = await client.getDocument(docId);
  if (!doc) {
    console.error(`  ✗ ${docId} not found — skipping`);
    return { matched: 0, unmatched: [] };
  }
  const cards = doc.featureCards || [];
  if (cards.length === 0) {
    console.warn(`  ⚠ ${docId} has no featureCards`);
    return { matched: 0, unmatched: [] };
  }

  const files = readdirSync(folder).filter((f) =>
    ['.jpg', '.jpeg', '.png', '.webp'].includes(extname(f).toLowerCase()),
  );

  /* Build a score matrix [file × card] then pick best pairs greedily. */
  const pairs = [];
  for (const file of files) {
    for (const card of cards) {
      pairs.push({ file, card, s: score(file, card.heading || '') });
    }
  }
  pairs.sort((a, b) => b.s - a.s);

  const usedFiles = new Set();
  const usedKeys = new Set();
  const assignments = []; // {file, card, score}
  for (const p of pairs) {
    if (p.s === 0) break;
    if (usedFiles.has(p.file) || usedKeys.has(p.card._key)) continue;
    usedFiles.add(p.file);
    usedKeys.add(p.card._key);
    assignments.push(p);
  }

  /* Upload + patch. We build a single transaction-style patch using
     set() at indexed paths so one network round-trip handles all cards
     for this doc. */
  const patch = client.patch(docId);
  for (const a of assignments) {
    const filePath = join(folder, a.file);
    process.stdout.write(`    uploading ${a.file} → "${a.card.heading}" ... `);
    const assetId = await uploadImage(filePath);
    const idx = cards.findIndex((c) => c._key === a.card._key);
    patch.set({
      [`featureCards[${idx}].image`]: {
        _type: 'image',
        asset: { _type: 'reference', _ref: assetId },
        alt: ALT,
      },
    });
    console.log('done');
  }
  await patch.commit();

  const unmatched = files.filter((f) => !usedFiles.has(f));
  return { matched: assignments.length, unmatched, docId };
}

async function main() {
  const report = [];
  for (const [folder, slug] of Object.entries(FOLDER_TO_CATEGORY)) {
    console.log(`\n→ ${folder}  (${slug})`);
    const r = await processCategory(folder, slug);
    report.push({ folder, slug, ...r });
  }

  console.log('\n\n== Summary ==');
  let totalMatched = 0;
  for (const r of report) {
    console.log(`  ${r.slug}: ${r.matched} matched${r.unmatched.length ? `, unused: ${r.unmatched.join(', ')}` : ''}`);
    totalMatched += r.matched;
  }
  console.log(`\nTotal images uploaded + assigned: ${totalMatched}`);
}

main().catch((e) => {
  console.error('\nFAILED:', e?.message || e);
  process.exit(1);
});
