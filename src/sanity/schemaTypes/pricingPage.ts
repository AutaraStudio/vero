import { defineField, defineType } from 'sanity'
import { TagIcon } from '@sanity/icons'

export const pricingPage = defineType({
  name: 'pricingPage',
  title: 'Pricing Page',
  type: 'document',
  icon: TagIcon,
  groups: [
    { name: 'hero', title: 'Hero' },
    { name: 'bespoke', title: 'Bespoke' },
  ],
  fields: [
    /* ── Hero ── */
    defineField({
      name: 'heroHeadline',
      title: 'Hero Headline',
      type: 'string',
      group: 'hero',
    }),
    defineField({
      name: 'heroIntro',
      title: 'Hero Intro',
      type: 'text',
      rows: 3,
      group: 'hero',
    }),

    /* ── Bespoke ── */
    defineField({
      name: 'bespokeHeading',
      title: 'Bespoke Heading',
      type: 'string',
      group: 'bespoke',
    }),
    defineField({
      name: 'bespokeBody',
      title: 'Bespoke Body',
      type: 'text',
      rows: 3,
      group: 'bespoke',
    }),
    defineField({
      name: 'bespokeCtaLabel',
      title: 'Bespoke CTA Label',
      type: 'string',
      group: 'bespoke',
    }),
    defineField({
      name: 'bespokeCtaHref',
      title: 'Bespoke CTA Href',
      type: 'string',
      group: 'bespoke',
    }),
  ],
  preview: {
    prepare() {
      return { title: 'Pricing Page' }
    },
  },
})
