/**
 * Apply the client amends from "Website amends.xlsx" (May 2026) to the
 * dataset configured in `sanity.cli.ts` (staging or production via env).
 *
 *   npx sanity exec scripts/sanity-exec-apply-client-amends.mjs --with-user-token
 *
 * Idempotent — re-running on already-amended docs is safe (text replace
 * is a no-op when the target wording isn't found, and conditional sets
 * skip when already correct).
 */
import { getCliClient } from 'sanity/cli'

const client = getCliClient({ apiVersion: '2024-09-01' })
console.log(`Dataset: ${client.config().dataset}\n`)

const log = (msg) => console.log(`  ✓ ${msg}`)

/* ── Pricing page — hero intro grammar ───────────────────────── */
{
  const doc = await client.fetch(`*[_id == "pricingPage"][0]{heroIntro}`)
  if (doc?.heroIntro?.includes('number of roles and level of integration')) {
    const next = doc.heroIntro.replace(
      'number of roles and level of integration',
      'numbers of roles and levels of integration',
    )
    await client.patch('pricingPage').set({ heroIntro: next }).commit()
    log('pricingPage.heroIntro: number→numbers, level→levels')
  } else {
    log('pricingPage.heroIntro already amended')
  }
}

/* ── Pricing tier — Starter tagline "package" → "plan" ───────── */
{
  const doc = await client.fetch(`*[_id == "pricingTier-starter"][0]{tagline}`)
  if (doc?.tagline?.includes('one-off package')) {
    const next = doc.tagline.replace('one-off package', 'one-off plan')
    await client.patch('pricingTier-starter').set({ tagline: next }).commit()
    log('pricingTier-starter.tagline: package→plan')
  } else {
    log('pricingTier-starter.tagline already amended')
  }
}

/* ── Contact page — email + FAQ wording ─────────────────────── */
{
  const doc = await client.fetch(`*[_id == "contactPage"][0]{email, faqs}`)
  const patches = []
  if (doc?.email !== 'support@veroassess.com') {
    patches.push({ kind: 'set', path: 'email', value: 'support@veroassess.com' })
  }
  /* Walk the FAQ Portable Text answers and replace "Essentials plan"
     with "Essential plan" wherever it appears. Patch each affected span
     individually using its _key path so we don't disturb the rest. */
  for (const faq of doc?.faqs ?? []) {
    for (const block of faq.answer ?? []) {
      for (const child of block.children ?? []) {
        if (typeof child.text === 'string' && /Essentials\s+plan/i.test(child.text)) {
          patches.push({
            kind: 'set',
            path: `faqs[_key=="${faq._key}"].answer[_key=="${block._key}"].children[_key=="${child._key}"].text`,
            value: child.text.replace(/Essentials\s+plan/g, 'Essential plan'),
          })
        }
      }
    }
  }
  if (patches.length) {
    let p = client.patch('contactPage')
    for (const op of patches) p = p.set({ [op.path]: op.value })
    await p.commit()
    log(`contactPage: ${patches.length} field(s) updated`)
  } else {
    log('contactPage already amended')
  }
}

/* ── Compliance page — WCAG 2.2 → 2.2 AA ─────────────────────── */
{
  const doc = await client.fetch(`*[_id == "compliancePage"][0]{accessibilityBody}`)
  if (doc?.accessibilityBody?.includes('(WCAG) 2.2,')) {
    const next = doc.accessibilityBody.replace('(WCAG) 2.2,', '(WCAG) 2.2 AA,')
    await client.patch('compliancePage').set({ accessibilityBody: next }).commit()
    log('compliancePage.accessibilityBody: WCAG 2.2 → WCAG 2.2 AA')
  } else {
    log('compliancePage.accessibilityBody already amended')
  }
}

/* ── How it works — benefits CTA points to The Science ─────── */
{
  const doc = await client.fetch(`*[_id == "howItWorksPage"][0]{benefitsLinkHref}`)
  if (doc?.benefitsLinkHref !== '/resources/science') {
    await client.patch('howItWorksPage').set({ benefitsLinkHref: '/resources/science' }).commit()
    log('howItWorksPage.benefitsLinkHref → /resources/science')
  } else {
    log('howItWorksPage.benefitsLinkHref already amended')
  }
}

/* ── Apprentices — append the missing sentence to dimensions copy ─ */
{
  const doc = await client.fetch(`*[_id == "jobCategory-apprentices"][0]{dimensionsSectionBody}`)
  const tail = " We've used the best combination of dimensions and weightings for each specific role, so you can find the right fit."
  if (doc?.dimensionsSectionBody && !doc.dimensionsSectionBody.includes("best combination of dimensions and weightings")) {
    const next = doc.dimensionsSectionBody.replace(/\s*$/, '') + tail
    await client.patch('jobCategory-apprentices').set({ dimensionsSectionBody: next }).commit()
    log('jobCategory-apprentices.dimensionsSectionBody: appended fit sentence')
  } else {
    log('jobCategory-apprentices.dimensionsSectionBody already amended')
  }
}

/* ── Field service — "Hire fast-thinkers" → "Hire fast thinkers" ─ */
{
  const FIELD_ID = 'jobCategory-field-service-and-technicians'
  const doc = await client.fetch(`*[_id == "${FIELD_ID}"][0]{featureCards[]{_key, heading}}`)
  const target = doc?.featureCards?.find((c) => c.heading === 'Hire fast-thinkers')
  if (target) {
    await client
      .patch(FIELD_ID)
      .set({ [`featureCards[_key=="${target._key}"].heading`]: 'Hire fast thinkers' })
      .commit()
    log('jobCategory-field-service: featureCards heading hyphen removed')
  } else {
    log('jobCategory-field-service already amended')
  }
}

/* ── About page — hide the "Meet the team" section ─────────── */
{
  const doc = await client.fetch(`*[_id == "aboutPage"][0]{teamHeading}`)
  if (doc?.teamHeading) {
    /* Renderer conditionally renders the section only when teamHeading
       is truthy. Unsetting hides the whole section without touching the
       teamMembers data, so it can be brought back later if needed. */
    await client.patch('aboutPage').unset(['teamHeading']).commit()
    log('aboutPage.teamHeading unset (Meet the team hidden)')
  } else {
    log('aboutPage.teamHeading already cleared')
  }
}

console.log('\nDone.')
