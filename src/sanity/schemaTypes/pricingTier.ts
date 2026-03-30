import { defineField, defineType } from 'sanity'
import { TagIcon } from '@sanity/icons'

export const pricingTier = defineType({
  name: 'pricingTier',
  title: 'Pricing Tier',
  type: 'document',
  icon: TagIcon,
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'name' },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'order',
      title: 'Display Order',
      type: 'number',
      description: 'Controls the order cards appear (1 = first)',
      validation: (Rule) => Rule.required().integer().min(1),
    }),
    defineField({
      name: 'isFeatured',
      title: 'Featured (Most Popular)',
      type: 'boolean',
      description: 'Shows the "Most popular" badge and uses the brand-purple-deep theme',
      initialValue: false,
    }),
    defineField({
      name: 'tierLabel',
      title: 'Tier Label',
      type: 'string',
      description: 'e.g. "Annual subscription", "Single edition", "Bespoke"',
    }),
    defineField({
      name: 'tagline',
      title: 'Tagline',
      type: 'text',
      rows: 2,
    }),
    defineField({
      name: 'priceDisplay',
      title: 'Price Display',
      type: 'string',
      description: 'Formatted price string shown on card, e.g. "£9,000"',
    }),
    defineField({
      name: 'annualPrice',
      title: 'Annual Price (numeric)',
      type: 'number',
      description: 'Raw number for logic/calculations',
    }),
    defineField({
      name: 'paymentOptions',
      title: 'Payment Options',
      type: 'string',
      description: 'e.g. "Pay monthly or annually", "Pay in full"',
    }),
    defineField({
      name: 'duration',
      title: 'Duration',
      type: 'string',
      description: 'e.g. "Annual", "Available to use for 12 months or until credits used"',
    }),
    defineField({
      name: 'candidateLimit',
      title: 'Candidate Limit',
      type: 'number',
      description: 'Leave empty for Bespoke (unlimited)',
    }),
    defineField({
      name: 'roleLimit',
      title: 'Role Limit',
      type: 'number',
      description: 'Leave empty for Bespoke (unlimited)',
    }),
    defineField({
      name: 'ctaLabel',
      title: 'CTA Label',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'ctaType',
      title: 'CTA Type',
      type: 'string',
      options: {
        list: [
          { title: 'Buy (goes to purchase flow)', value: 'buy' },
          { title: 'Contact (goes to contact page)', value: 'contact' },
        ],
        layout: 'radio',
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'upgradeNote',
      title: 'Upgrade Note',
      type: 'text',
      rows: 2,
      description: 'Optional note shown on Starter tier about upgrading',
    }),
    defineField({
      name: 'bespokeDescription',
      title: 'Bespoke Description',
      type: 'text',
      rows: 3,
      description: 'Only used on the Bespoke tier card',
    }),
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'priceDisplay',
      isFeatured: 'isFeatured',
      order: 'order',
    },
    prepare({ title, subtitle, isFeatured, order }) {
      return {
        title: `${order}. ${title}${isFeatured ? ' ⭐' : ''}`,
        subtitle: subtitle || 'No price (Bespoke)',
      }
    },
  },
})
