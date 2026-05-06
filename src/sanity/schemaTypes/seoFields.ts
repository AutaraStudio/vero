import { defineField, defineType } from 'sanity'
import { SearchIcon } from '@sanity/icons'
import { altRequiredWhenImagePresent } from '../lib/altFieldValidation'

/**
 * Reusable per-page SEO object.
 *
 * Drop into any page document via:
 *   defineField({ name: 'seo', title: 'SEO', type: 'seoFields', group: 'seo' }),
 *
 * Every field is optional. The page's render code falls back to the page's
 * own headline / intro / hero image, and ultimately to siteSettings global
 * defaults, when a field is left blank — clients only need to fill in
 * what they want to override.
 */
export const seoFields = defineType({
  name: 'seoFields',
  title: 'SEO',
  type: 'object',
  icon: SearchIcon,
  options: { collapsible: true, collapsed: false },
  fields: [
    defineField({
      name: 'pageTitle',
      title: 'Page title (browser tab + search results)',
      type: 'string',
      description:
        'Shown in browser tabs, search engine results and link previews. ' +
        'Aim for ≤60 characters. Leave blank to use the page heading.',
      validation: (Rule) =>
        Rule.max(70).warning('Search engines typically truncate after ~60 characters.'),
    }),
    defineField({
      name: 'metaDescription',
      title: 'Meta description',
      type: 'text',
      rows: 3,
      description:
        'One- or two-sentence summary shown in search results. ' +
        'Aim for ≤160 characters. Leave blank to use the page intro.',
      validation: (Rule) =>
        Rule.max(180).warning('Search engines typically truncate after ~160 characters.'),
    }),
    defineField({
      name: 'ogTitle',
      title: 'Social share title (Open Graph)',
      type: 'string',
      description:
        'Title used when this page is shared on Facebook, LinkedIn, Slack, etc. ' +
        'Leave blank to use the page title above.',
    }),
    defineField({
      name: 'ogDescription',
      title: 'Social share description (Open Graph)',
      type: 'text',
      rows: 2,
      description:
        'Description used in social share previews. ' +
        'Leave blank to use the meta description above.',
    }),
    defineField({
      name: 'ogImage',
      title: 'Social share image (Open Graph)',
      type: 'image',
      options: { hotspot: true },
      description:
        'Image shown in social share previews. Recommended: 1200×630px JPG/PNG. ' +
        'Leave blank to use the global default from Site Settings.',
      fields: [
        defineField({ name: 'alt', title: 'Alt text', type: 'string', validation: altRequiredWhenImagePresent }),
      ],
    }),
    defineField({
      name: 'noIndex',
      title: 'Hide from search engines',
      type: 'boolean',
      description:
        'When checked, adds <meta name="robots" content="noindex"> so this page ' +
        'will not appear in Google / Bing search results. Leave unchecked for normal pages.',
      initialValue: false,
    }),
  ],
})
