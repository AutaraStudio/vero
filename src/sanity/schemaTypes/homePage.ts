import { defineField, defineType } from 'sanity'
import { altRequiredWhenImagePresent } from '../lib/altFieldValidation'
import {
  HomeIcon,
  SearchIcon,
  StarIcon,
  PlayIcon,
  RocketIcon,
  TagIcon,
  HeartFilledIcon,
  ImagesIcon,
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
    { name: 'logoMarquee', title: 'Section 2 — Logo marquee', icon: ImagesIcon },
    { name: 'introBlock',  title: 'Section 3 — Intro + video', icon: PlayIcon },
    { name: 'usps',        title: 'Section 4 — Feature highlights', icon: HeartFilledIcon },
    { name: 'steps',       title: 'Section 5 — How it works', icon: RocketIcon },
    { name: 'pricing',     title: 'Section 6 — Pricing summary', icon: TagIcon },
    /* "Section 7 — Closing statement" group removed. The closing CTA
       is now site-wide — edit it via Global → Footer instead. */
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
       SECTION 2 — LOGO MARQUEE
       Scrolling row of partner / customer logos. Renders only on
       the home page, just below the hero.
    ════════════════════════════════════════════════════════ */
    defineField({
      name: 'partnerLogosLabel',
      title: 'Section label',
      type: 'string',
      group: 'logoMarquee',
      description:
        'Small eyebrow shown above the marquee (e.g. "Trusted by hiring teams at"). Leave blank to hide the label.',
    }),
    defineField({
      name: 'partnerLogos',
      title: 'Logos',
      type: 'array',
      group: 'logoMarquee',
      description:
        'Logos shown in the scrolling marquee. SVG strongly preferred — uploaded as raw file assets so they render crisply and recolour cleanly. Leave the array empty to hide the section.',
      of: [
        {
          type: 'object',
          preview: {
            select: { title: 'name', media: 'logo' },
          },
          fields: [
            defineField({
              name: 'name',
              title: 'Company name',
              type: 'string',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'logo',
              title: 'Logo (SVG, PNG, or WebP)',
              type: 'file',
              options: {
                accept: 'image/svg+xml,image/png,image/webp',
              },
              description: 'SVGs upload as files (no transformations) so they keep their full vector fidelity.',
            }),
          ],
        },
      ],
    }),

    /* ════════════════════════════════════════════════════════
       SECTION 3 — INTRO BLOCK (text + video)
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
       SECTION 4 — FEATURE HIGHLIGHTS (cards grid)
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
              fields: [defineField({ name: 'alt', title: 'Alt text', type: 'string', validation: altRequiredWhenImagePresent })],
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
       SECTION 5 — HOW IT WORKS (numbered steps)
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
       SECTION 6 — PRICING SUMMARY
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

    /* The closing CTA used to live here as a per-page section — but
       it always renders the same content as the site-wide footer
       block, so now lives once in Global → Footer. The fields are
       removed from this schema; the orphan data on the existing
       homePage doc is harmless and can be unset by an editor opening
       the doc in Studio (Sanity ignores unknown fields). */
  ],
  preview: {
    prepare() {
      return { title: 'Home page', subtitle: 'Singleton — only one of these exists' }
    },
  },
})
