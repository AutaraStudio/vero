/**
 * One-off migration: copy each singleton page's inline `seo` field
 * into a new companion `pageSeo` document with a deterministic ID.
 *
 *   homePage.seo  ←  homePage.seo (inline)
 *   aboutPage.seo ←  aboutPage.seo (inline)
 *   ... etc.
 *
 * After this runs, the inline `seo` field on each page is unset
 * (the schema no longer declares it, so it would show as "unknown
 * field" in Studio if left).
 *
 * Run with:
 *   node --env-file=.env.local scripts/migrate-page-seo.mjs
 */
import { createClient } from '@sanity/client';

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset:   process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: '2024-09-01',
  token:     process.env.SANITY_API_TOKEN,
  useCdn:    false,
});

const SINGLETON_PAGES = [
  'homePage',
  'aboutPage',
  'pricingPage',
  'contactPage',
  'howItWorksPage',
  'sciencePage',
  'compliancePage',
  'assessmentsPage',
];

async function main() {
  let created = 0;
  let cleared = 0;

  for (const pageId of SINGLETON_PAGES) {
    const seoId = `${pageId}.seo`;

    /* Fetch the page including the (now-orphaned) inline seo field */
    const page = await client.fetch(
      `*[_id == $pageId][0]{ _id, seo }`,
      { pageId },
    );

    if (!page) {
      console.log(`  -- ${pageId}: page doc doesn't exist, skipping`);
      continue;
    }

    /* If there's existing inline seo data, copy it into the new pageSeo doc.
       Use createOrReplace so re-running the script is idempotent. */
    if (page.seo) {
      await client.createOrReplace({
        _id: seoId,
        _type: 'pageSeo',
        seo: page.seo,
      });
      created += 1;
      console.log(`  copied ${pageId} → ${seoId}`);

      /* Then unset the now-orphaned inline seo field on the page doc */
      await client.patch(pageId).unset(['seo']).commit();
      cleared += 1;
    } else {
      /* No existing data — create an empty pageSeo doc so the Studio
         sidebar item resolves to something (Sanity creates a draft on
         first edit otherwise, which is fine but less obvious). */
      const existing = await client.fetch(`*[_id == $seoId][0]{_id}`, { seoId });
      if (!existing) {
        await client.createOrReplace({ _id: seoId, _type: 'pageSeo' });
        created += 1;
        console.log(`  created empty ${seoId}`);
      } else {
        console.log(`  -- ${seoId} already exists, skipping`);
      }
    }
  }

  console.log(`\nDone. ${created} pageSeo doc(s) written, ${cleared} inline seo field(s) cleared.`);
}

main().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
