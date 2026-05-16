import { defineField, defineType } from 'sanity'
import { SearchIcon, StarIcon } from '@sanity/icons'

export const assessmentsPage = defineType({
  name: 'assessmentsPage',
  title: 'Assessments Page',
  type: 'document',
  icon: SearchIcon,
  groups: [
    { name: 'hero', title: 'Section 1 — Hero', icon: StarIcon, default: true },
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
      title: 'Primary button — text',
      type: 'string',
      group: 'hero',
      description: 'Optional. Leave blank to hide the primary button.',
    }),
    defineField({
      name: 'heroCTAHref',
      title: 'Primary button — link',
      type: 'string',
      group: 'hero',
      hidden: ({ parent }) => !parent?.heroCTALabel,
    }),
    defineField({
      name: 'heroSecondaryCTALabel',
      title: 'Secondary button — text',
      type: 'string',
      group: 'hero',
      description: 'Optional second button — usually quieter.',
    }),
    defineField({
      name: 'heroSecondaryCTAHref',
      title: 'Secondary button — link',
      type: 'string',
      group: 'hero',
      hidden: ({ parent }) => !parent?.heroSecondaryCTALabel,
    }),
  ],
  preview: {
    prepare() {
      return { title: 'Assessments Page' }
    },
  },
})
