import { defineField, defineType } from 'sanity'
import { DocumentTextIcon } from '@sanity/icons'

/**
 * Legal page — privacy, cookie policy, security, etc.
 *
 * Body is stored as Markdown so editors can paste content from the
 * source policy documents and the page route renders it via
 * react-markdown with a clean, accessible long-form style.
 */
export const legalPage = defineType({
  name: 'legalPage',
  title: 'Legal page',
  type: 'document',
  icon: DocumentTextIcon,
  fields: [
    defineField({
      name: 'title',
      title: 'Page title',
      type: 'string',
      description: 'Shown as the H1 (e.g. "Privacy Policy", "Security").',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'URL slug',
      type: 'slug',
      options: { source: 'title', maxLength: 60 },
      description:
        'Becomes the page URL: /legal/<slug>. Use kebab-case, e.g. "privacy", "cookies", "security".',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'intro',
      title: 'Short intro (optional)',
      type: 'text',
      rows: 2,
      description:
        'One- or two-line summary shown under the title. Leave blank to skip.',
    }),
    defineField({
      name: 'lastUpdated',
      title: 'Last updated',
      type: 'date',
      description:
        'Shown below the title. Update whenever the policy text materially changes.',
    }),
    defineField({
      name: 'body',
      title: 'Body (Markdown)',
      type: 'text',
      rows: 30,
      description:
        'The full policy text in Markdown. Use ## for sections, ### for subsections, and standard - bullet lists. Inline links work via [label](url).',
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: { title: 'title', subtitle: 'slug.current' },
    prepare: ({ title, subtitle }) => ({
      title: title || 'Untitled legal page',
      subtitle: subtitle ? `/legal/${subtitle}` : 'No slug',
    }),
  },
})
