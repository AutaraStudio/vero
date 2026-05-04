import { defineField, defineType } from 'sanity'
import { SearchIcon } from '@sanity/icons'

export const assessmentsPage = defineType({
  name: 'assessmentsPage',
  title: 'Assessments Page',
  type: 'document',
  icon: SearchIcon,
  groups: [
    { name: 'seo', title: 'SEO' },
    { name: 'hero', title: 'Hero' },
  ],
  fields: [
    /* ── SEO (per-page overrides — falls back to siteSettings) ── */
    defineField({
      name: 'seo',
      title: 'SEO',
      type: 'seoFields',
      group: 'seo',
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
