import { defineField, defineType } from 'sanity'
import { TagIcon } from '@sanity/icons'

export const pricingPage = defineType({
  name: 'pricingPage',
  title: 'Pricing Page',
  type: 'document',
  icon: TagIcon,
  groups: [
    { name: 'hero', title: 'Hero' },
    { name: 'starter', title: 'Starter Callout' },
    { name: 'bespoke', title: 'Bespoke' },
    { name: 'faq', title: 'FAQ' },
  ],
  fields: [
    /* ── Hero ── */
    defineField({
      name: 'heroHeadline',
      title: 'Headline',
      type: 'string',
      group: 'hero',
    }),
    defineField({
      name: 'heroIntro',
      title: 'Intro',
      type: 'text',
      rows: 4,
      group: 'hero',
    }),

    /* ── Starter Callout ── */
    defineField({
      name: 'starterCallout',
      title: 'Starter Callout',
      type: 'text',
      rows: 3,
      group: 'starter',
      description: 'Short line nudging unsure visitors toward the Starter plan.',
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

    /* ── FAQ ── */
    defineField({
      name: 'faqHeading',
      title: 'FAQ Heading',
      type: 'string',
      group: 'faq',
    }),
    defineField({
      name: 'faqs',
      title: 'FAQs',
      type: 'array',
      group: 'faq',
      of: [
        {
          type: 'object',
          preview: { select: { title: 'question' } },
          fields: [
            defineField({ name: 'question', title: 'Question', type: 'string' }),
            defineField({
              name: 'answer',
              title: 'Answer',
              type: 'array',
              of: [{ type: 'block', styles: [{ title: 'Normal', value: 'normal' }], marks: { decorators: [{ title: 'Emphasis', value: 'em' }, { title: 'Strong', value: 'strong' }] } }],
            }),
          ],
        },
      ],
    }),
    defineField({
      name: 'faqFooter',
      title: 'FAQ Footer',
      type: 'text',
      rows: 2,
      group: 'faq',
      description: 'Short sign-off below the FAQ list.',
    }),
  ],
  preview: {
    prepare() {
      return { title: 'Pricing Page' }
    },
  },
})
