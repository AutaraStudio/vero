import { defineField, defineType } from 'sanity'
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
    { name: 'seo',        title: 'SEO',                              icon: SearchIcon },
    { name: 'hero',       title: 'Section 1 — Hero',                 icon: StarIcon, default: true },
    { name: 'authentic',  title: 'Section 2 — Finding potential',    icon: HeartFilledIcon },
    { name: 'theory',     title: 'Section 3 — The theory + dimensions', icon: BookIcon },
    { name: 'dataBacked', title: 'Section 4 — Data-backed outcomes', icon: TrendUpwardIcon },
    { name: 'cta',        title: 'Section 5 — Closing CTA',          icon: CommentIcon },
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
      name: 'heroBody',
      title: 'Body',
      type: 'text',
      rows: 3,
      group: 'hero',
    }),

    /* ── Finding Authentic Potential ── */
    defineField({
      name: 'authenticHeading',
      title: 'Heading',
      type: 'string',
      group: 'authentic',
    }),
    defineField({
      name: 'authenticBody',
      title: 'Body',
      type: 'array',
      group: 'authentic',
      of: [{ type: 'block', styles: [{ title: 'Normal', value: 'normal' }], marks: { decorators: [] } }],
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
              fields: [defineField({ name: 'alt', title: 'Alt text', type: 'string' })],
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
      name: 'dimensionsImage',
      title: 'Dimensions — Optional Graphic / Image',
      type: 'image',
      group: 'theory',
      options: { hotspot: true },
      fields: [defineField({ name: 'alt', title: 'Alt text', type: 'string' })],
      description: 'Optional graphic or image shown alongside the 16-dimensions section.',
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
      name: 'insightsHeading',
      title: 'Insights — Heading',
      type: 'string',
      group: 'theory',
    }),
    defineField({
      name: 'insightsBody',
      title: 'Insights — Body',
      type: 'array',
      group: 'theory',
      of: [{ type: 'block', styles: [{ title: 'Normal', value: 'normal' }], marks: { decorators: [] } }],
    }),
    defineField({
      name: 'insightsImage',
      title: 'Insights — Dashboard Image',
      type: 'image',
      group: 'theory',
      options: { hotspot: true },
      fields: [defineField({ name: 'alt', title: 'Alt text', type: 'string' })],
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
