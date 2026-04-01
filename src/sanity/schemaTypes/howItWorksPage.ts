import { defineField, defineType } from 'sanity'
import { PlayIcon } from '@sanity/icons'

export const howItWorksPage = defineType({
  name: 'howItWorksPage',
  title: 'How It Works Page',
  type: 'document',
  icon: PlayIcon,
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
    defineField({
      name: 'heroSecondaryCTALabel',
      title: 'Hero Secondary CTA Label',
      type: 'string',
      group: 'hero',
    }),
    defineField({
      name: 'heroSecondaryCTAHref',
      title: 'Hero Secondary CTA Href',
      type: 'string',
      group: 'hero',
    }),
  ],
  preview: {
    prepare() {
      return { title: 'How It Works Page' }
    },
  },
})
