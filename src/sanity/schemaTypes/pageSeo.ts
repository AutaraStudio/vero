import { defineField, defineType } from 'sanity'
import { SearchIcon } from '@sanity/icons'

/**
 * Per-page SEO settings as a SEPARATE document.
 *
 * Why a separate document instead of an `seo` field on each page?
 * So the Studio sidebar can offer a focused "SEO" link per page that
 * opens a clean form with only SEO fields — no section tabs cluttering
 * the view.
 *
 * One document per page, with a predictable ID:
 *   - homePage         → homePage.seo
 *   - aboutPage        → aboutPage.seo
 *   - pricingPage      → pricingPage.seo
 *   - howItWorksPage   → howItWorksPage.seo
 *   - sciencePage      → sciencePage.seo
 *   - compliancePage   → compliancePage.seo
 *   - contactPage      → contactPage.seo
 *   - assessmentsPage  → assessmentsPage.seo
 */
export const pageSeo = defineType({
  name: 'pageSeo',
  title: 'Page SEO',
  type: 'document',
  icon: SearchIcon,
  fields: [
    defineField({
      name: 'seo',
      title: 'Search engine + social sharing',
      type: 'seoFields',
      description:
        'Browser tab title, search-result snippet, and link previews on social. ' +
        'Anything left blank inherits from Site Settings.',
    }),
  ],
  preview: {
    prepare() {
      return { title: 'Page SEO' }
    },
  },
})
