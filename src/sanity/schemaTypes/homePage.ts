import { defineField, defineType } from 'sanity'
import {
  HomeIcon,
  SearchIcon,
  StarIcon,
  PlayIcon,
  RocketIcon,
  TagIcon,
  CommentIcon,
  HeartFilledIcon,
} from '@sanity/icons'

/**
 * HOME PAGE — singleton.
 *
 * Field groups are content-purpose-led ("Section 1: Hero", etc.) so it's
 * obvious what's on the page in what order. Every field carries a short
 * description telling the editor where the value appears and how it's used.
 */
export const homePage = defineType({
  name: 'homePage',
  title: 'Home Page',
  type: 'document',
  icon: HomeIcon,
  groups: [
    { name: 'hero',        title: 'Section 1 — Hero',       icon: StarIcon, default: true },
    { name: 'introBlock',  title: 'Section 2 — Intro + video', icon: PlayIcon },
    { name: 'usps',        title: 'Section 3 — Feature highlights', icon: HeartFilledIcon },
    { name: 'steps',       title: 'Section 4 — How it works', icon: RocketIcon },
    { name: 'pricing',     title: 'Section 5 — Pricing summary', icon: TagIcon },
    { name: 'closingCta',  title: 'Section 6 — Closing statement', icon: CommentIcon },
  ],
  fields: [
    /* ════════════════════════════════════════════════════════
       SECTION 1 — HERO
    ════════════════════════════════════════════════════════ */
    defineField({
      name: 'heroBadgeLabel',
      title: 'Pill badge text',
      type: 'string',
      group: 'hero',
      description:
        'Small pill above the headline (e.g. "New for 2025"). Leave blank to hide the pill.',
    }),
    defineField({
      name: 'heroBadgeHref',
      title: 'Pill badge link',
      type: 'string',
      group: 'hero',
      description: 'Where the pill links to. Use a path like "/pricing" or full URL.',
      hidden: ({ parent }) => !parent?.heroBadgeLabel,
    }),
    defineField({
      name: 'heroTitle',
      title: 'Headline',
      type: 'string',
      group: 'hero',
      description: 'The main headline. Aim for 4–8 words for maximum punch.',
      validation: (Rule) =>
        Rule.required().max(80).warning('Headlines longer than 80 chars start to wrap awkwardly.'),
    }),
    defineField({
      name: 'heroIntro',
      title: 'Intro paragraph',
      type: 'text',
      rows: 3,
      group: 'hero',
      description: 'One or two sentences that sit beneath the headline.',
    }),
    defineField({
      name: 'heroCTALabel',
      title: 'Primary button — text',
      type: 'string',
      group: 'hero',
      description: 'Bright, action-led — e.g. "Get started" or "Talk to us".',
    }),
    defineField({
      name: 'heroCTAHref',
      title: 'Primary button — link',
      type: 'string',
      group: 'hero',
      description: 'e.g. "/get-started" or "/contact".',
      hidden: ({ parent }) => !parent?.heroCTALabel,
    }),
    defineField({
      name: 'heroSecondaryCTALabel',
      title: 'Secondary button — text',
      type: 'string',
      group: 'hero',
      description: 'Optional second button — usually quieter (e.g. "See how it works").',
    }),
    defineField({
      name: 'heroSecondaryCTAHref',
      title: 'Secondary button — link',
      type: 'string',
      group: 'hero',
      hidden: ({ parent }) => !parent?.heroSecondaryCTALabel,
    }),
    defineField({
      name: 'heroMedia',
      title: 'Hero media (image or video)',
      type: 'mediaBlock',
      group: 'hero',
      description: 'Image or clickable video shown beneath the headline. 1600×900px recommended for images / 16:9 cover for videos.',
    }),

    /* ════════════════════════════════════════════════════════
       SECTION 2 — INTRO BLOCK (text + video)
    ════════════════════════════════════════════════════════ */
    defineField({
      name: 'introBlockEyebrow',
      title: 'Small label above heading',
      type: 'string',
      group: 'introBlock',
      description: 'A small uppercase label (e.g. "How it works"). Leave blank to hide.',
    }),
    defineField({
      name: 'introBlockHeading',
      title: 'Heading',
      type: 'string',
      group: 'introBlock',
    }),
    defineField({
      name: 'introBlockBody',
      title: 'Body paragraphs',
      type: 'array',
      group: 'introBlock',
      description: 'One or more paragraphs. Use Bold for emphasis sparingly.',
      of: [{ type: 'block', styles: [{ title: 'Normal', value: 'normal' }], marks: { decorators: [{ title: 'Bold', value: 'strong' }] } }],
    }),
    defineField({
      name: 'introBlockCtaLabel',
      title: 'Button text',
      type: 'string',
      group: 'introBlock',
    }),
    defineField({
      name: 'introBlockCtaHref',
      title: 'Button link',
      type: 'string',
      group: 'introBlock',
      hidden: ({ parent }) => !parent?.introBlockCtaLabel,
    }),
    defineField({
      name: 'introBlockMedia',
      title: 'Section media (image or video)',
      type: 'mediaBlock',
      group: 'introBlock',
      description: 'Image or clickable video shown beside the intro body. 16:9 cover recommended.',
    }),

    /* ════════════════════════════════════════════════════════
       SECTION 3 — FEATURE HIGHLIGHTS (cards grid)
    ════════════════════════════════════════════════════════ */
    defineField({
      name: 'uspsSectionLabel',
      title: 'Small label above heading',
      type: 'string',
      group: 'usps',
    }),
    defineField({
      name: 'uspsSectionHeading',
      title: 'Section heading',
      type: 'string',
      group: 'usps',
    }),
    defineField({
      name: 'uspsSectionSubheading',
      title: 'Section intro paragraph',
      type: 'text',
      rows: 2,
      group: 'usps',
    }),
    defineField({
      name: 'usps',
      title: 'Highlight cards',
      type: 'array',
      group: 'usps',
      description:
        'Best with 3 or 6 cards (renders as a 3-column grid on desktop). Each card has a label, body and optional image.',
      of: [
        {
          type: 'object',
          preview: {
            select: { title: 'label', subtitle: 'body', media: 'image' },
            prepare: ({ title, subtitle, media }) => ({
              title: title || 'Untitled card',
              subtitle: subtitle ? subtitle.slice(0, 80) : undefined,
              media,
            }),
          },
          fields: [
            defineField({
              name: 'label',
              title: 'Card title',
              type: 'string',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'body',
              title: 'Card description',
              type: 'text',
              rows: 3,
              description: 'Keep concise — 1–2 short sentences.',
            }),
            defineField({
              name: 'image',
              title: 'Card image',
              type: 'image',
              options: { hotspot: true },
              description: 'Optional image at the top of the card. Square or 4:3 works best.',
              fields: [defineField({ name: 'alt', title: 'Alt text', type: 'string' })],
            }),
          ],
        },
      ],
    }),
    defineField({
      name: 'uspsCtaLabel',
      title: 'Section button — text',
      type: 'string',
      group: 'usps',
    }),
    defineField({
      name: 'uspsCtaHref',
      title: 'Section button — link',
      type: 'string',
      group: 'usps',
      hidden: ({ parent }) => !parent?.uspsCtaLabel,
    }),

    /* ════════════════════════════════════════════════════════
       SECTION 4 — HOW IT WORKS (numbered steps)
    ════════════════════════════════════════════════════════ */
    defineField({
      name: 'stepsSectionLabel',
      title: 'Small label above heading',
      type: 'string',
      group: 'steps',
    }),
    defineField({
      name: 'stepsSectionHeading',
      title: 'Section heading',
      type: 'string',
      group: 'steps',
    }),
    defineField({
      name: 'stepsSectionIntro',
      title: 'Section intro paragraph',
      type: 'text',
      rows: 2,
      group: 'steps',
    }),
    defineField({
      name: 'steps',
      title: 'Steps',
      type: 'array',
      group: 'steps',
      description: 'Numbered automatically (1, 2, 3…). Best with 3 steps.',
      of: [
        {
          type: 'object',
          preview: {
            select: { title: 'title', subtitle: 'body' },
            prepare: ({ title, subtitle }) => ({
              title: title || 'Untitled step',
              subtitle: subtitle ? subtitle.slice(0, 80) : undefined,
            }),
          },
          fields: [
            defineField({
              name: 'title',
              title: 'Step title',
              type: 'string',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'body',
              title: 'Step description',
              type: 'text',
              rows: 4,
            }),
            defineField({
              name: 'ctaLabel',
              title: 'Step button — text (optional)',
              type: 'string',
            }),
            defineField({
              name: 'ctaHref',
              title: 'Step button — link',
              type: 'string',
              hidden: ({ parent }) => !parent?.ctaLabel,
            }),
          ],
        },
      ],
    }),

    /* ════════════════════════════════════════════════════════
       SECTION 5 — PRICING SUMMARY
    ════════════════════════════════════════════════════════ */
    defineField({
      name: 'pricingSectionLabel',
      title: 'Small label above heading',
      type: 'string',
      group: 'pricing',
    }),
    defineField({
      name: 'pricingSectionHeading',
      title: 'Section heading',
      type: 'string',
      group: 'pricing',
    }),
    defineField({
      name: 'pricingSectionSubheading',
      title: 'Section intro paragraph',
      type: 'text',
      rows: 3,
      group: 'pricing',
    }),
    defineField({
      name: 'pricingHighlights',
      title: 'Highlight bullets',
      type: 'array',
      group: 'pricing',
      of: [{ type: 'string' }],
      description:
        'Short claims shown beside the button — e.g. "From £49 per candidate", "No long-term contract". 3–4 work best.',
    }),
    defineField({
      name: 'pricingCtaLabel',
      title: 'Button — text',
      type: 'string',
      group: 'pricing',
    }),
    defineField({
      name: 'pricingCtaHref',
      title: 'Button — link',
      type: 'string',
      group: 'pricing',
      hidden: ({ parent }) => !parent?.pricingCtaLabel,
    }),

    /* ════════════════════════════════════════════════════════
       SECTION 6 — CLOSING STATEMENT
       The big purple block above the footer.
    ════════════════════════════════════════════════════════ */
    defineField({
      name: 'closingStatement',
      title: 'Big headline statement',
      type: 'string',
      group: 'closingCta',
      description: 'The largest text on the page. Aim for ≤10 punchy words.',
      validation: (Rule) =>
        Rule.max(120).warning('Statements longer than ~12 words tend to wrap into too many lines.'),
    }),
    defineField({
      name: 'closingEyebrow',
      title: 'Small label (yellow pill)',
      type: 'string',
      group: 'closingCta',
      description: 'e.g. "with Vero Assess you can". Sits between the headline and the rotating benefits.',
    }),
    defineField({
      name: 'closingBenefits',
      title: 'Rotating benefit lines',
      type: 'array',
      group: 'closingCta',
      of: [{ type: 'string' }],
      description:
        'Short benefit claims that fade in/out one at a time. 3–6 lines work best. ' +
        'Each line is one short sentence (no full stop).',
    }),
    defineField({
      name: 'closingCtaLabel',
      title: 'Button — text',
      type: 'string',
      group: 'closingCta',
    }),
    defineField({
      name: 'closingCtaHref',
      title: 'Button — link',
      type: 'string',
      group: 'closingCta',
      hidden: ({ parent }) => !parent?.closingCtaLabel,
    }),
  ],
  preview: {
    prepare() {
      return { title: 'Home page', subtitle: 'Singleton — only one of these exists' }
    },
  },
})
