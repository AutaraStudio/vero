import { defineField, defineType } from 'sanity'
import { InfoOutlineIcon } from '@sanity/icons'

export const aboutPage = defineType({
  name: 'aboutPage',
  title: 'About Page',
  type: 'document',
  icon: InfoOutlineIcon,
  groups: [
    { name: 'hero', title: 'Hero' },
    { name: 'tazioEvolution', title: 'Tazio Evolution' },
    { name: 'candidateExperiences', title: 'Candidate Experiences' },
    { name: 'clients', title: 'Clients' },
    { name: 'team', title: 'Team' },
  ],
  fields: [
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
          type: 'image',
          options: { hotspot: true },
          fields: [defineField({ name: 'alt', title: 'Alt text', type: 'string' })],
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
          type: 'image',
          options: { hotspot: true },
          fields: [defineField({ name: 'alt', title: 'Alt text', type: 'string' })],
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
      return { title: 'About Page' }
    },
  },
})
