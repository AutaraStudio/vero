import { defineField, defineType } from 'sanity'
import { InfoOutlineIcon } from '@sanity/icons'

export const aboutPage = defineType({
  name: 'aboutPage',
  title: 'About Page',
  type: 'document',
  icon: InfoOutlineIcon,
  groups: [
    { name: 'hero', title: 'Hero' },
  ],
  fields: [
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
      return { title: 'About Page' }
    },
  },
})
