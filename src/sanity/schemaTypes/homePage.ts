import { defineField, defineType } from 'sanity'
import { HomeIcon } from '@sanity/icons'

export const homePage = defineType({
  name: 'homePage',
  title: 'Home Page',
  type: 'document',
  icon: HomeIcon,
  groups: [
    { name: 'hero', title: 'Hero' },
    { name: 'howItWorks', title: 'How It Works' },
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
      description: 'Optional announcement pill above the headline. Leave blank to hide.',
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
    defineField({
      name: 'heroMediaType',
      title: 'Media Type',
      type: 'string',
      group: 'hero',
      options: {
        list: [
          { title: 'Image', value: 'image' },
          { title: 'Video', value: 'video' },
        ],
        layout: 'radio',
      },
      initialValue: 'image',
    }),
    defineField({
      name: 'heroImage',
      title: 'Hero Image',
      type: 'image',
      group: 'hero',
      options: { hotspot: true },
      description: 'Shown when Media Type is "Image".',
      fields: [
        defineField({ name: 'alt', title: 'Alt text', type: 'string' }),
      ],
    }),
    defineField({
      name: 'heroVideoThumbnail',
      title: 'Video Thumbnail',
      type: 'image',
      group: 'hero',
      options: { hotspot: true },
      description: 'Shown when Media Type is "Video".',
    }),
    defineField({
      name: 'heroVideoUrl',
      title: 'Video URL',
      type: 'url',
      group: 'hero',
      description: 'Direct MP4 URL. Loaded lazily — only when the modal opens.',
    }),

    /* ── How It Works ── */
    defineField({
      name: 'howItWorksHeading',
      title: 'Heading',
      type: 'string',
      group: 'howItWorks',
    }),
    defineField({
      name: 'howItWorksIntro',
      title: 'Intro',
      type: 'text',
      rows: 2,
      group: 'howItWorks',
    }),
    defineField({
      name: 'steps',
      title: 'Steps',
      type: 'array',
      group: 'howItWorks',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'title',
              title: 'Title',
              type: 'string',
            }),
            defineField({
              name: 'body',
              title: 'Body',
              type: 'text',
              rows: 3,
            }),
            defineField({
              name: 'ctaLabel',
              title: 'CTA Label',
              type: 'string',
            }),
            defineField({
              name: 'ctaHref',
              title: 'CTA Href',
              type: 'string',
            }),
          ],
        },
      ],
    }),

    /* ── USPs ── */
    defineField({
      name: 'uspsSectionLabel',
      title: 'Section Eyebrow Label',
      type: 'string',
      group: 'usps',
      description: 'Optional small label above the heading (e.g. "Why Vero Assess"). Leave blank to hide.',
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
          preview: {
            select: { title: 'label' },
          },
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
              fields: [
                defineField({ name: 'alt', title: 'Alt text', type: 'string' }),
              ],
            }),
          ],
        },
      ],
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
      rows: 2,
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
