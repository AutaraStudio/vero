/**
 * Cleanup orphan top-level fields from production / staging documents.
 * Driven by the audit at scripts/sanity-exec-audit-orphan-fields.ts —
 * ONLY unsets fields that have been confirmed dead in code (i.e. the
 * schema no longer defines them and no source file references them).
 *
 *   npx sanity exec scripts/sanity-exec-cleanup-orphan-fields.mjs --with-user-token
 *   npx sanity exec scripts/sanity-exec-cleanup-orphan-fields.mjs --with-user-token -- --apply
 *
 * Idempotent — re-running on a clean dataset is a no-op.
 */
import { getCliClient } from 'sanity/cli'

const client = getCliClient({ apiVersion: '2024-09-01' })
const apply = process.argv.includes('--apply')
console.log(`Dataset: ${client.config().dataset} ${apply ? '' : '(dry run)'}\n`)

/* doc id → fields to unset. Each field name listed here MUST be:
   - absent from the corresponding schema (in src/sanity/schemaTypes/)
   - unreferenced in src/ and scripts/ except seed scripts
   Add new entries only after running the audit script + grepping. */
const targets = [
  {
    id: 'homePage',
    fields: [
      /* PR #27 — closing CTA moved to globalFooter */
      'closingStatement',
      'closingEyebrow',
      'closingBenefits',
      'closingCtaLabel',
      'closingCtaHref',
      /* Older flat hero-video shape — replaced by `heroMedia` mediaBlock */
      'heroMediaType',
      'heroVideoUrl',
      /* Older partner-logos shape — replaced by `partnerLogos[]` / `partnerLogosLabel` in PR #28 */
      'socialProofLabel',
      'socialProofLogos',
    ],
  },
  {
    id: 'siteSettings',
    fields: [
      /* PR #27 — moved to globalFooter */
      'footerCtaHeading',
      'footerCtaBody',
      'footerCtaButtonLabel',
      'footerCtaButtonHref',
      /* PR #27 — moved to globalNav */
      'navCtaLabel',
      'navCtaHref',
    ],
  },
]

for (const target of targets) {
  const doc = await client.fetch(`*[_id == $id][0]`, { id: target.id })
  if (!doc) {
    console.log(`  ↪ ${target.id} not found, skipping`)
    continue
  }
  const present = target.fields.filter((f) => f in doc)
  if (present.length === 0) {
    console.log(`  ↪ ${target.id}: already clean`)
    continue
  }
  console.log(`  ${apply ? '✓ unsetting' : '↪ would unset'} on ${target.id}: ${present.join(', ')}`)
  if (apply) {
    await client.patch(target.id).unset(present).commit()
  }
}

console.log(`\n${apply ? 'Done.' : 'Dry run only — re-run with `-- --apply` to write.'}`)
