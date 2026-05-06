import { defineArrayMember, defineField, defineType } from 'sanity'
import { altRequiredWhenImagePresent } from '../lib/altFieldValidation'
import { ComposeIcon } from '@sanity/icons'

/**
 * Everything that renders inside the site footer — the CTA hero block at
 * the top, the link columns, the contact strip, the social icons, the
 * legal links row, the partner logo, and the copyright text. Editors
 * change copy here and it propagates to every page on the site.
 *
 * The category-by-group columns (Job families / Early careers / Specialist)
 * are NOT in this doc — they live in `globalCategoryGroups` so the nav
 * and footer share a single ordered source.
 */

const platformList = [
  { title: 'LinkedIn', value: 'linkedin' },
  { title: 'YouTube', value: 'youtube' },
  { title: 'Instagram', value: 'instagram' },
  { title: 'Facebook', value: 'facebook' },
  { title: 'X / Twitter', value: 'x' },
  { title: 'TikTok', value: 'tiktok' },
  { title: 'Threads', value: 'threads' },
  { title: 'Bluesky', value: 'bluesky' },
] as const

export const globalFooter = defineType({
  name: 'globalFooter',
  title: 'Footer',
  type: 'document',
  icon: ComposeIcon,
  groups: [
    { name: 'cta', title: 'CTA hero block', default: true },
    { name: 'nav', title: 'Link columns' },
    { name: 'contact', title: 'Contact strip' },
    { name: 'social', title: 'Social links' },
    { name: 'legal', title: 'Legal + close' },
    { name: 'partner', title: 'Partner logo' },
  ],
  fields: [
    /* ────────────────────────────────────────────────────────────
       CTA hero — the big purple block at the top of every footer
    ──────────────────────────────────────────────────────────── */
    defineField({
      name: 'ctaHeading',
      title: 'CTA heading',
      type: 'text',
      rows: 2,
      group: 'cta',
      description:
        'The big statement at the top of the footer. Currently: "A CV tells you what someone has done. Not who they really are."',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'ctaEyebrow',
      title: 'Eyebrow label',
      type: 'string',
      group: 'cta',
      description:
        'Short pill above the rotating list (e.g. "With Vero Assess you can").',
      initialValue: 'With Vero Assess you can',
    }),
    defineField({
      name: 'ctaBenefits',
      title: 'Rotating benefits',
      type: 'array',
      group: 'cta',
      description:
        'Three short statements that cycle inside the rotating box (e.g. "Reduce time-to-hire without sacrificing quality"). Order is the rotation order.',
      validation: (Rule) => Rule.required().min(1).max(6),
      of: [defineArrayMember({ type: 'string' })],
    }),
    defineField({
      name: 'ctaPrimaryLabel',
      title: 'Primary CTA label',
      type: 'string',
      group: 'cta',
      initialValue: 'Get started',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'ctaPrimaryHref',
      title: 'Primary CTA link',
      type: 'string',
      group: 'cta',
      initialValue: '/get-started',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'ctaSecondaryLabel',
      title: 'Secondary CTA label',
      type: 'string',
      group: 'cta',
      description: 'Optional. Leave blank to hide the secondary button.',
      initialValue: 'Talk to sales',
    }),
    defineField({
      name: 'ctaSecondaryHref',
      title: 'Secondary CTA link',
      type: 'string',
      group: 'cta',
      initialValue: '/contact',
    }),

    /* ────────────────────────────────────────────────────────────
       Link columns — Product / Company / Resources etc.
       The Assessments column is driven by globalCategoryGroups, not here.
    ──────────────────────────────────────────────────────────── */
    defineField({
      name: 'linkColumns',
      title: 'Link columns',
      type: 'array',
      group: 'nav',
      description:
        'Each column appears as a labelled list of links in the footer. Drag to reorder. Edit titles, link labels, and URLs freely.',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'column',
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
                  name: 'link',
                  fields: [
                    defineField({
                      name: 'label',
                      title: 'Label',
                      type: 'string',
                      validation: (Rule) => Rule.required(),
                    }),
                    defineField({
                      name: 'href',
                      title: 'URL',
                      type: 'string',
                      description: 'Internal path like "/pricing" or full https:// URL for external links.',
                      validation: (Rule) => Rule.required(),
                    }),
                    defineField({
                      name: 'external',
                      title: 'Open in new tab',
                      type: 'boolean',
                      initialValue: false,
                    }),
                  ],
                  preview: {
                    select: { title: 'label', subtitle: 'href' },
                  },
                }),
              ],
            }),
          ],
          preview: {
            select: { title: 'title', count: 'links.length' },
            prepare: ({ title, count }) => ({
              title: title || 'Untitled column',
              subtitle: `${count ?? 0} link${count === 1 ? '' : 's'}`,
            }),
          },
        }),
      ],
    }),

    /* ────────────────────────────────────────────────────────────
       Contact strip — phone / email / address
    ──────────────────────────────────────────────────────────── */
    defineField({
      name: 'contactPhone',
      title: 'Phone number',
      type: 'string',
      group: 'contact',
      description: 'Displayed as written. The "tel:" link is generated automatically.',
    }),
    defineField({
      name: 'contactEmail',
      title: 'Email address',
      type: 'string',
      group: 'contact',
    }),
    defineField({
      name: 'contactAddress',
      title: 'Address',
      type: 'text',
      rows: 3,
      group: 'contact',
      description:
        'Use line breaks to control wrapping (e.g. line 1 = building/office, line 2 = street, line 3 = city + postcode).',
    }),

    /* ────────────────────────────────────────────────────────────
       Social links — array, platform-keyed
    ──────────────────────────────────────────────────────────── */
    defineField({
      name: 'socialLinks',
      title: 'Social links',
      type: 'array',
      group: 'social',
      description:
        'Add as many or as few as you want. The site renders the matching brand icon for each platform automatically. Drag to reorder.',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'social',
          fields: [
            defineField({
              name: 'platform',
              title: 'Platform',
              type: 'string',
              options: { list: [...platformList], layout: 'dropdown' },
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'url',
              title: 'Profile URL',
              type: 'url',
              validation: (Rule) =>
                Rule.required().uri({ scheme: ['http', 'https'] }),
            }),
          ],
          preview: {
            select: { title: 'platform', subtitle: 'url' },
          },
        }),
      ],
    }),

    /* ────────────────────────────────────────────────────────────
       Legal + close
    ──────────────────────────────────────────────────────────── */
    defineField({
      name: 'legalLinks',
      title: 'Legal links row',
      type: 'array',
      group: 'legal',
      description:
        'The small row of links at the very bottom of the footer (Privacy, Cookies, Modern Slavery, Status, etc.).',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'legalLink',
          fields: [
            defineField({
              name: 'label',
              title: 'Label',
              type: 'string',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'href',
              title: 'URL',
              type: 'string',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'external',
              title: 'Open in new tab',
              type: 'boolean',
              description: 'Tick for full https:// URLs that point off-site.',
              initialValue: false,
            }),
          ],
          preview: { select: { title: 'label', subtitle: 'href' } },
        }),
      ],
    }),
    defineField({
      name: 'businessText',
      title: 'Business / company text',
      type: 'text',
      rows: 3,
      group: 'legal',
      description:
        'Sentence shown above the legal links row (e.g. "Vero is a service offered by Tazio…"). Plain text, no rich formatting.',
    }),
    defineField({
      name: 'copyrightText',
      title: 'Copyright line',
      type: 'string',
      group: 'legal',
      description:
        'The "© {year} …" line. Use {year} as a placeholder for the current year — the site replaces it automatically.',
      initialValue: '© {year} Tazio Online Media Limited.',
    }),

    /* ────────────────────────────────────────────────────────────
       Partner logo — currently the ISE badge
    ──────────────────────────────────────────────────────────── */
    defineField({
      name: 'partnerLabel',
      title: 'Partner section label',
      type: 'string',
      group: 'partner',
      description:
        'Small text shown next to the partner logo. Leave blank to hide the partner block entirely.',
      initialValue: 'In partnership with',
    }),
    defineField({
      name: 'partnerLogo',
      title: 'Partner logo',
      type: 'image',
      group: 'partner',
      options: { hotspot: true },
      description: 'PNG or SVG. Leave blank to hide the partner block.',
      fields: [
        defineField({
          name: 'alt',
          title: 'Alt text',
          type: 'string',
          validation: altRequiredWhenImagePresent,
        }),
      ],
    }),
  ],
  preview: { prepare: () => ({ title: 'Footer' }) },
})
