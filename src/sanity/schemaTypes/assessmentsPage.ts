import { defineField, defineType } from 'sanity'
import { SearchIcon, StarIcon } from '@sanity/icons'

export const assessmentsPage = defineType({
  name: 'assessmentsPage',
  title: 'Assessments Page',
  type: 'document',
  icon: SearchIcon,
  groups: [
    { name: 'seo',  title: 'SEO',              icon: SearchIcon },
    { name: 'hero', title: 'Section 1 — Hero', icon: StarIcon, default: true },
  ],
  fields: [
    defineField({
      name: 'seo',
      title: 'Search engine + social sharing',
      type: 'seoFields',
      group: 'seo',
      description:
        'Browser tab title, search-result snippet, and link previews on social. ' +
        'Anything left blank inherits from Site Settings. ' +
        'Below this, the listing of Job Categories is generated automatically — ' +
        'manage individual categories from the "Job categories" section in the sidebar.',
    }),

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
    defineField({
      name: 'heroCTALabel',
      title: 'Hero CTA Label',
      type: 'string',
      group: 'hero',
    }),
    defineField({
      name: 'heroCTAHref',
      title: 'Hero CTA Href',
      type: 'string',
      group: 'hero',
    }),
  ],
  preview: {
    prepare() {
      return { title: 'Assessments Page' }
    },
  },
})
