import { defineField, defineType } from 'sanity'
import { altRequiredWhenImagePresent } from '../lib/altFieldValidation'
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
    { name: 'hero',                title: 'Section 1 — Hero',                icon: StarIcon, default: true },
    { name: 'gettingStarted',      title: 'Section 2 — Getting started',     icon: RocketIcon },
    { name: 'steps',               title: 'Section 3 — Process steps',       icon: ListIcon },
    { name: 'candidateExperience', title: 'Section 4 — Candidate experience', icon: HeartFilledIcon },
    { name: 'benefits',            title: 'Section 5 — Benefits',            icon: CheckmarkIcon },
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
      type: 'link',
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
      type: 'link',
      group: 'hero',
    }),
    defineField({
      name: 'heroMedia',
      title: 'Hero media (image or video)',
      type: 'mediaBlock',
      group: 'hero',
      description: 'Image or clickable video shown in the hero. 16:9 cover recommended.',
    }),

    /* ── Getting Started ── */
    defineField({
      hidden: true,
      name: 'gettingStartedHeading',
      title: 'Heading',
      type: 'string',
      group: 'gettingStarted',
    }),
    defineField({
      hidden: true,
      name: 'gettingStartedBody',
      title: 'Body',
      type: 'array',
      group: 'gettingStarted',
      of: [{ type: 'block', styles: [{ title: 'Normal', value: 'normal' }], marks: { decorators: [] } }],
    }),
    defineField({
      hidden: true,
      name: 'gettingStartedMedia',
      title: 'Section media (image or video)',
      type: 'mediaBlock',
      group: 'gettingStarted',
      description: 'Image or clickable video shown beside the body.',
    }),
    defineField({
      hidden: true,
      name: 'gettingStartedLinkLabel',
      title: 'Pricing Link Label',
      type: 'string',
      group: 'gettingStarted',
      description: 'Inline call-out, e.g. "Read more about your options on our pricing page".',
    }),
    defineField({
      hidden: true,
      name: 'gettingStartedLinkHref',
      title: 'Pricing Link Href',
      type: 'string',
      group: 'gettingStarted',
    }),
    /* Unified content-section migration target. */
    defineField({
      name: 'gettingStartedSection',
      title: 'Section content',
      type: 'contentSection',
      group: 'gettingStarted',
      description: 'Migrated equivalent of the fields above — edit here once Phase 2 ships.',
    }),

    /* ── Steps (7-step sticky-tabs process) ── */
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
          preview: {
            select: { title: 'headline', subtitle: 'body' },
            prepare({ title, subtitle }) {
              return {
                title: title || 'Step',
                subtitle: subtitle ? `${subtitle.slice(0, 80)}…` : undefined,
              }
            },
          },
          fields: [
            defineField({ name: 'headline', title: 'Headline', type: 'string', description: 'Short heading shown above the body (e.g. "Add your team").' }),
            defineField({ name: 'label', title: 'Tab label', type: 'string', description: 'Label shown in the sticky tab strip. Defaults to "Step N: Headline" if blank.' }),
            defineField({ name: 'body', title: 'Body', type: 'text', rows: 4 }),
            defineField({
              name: 'image',
              title: 'Step Image',
              type: 'image',
              options: { hotspot: true },
              fields: [defineField({ name: 'alt', title: 'Alt text', type: 'string', validation: altRequiredWhenImagePresent })],
            }),
          ],
        },
      ],
    }),

    /* ── Candidate Experience ── */
    defineField({
      hidden: true,
      name: 'candidateExpHeading',
      title: 'Heading',
      type: 'string',
      group: 'candidateExperience',
    }),
    defineField({
      hidden: true,
      name: 'candidateExpBody',
      title: 'Body',
      type: 'array',
      group: 'candidateExperience',
      of: [{ type: 'block', styles: [{ title: 'Normal', value: 'normal' }], marks: { decorators: [] } }],
    }),
    defineField({
      hidden: true,
      name: 'candidateExpMedia',
      title: 'Section media (image or video)',
      type: 'mediaBlock',
      group: 'candidateExperience',
      description: 'Image or clickable video shown beside the body.',
    }),
    /* Unified content-section migration target. */
    defineField({
      name: 'candidateExperienceSection',
      title: 'Section content',
      type: 'contentSection',
      group: 'candidateExperience',
      description: 'Migrated equivalent of the fields above — edit here once Phase 2 ships.',
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
              fields: [defineField({ name: 'alt', title: 'Alt text', type: 'string', validation: altRequiredWhenImagePresent })],
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
      type: 'link',
      group: 'benefits',
    }),
  ],
  preview: {
    prepare() {
      return { title: 'How It Works Page' }
    },
  },
})
