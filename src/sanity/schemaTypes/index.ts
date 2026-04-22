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

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [
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
  ],
}
