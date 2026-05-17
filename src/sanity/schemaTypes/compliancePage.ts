import { defineField, defineType } from 'sanity'
import { altRequiredWhenImagePresent } from '../lib/altFieldValidation'
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
    { name: 'hero',          title: 'Section 1 — Hero',                 icon: StarIcon, default: true },
    { name: 'security',      title: 'Section 2 — Data security',        icon: LockIcon },
    { name: 'quality',       title: 'Section 3 — Quality assurance',    icon: CheckmarkIcon },
    { name: 'ai',            title: 'Section 4 — Our approach to AI',   icon: ControlsIcon },
    { name: 'accessibility', title: 'Section 5 — Accessibility',        icon: EyeOpenIcon },
  ],
  fields: [
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
      type: 'link',
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
      type: 'link',
      group: 'hero',
      hidden: ({ parent }) => !parent?.heroSecondaryCTALabel,
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
      name: 'securityBadgesMedia',
      title: 'Security badges graphic (image or video)',
      type: 'mediaBlock',
      group: 'security',
      description: 'Image or video shown alongside the data security checklist.',
    }),
    /* Unified content-section migration target. */
    defineField({
      hidden: true,
      name: 'securitySection',
      title: 'Section content',
      type: 'contentSection',
      group: 'security',
      description: 'Migrated equivalent of the heading / body / badges fields above — edit here once Phase 2 ships.',
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
              fields: [defineField({ name: 'alt', title: 'Alt text', type: 'string', validation: altRequiredWhenImagePresent })],
              description: 'Shown as the sticky visual in the scroll-driven Quality Assurance section.',
            }),
          ],
        },
      ],
    }),

    /* ── Our Approach to AI ── */
    defineField({
      hidden: true,
      name: 'aiHeading',
      title: 'Heading',
      type: 'string',
      group: 'ai',
    }),
    defineField({
      hidden: true,
      name: 'aiBody',
      title: 'Body',
      type: 'array',
      group: 'ai',
      of: [{ type: 'block', styles: [{ title: 'Normal', value: 'normal' }], marks: { decorators: [] } }],
    }),
    defineField({
      hidden: true,
      name: 'aiMedia',
      title: 'Section media (image or video)',
      type: 'mediaBlock',
      group: 'ai',
      description: 'Image or clickable video shown alongside the AI section body.',
    }),
    /* Unified content-section migration target. */
    defineField({
      name: 'aiSection',
      title: 'Section content',
      type: 'contentSection',
      group: 'ai',
      description: 'Migrated equivalent of the heading / body / media fields above — edit here once Phase 2 ships.',
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
              fields: [defineField({ name: 'alt', title: 'Alt text', type: 'string', validation: altRequiredWhenImagePresent })],
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
