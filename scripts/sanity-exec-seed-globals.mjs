/**
 * One-time seed for the new Global singletons (globalNav, globalFooter,
 * globalCategoryGroups). Populates them with the same content the site
 * was rendering from hardcoded arrays before this refactor, plus the
 * old siteSettings footer + nav fields.
 *
 * Idempotent — uses createOrReplace so re-running on a populated
 * dataset overwrites with the seed values. Skip the apply flag for a
 * dry run that just prints the payloads.
 *
 *   npx sanity exec scripts/sanity-exec-seed-globals.mjs --with-user-token
 *   npx sanity exec scripts/sanity-exec-seed-globals.mjs --with-user-token -- --apply
 */
import { getCliClient } from 'sanity/cli'
import { randomUUID } from 'node:crypto'

const client = getCliClient({ apiVersion: '2024-09-01' })
const apply = process.argv.includes('--apply')
console.log(`Dataset: ${client.config().dataset} ${apply ? '' : '(dry run)'}\n`)

const k = () => randomUUID()

/* ── Pre-existing siteSettings (read so we can keep what was already
   editable — navCta + footer CTA button — instead of overwriting
   with new defaults). */
const siteSettings = await client.fetch(
  `*[_id == "siteSettings"][0]{navCtaLabel, navCtaHref, footerCtaButtonLabel, footerCtaButtonHref}`,
)

/* ── Categories — used to build the default groupings. */
const categories = await client.fetch(
  `*[_type == "jobCategory"]{_id, "slug": slug.current, name}`,
)
const bySlug = new Map(categories.map((c) => [c.slug, c]))
const ref = (slug) => {
  const c = bySlug.get(slug)
  if (!c) {
    console.warn(`  ! missing jobCategory: ${slug}`)
    return null
  }
  return { _key: k(), _type: 'reference', _ref: c._id }
}

/* ── globalCategoryGroups ─────────────────────────────────────── */

const groupSpec = [
  {
    title: 'Job families',
    slugs: [
      'administration',
      'operations-and-logistics',
      'sales',
      'retail-and-hospitality',
      'health-and-social-care',
    ],
  },
  {
    title: 'Early careers',
    slugs: ['graduates', 'apprentices', 'interns'],
  },
  {
    title: 'Specialist',
    slugs: ['claims-and-collections', 'field-service-and-technicians'],
  },
]

const globalCategoryGroups = {
  _id: 'globalCategoryGroups',
  _type: 'globalCategoryGroups',
  groups: groupSpec.map((g) => ({
    _key: k(),
    _type: 'group',
    title: g.title,
    categories: g.slugs.map(ref).filter(Boolean),
  })),
}

/* ── jobCategory.navDescription seeding ───────────────────────── */
/* These are the descriptions that used to live in the hardcoded
   categoryMeta object inside MegaNav. Patch onto the matching docs. */
const navDescriptions = {
  'administration': 'Dependable, organised talent',
  'operations-and-logistics': 'Precise, process-led hires',
  'sales': 'Commercially-minded performers',
  'retail-and-hospitality': 'Service-led problem solvers',
  'health-and-social-care': 'Compassionate, resilient staff',
  'graduates': 'Future leaders, assessed early',
  'apprentices': 'Spot potential beyond CVs',
  'interns': 'Build your talent pipeline',
  'claims-and-collections': 'Integrity under pressure',
  'field-service-and-technicians': 'Practical and customer-facing',
}

/* ── globalNav ────────────────────────────────────────────────── */

const globalNav = {
  _id: 'globalNav',
  _type: 'globalNav',
  topItems: [
    { _key: k(), _type: 'assessmentsDropdown', label: 'Assessments' },
    { _key: k(), _type: 'companyDropdown', label: 'Company' },
    { _key: k(), _type: 'plainLink', label: 'Pricing', href: '/pricing', external: false },
  ],
  companyColumns: [
    {
      _key: k(),
      _type: 'navColumn',
      title: 'Company',
      links: [
        { _key: k(), _type: 'navLink', label: 'About Vero Assess', description: 'Our mission and approach', href: '/about', external: false },
        { _key: k(), _type: 'navLink', label: 'Contact', description: 'Get in touch', href: '/contact', external: false },
      ],
    },
    {
      _key: k(),
      _type: 'navColumn',
      title: 'Resources',
      links: [
        { _key: k(), _type: 'navLink', label: 'How it Works', description: 'Our assessment process', href: '/how-it-works', external: false },
        { _key: k(), _type: 'navLink', label: 'Pricing', description: 'Plans for every team size', href: '/pricing', external: false },
        { _key: k(), _type: 'navLink', label: 'The Science', description: 'Research-backed methodology', href: '/resources/science', external: false },
        { _key: k(), _type: 'navLink', label: 'Compliance', description: 'ISO, WCAG, Cyber Essentials', href: '/resources/compliance', external: false },
      ],
    },
  ],
  companyCard: {
    eyebrow: 'Live in 48 hours',
    body: 'Get your assessments running fast',
    ctaLabel: 'Get started',
    ctaHref: '/get-started',
  },
  ctaLabel: siteSettings?.navCtaLabel || 'Get started',
  ctaHref: siteSettings?.navCtaHref || '/get-started',
}

