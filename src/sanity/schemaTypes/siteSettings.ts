import { defineField, defineType } from 'sanity'
import { CogIcon } from '@sanity/icons'

export const siteSettings = defineType({
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  icon: CogIcon,
  groups: [
    { name: 'footer',        title: 'Footer' },
    { name: 'nav',           title: 'Nav' },
    { name: 'partnerLogos',  title: 'Partner Logos' },
  ],
  fields: [
    /* ── Footer ── */
    defineField({
      name: 'footerCtaHeading',
      title: 'Footer CTA Heading',
      type: 'string',
      group: 'footer',
    }),
    defineField({
      name: 'footerCtaBody',
      title: 'Footer CTA Body',
      type: 'text',
      rows: 2,
      group: 'footer',
    }),
    defineField({
      name: 'footerCtaButtonLabel',
      title: 'Footer CTA Button Label',
      type: 'string',
      group: 'footer',
    }),
    defineField({
      name: 'footerCtaButtonHref',
      title: 'Footer CTA Button Href',
      type: 'string',
      group: 'footer',
    }),

    /* ── Nav ── */
    defineField({
      name: 'navCtaLabel',
      title: 'Nav CTA Label',
      type: 'string',
      group: 'nav',
    }),
    defineField({
      name: 'navCtaHref',
      title: 'Nav CTA Href',
      type: 'string',
      group: 'nav',
    }),

    /* ── Partner Logos (global — used wherever the LogoMarquee renders) ── */
    defineField({
      name: 'partnerLogosLabel',
      title: 'Default Section Label',
      type: 'string',
      group: 'partnerLogos',
      description: 'Default eyebrow shown above the marquee (e.g. "Trusted by hiring teams at"). Pages can still override this.',
    }),
    defineField({
      name: 'partnerLogos',
      title: 'Partner Logos',
      type: 'array',
      group: 'partnerLogos',
      description: 'Logos shown in the marquee. SVG strongly preferred — uploaded as raw file assets so they render crisply and recolour cleanly.',
      of: [
        {
          type: 'object',
          preview: {
            select: { title: 'name', media: 'logo' },
          },
          fields: [
            defineField({
              name: 'name',
              title: 'Company name',
              type: 'string',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'logo',
              title: 'Logo (SVG, PNG, or WebP)',
              type: 'file',
              options: {
                accept: 'image/svg+xml,image/png,image/webp',
              },
              description: 'SVGs upload as files (no transformations) so they keep their full vector fidelity.',
            }),
          ],
        },
      ],
    }),
  ],
  preview: {
    prepare() {
      return { title: 'Site Settings' }
    },
  },
})
