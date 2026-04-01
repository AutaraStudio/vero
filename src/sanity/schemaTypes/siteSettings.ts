import { defineField, defineType } from 'sanity'
import { CogIcon } from '@sanity/icons'

export const siteSettings = defineType({
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  icon: CogIcon,
  groups: [
    { name: 'footer', title: 'Footer' },
    { name: 'nav', title: 'Nav' },
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
  ],
  preview: {
    prepare() {
      return { title: 'Site Settings' }
    },
  },
})
