import { defineField, defineType } from 'sanity'
import { altRequiredWhenImagePresent } from '../lib/altFieldValidation'
import {
  SparklesIcon,
  SearchIcon,
  StarIcon,
  HeartFilledIcon,
  BookIcon,
  TrendUpwardIcon,
  CommentIcon,
} from '@sanity/icons'

export const sciencePage = defineType({
  name: 'sciencePage',
  title: 'The Science Page',
  type: 'document',
  icon: SparklesIcon,
  groups: [
    { name: 'hero',       title: 'Section 1 — Hero',                 icon: StarIcon, default: true },
    { name: 'authentic',  title: 'Section 2 — Finding potential',    icon: HeartFilledIcon },
    { name: 'theory',     title: 'Section 3 — The theory + dimensions', icon: BookIcon },
    { name: 'dataBacked', title: 'Section 4 — Data-backed outcomes', icon: TrendUpwardIcon },
    { name: 'cta',        title: 'Section 5 — Closing CTA',          icon: CommentIcon },
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
      name: 'heroBody',
      title: 'Body',
      type: 'text',
      rows: 3,
      group: 'hero',
    }),

    /* ── Finding Authentic Potential ── */
    defineField({
      hidden: true,
      name: 'authenticHeading',
      title: 'Heading',
      type: 'string',
      group: 'authentic',
    }),
    defineField({
      hidden: true,
      name: 'authenticBody',
      title: 'Body',
      type: 'array',
      group: 'authentic',
      of: [{ type: 'block', styles: [{ title: 'Normal', value: 'normal' }], marks: { decorators: [] } }],
    }),
    /* Unified content-section migration target. */
    defineField({
      name: 'authenticSection',
      title: 'Section content',
      type: 'contentSection',
      group: 'authentic',
      description: 'Migrated equivalent of the fields above — edit here once Phase 2 ships.',
    }),

    /* ── Theory Scroll Section ── */
    defineField({
      name: 'theoryHeading',
      title: 'Section Heading',
      type: 'string',
      group: 'theory',
    }),
    defineField({
      name: 'theoryIntro',
      title: 'Section Intro',
      type: 'text',
      rows: 3,
      group: 'theory',
    }),

    /* Step 1 — Four perspectives */
    defineField({
      name: 'perspectivesHeading',
      title: 'Perspectives — Heading',
      type: 'string',
      group: 'theory',
    }),
    defineField({
      name: 'perspectivesIntro',
      title: 'Perspectives — Intro',
      type: 'text',
      rows: 2,
      group: 'theory',
    }),
    defineField({
      name: 'perspectives',
      title: 'Perspectives',
      type: 'array',
      group: 'theory',
      of: [
        {
          type: 'object',
          preview: { select: { title: 'name', subtitle: 'description', media: 'image' } },
          fields: [
            defineField({ name: 'name', title: 'Name', type: 'string' }),
            defineField({ name: 'description', title: 'Description', type: 'text', rows: 2 }),
            defineField({
              name: 'image',
              title: 'Supporting image',
              type: 'image',
              options: { hotspot: true },
              fields: [defineField({ name: 'alt', title: 'Alt text', type: 'string', validation: altRequiredWhenImagePresent })],
              description: 'Shown as the sticky visual in the scroll-driven section.',
            }),
          ],
        },
      ],
    }),

    /* Step 2 — 16 Dimensions */
    defineField({
      name: 'dimensionsHeading',
      title: 'Dimensions — Heading',
      type: 'string',
      group: 'theory',
    }),
    defineField({
      name: 'dimensionsBody',
      title: 'Dimensions — Body',
      type: 'array',
      group: 'theory',
      of: [{ type: 'block', styles: [{ title: 'Normal', value: 'normal' }], marks: { decorators: [] } }],
    }),
    defineField({
      name: 'dimensionsMedia',
      title: 'Dimensions — Optional graphic, image or video',
      type: 'mediaBlock',
      group: 'theory',
      description: 'Optional supporting media alongside the 16-dimensions section.',
    }),
    /* Unified content-section migration target. */
    defineField({
      hidden: true,
      name: 'dimensionsSectionContent',
      title: 'Dimensions section — content',
      type: 'contentSection',
      group: 'theory',
      description: 'Migrated equivalent of the Dimensions heading/body/media fields above — edit here once Phase 2 ships.',
    }),
    defineField({
      name: 'dimensionCategories',
      title: 'Dimension Categories',
      type: 'array',
      group: 'theory',
      description: 'Four categories, each with four dimensions.',
      of: [
        {
          type: 'object',
          preview: {
            select: { title: 'name', subtitle: 'dimensions' },
            prepare({ title, subtitle }) {
              return {
                title,
                subtitle: Array.isArray(subtitle) ? subtitle.join(', ') : '',
              }
            },
          },
          fields: [
            defineField({ name: 'name', title: 'Category Name', type: 'string' }),
            defineField({
              name: 'dimensions',
              title: 'Dimensions',
              type: 'array',
              of: [{ type: 'string' }],
            }),
          ],
        },
      ],
    }),

    /* Step 3 — Detailed candidate insights */
    defineField({
      hidden: true,
      name: 'insightsHeading',
      title: 'Insights — Heading',
      type: 'string',
      group: 'theory',
    }),
    defineField({
      hidden: true,
      name: 'insightsBody',
      title: 'Insights — Body',
      type: 'array',
      group: 'theory',
      of: [{ type: 'block', styles: [{ title: 'Normal', value: 'normal' }], marks: { decorators: [] } }],
    }),
    defineField({
      hidden: true,
      name: 'insightsMedia',
      title: 'Insights — Dashboard image or video',
      type: 'mediaBlock',
      group: 'theory',
      description: 'Image or clickable video shown alongside the candidate insights section.',
    }),
    /* Unified content-section migration target. */
    defineField({
      name: 'insightsSection',
      title: 'Insights section — content',
      type: 'contentSection',
      group: 'theory',
      description: 'Migrated equivalent of the Insights heading/body/media fields above — edit here once Phase 2 ships.',
    }),

    /* ── Data-Backed Recruitment ── */
    defineField({
      name: 'dataBackedHeading',
      title: 'Heading',
      type: 'string',
      group: 'dataBacked',
    }),
    defineField({
      name: 'dataBackedIntro',
      title: 'Intro',
      type: 'text',
      rows: 3,
      group: 'dataBacked',
    }),
    defineField({
      name: 'dataBackedPoints',
      title: 'Points',
      type: 'array',
      group: 'dataBacked',
      of: [
        {
          type: 'object',
          preview: { select: { title: 'heading', subtitle: 'body' } },
          fields: [
            defineField({ name: 'heading', title: 'Heading', type: 'string' }),
            defineField({ name: 'body', title: 'Body', type: 'text', rows: 3 }),
          ],
        },
      ],
    }),

    /* ── Contact CTA ── */
    defineField({
      name: 'ctaBody',
      title: 'CTA Body',
      type: 'text',
      rows: 2,
      group: 'cta',
    }),
    defineField({
      name: 'ctaLabel',
      title: 'CTA Label',
      type: 'string',
      group: 'cta',
    }),
    defineField({
      name: 'ctaHref',
      title: 'CTA Href',
      type: 'string',
      group: 'cta',
    }),
  ],
  preview: {
    prepare() {
      return { title: 'The Science Page' }
    },
  },
})
