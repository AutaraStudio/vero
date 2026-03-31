import { type SchemaTypeDefinition } from 'sanity'
import { homePage } from './homePage'
import { pricingTier } from './pricingTier'
import { jobCategory } from './jobCategory'
import { role } from './role'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [homePage, pricingTier, jobCategory, role],
}
