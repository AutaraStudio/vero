import { defineField, defineType } from 'sanity'
import { HomeIcon } from '@sanity/icons'

export const homePage = defineType({
  name: 'homePage',
  title: 'Home Page',
  type: 'document',
  icon: HomeIcon,
  groups: [
    { name: 'hero', title: 'Hero' },
    { name: 'howItWorks', title: 'How It Works' },
  ],
  fields: [
    /* ── Hero ── */
    defineField({
      name: 'heroTitle',
      title: 'Hero Title',
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
    defineField({
      name: 'heroCTALabel',
      title: 'Hero CTA Label',
      type: 'string',
      group: 'hero',
    }),

    /* ── How It Works ── */
    defineField({
      name: 'howItWorksHeading',
      title: 'Heading',
      type: 'string',
      group: 'howItWorks',
    }),
    defineField({
      name: 'howItWorksIntro',
      title: 'Intro',
      type: 'text',
      rows: 2,
      group: 'howItWorks',
    }),
    defineField({
      name: 'steps',
      title: 'Steps',
      type: 'array',
      group: 'howItWorks',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'title',
              title: 'Title',
              type: 'string',
            }),
            defineField({
              name: 'body',
              title: 'Body',
              type: 'text',
              rows: 3,
            }),
            defineField({
              name: 'ctaLabel',
              title: 'CTA Label',
              type: 'string',
            }),
            defineField({
              name: 'ctaHref',
              title: 'CTA Href',
              type: 'string',
            }),
          ],
        },
      ],
    }),
  ],
  preview: {
    prepare() {
      return { title: 'Home Page' }
    },
  },
})
