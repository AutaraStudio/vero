import { defineField, defineType } from 'sanity'
import {
  PlayIcon,
  SearchIcon,
  StarIcon,
  RocketIcon,
  ListIcon,
  HeartFilledIcon,
  CheckmarkIcon,
} from '@sanity/icons'

export const howItWorksPage = defineType({
  name: 'howItWorksPage',
  title: 'How It Works Page',
  type: 'document',
  icon: PlayIcon,
  groups: [
    { name: 'seo',                 title: 'SEO',                             icon: SearchIcon },
    { name: 'hero',                title: 'Section 1 — Hero',                icon: StarIcon, default: true },
    { name: 'gettingStarted',      title: 'Section 2 — Getting started',     icon: RocketIcon },
    { name: 'steps',               title: 'Section 3 — Process steps',       icon: ListIcon },
    { name: 'candidateExperience', title: 'Section 4 — Candidate experience', icon: HeartFilledIcon },
    { name: 'benefits',            title: 'Section 5 — Benefits',            icon: CheckmarkIcon },
  ],
  fields: [
    defineField({
      name: 'seo',
      title: 'Search engine + social sharing',
      type: 'seoFields',
      group: 'seo',
      description:
        'Browser tab title, search-result snippet, and link previews on social. ' +
        'Anything left blank inherits from Site Settings.',
    }),

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
      rows: 3,
      group: 'hero',
    }),
    defineField({
      name: 'heroCTALabel',
      title: 'Primary CTA Label',
      type: 'string',
      group: 'hero',
    }),
    defineField({
      name: 'heroCTAHref',
      title: 'Primary CTA Href',
      type: 'string',
      group: 'hero',
    }),
    defineField({
      name: 'heroSecondaryCTALabel',
      title: 'Secondary CTA Label',
      type: 'string',
      group: 'hero',
    }),
    defineField({
      name: 'heroSecondaryCTAHref',
      title: 'Secondary CTA Href',
      type: 'string',
      group: 'hero',
    }),
    defineField({
      name: 'heroImage',
      title: 'Hero Image',
      type: 'image',
      group: 'hero',
      options: { hotspot: true },
      fields: [defineField({ name: 'alt', title: 'Alt text', type: 'string' })],
    }),

    /* ── Getting Started ── */
    defineField({
      name: 'gettingStartedHeading',
      title: 'Heading',
      type: 'string',
      group: 'gettingStarted',
    }),
    defineField({
      name: 'gettingStartedBody',
      title: 'Body',
      type: 'array',
      group: 'gettingStarted',
      of: [{ type: 'block', styles: [{ title: 'Normal', value: 'normal' }], marks: { decorators: [] } }],
    }),
    defineField({
      name: 'gettingStartedImage',
      title: 'Image',
      type: 'image',
      group: 'gettingStarted',
      options: { hotspot: true },
      fields: [defineField({ name: 'alt', title: 'Alt text', type: 'string' })],
    }),
    defineField({
      name: 'gettingStartedLinkLabel',
      title: 'Pricing Link Label',
      type: 'string',
      group: 'gettingStarted',
      description: 'Inline call-out, e.g. "Read more about your options on our pricing page".',
    }),
    defineField({
      name: 'gettingStartedLinkHref',
      title: 'Pricing Link Href',
      type: 'string',
      group: 'gettingStarted',
    }),

    /* ── Steps ── */
    defineField({
      name: 'stepsHeading',
      title: 'Section Heading',
      type: 'string',
      group: 'steps',
    }),
    defineField({
      name: 'stepsIntro',
      title: 'Section Intro',
      type: 'text',
      rows: 3,
      group: 'steps',
    }),
    defineField({
      name: 'steps',
      title: 'Steps',
      type: 'array',
      group: 'steps',
      of: [
        {
          type: 'object',
          preview: { select: { title: 'body' }, prepare({ title }) { return { title: title ? `${title.slice(0, 60)}…` : 'Step' } } },
          fields: [
            defineField({ name: 'body', title: 'Body', type: 'text', rows: 4 }),
            defineField({
              name: 'image',
              title: 'Step Image',
              type: 'image',
              options: { hotspot: true },
              fields: [defineField({ name: 'alt', title: 'Alt text', type: 'string' })],
            }),
          ],
        },
      ],
    }),

    /* ── Candidate Experience ── */
    defineField({
      name: 'candidateExpHeading',
      title: 'Heading',
      type: 'string',
      group: 'candidateExperience',
    }),
    defineField({
      name: 'candidateExpBody',
      title: 'Body',
      type: 'array',
      group: 'candidateExperience',
      of: [{ type: 'block', styles: [{ title: 'Normal', value: 'normal' }], marks: { decorators: [] } }],
    }),
    defineField({
      name: 'candidateExpImage',
      title: 'Image',
      type: 'image',
      group: 'candidateExperience',
      options: { hotspot: true },
      fields: [defineField({ name: 'alt', title: 'Alt text', type: 'string' })],
    }),

    /* ── Benefits ── */
    defineField({
      name: 'benefitsHeading',
      title: 'Heading',
      type: 'string',
      group: 'benefits',
    }),
    defineField({
      name: 'benefits',
      title: 'Benefits',
      type: 'array',
      group: 'benefits',
      of: [
        {
          type: 'object',
          preview: { select: { title: 'label', subtitle: 'body' } },
          fields: [
            defineField({ name: 'label', title: 'Label', type: 'string' }),
            defineField({ name: 'body', title: 'Body', type: 'text', rows: 3 }),
            defineField({
              name: 'image',
              title: 'Icon / Screenshot',
              type: 'image',
              options: { hotspot: true },
              fields: [defineField({ name: 'alt', title: 'Alt text', type: 'string' })],
            }),
          ],
        },
      ],
    }),
    defineField({
      name: 'benefitsLinkLabel',
      title: 'Read More Link Label',
      type: 'string',
      group: 'benefits',
      description: 'e.g. "Read more about Vero Assess".',
    }),
    defineField({
      name: 'benefitsLinkHref',
      title: 'Read More Link Href',
      type: 'string',
      group: 'benefits',
    }),
  ],
  preview: {
    prepare() {
      return { title: 'How It Works Page' }
    },
  },
})
