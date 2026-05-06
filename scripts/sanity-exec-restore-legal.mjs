/**
 * Restore the legal page bodies from pre-converted Portable Text JSON
 * files in /tmp. One-shot recovery script — reads the JSON, sets the
 * `body` field on each doc using the Sanity CLI's authenticated client.
 *
 *   npx sanity exec scripts/sanity-exec-restore-legal.mjs --with-user-token
 */
import { getCliClient } from 'sanity/cli'
import { readFileSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'

const tmp = os.tmpdir()
const targets = [
  { id: 'legalPage.cookies', file: path.join(tmp, 'cookies-blocks.json') },
  { id: 'legalPage.privacy', file: path.join(tmp, 'privacy-blocks.json') },
  { id: 'legalPage.security', file: path.join(tmp, 'security-blocks.json') },
]

const client = getCliClient({ apiVersion: '2024-09-01' })
console.log(`Dataset: ${client.config().dataset}\n`)

for (const t of targets) {
  const blocks = JSON.parse(readFileSync(t.file, 'utf8'))
  await client.patch(t.id).set({ body: blocks }).commit()
  console.log(`  ✓ ${t.id} restored (${blocks.length} blocks)`)
}
