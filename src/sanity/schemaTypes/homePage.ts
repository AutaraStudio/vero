import { defineField, defineType } from 'sanity'
import { HomeIcon } from '@sanity/icons'

export const homePage = defineType({
  name: 'homePage',
  title: 'Home Page',
  type: 'document',
  icon: HomeIcon,
  groups: [
    { name: 'hero', title: 'Hero' },
    { name: 'introBlock', title: 'Intro Block' },
    { name: 'usps', title: 'USPs' },
    { name: 'pricing', title: 'Pricing Section' },
  ],
  fields: [
    /* ── Hero ── */
    defineField({
      name: 'heroBadgeLabel',
      title: 'Badge Label',
      type: 'string',
      group: 'hero',
      description: 'Optional pill above the headline. Leave blank to hide.',
    }),
    defineField({
      name: 'heroBadgeHref',
      title: 'Badge Link',
      type: 'string',
      group: 'hero',
    }),
    defineField({
      name: 'heroTitle',
      title: 'Hero Title',
      type: 'string',
      group: 'hero',
    }),
    defineField({
      name: 'heroCTALabel',
      title: 'Primary CTA Label',
      type: 'string',
      group: 'hero',
    }),
    defineField({
      name: 'heroCTAHref',
      title: 'Primary CTA Href',
      type: 'string',
      group: 'hero',
    }),
    defineField({
      name: 'heroSecondaryCTALabel',
      title: 'Secondary CTA Label',
      type: 'string',
      group: 'hero',
    }),
    defineField({
      name: 'heroSecondaryCTAHref',
      title: 'Secondary CTA Href',
      type: 'string',
      group: 'hero',
    }),
    defineField({
      name: 'heroImage',
      title: 'Hero Image',
      type: 'image',
      group: 'hero',
      options: { hotspot: true },
      fields: [defineField({ name: 'alt', title: 'Alt text', type: 'string' })],
    }),

    /* ── Intro Block (Ready-to-go assessment solution) ── */
    defineField({
      name: 'introBlockHeading',
      title: 'Heading',
      type: 'string',
      group: 'introBlock',
    }),
    defineField({
      name: 'introBlockBody',
      title: 'Body',
      type: 'array',
      group: 'introBlock',
      of: [{ type: 'block', styles: [{ title: 'Normal', value: 'normal' }], marks: { decorators: [] } }],
    }),
    defineField({
      name: 'introBlockVideoThumbnail',
      title: 'Demo Video Thumbnail',
      type: 'image',
      group: 'introBlock',
      options: { hotspot: true },
      fields: [defineField({ name: 'alt', title: 'Alt text', type: 'string' })],
    }),
    defineField({
      name: 'introBlockVideoUrl',
      title: 'Demo Video URL',
      type: 'url',
      group: 'introBlock',
      description: 'Direct MP4 or HLS URL. Loaded lazily — only when the modal opens.',
    }),

    /* ── USPs ── */
    defineField({
      name: 'uspsSectionLabel',
      title: 'Section Eyebrow Label',
      type: 'string',
      group: 'usps',
      description: 'Optional small label above the heading. Leave blank to hide.',
    }),
    defineField({
      name: 'uspsSectionHeading',
      title: 'Section Heading',
      type: 'string',
      group: 'usps',
    }),
    defineField({
      name: 'uspsSectionSubheading',
      title: 'Section Subheading',
      type: 'text',
      rows: 2,
      group: 'usps',
    }),
    defineField({
      name: 'usps',
      title: 'USPs',
      type: 'array',
      group: 'usps',
      of: [
        {
          type: 'object',
          preview: { select: { title: 'label' } },
          fields: [
            defineField({
              name: 'label',
              title: 'Label',
              type: 'string',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'body',
              title: 'Body',
              type: 'text',
              rows: 3,
            }),
            defineField({
              name: 'image',
              title: 'Card Image',
              type: 'image',
              options: { hotspot: true },
              description: 'Optional image shown in the card header.',
              fields: [defineField({ name: 'alt', title: 'Alt text', type: 'string' })],
            }),
          ],
        },
      ],
    }),
    defineField({
      name: 'uspsCtaLabel',
      title: 'USPs CTA Label',
      type: 'string',
      group: 'usps',
      description: 'Button shown below the USPs (e.g. "How Vero Assess works").',
    }),
    defineField({
      name: 'uspsCtaHref',
      title: 'USPs CTA Href',
      type: 'string',
      group: 'usps',
    }),

    /* ── Pricing Section ── */
    defineField({
      name: 'pricingSectionHeading',
      title: 'Section Heading',
      type: 'string',
      group: 'pricing',
    }),
    defineField({
      name: 'pricingSectionSubheading',
      title: 'Section Subheading',
      type: 'text',
      rows: 3,
      group: 'pricing',
    }),
    defineField({
      name: 'pricingCtaLabel',
      title: 'Pricing CTA Label',
      type: 'string',
      group: 'pricing',
    }),
  ],
  preview: {
    prepare() {
      return { title: 'Home Page' }
    },
  },
})
