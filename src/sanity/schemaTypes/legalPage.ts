import { defineArrayMember, defineField, defineType } from 'sanity'
import { DocumentTextIcon } from '@sanity/icons'

/**
 * Legal page — privacy, cookie policy, security, etc.
 *
 * Body is Portable Text so editors get a proper rich-text editor with
 * headings, lists, links, bold/italic, and block quotes — every option
 * is mapped to a Vero-styled output in `LegalDocument.tsx`. The older
 * `legacyMarkdown` field is kept visible for now so editors can copy
 * content over from the previous markdown body; once a rich body is
 * filled in, it takes precedence and the markdown is ignored.
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
      title: 'Body',
      description:
        'Rich text. Use H2 for top-level sections (these auto-populate the on-page table of contents), H3 for subsections, plus lists, links, and bold / italic as needed.',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'block',
          /* Block styles available in the dropdown. We deliberately exclude
             H1 — the page title is the only H1 — and oversized headings
             that don't fit the legal layout. */
          styles: [
            { title: 'Normal', value: 'normal' },
            { title: 'Section heading (H2)', value: 'h2' },
            { title: 'Sub-section (H3)', value: 'h3' },
            { title: 'Inline heading (H4)', value: 'h4' },
            { title: 'Quote', value: 'blockquote' },
          ],
          lists: [
            { title: 'Bullet', value: 'bullet' },
            { title: 'Numbered', value: 'number' },
          ],
          marks: {
            decorators: [
              { title: 'Bold', value: 'strong' },
              { title: 'Italic', value: 'em' },
              { title: 'Underline', value: 'underline' },
              { title: 'Strike-through', value: 'strike-through' },
              { title: 'Inline code', value: 'code' },
            ],
            annotations: [
              {
                name: 'link',
                type: 'object',
                title: 'Link',
                fields: [
                  defineField({
                    name: 'href',
                    title: 'URL',
                    type: 'url',
                    validation: (Rule) =>
                      Rule.uri({
                        scheme: ['http', 'https', 'mailto', 'tel'],
                        allowRelative: true,
                      }),
                  }),
                  defineField({
                    name: 'newTab',
                    title: 'Open in a new tab',
                    type: 'boolean',
                    initialValue: true,
                  }),
                ],
              },
            ],
          },
        }),
      ],
    }),
    defineField({
      name: 'legacyMarkdown',
      title: 'Body (legacy markdown)',
      type: 'text',
      rows: 20,
      description:
        'Old markdown body — used as a fallback while content is being moved into the rich-text Body above. Once you finish copying the content into the new editor, you can clear this field.',
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
