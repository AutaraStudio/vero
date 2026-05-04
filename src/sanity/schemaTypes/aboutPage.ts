import { defineField, defineType } from 'sanity'
import {
  InfoOutlineIcon,
  SearchIcon,
  StarIcon,
  RocketIcon,
  HeartFilledIcon,
  CaseIcon,
  UsersIcon,
} from '@sanity/icons'

export const aboutPage = defineType({
  name: 'aboutPage',
  title: 'About Page',
  type: 'document',
  icon: InfoOutlineIcon,
  groups: [
    { name: 'seo',                  title: 'SEO',                              icon: SearchIcon },
    { name: 'hero',                 title: 'Section 1 — Hero',                 icon: StarIcon, default: true },
    { name: 'tazioEvolution',       title: 'Section 2 — Tazio platform story', icon: RocketIcon },
    { name: 'candidateExperiences', title: 'Section 3 — Candidate experience', icon: HeartFilledIcon },
    { name: 'clients',              title: 'Section 4 — Clients & partners',   icon: CaseIcon },
    { name: 'team',                 title: 'Section 5 — Team grid',            icon: UsersIcon },
  ],
  fields: [
    /* ── SEO ── */
    defineField({
      name: 'seo',
      title: 'Search engine + social sharing',
      type: 'seoFields',
      group: 'seo',
      description:
        'Browser tab title, search-result snippet, and link previews on social. ' +
        'Anything left blank inherits from Site Settings.',
    }),

    /* ── Hero ── */
    defineField({
      name: 'heroHeadline',
      title: 'Headline',
      type: 'string',
      group: 'hero',
    }),
    defineField({
      name: 'heroIntro',
      title: 'Intro',
      type: 'text',
      rows: 3,
      group: 'hero',
    }),
    defineField({
      name: 'heroImage',
      title: 'Hero Image (Tazio)',
      type: 'image',
      group: 'hero',
      options: { hotspot: true },
      fields: [defineField({ name: 'alt', title: 'Alt text', type: 'string' })],
    }),

    /* ── Tazio Evolution ── */
    defineField({
      name: 'tazioEvolutionHeading',
      title: 'Heading',
      type: 'string',
      group: 'tazioEvolution',
    }),
    defineField({
      name: 'tazioEvolutionBody',
      title: 'Body',
      type: 'array',
      group: 'tazioEvolution',
      of: [{ type: 'block', styles: [{ title: 'Normal', value: 'normal' }], marks: { decorators: [] } }],
    }),
    defineField({
      name: 'tazioEvolutionImage',
      title: 'Image (Tazio Platform)',
      type: 'image',
      group: 'tazioEvolution',
      options: { hotspot: true },
      fields: [defineField({ name: 'alt', title: 'Alt text', type: 'string' })],
    }),
    defineField({
      name: 'tazioEvolutionCTALabel',
      title: 'CTA Label',
      type: 'string',
      group: 'tazioEvolution',
    }),
    defineField({
      name: 'tazioEvolutionCTAHref',
      title: 'CTA Href',
      type: 'url',
      group: 'tazioEvolution',
    }),

    /* ── Candidate Experiences ── */
    defineField({
      name: 'candidateExperiencesHeading',
      title: 'Heading',
      type: 'string',
      group: 'candidateExperiences',
    }),
    defineField({
      name: 'candidateExperiencesBody',
      title: 'Body',
      type: 'array',
      group: 'candidateExperiences',
      of: [{ type: 'block', styles: [{ title: 'Normal', value: 'normal' }], marks: { decorators: [] } }],
    }),
    defineField({
      name: 'candidateExperiencesImage',
      title: 'Image',
      type: 'image',
      group: 'candidateExperiences',
      options: { hotspot: true },
      fields: [defineField({ name: 'alt', title: 'Alt text', type: 'string' })],
    }),

    /* ── Clients ── */
    defineField({
      name: 'clientsHeading',
      title: 'Heading',
      type: 'string',
      group: 'clients',
    }),
    defineField({
      name: 'clientsIntro',
      title: 'Client Sectors Intro',
      type: 'text',
      rows: 2,
      group: 'clients',
    }),
    defineField({
      name: 'clientLogos',
      title: 'Client Logos',
      type: 'array',
      group: 'clients',
      of: [
        {
          type: 'object',
          preview: { select: { title: 'name', media: 'logo' } },
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
              options: { accept: 'image/svg+xml,image/png,image/webp' },
            }),
          ],
        },
      ],
    }),
    defineField({
      name: 'rpoIntro',
      title: 'RPO Partners Intro',
      type: 'text',
      rows: 2,
      group: 'clients',
    }),
    defineField({
      name: 'rpoLogos',
      title: 'RPO Logos',
      type: 'array',
      group: 'clients',
      of: [
        {
          type: 'object',
          preview: { select: { title: 'name', media: 'logo' } },
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
              options: { accept: 'image/svg+xml,image/png,image/webp' },
            }),
          ],
        },
      ],
    }),

    /* ── Team ── */
    defineField({
      name: 'teamHeading',
      title: 'Heading',
      type: 'string',
      group: 'team',
    }),
    defineField({
      name: 'teamIntro',
      title: 'Intro',
      type: 'text',
      rows: 3,
      group: 'team',
      description: 'Sticky intro paragraph shown next to the team list.',
    }),
    defineField({
      name: 'teamMembers',
      title: 'Team Members',
      type: 'array',
      group: 'team',
      of: [
        {
          type: 'object',
          preview: { select: { title: 'name', subtitle: 'role', media: 'headshot' } },
          fields: [
            defineField({ name: 'name', title: 'Name', type: 'string' }),
            defineField({ name: 'role', title: 'Role', type: 'string' }),
            defineField({
              name: 'category',
              title: 'Category',
              type: 'string',
              options: {
                list: [
                  { title: 'Leadership',          value: 'leadership' },
                  { title: 'Sales & Commercial',  value: 'sales' },
                  { title: 'Marketing',           value: 'marketing' },
                  { title: 'Customer Success',    value: 'customerSuccess' },
                  { title: 'People & Operations', value: 'peopleOps' },
                  { title: 'Science & Research',  value: 'science' },
                ],
                layout: 'dropdown',
              },
              description: 'Used to group members under category headings on the about page.',
            }),
            defineField({
              name: 'headshot',
              title: 'Headshot',
              type: 'image',
              options: { hotspot: true },
              fields: [defineField({ name: 'alt', title: 'Alt text', type: 'string' })],
            }),
          ],
        },
      ],
    }),
  ],
  preview: {
    prepare() {
      return { title: 'About us page', subtitle: 'Singleton — only one of these exists' }
    },
  },
})
