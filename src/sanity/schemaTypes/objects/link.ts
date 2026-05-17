import { defineField, defineType } from 'sanity'
import { LinkIcon } from '@sanity/icons'

/**
 * Reusable link object — used everywhere editors used to type a URL by
 * hand (CTAs, nav links, footer links, etc.).
 *
 * Three modes, picked via the radio at the top:
 *
 *  1. `internal` — pick a built-in site route from a dropdown. Covers
 *     all the static pages that don't have a Sanity document behind them
 *     (Home, Pricing, Contact, the get-started flow, etc.).
 *
 *  2. `reference` — pick a Sanity document (a job category, a role, a
 *     legal page). The site resolves the URL from the document's slug
 *     so the link follows the doc if its slug ever changes.
 *
 *  3. `external` — paste any full URL. Use for links off-site.
 *
 *  4. `openInNewTab` — applies to all three modes.
 *
 * Components don't read this object directly — queries resolve it to a
 * plain string href via `resolveLinkProjection()` in `queries.ts`. That
 * keeps all the consuming components blissfully unaware that links got
 * smarter under the hood.
 */

/* Hardcoded list of every static Next.js route on the marketing site.
   Order roughly mirrors top-level nav importance. Keep in sync with
   `src/app/(site)/**` whenever a new static route ships. */
export const INTERNAL_ROUTES: { title: string; value: string }[] = [
  { title: 'Home (/)', value: '/' },
  { title: 'Pricing (/pricing)', value: '/pricing' },
  { title: 'How it works (/how-it-works)', value: '/how-it-works' },
  { title: 'Assessments — listing (/assessments)', value: '/assessments' },
  { title: 'About (/about)', value: '/about' },
  { title: 'Contact (/contact)', value: '/contact' },
  { title: 'The Science (/resources/science)', value: '/resources/science' },
  { title: 'Compliance (/resources/compliance)', value: '/resources/compliance' },
  { title: 'Get started — step 1 (/get-started)', value: '/get-started' },
  { title: 'Get started — bespoke enquiry (/get-started/bespoke)', value: '/get-started/bespoke' },
]

export const link = defineType({
  name: 'link',
  title: 'Link',
  type: 'object',
  icon: LinkIcon,
  fields: [
    defineField({
      name: 'type',
      title: 'Link type',
      type: 'string',
      options: {
        list: [
          { title: 'Internal page', value: 'internal' },
          { title: 'Sanity content (category, role, legal page)', value: 'reference' },
          { title: 'External URL', value: 'external' },
        ],
        layout: 'radio',
      },
      initialValue: 'internal',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'internal',
      title: 'Page',
      type: 'string',
      options: { list: INTERNAL_ROUTES },
      hidden: ({ parent }) => parent?.type !== 'internal',
      validation: (Rule) =>
        Rule.custom((value, ctx) => {
          const parent = ctx.parent as { type?: string } | undefined
          if (parent?.type === 'internal' && !value) return 'Pick a page'
          return true
        }),
    }),
    defineField({
      name: 'reference',
      title: 'Content',
      type: 'reference',
      to: [
        { type: 'jobCategory' },
        { type: 'role' },
        { type: 'legalPage' },
      ],
      hidden: ({ parent }) => parent?.type !== 'reference',
      validation: (Rule) =>
        Rule.custom((value, ctx) => {
          const parent = ctx.parent as { type?: string } | undefined
          if (parent?.type === 'reference' && !value) return 'Pick a document'
          return true
        }),
    }),
    defineField({
      name: 'external',
      title: 'URL',
      type: 'url',
      description: 'Full URL including https://',
      hidden: ({ parent }) => parent?.type !== 'external',
      validation: (Rule) =>
        Rule.uri({ scheme: ['http', 'https', 'mailto', 'tel'] }).custom((value, ctx) => {
          const parent = ctx.parent as { type?: string } | undefined
          if (parent?.type === 'external' && !value) return 'Enter a URL'
          return true
        }),
    }),
    defineField({
      name: 'openInNewTab',
      title: 'Open in new tab',
      type: 'boolean',
      initialValue: false,
    }),
  ],
})
