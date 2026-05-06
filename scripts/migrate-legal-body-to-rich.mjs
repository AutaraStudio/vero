#!/usr/bin/env node
/**
 * One-time migration: move legacy markdown content out of `legalPage.body`
 * (which is now a Portable Text array) into `legalPage.legacyMarkdown` so
 * the schema field types match. After this runs, `body` is empty and ready
 * for the client to populate via the new rich-text editor; the site continues
 * rendering in markdown-fallback mode until they do.
 *
 * Usage:
 *   node scripts/migrate-legal-body-to-rich.mjs              # both datasets, dry run
 *   node scripts/migrate-legal-body-to-rich.mjs --apply      # both datasets, real
 *   node scripts/migrate-legal-body-to-rich.mjs --dataset=staging --apply
 *
 * Required env: SANITY_API_TOKEN (Editor token), NEXT_PUBLIC_SANITY_PROJECT_ID
 *               (or pass via .env.local — same vars used elsewhere in the repo).
 */

import { createClient } from '@sanity/client'
import { config as loadEnv } from 'dotenv'
import process from 'node:process'

loadEnv({ path: '.env.local' })
loadEnv({ path: '.env' })

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const token = process.env.SANITY_API_TOKEN
if (!projectId || !token) {
  console.error('Missing NEXT_PUBLIC_SANITY_PROJECT_ID or SANITY_API_TOKEN in env')
  process.exit(1)
}

const args = new Set(process.argv.slice(2))
const apply = args.has('--apply')
const datasetArg = [...args].find((a) => a.startsWith('--dataset='))
const datasets = datasetArg ? [datasetArg.split('=')[1]] : ['staging', 'production']

async function migrate(dataset) {
  const client = createClient({
    projectId,
    dataset,
    apiVersion: '2024-09-01',
    token,
    useCdn: false,
  })

  const docs = await client.fetch(
    `*[_type == "legalPage" && defined(body) && !defined(body[0]._type)]{_id, title, "len": length(body)}`,
  )

  if (!docs.length) {
    console.log(`[${dataset}] no legacy-string bodies to migrate`)
    return
  }

  console.log(`[${dataset}] ${docs.length} doc(s) need migrating:`)
  for (const d of docs) console.log(`  - ${d._id} ("${d.title}", ${d.len} chars)`)

  if (!apply) {
    console.log(`[${dataset}] dry run only — re-run with --apply to write`)
    return
  }

  for (const d of docs) {
    const full = await client.getDocument(d._id)
    if (typeof full?.body !== 'string') {
      console.log(`  - ${d._id} body no longer a string, skipping`)
      continue
    }
    await client
      .patch(d._id)
      .set({ legacyMarkdown: full.body })
      .unset(['body'])
      .commit()
    console.log(`  ✓ ${d._id} migrated`)
  }
}

for (const ds of datasets) {
  console.log(`\n━━━ ${ds} ━━━`)
  await migrate(ds)
}
console.log('\nDone.')
