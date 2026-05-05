import { type SchemaTypeDefinition } from 'sanity'
import { homePage } from './homePage'
import { siteSettings } from './siteSettings'
import { pricingPage } from './pricingPage'
import { assessmentsPage } from './assessmentsPage'
import { howItWorksPage } from './howItWorksPage'
import { aboutPage } from './aboutPage'
import { contactPage } from './contactPage'
import { sciencePage } from './sciencePage'
import { compliancePage } from './compliancePage'
import { pricingTier } from './pricingTier'
import { jobCategory } from './jobCategory'
import { role } from './role'
import { seoFields } from './seoFields'
import { mediaBlock } from './mediaBlock'
import { pageSeo } from './pageSeo'
import { legalPage } from './legalPage'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [
    /* Reusable object types — must be registered before documents that use them */
    seoFields,
    mediaBlock,

    /* Per-page SEO — separate documents so Studio sidebar can show a focused SEO view */
    pageSeo,

    /* Documents */
    homePage,
    siteSettings,
    pricingPage,
    assessmentsPage,
    howItWorksPage,
    aboutPage,
    contactPage,
    sciencePage,
    compliancePage,
    pricingTier,
    jobCategory,
    role,
    legalPage,
  ],
}
