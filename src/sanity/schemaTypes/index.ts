import { type SchemaTypeDefinition } from 'sanity'
import { pricingTier } from './pricingTier'
import { jobCategory } from './jobCategory'
import { role } from './role'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [pricingTier, jobCategory, role],
}
