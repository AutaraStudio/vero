import { defineField, defineType } from 'sanity'
import {
  CheckmarkCircleIcon,
  SearchIcon,
  StarIcon,
  LockIcon,
  CheckmarkIcon,
  ControlsIcon,
  EyeOpenIcon,
} from '@sanity/icons'

export const compliancePage = defineType({
  name: 'compliancePage',
  title: 'Compliance Page',
  type: 'document',
  icon: CheckmarkCircleIcon,
  groups: [
    { name: 'seo',           title: 'SEO',                              icon: SearchIcon },
    { name: 'hero',          title: 'Section 1 — Hero',                 icon: StarIcon, default: true },
    { name: 'security',      title: 'Section 2 — Data security',        icon: LockIcon },
    { name: 'quality',       title: 'Section 3 — Quality assurance',    icon: CheckmarkIcon },
    { name: 'ai',            title: 'Section 4 — Our approach to AI',   icon: ControlsIcon },
    { name: 'accessibility', title: 'Section 5 — Accessibility',        icon: EyeOpenIcon },
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

    /* ── Data Security ── */
    defineField({
      name: 'securityHeading',
      title: 'Heading',
      type: 'string',
      group: 'security',
    }),
    defineField({
      name: 'securityBody',
      title: 'Body',
      type: 'text',
      rows: 3,
      group: 'security',
    }),
    defineField({
      name: 'securityBadgesImage',
      title: 'Security Badges Graphic',
      type: 'image',
      group: 'security',
      options: { hotspot: true },
      fields: [defineField({ name: 'alt', title: 'Alt text', type: 'string' })],
    }),
    defineField({
      name: 'securityCredentials',
      title: 'Credentials',
      type: 'array',
      group: 'security',
      of: [
        {
          type: 'object',
          preview: { select: { title: 'label', subtitle: 'description' } },
          fields: [
            defineField({ name: 'label', title: 'Label', type: 'string' }),
            defineField({ name: 'description', title: 'Description', type: 'text', rows: 2 }),
          ],
        },
      ],
    }),

    /* ── Quality Assurance ── */
    defineField({
      name: 'qualityHeading',
      title: 'Heading',
      type: 'string',
      group: 'quality',
    }),
    defineField({
      name: 'qualityBody',
      title: 'Body',
      type: 'text',
      rows: 3,
      group: 'quality',
    }),
    defineField({
      name: 'qualityItems',
      title: 'Items',
      type: 'array',
      group: 'quality',
      of: [
        {
          type: 'object',
          preview: { select: { title: 'label', subtitle: 'description', media: 'image' } },
          fields: [
            defineField({ name: 'label', title: 'Label', type: 'string' }),
            defineField({ name: 'description', title: 'Description', type: 'text', rows: 2 }),
            defineField({
              name: 'image',
              title: 'Supporting image',
              type: 'image',
              options: { hotspot: true },
              fields: [defineField({ name: 'alt', title: 'Alt text', type: 'string' })],
              description: 'Shown as the sticky visual in the scroll-driven Quality Assurance section.',
            }),
          ],
        },
      ],
    }),

    /* ── Our Approach to AI ── */
    defineField({
      name: 'aiHeading',
      title: 'Heading',
      type: 'string',
      group: 'ai',
    }),
    defineField({
      name: 'aiBody',
      title: 'Body',
      type: 'array',
      group: 'ai',
      of: [{ type: 'block', styles: [{ title: 'Normal', value: 'normal' }], marks: { decorators: [] } }],
    }),
    defineField({
      name: 'aiImage',
      title: 'Image',
      type: 'image',
      group: 'ai',
      options: { hotspot: true },
      fields: [defineField({ name: 'alt', title: 'Alt text', type: 'string' })],
    }),

    /* ── Accessibility ── */
    defineField({
      name: 'accessibilityHeading',
      title: 'Heading',
      type: 'string',
      group: 'accessibility',
    }),
    defineField({
      name: 'accessibilityBody',
      title: 'Body',
      type: 'text',
      rows: 4,
      group: 'accessibility',
    }),
    defineField({
      name: 'accessibilityItems',
      title: 'Accessibility Features',
      type: 'array',
      group: 'accessibility',
      of: [
        {
          type: 'object',
          preview: { select: { title: 'label', subtitle: 'description', media: 'image' } },
          fields: [
            defineField({ name: 'label', title: 'Label', type: 'string' }),
            defineField({ name: 'description', title: 'Description', type: 'text', rows: 3 }),
            defineField({
              name: 'image',
              title: 'Supporting image',
              type: 'image',
              options: { hotspot: true },
              fields: [defineField({ name: 'alt', title: 'Alt text', type: 'string' })],
              description: 'Shown as the sticky visual in the scroll-driven section (e.g. screenshot of accessibility feature in action).',
            }),
          ],
        },
      ],
    }),
  ],
  preview: {
    prepare() {
      return { title: 'Compliance page', subtitle: 'Singleton — only one of these exists' }
    },
  },
})
