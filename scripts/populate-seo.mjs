/**
 * Populate page titles + meta descriptions across the site.
 *
 *  • Singleton pages: writes pageTitle + metaDescription onto each
 *    pageSeo document (homePage.seo, aboutPage.seo, etc.)
 *  • Job categories: writes seo.pageTitle + seo.metaDescription onto
 *    the inline seo field on each jobCategory document
 *  • Sets siteSettings.titleTemplate to "%s" (pass-through) — the
 *    client-supplied titles already include "Vero Assess" branding
 *    where they want it, so we don't want the global template to
 *    append a second "— Vero Assess" suffix.
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
   Singleton page SEO copy — supplied by client.
   Titles are written VERBATIM — the global titleTemplate is set
   to "%s" below so these render as-is in the browser tab.
──────────────────────────────────────────────────────────── */
const PAGE_SEO = {
  homePage: {
    pageTitle: 'Vero Assess | Science-Backed Talent Assessment Platform',
    metaDescription:
      'Identify top talent with role-specific, science-backed assessments. Reduce recruitment bias and make better hiring decisions with Vero Assess.',
  },
  aboutPage: {
    pageTitle: 'Vero Assess | Our Mission to Identify Talent Ready to Thrive',
    metaDescription:
      'Learn about the team behind Vero Assess and our commitment to making recruitment fairer, faster and more effective through science-backed assessments.',
  },
  sciencePage: {
    pageTitle: 'The Science Behind Vero Assess | Validated Values and Traits',
    metaDescription:
      'Discover the academic research and psychometric principles that power our assessments, ensuring every test is reliable, fair and predictive of success.',
  },
  howItWorksPage: {
    pageTitle: 'How Vero Assess Works | Streamline Your Hiring Process',
    metaDescription:
      'From rapid setup to detailed candidate results, see how easy it is to integrate role-specific assessments into your existing recruitment workflow.',
  },
  pricingPage: {
    pageTitle: 'Flexible Pricing Plans for Teams | Vero Assess',
    metaDescription:
      'Choose a pricing plan to match your hiring needs. From Starter to Scale, find a package that fits your required roles and candidate volumes.',
  },
  compliancePage: {
    pageTitle: 'Enterprise-Grade Security & ISO27001 Compliance | Vero Assess',
    metaDescription:
      'Learn about our commitment to data security and accessibility, including ISO27001 & ISO9001, Cyber Essentials Plus, and WCAG 2.2 standards.',
  },
  contactPage: {
    pageTitle: 'Get in Touch | Talk to us about Vero Assess',
    metaDescription:
      'Have questions or ready to start? Contact the Vero Assess team if you need support to get our CV-less, bias-free assessments up and running.',
  },
};

/* ────────────────────────────────────────────────────────────
   Per-category SEO copy — supplied by client. Keyed on jobCategory slug.
──────────────────────────────────────────────────────────── */
const CATEGORY_SEO = {
  'administration': {
    pageTitle: 'Administration Role Assessments | Hire Organised Talent',
    metaDescription:
      'Identify dependable, organised administration talent with specialised assessments designed to test attention to detail and efficiency.',
  },
  'retail-and-hospitality': {
    pageTitle: 'Retail & Hospitality Assessments | Hire Customer-Focused Talent',
    metaDescription:
      'Streamline your retail hiring with assessments built for speed and accuracy. Identify reliable, customer-focused staff to strengthen your teams.',
  },
  'sales': {
    pageTitle: 'Sales Role Assessments | Hire High-Performing Sales Talent',
    metaDescription:
      'Use situational judgement and aptitude tests to identify resilient, goal-oriented sales professionals who can drive results for your business.',
  },
  'health-and-social-care': {
    pageTitle: 'Health & Social Care Assessments | Identify Compassionate Talent',
    metaDescription:
      'Find candidates with the values and dependability to thrive in a health & social care role, with our specialised, bias-free assessments.',
  },
  'operations-and-logistics': {
    pageTitle: 'Operations & Logistics Assessments | Reliable Staff Hiring',
    metaDescription:
      'Ensure operational reliability by assessing for aptitude, judgement and dependability as you build your warehouse and logistics team.',
  },
  'apprentices': {
    pageTitle: 'Apprentice Assessments | Identify Talent Ready for a Challenge',
    metaDescription:
      'Discover high-potential apprentices with assessments designed to measure core aptitudes and the willingness to learn, regardless of previous experience.',
  },
  'graduates': {
    pageTitle: 'Graduate Role Assessments | Scale Your Early Careers Hiring',
    metaDescription:
      'Assess large graduate pools efficiently with science-backed tests that identify future stars based on cognitive ability and cultural alignment.',
  },
  'interns': {
    pageTitle: 'Intern Assessments | Objective Screening for Growth Potential',
    metaDescription:
      'Make informed decisions on intern placements using assessments that evaluate foundational skills, core values and suitability for your organisation.',
  },
  'claims-and-collections': {
    pageTitle: 'Claims & Collections Assessments | Identify Integrity & Resilience',
    metaDescription:
      'Find candidates who maintain integrity and stay calm under pressure with assessments tailored for the claims and collections sector.',
  },
  'field-service-and-technicians': {
    pageTitle: 'Field Service & Technician Assessments | Recruit Reliable Talent',
    metaDescription:
      'Identify dependable field service professionals and technicians who can work independently and provide a high-quality on-site service to your customers.',
  },
};

async function setTitleTemplatePassThrough() {
  console.log('— siteSettings.titleTemplate → "%s" (pass-through) —');
  const settings = await client.fetch(`*[_type == "siteSettings"][0]{ _id }`);
  if (!settings?._id) {
    console.log('  No siteSettings doc found — skipping template update.');
    return;
  }
  await client.patch(settings._id).set({ titleTemplate: '%s' }).commit();
  console.log(`  ${settings._id} updated`);
}

async function populateSingletonPages() {
  console.log('\n— Singleton pages —');
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
  await setTitleTemplatePassThrough();
  await populateSingletonPages();
  const cats = await populateCategories();
  console.log(`\nDone. ${Object.keys(PAGE_SEO).length} pages + ${cats} categories.`);
}

main().catch((err) => {
  console.error('Population failed:', err);
  process.exit(1);
});
