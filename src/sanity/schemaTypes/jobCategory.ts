import { defineField, defineType } from 'sanity'
import { UsersIcon } from '@sanity/icons'

export const jobCategory = defineType({
  name: 'jobCategory',
  title: 'Job Category',
  type: 'document',
  icon: UsersIcon,
  groups: [
    { name: 'hero', title: 'Hero' },
    { name: 'dimensions', title: 'Dimensions' },
    { name: 'featureCards', title: 'Feature Cards' },
    { name: 'stats', title: 'Stats' },
    { name: 'roster', title: 'Role Roster' },
    { name: 'bespoke', title: 'Bespoke CTA' },
  ],
  fields: [
    defineField({
      name: 'name',
      title: 'Category Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'name' },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'heroHeadline',
      title: 'Hero Headline',
      type: 'string',
      group: 'hero',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'heroIntroCopy',
      title: 'Hero Intro Copy',
      type: 'text',
      rows: 3,
      group: 'hero',
    }),
    defineField({
      name: 'heroImage',
      title: 'Hero Image',
      type: 'image',
      options: { hotspot: true },
      group: 'hero',
    }),
    defineField({
      name: 'dimensionsSectionHeading',
      title: 'Dimensions Section Heading',
      type: 'string',
      group: 'dimensions',
    }),
    defineField({
      name: 'dimensionsSectionBody',
      title: 'Dimensions Section Body',
      type: 'text',
      rows: 4,
      group: 'dimensions',
    }),
    defineField({
      name: 'dimensionsSectionImage',
      title: 'Dimensions Section Image',
      type: 'image',
      options: { hotspot: true },
      group: 'dimensions',
    }),
    defineField({
      name: 'featureCardsHeading',
      title: 'Feature Cards Section Heading',
      type: 'string',
      group: 'featureCards',
    }),
    defineField({
      name: 'featureCardsSubheading',
      title: 'Feature Cards Section Subheading',
      type: 'text',
      rows: 2,
      group: 'featureCards',
    }),
    defineField({
      name: 'featureCards',
      title: 'Feature Cards',
      type: 'array',
      group: 'featureCards',
      of: [
        {
          type: 'object',
          fields: [
            defineField({ name: 'heading', title: 'Heading', type: 'string' }),
            defineField({ name: 'body', title: 'Body', type: 'text', rows: 3 }),
          ],
          preview: {
            select: { title: 'heading' },
          },
        },
      ],
    }),
    defineField({
      name: 'stat1Heading',
      title: 'Stat 1 Heading',
      type: 'string',
      group: 'stats',
    }),
    defineField({
      name: 'stat1Body',
      title: 'Stat 1 Body',
      type: 'string',
      group: 'stats',
    }),
    defineField({
      name: 'stat2Heading',
      title: 'Stat 2 Heading',
      type: 'string',
      group: 'stats',
    }),
    defineField({
      name: 'stat2Body',
      title: 'Stat 2 Body',
      type: 'string',
      group: 'stats',
    }),
    defineField({
      name: 'stat3Heading',
      title: 'Stat 3 Heading',
      type: 'string',
      group: 'stats',
    }),
    defineField({
      name: 'stat3Body',
      title: 'Stat 3 Body',
      type: 'string',
      group: 'stats',
    }),
    defineField({
      name: 'stat4Heading',
      title: 'Stat 4 Heading',
      type: 'string',
      group: 'stats',
    }),
    defineField({
      name: 'stat4Body',
      title: 'Stat 4 Body',
      type: 'string',
      group: 'stats',
    }),
    defineField({
      name: 'roleRosterHeading',
      title: 'Role Roster Heading',
      type: 'string',
      group: 'roster',
    }),
    defineField({
      name: 'roleRosterSubheading',
      title: 'Role Roster Subheading',
      type: 'string',
      group: 'roster',
    }),
    defineField({
      name: 'bespokeSectionHeading',
      title: 'Bespoke Section Heading',
      type: 'string',
      group: 'bespoke',
    }),
    defineField({
      name: 'bespokeSectionBody',
      title: 'Bespoke Section Body',
      type: 'text',
      rows: 3,
      group: 'bespoke',
    }),
    defineField({
      name: 'bespokeCTALabel',
      title: 'Bespoke CTA Label',
      type: 'string',
      group: 'bespoke',
    }),
    defineField({
      name: 'bespokeCTAHref',
      title: 'Bespoke CTA Href',
      type: 'string',
      group: 'bespoke',
      description: 'Where the bespoke CTA links to (e.g. "/contact").',
    }),
    defineField({
      name: 'bespokeSectionImage',
      title: 'Bespoke Section Image',
      type: 'image',
      options: { hotspot: true },
      group: 'bespoke',
    }),
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'heroIntroCopy',
      media: 'heroImage',
    },
    prepare({ title, subtitle, media }) {
      return {
        title,
        subtitle: subtitle ? subtitle.slice(0, 80) : 'No intro',
        media,
      }
    },
  },
})
