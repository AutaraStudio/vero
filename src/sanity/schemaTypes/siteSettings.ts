import { defineField, defineType } from 'sanity'
import { CogIcon } from '@sanity/icons'

export const siteSettings = defineType({
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  icon: CogIcon,
  groups: [
    { name: 'seo',           title: 'SEO & Branding' },
    { name: 'footer',        title: 'Footer' },
    { name: 'nav',           title: 'Nav' },
    { name: 'partnerLogos',  title: 'Partner Logos' },
    { name: 'legal',         title: 'Legal' },
  ],
  fields: [
    /* ── SEO & Branding (global defaults) ──────────────────
       These provide site-wide fallbacks. Per-page SEO blocks override
       individual fields when set; anything left blank inherits from here. */
    defineField({
      name: 'siteName',
      title: 'Site name',
      type: 'string',
      group: 'seo',
      description: 'Used in <title> tags as a suffix (e.g. "Pricing — Vero Assess").',
      initialValue: 'Vero Assess',
    }),
    defineField({
      name: 'titleTemplate',
      title: 'Title template',
      type: 'string',
      group: 'seo',
      description:
        'Pattern for the <title> tag. Use %s for the page title and %site for the site name. ' +
        'Example: "%s — %site". Leave blank for "%s — %site".',
    }),
    defineField({
      name: 'defaultMetaDescription',
      title: 'Default meta description',
      type: 'text',
      rows: 2,
      group: 'seo',
      description: 'Shown in search results when a page has no override.',
    }),
    defineField({
      name: 'defaultOgImage',
      title: 'Default social share image',
      type: 'image',
      options: { hotspot: true },
      group: 'seo',
      description: 'Used in social share previews when a page has no override. Recommended 1200×630.',
      fields: [
        defineField({ name: 'alt', title: 'Alt text', type: 'string' }),
      ],
    }),
    defineField({
      name: 'favicon',
      title: 'Favicon',
      type: 'image',
      options: { accept: 'image/png,image/svg+xml,image/x-icon' },
      group: 'seo',
      description: 'Browser-tab icon. Square PNG/SVG (32×32 or larger) works best.',
    }),
    defineField({
      name: 'appleTouchIcon',
      title: 'Apple touch icon',
      type: 'image',
      options: { accept: 'image/png' },
      group: 'seo',
      description: 'Used when someone adds the site to their iOS home screen. 180×180 PNG.',
    }),
    defineField({
      name: 'twitterHandle',
      title: 'Twitter / X handle',
      type: 'string',
      group: 'seo',
      description: 'Without the @ — e.g. "veroassess". Used in Twitter card metadata.',
    }),
    defineField({
      name: 'siteUrl',
      title: 'Canonical site URL',
      type: 'url',
      group: 'seo',
      description: 'e.g. https://www.veroassess.com — used to build absolute URLs in Open Graph metadata.',
    }),
    defineField({
      name: 'themeColor',
      title: 'Browser theme colour',
      type: 'string',
      group: 'seo',
      description:
        'Hex value used by mobile browsers to tint the address bar (e.g. "#472d6a"). Optional.',
    }),

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

    /* ── Legal (T&C PDFs shown on the checkout contract step) ──
       Two variants live on HubSpot today. Editable here so marketing can
       swap the PDFs without a code deploy. If left blank, the site falls
       back to the hardcoded HubSpot URLs in the contract page. */
    defineField({
      name: 'starterContractUrl',
      title: 'Starter plan T&Cs (PDF URL)',
      type: 'url',
      group: 'legal',
      description:
        'Shown to Starter buyers on the checkout contract step. Paste the full https:// URL of the Single Role Starter Plan T&Cs PDF.',
    }),
    defineField({
      name: 'multiRoleContractUrl',
      title: 'Multi-role plan T&Cs (PDF URL)',
      type: 'url',
      group: 'legal',
      description:
        'Shown to Growth, Scale, and Bespoke buyers on the checkout contract step. Paste the full https:// URL of the Multiple Role Plan T&Cs PDF.',
    }),
  ],
  preview: {
    prepare() {
      return { title: 'Site Settings' }
    },
  },
})
