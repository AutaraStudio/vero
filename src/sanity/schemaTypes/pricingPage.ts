import { defineField, defineType } from 'sanity'
import {
  TagIcon,
  SearchIcon,
  StarIcon,
  InfoOutlineIcon,
  PackageIcon,
  HelpCircleIcon,
} from '@sanity/icons'

export const pricingPage = defineType({
  name: 'pricingPage',
  title: 'Pricing Page',
  type: 'document',
  icon: TagIcon,
  groups: [
    { name: 'hero',    title: 'Section 1 — Hero',               icon: StarIcon, default: true },
    { name: 'starter', title: 'Section 2 — Starter callout',    icon: InfoOutlineIcon },
    { name: 'bespoke', title: 'Section 3 — Bespoke CTA',        icon: PackageIcon },
    { name: 'faq',     title: 'Section 4 — FAQ',                icon: HelpCircleIcon },
  ],
  fields: [
    /* ── Hero ── */
    /* ════════════════════════════════════════════════════════
       SECTION 1 — HERO
    ════════════════════════════════════════════════════════ */
    defineField({
      name: 'heroHeadline',
      title: 'Headline',
      type: 'string',
      group: 'hero',
      description: 'Big headline at the top of the page (e.g. "Flexible pricing"). 2–6 words.',
      validation: (Rule) =>
        Rule.max(80).warning('Headlines longer than 80 chars start to wrap awkwardly.'),
    }),
    defineField({
      name: 'heroIntro',
      title: 'Intro paragraph',
      type: 'text',
      rows: 4,
      group: 'hero',
      description: 'One or two sentences explaining the pricing approach.',
    }),

    /* ════════════════════════════════════════════════════════
       SECTION 2 — STARTER CALLOUT
       The small tooltip on the Starter pricing card.
    ════════════════════════════════════════════════════════ */
    defineField({
      name: 'starterCallout',
      title: 'Starter plan tooltip text',
      type: 'text',
      rows: 3,
      group: 'starter',
      description:
        'Short callout shown when hovering the info icon on the Starter card. ' +
        'Use this to nudge unsure visitors toward Starter (e.g. "Best for one-off campaigns").',
    }),

    /* ════════════════════════════════════════════════════════
       SECTION 3 — BESPOKE CTA
       The closing band offering custom pricing for larger needs.
    ════════════════════════════════════════════════════════ */
    defineField({
      name: 'bespokeHeading',
      title: 'Heading',
      type: 'string',
      group: 'bespoke',
      description: 'Large headline in the bespoke band (e.g. "Need something custom?").',
    }),
    defineField({
      name: 'bespokeBody',
      title: 'Body paragraph',
      type: 'text',
      rows: 3,
      group: 'bespoke',
      description: 'Short explanation underneath the bespoke heading.',
    }),
    defineField({
      name: 'bespokeCtaLabel',
      title: 'Button — text',
      type: 'string',
      group: 'bespoke',
      description: 'e.g. "Talk to us" or "Get in touch".',
    }),
    defineField({
      name: 'bespokeCtaHref',
      title: 'Button — link',
      type: 'string',
      group: 'bespoke',
      description: 'Where the button links to. Usually "/contact".',
      hidden: ({ parent }) => !parent?.bespokeCtaLabel,
    }),

    /* ════════════════════════════════════════════════════════
       SECTION 4 — FAQ
    ════════════════════════════════════════════════════════ */
    defineField({
      name: 'faqHeading',
      title: 'Section heading',
      type: 'string',
      group: 'faq',
      description: 'Heading above the FAQ accordion (e.g. "Pricing questions").',
    }),
    defineField({
      name: 'faqs',
      title: 'Questions & answers',
      type: 'array',
      group: 'faq',
      description: 'Each question becomes a click-to-expand row. Answers support bold + italic formatting.',
      of: [
        {
          type: 'object',
          preview: {
            select: { title: 'question' },
            prepare: ({ title }) => ({
              title: title || 'Untitled question',
              subtitle: 'Click to edit answer',
            }),
          },
          fields: [
            defineField({
              name: 'question',
              title: 'Question',
              type: 'string',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'answer',
              title: 'Answer',
              type: 'array',
              description: 'Plain text with optional bold or italic. Multiple paragraphs supported.',
              of: [{ type: 'block', styles: [{ title: 'Normal', value: 'normal' }], marks: { decorators: [{ title: 'Italic', value: 'em' }, { title: 'Bold', value: 'strong' }] } }],
            }),
          ],
        },
      ],
    }),
    defineField({
      name: 'faqFooter',
      title: 'Footer text (below FAQ list)',
      type: 'text',
      rows: 2,
      group: 'faq',
      description: 'Optional sign-off below the FAQ list (e.g. "Still got questions? Email us at…").',
    }),
  ],
  preview: {
    prepare() {
      return { title: 'Pricing page', subtitle: 'Singleton — only one of these exists' }
    },
  },
})
