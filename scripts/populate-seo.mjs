/**
 * Populate page titles + meta descriptions across the site.
 *
 *  • Singleton pages: writes pageTitle + metaDescription onto each
 *    pageSeo document (homePage.seo, aboutPage.seo, etc.)
 *  • Job categories: writes seo.pageTitle + seo.metaDescription onto
 *    the inline seo field on each jobCategory document
 *
 * Idempotent — safe to re-run; existing values are overwritten with the
 * canonical copy here. If you want to keep an editor's customisations,
 * delete the entry from the lookup tables below first.
 *
 * Run with:
 *   node --env-file=.env.local scripts/populate-seo.mjs
 */
import { createClient } from '@sanity/client';

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset:   process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: '2024-09-01',
  token:     process.env.SANITY_API_TOKEN,
  useCdn:    false,
});

/* ────────────────────────────────────────────────────────────
   Singleton page SEO copy.
   Lengths chosen for SEO best practices:
     - title ≤ 60 chars   (search engine truncates ~60-65)
     - description 140-160 chars (search engine truncates ~160)
   The Site Settings titleTemplate appends " — Vero Assess" so the
   titles below are written without the brand suffix.
──────────────────────────────────────────────────────────── */
const PAGE_SEO = {
  homePage: {
    pageTitle: 'Skills-based hiring assessments built for your roles',
    metaDescription:
      "Vero Assess helps hiring teams identify the right people faster, with science-backed assessments tailored to specific job families. Objective, fair, and built on trusted technology.",
  },
  aboutPage: {
    pageTitle: 'About us — powered by trusted technology',
    metaDescription:
      'Vero Assess is part of Tazio, built on the same enterprise recruitment technology trusted by leading employers since 2010. Meet the team behind smarter, fairer hiring.',
  },
  pricingPage: {
    pageTitle: 'Pricing — flexible plans for every team',
    metaDescription:
      "Four plans for every team size, from one-off Starter campaigns through to high-volume Scale recruitment. Transparent pricing with no long-term contract required.",
  },
  contactPage: {
    pageTitle: 'Contact us',
    metaDescription:
      'Get in touch with the Vero Assess team. Talk to us about how science-backed assessments can transform your hiring — by phone, email, or contact form.',
  },
  howItWorksPage: {
    pageTitle: 'How it works — from setup to first hire',
    metaDescription:
      "See how Vero Assess fits into your hiring process. Seven simple steps from sign-up to your first hire, with a candidate experience built around fairness.",
  },
  sciencePage: {
    pageTitle: 'The science behind Vero Assess',
    metaDescription:
      'Four perspectives, sixteen dimensions, scientifically-validated assessments built to predict role-specific potential. The thinking behind Vero Assess.',
  },
  compliancePage: {
    pageTitle: 'Compliance — safe, secure, accessible',
    metaDescription:
      'ISO 27001, ISO 9001, Cyber Essentials Plus, and WCAG 2.2. The regulatory and accessibility frameworks Vero Assess is built on.',
  },
  assessmentsPage: {
    pageTitle: 'Assessments built for the roles you actually hire',
    metaDescription:
      'Browse our library of skills-based assessments designed around specific job families and roles. Find the right one for your hiring needs.',
  },
};

/* ────────────────────────────────────────────────────────────
   Per-category SEO copy. Keyed on jobCategory slug. Title ends
   with " assessments" since the brand suffix gets added by the
   global title template.
──────────────────────────────────────────────────────────── */
const CATEGORY_SEO = {
  'administration': {
    pageTitle: 'Administration assessments',
    metaDescription:
      'Hire dependable, organised administrators. Vero Assess for Administration measures the precision, focus and communication skills that make great support staff.',
  },
  'apprentices': {
    pageTitle: 'Apprentice assessments',
    metaDescription:
      'Spot apprentice potential beyond the CV. Vero Assess measures coachability, motivation and aptitude for the trade — for fairer, smarter early-career hiring.',
  },
  'claims-and-collections': {
    pageTitle: 'Claims and collections assessments',
    metaDescription:
      'Hire claims and collections agents who keep their head under pressure. Vero Assess tests the integrity, resilience and customer focus this work demands.',
  },
  'field-service-and-technicians': {
    pageTitle: 'Field service and technicians assessments',
    metaDescription:
      'Hire field engineers and technicians who can fix the job AND handle the customer. Vero Assess measures practical judgement, problem-solving and service mindset.',
  },
  'graduates': {
    pageTitle: 'Graduate assessments',
    metaDescription:
      'Identify high-potential graduates before they apply elsewhere. Vero Assess measures the values and capabilities that predict success in early-career roles.',
  },
  'health-and-social-care': {
    pageTitle: 'Health and social care assessments',
    metaDescription:
      'Hire compassionate, resilient care staff. Vero Assess for Health and Social Care measures the empathy, emotional resilience and reliability the sector needs.',
  },
  'interns': {
    pageTitle: 'Internship assessments',
    metaDescription:
      'Build a stronger talent pipeline through smarter intern hiring. Vero Assess measures aptitude, drive and team-fit so your interns become tomorrow\'s graduates.',
  },
  'operations-and-logistics': {
    pageTitle: 'Operations and logistics assessments',
    metaDescription:
      'Hire process-led, precise operators. Vero Assess for Operations and Logistics measures the planning, attention-to-detail and reliability that keep work flowing.',
  },
  'retail-and-hospitality': {
    pageTitle: 'Retail and hospitality assessments',
    metaDescription:
      'Hire customer-first retail and hospitality staff who solve problems on the floor. Vero Assess measures service mindset, energy and adaptability under pressure.',
  },
  'sales': {
    pageTitle: 'Sales assessments',
    metaDescription:
      "Hire commercially-minded salespeople who actually close. Vero Assess for Sales measures resilience, drive and the values that separate great sellers from average.",
  },
};

async function populateSingletonPages() {
  console.log('— Singleton pages —');
  for (const [pageId, seo] of Object.entries(PAGE_SEO)) {
    const seoId = `${pageId}.seo`;
    await client
      .patch(seoId)
      .set({ 'seo.pageTitle': seo.pageTitle, 'seo.metaDescription': seo.metaDescription })
      .commit({ autoGenerateArrayKeys: true });
    console.log(`  ${seoId}`);
  }
}

async function populateCategories() {
  console.log('\n— Job categories —');
  /* Pull every jobCategory + its slug so we can match against the lookup */
  const cats = await client.fetch(
    `*[_type == "jobCategory"]{ _id, name, "slug": slug.current }`,
  );
  let written = 0;
  let unmatched = [];
  for (const cat of cats) {
    const seo = CATEGORY_SEO[cat.slug];
    if (!seo) {
      unmatched.push(cat.slug);
      continue;
    }
    await client
      .patch(cat._id)
      .set({ 'seo.pageTitle': seo.pageTitle, 'seo.metaDescription': seo.metaDescription })
      .commit({ autoGenerateArrayKeys: true });
    console.log(`  ${cat._id} (${cat.slug})`);
    written += 1;
  }
  if (unmatched.length) {
    console.log(`\n  Unmatched (no copy in lookup): ${unmatched.join(', ')}`);
  }
  return written;
}

async function main() {
  await populateSingletonPages();
  const cats = await populateCategories();
  console.log(`\nDone. ${Object.keys(PAGE_SEO).length} pages + ${cats} categories.`);
}

main().catch((err) => {
  console.error('Population failed:', err);
  process.exit(1);
});
