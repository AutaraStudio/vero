import { defineArrayMember, defineField, defineType } from 'sanity'
import { altRequiredWhenImagePresent } from '../lib/altFieldValidation'
import { MenuIcon } from '@sanity/icons'

/**
 * Top-bar navigation. Editors control the order of the top-level items
 * (mix of plain links and the two dropdown triggers), the dropdown
 * content for "Company", and the promo card sat alongside it.
 *
 * The Assessments dropdown content comes from `globalCategoryGroups` —
 * editors reorder categories there, not here.
 */
export const globalNav = defineType({
  name: 'globalNav',
  title: 'Nav',
  type: 'document',
  icon: MenuIcon,
  groups: [
    { name: 'top', title: 'Top-level items', default: true },
    { name: 'company', title: 'Company dropdown' },
    { name: 'cta', title: 'CTA button' },
  ],
  fields: [
    /* ────────────────────────────────────────────────────────────
       Top-level items — ordered list of plain links and dropdowns
    ──────────────────────────────────────────────────────────── */
    defineField({
      name: 'topItems',
      title: 'Top-level items',
      type: 'array',
      group: 'top',
      description:
        'Drag to reorder. Add a "Plain link" for direct destinations like Pricing. Add an "Assessments dropdown" or "Company dropdown" exactly once each — those are the two mega-menus.',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'plainLink',
          title: 'Plain link',
          fields: [
            defineField({ name: 'label', title: 'Label', type: 'string', validation: (Rule) => Rule.required() }),
            defineField({
              name: 'href',
              title: 'URL',
              type: 'string',
              description: 'Internal path like "/pricing" or full https:// URL for external.',
              validation: (Rule) => Rule.required(),
            }),
            defineField({ name: 'external', title: 'Open in new tab', type: 'boolean', initialValue: false }),
          ],
          preview: { select: { title: 'label', subtitle: 'href' }, prepare: ({ title, subtitle }) => ({ title: title ?? '—', subtitle: `Link · ${subtitle ?? ''}` }) },
        }),
        defineArrayMember({
          type: 'object',
          name: 'assessmentsDropdown',
          title: 'Assessments dropdown',
          fields: [
            defineField({
              name: 'label',
              title: 'Trigger label',
              type: 'string',
              description: 'The text shown in the top bar (e.g. "Assessments").',
              initialValue: 'Assessments',
              validation: (Rule) => Rule.required(),
            }),
          ],
          preview: { select: { title: 'label' }, prepare: ({ title }) => ({ title: title ?? 'Assessments', subtitle: 'Dropdown · driven by Category groups' }) },
        }),
        defineArrayMember({
          type: 'object',
          name: 'companyDropdown',
          title: 'Company dropdown',
          fields: [
            defineField({
              name: 'label',
              title: 'Trigger label',
              type: 'string',
              description: 'The text shown in the top bar (e.g. "Company").',
              initialValue: 'Company',
              validation: (Rule) => Rule.required(),
            }),
          ],
          preview: { select: { title: 'label' }, prepare: ({ title }) => ({ title: title ?? 'Company', subtitle: 'Dropdown · content below' }) },
        }),
      ],
    }),

    /* ────────────────────────────────────────────────────────────
       Company dropdown content
    ──────────────────────────────────────────────────────────── */
    defineField({
      name: 'companyColumns',
      title: 'Company dropdown columns',
      type: 'array',
      group: 'company',
      description:
        'Each column appears as a labelled list of links inside the dropdown. Currently two columns ("Company" and "Resources") — add more if you want.',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'navColumn',
          fields: [
            defineField({
              name: 'title',
              title: 'Column title',
              type: 'string',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'links',
              title: 'Links',
              type: 'array',
              of: [
                defineArrayMember({
                  type: 'object',
                  name: 'navLink',
                  fields: [
                    defineField({ name: 'label', title: 'Label', type: 'string', validation: (Rule) => Rule.required() }),
                    defineField({
                      name: 'description',
                      title: 'Description',
                      type: 'string',
                      description: 'Short teaser shown below the label inside the dropdown.',
                    }),
                    defineField({
                      name: 'href',
                      title: 'URL',
                      type: 'string',
                      validation: (Rule) => Rule.required(),
                    }),
                    defineField({ name: 'external', title: 'Open in new tab', type: 'boolean', initialValue: false }),
                  ],
                  preview: { select: { title: 'label', subtitle: 'href' } },
                }),
              ],
            }),
          ],
          preview: { select: { title: 'title', count: 'links.length' }, prepare: ({ title, count }) => ({ title: title || 'Untitled column', subtitle: `${count ?? 0} link${count === 1 ? '' : 's'}` }) },
        }),
      ],
    }),
    defineField({
      name: 'companyCard',
      title: 'Company dropdown promo card',
      type: 'object',
      group: 'company',
      description:
        'Optional card shown alongside the Company dropdown columns. Leave the heading blank to hide it.',
      fields: [
        defineField({
          name: 'eyebrow',
          title: 'Eyebrow / heading',
          type: 'string',
          description: 'Short hook (e.g. "Live in 48 hours").',
        }),
        defineField({
          name: 'body',
          title: 'Body text',
          type: 'string',
          description: 'One supporting line under the heading.',
        }),
        defineField({
          name: 'ctaLabel',
          title: 'CTA label',
          type: 'string',
          initialValue: 'Get started',
        }),
        defineField({
          name: 'ctaHref',
          title: 'CTA link',
          type: 'string',
          initialValue: '/get-started',
        }),
        defineField({
          name: 'image',
          title: 'Card image',
          type: 'image',
          options: { hotspot: true },
          description: 'Optional. Replaces the placeholder block at the top of the card.',
          fields: [
            defineField({ name: 'alt', title: 'Alt text', type: 'string', validation: altRequiredWhenImagePresent }),
          ],
        }),
      ],
    }),

    /* ────────────────────────────────────────────────────────────
       Top-right CTA button
    ──────────────────────────────────────────────────────────── */
    defineField({
      name: 'ctaLabel',
      title: 'CTA button label',
      type: 'string',
      group: 'cta',
      initialValue: 'Get started',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'ctaHref',
      title: 'CTA button link',
      type: 'string',
      group: 'cta',
      initialValue: '/get-started',
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: { prepare: () => ({ title: 'Nav' }) },
})
