import { defineField, defineType } from 'sanity'
import {
  UsersIcon,
  SearchIcon,
  StarIcon,
  BarChartIcon,
  PlayIcon,
  ImagesIcon,
  TrendUpwardIcon,
  ListIcon,
  PackageIcon,
} from '@sanity/icons'

export const jobCategory = defineType({
  name: 'jobCategory',
  title: 'Job Category',
  type: 'document',
  icon: UsersIcon,
  groups: [
    { name: 'seo',          title: 'SEO',                              icon: SearchIcon },
    { name: 'hero',         title: 'Section 1 — Hero',                 icon: StarIcon, default: true },
    { name: 'dimensions',   title: 'Section 2 — Dimensions explainer', icon: BarChartIcon },
    { name: 'inAction',     title: 'Section 3 — "In action" header',   icon: PlayIcon },
    { name: 'featureCards', title: 'Section 4 — Feature carousel cards', icon: ImagesIcon },
    { name: 'stats',        title: 'Section 5 — Headline stats',       icon: TrendUpwardIcon },
    { name: 'roster',       title: 'Section 6 — Role roster',          icon: ListIcon },
    { name: 'bespoke',      title: 'Section 7 — Bespoke CTA',          icon: PackageIcon },
  ],
  fields: [
    defineField({
      name: 'seo',
      title: 'Search engine + social sharing',
      type: 'seoFields',
      group: 'seo',
      description:
        'Browser tab title, search-result snippet, and link previews on social ' +
        'when this category page is shared. Anything left blank inherits from Site Settings.',
    }),

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
    /* ── In Action — section header above the FeatureCards carousel ── */
    defineField({
      name: 'inActionLabel',
      title: 'Eyebrow Label',
      type: 'string',
      group: 'inAction',
      description: 'Small uppercase label above the heading. Defaults to "In action".',
    }),
    defineField({
      name: 'inActionHeading',
      title: 'Section Heading',
      type: 'string',
      group: 'inAction',
      description: 'Heading shown above the carousel.',
    }),
    defineField({
      name: 'inActionIntro',
      title: 'Section Intro',
      type: 'text',
      rows: 3,
      group: 'inAction',
      description: 'Short description shown under the heading.',
    }),

    defineField({
      name: 'featureCardsHeading',
      title: 'Feature Cards Lead-Card Heading',
      type: 'string',
      group: 'featureCards',
      description: 'Heading of the FIRST card in the carousel (e.g. "Keeping your team on track").',
    }),
    defineField({
      name: 'featureCardsSubheading',
      title: 'Feature Cards Lead-Card Body',
      type: 'text',
      rows: 2,
      group: 'featureCards',
      description: 'Body of the FIRST card in the carousel.',
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
            defineField({
              name: 'image',
              title: 'Card Image',
              type: 'image',
              options: { hotspot: true },
              fields: [defineField({ name: 'alt', title: 'Alt text', type: 'string' })],
              description: 'Shown at the top of the card in the In Action carousel.',
            }),
          ],
          preview: {
            select: { title: 'heading', media: 'image' },
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
