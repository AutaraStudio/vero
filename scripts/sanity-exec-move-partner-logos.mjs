/**
 * Move the home-page logo marquee data from siteSettings → homePage.
 *
 * Idempotent — sets `homePage.partnerLogos` / `partnerLogosLabel` only if
 * the homePage doc doesn't already have them populated, then unsets the
 * matching fields on siteSettings to keep the dataset tidy.
 *
 *   npx sanity exec scripts/sanity-exec-move-partner-logos.mjs --with-user-token
 *   npx sanity exec scripts/sanity-exec-move-partner-logos.mjs --with-user-token -- --apply
 */
import { getCliClient } from 'sanity/cli'

const client = getCliClient({ apiVersion: '2024-09-01' })
const apply = process.argv.includes('--apply')
console.log(`Dataset: ${client.config().dataset} ${apply ? '' : '(dry run)'}\n`)

const settings = await client.fetch(
  `*[_id == "siteSettings"][0]{partnerLogosLabel, partnerLogos}`,
)
const homePage = await client.fetch(
  `*[_id == "homePage"][0]{partnerLogosLabel, partnerLogos}`,
)

const hasLogosOnHome = Array.isArray(homePage?.partnerLogos) && homePage.partnerLogos.length > 0
const hasLogosOnSettings = Array.isArray(settings?.partnerLogos) && settings.partnerLogos.length > 0

if (hasLogosOnHome) {
  console.log('  ↪ homePage.partnerLogos already populated — leaving as-is')
} else if (!hasLogosOnSettings) {
  console.log('  ↪ no logos found on either doc — nothing to move')
} else {
  console.log(`  ${apply ? '✓ copied' : '↪ would copy'} ${settings.partnerLogos.length} logo(s) from siteSettings → homePage`)
  if (apply) {
    await client
      .patch('homePage')
      .set({
        partnerLogos: settings.partnerLogos,
        partnerLogosLabel: settings.partnerLogosLabel ?? null,
      })
      .commit()
  }
}

if (hasLogosOnSettings) {
  console.log(`  ${apply ? '✓ unset' : '↪ would unset'} partnerLogos / partnerLogosLabel on siteSettings`)
  if (apply) {
    await client
      .patch('siteSettings')
      .unset(['partnerLogos', 'partnerLogosLabel'])
      .commit()
  }
}

console.log(`\n${apply ? 'Done.' : 'Dry run only — re-run with `-- --apply` to write.'}`)