/* ── globalFooter ─────────────────────────────────────────────── */

const globalFooter = {
  _id: 'globalFooter',
  _type: 'globalFooter',
  ctaHeading: 'A CV tells you what someone has done. Not who they really are.',
  ctaEyebrow: 'with Vero Assess you can',
  ctaBenefits: [
    'Assess every candidate consistently, at any volume',
    'Make data-backed hiring decisions with confidence',
    'Reduce time-to-hire without sacrificing quality',
    'Build fairer, more inclusive hiring processes',
  ],
  ctaPrimaryLabel: siteSettings?.footerCtaButtonLabel || 'Get started',
  ctaPrimaryHref: siteSettings?.footerCtaButtonHref || '/get-started',
  ctaSecondaryLabel: 'Talk to sales',
  ctaSecondaryHref: '/contact',
  linkColumns: [
    {
      _key: k(),
      _type: 'column',
      title: 'Product',
      links: [
        { _key: k(), _type: 'link', label: 'Pricing', href: '/pricing', external: false },
        { _key: k(), _type: 'link', label: 'How it Works', href: '/how-it-works', external: false },
        { _key: k(), _type: 'link', label: 'Get started', href: '/get-started', external: false },
      ],
    },
    {
      _key: k(),
      _type: 'column',
      title: 'Company',
      links: [
        { _key: k(), _type: 'link', label: 'About', href: '/about', external: false },
        { _key: k(), _type: 'link', label: 'Contact', href: '/contact', external: false },
      ],
    },
    {
      _key: k(),
      _type: 'column',
      title: 'Resources',
      links: [
        { _key: k(), _type: 'link', label: 'The Science', href: '/resources/science', external: false },
        { _key: k(), _type: 'link', label: 'Compliance', href: '/resources/compliance', external: false },
      ],
    },
  ],
  contactPhone: '+44 (0)2922 331 888',
  contactEmail: 'support@veroassess.com',
  contactAddress: 'Cardiff, Wales, UK',
  socialLinks: [
    { _key: k(), _type: 'social', platform: 'linkedin', url: 'https://www.linkedin.com/company/tazio/' },
    { _key: k(), _type: 'social', platform: 'youtube', url: 'https://www.youtube.com/channel/UCfXfmtOQsyrkSeBAjeWZ05g' },
  ],
  legalLinks: [
    { _key: k(), _type: 'legalLink', label: 'Privacy Policy', href: '/legal/privacy', external: false },
    { _key: k(), _type: 'legalLink', label: 'Cookie Policy', href: '/legal/cookies', external: false },
    { _key: k(), _type: 'legalLink', label: 'Security', href: '/legal/security', external: false },
    { _key: k(), _type: 'legalLink', label: 'Modern Slavery Statement', href: 'https://cdn.prod.website-files.com/66bb33f5cfec7c80b0da6fed/6925b1b4a26e3c0faa0ca494_Modern%20Slavery%20and%20Human%20Trafficking%20Statement%202025-2026.pdf', external: true },
    { _key: k(), _type: 'legalLink', label: 'Status', href: 'https://status.tazio.network/', external: true },
  ],
  businessText:
    'Vero is a service offered by Tazio. Tazio is a service from Tazio Online Media Limited — Registered in England & Wales No: 03392879. Registered Office: Beechwood House, Greenwood Close, Cardiff Gate, Pontprennau, Cardiff CF23 8RD.',
  copyrightText: '© {year} Tazio Online Media Limited.',
  partnerLabel: 'In partnership with',
  /* partnerLogo intentionally left empty — the existing public ISE PNG
     stays in /public; once an editor uploads a Sanity asset it'll take
     over. */
}

/* ── Apply ────────────────────────────────────────────────────── */

async function writeNavDescriptions() {
  let n = 0
  for (const [slug, desc] of Object.entries(navDescriptions)) {
    const cat = bySlug.get(slug)
    if (!cat) continue
    if (apply) {
      await client.patch(cat._id).setIfMissing({ navDescription: desc }).commit()
    }
    n++
  }
  console.log(`  ${apply ? '✓' : '↪'} navDescription on ${n} category doc(s)${apply ? '' : ' (would set)'}`)
}

if (apply) {
  await client.createOrReplace(globalCategoryGroups)
  console.log('  ✓ globalCategoryGroups created/replaced')
  await client.createOrReplace(globalNav)
  console.log('  ✓ globalNav created/replaced')
  await client.createOrReplace(globalFooter)
  console.log('  ✓ globalFooter created/replaced')
} else {
  console.log('  ↪ globalCategoryGroups groups:', globalCategoryGroups.groups.map((g) => `${g.title} (${g.categories.length})`).join(', '))
  console.log('  ↪ globalNav topItems:', globalNav.topItems.length, 'companyColumns:', globalNav.companyColumns.length)
  console.log('  ↪ globalFooter linkColumns:', globalFooter.linkColumns.length, 'socialLinks:', globalFooter.socialLinks.length, 'legalLinks:', globalFooter.legalLinks.length)
}

await writeNavDescriptions()

console.log(`\n${apply ? 'Done.' : 'Dry run only — re-run with `-- --apply` to write.'}`)
