import { defineField, defineType } from 'sanity'
import { HomeIcon } from '@sanity/icons'

export const homePage = defineType({
  name: 'homePage',
  title: 'Home Page',
  type: 'document',
  icon: HomeIcon,
  groups: [
    { name: 'hero',         title: 'Hero' },
    { name: 'introBlock',   title: 'Intro Block' },
    { name: 'usps',         title: 'USPs' },
    { name: 'steps',        title: 'How It Works' },
    { name: 'pricing',      title: 'Pricing Teaser' },
    { name: 'closingCta',   title: 'Closing CTA' },
  ],
  fields: [
    /* ════════════════════════════════════════════════════════
       HERO
    ════════════════════════════════════════════════════════ */
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
      validation: (Rule) => Rule.required(),
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
      name: 'heroMediaType',
      title: 'Hero Media Type',
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
      fields: [defineField({ name: 'alt', title: 'Alt text', type: 'string' })],
      hidden: ({ parent }) => parent?.heroMediaType === 'video',
    }),
    defineField({
      name: 'heroVideoThumbnail',
      title: 'Hero Video Thumbnail',
      type: 'image',
      group: 'hero',
      options: { hotspot: true },
      fields: [defineField({ name: 'alt', title: 'Alt text', type: 'string' })],
      hidden: ({ parent }) => parent?.heroMediaType !== 'video',
    }),
    defineField({
      name: 'heroVideoUrl',
      title: 'Hero Video URL',
      type: 'url',
      group: 'hero',
      description: 'Direct MP4 or HLS URL. Loaded lazily when the modal opens.',
      hidden: ({ parent }) => parent?.heroMediaType !== 'video',
    }),

    /* ════════════════════════════════════════════════════════
       INTRO BLOCK — split: text + demo video
    ════════════════════════════════════════════════════════ */
    defineField({
      name: 'introBlockEyebrow',
      title: 'Eyebrow',
      type: 'string',
      group: 'introBlock',
    }),
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
      of: [{ type: 'block', styles: [{ title: 'Normal', value: 'normal' }], marks: { decorators: [{ title: 'Bold', value: 'strong' }] } }],
    }),
    defineField({
      name: 'introBlockCtaLabel',
      title: 'CTA Label',
      type: 'string',
      group: 'introBlock',
    }),
    defineField({
      name: 'introBlockCtaHref',
      title: 'CTA Href',
      type: 'string',
      group: 'introBlock',
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

    /* ════════════════════════════════════════════════════════
       USPs
    ════════════════════════════════════════════════════════ */
    defineField({
      name: 'uspsSectionLabel',
      title: 'Eyebrow Label',
      type: 'string',
      group: 'usps',
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
      title: 'CTA Label',
      type: 'string',
      group: 'usps',
    }),
    defineField({
      name: 'uspsCtaHref',
      title: 'CTA Href',
      type: 'string',
      group: 'usps',
    }),

    /* ════════════════════════════════════════════════════════
       HOW IT WORKS — Steps
    ════════════════════════════════════════════════════════ */
    defineField({
      name: 'stepsSectionLabel',
      title: 'Eyebrow Label',
      type: 'string',
      group: 'steps',
    }),
    defineField({
      name: 'stepsSectionHeading',
      title: 'Section Heading',
      type: 'string',
      group: 'steps',
    }),
    defineField({
      name: 'stepsSectionIntro',
      title: 'Section Intro',
      type: 'text',
      rows: 2,
      group: 'steps',
    }),
    defineField({
      name: 'steps',
      title: 'Steps',
      type: 'array',
      group: 'steps',
      of: [
        {
          type: 'object',
          preview: { select: { title: 'title' } },
          fields: [
            defineField({
              name: 'title',
              title: 'Step Title',
              type: 'string',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'body',
              title: 'Body',
              type: 'text',
              rows: 4,
            }),
            defineField({ name: 'ctaLabel', title: 'CTA Label', type: 'string' }),
            defineField({ name: 'ctaHref',  title: 'CTA Href',  type: 'string' }),
          ],
        },
      ],
    }),

    /* ════════════════════════════════════════════════════════
       PRICING TEASER
    ════════════════════════════════════════════════════════ */
    defineField({
      name: 'pricingSectionLabel',
      title: 'Eyebrow Label',
      type: 'string',
      group: 'pricing',
    }),
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
      name: 'pricingHighlights',
      title: 'Highlight Bullets',
      type: 'array',
      group: 'pricing',
      of: [{ type: 'string' }],
      description: 'Short bullet-point claims shown beside the CTA (e.g. "From £49 per candidate").',
    }),
    defineField({
      name: 'pricingCtaLabel',
      title: 'CTA Label',
      type: 'string',
      group: 'pricing',
    }),
    defineField({
      name: 'pricingCtaHref',
      title: 'CTA Href',
      type: 'string',
      group: 'pricing',
    }),

    /* ════════════════════════════════════════════════════════
       CLOSING CTA — peak brand-purple-deep statement block
    ════════════════════════════════════════════════════════ */
    defineField({
      name: 'closingStatement',
      title: 'Statement',
      type: 'string',
      group: 'closingCta',
      description: 'Big headline statement — max ~10 words.',
    }),
    defineField({
      name: 'closingEyebrow',
      title: 'Eyebrow',
      type: 'string',
      group: 'closingCta',
      description: 'e.g. "with Vero Assess you can"',
    }),
    defineField({
      name: 'closingBenefits',
      title: 'Rotating Benefits',
      type: 'array',
      group: 'closingCta',
      of: [{ type: 'string' }],
      description: 'Short benefit claims that rotate one-by-one.',
    }),
    defineField({
      name: 'closingCtaLabel',
      title: 'CTA Label',
      type: 'string',
      group: 'closingCta',
    }),
    defineField({
      name: 'closingCtaHref',
      title: 'CTA Href',
      type: 'string',
      group: 'closingCta',
    }),
  ],
  preview: {
    prepare() {
      return { title: 'Home Page' }
    },
  },
})
