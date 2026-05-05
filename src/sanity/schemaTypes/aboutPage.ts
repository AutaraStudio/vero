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
    { name: 'hero',                 title: 'Section 1 — Hero',                 icon: StarIcon, default: true },
    { name: 'tazioEvolution',       title: 'Section 2 — Tazio platform story', icon: RocketIcon },
    { name: 'candidateExperiences', title: 'Section 3 — Candidate experience', icon: HeartFilledIcon },
    { name: 'clients',              title: 'Section 4 — Clients & partners',   icon: CaseIcon },
    { name: 'team',                 title: 'Section 5 — Team grid',            icon: UsersIcon },
  ],
  fields: [
    /* ════════════════════════════════════════════════════════
       SECTION 1 — HERO
    ════════════════════════════════════════════════════════ */
    defineField({
      name: 'heroHeadline',
      title: 'Headline',
      type: 'string',
      group: 'hero',
      description: 'The big headline at the top of the page (e.g. "Powered by trusted technology"). 4–8 words works best.',
      validation: (Rule) =>
        Rule.max(80).warning('Headlines longer than 80 chars start to wrap awkwardly.'),
    }),
    defineField({
      name: 'heroIntro',
      title: 'Intro paragraph',
      type: 'text',
      rows: 3,
      group: 'hero',
      description: 'One or two sentences sitting beneath the headline.',
    }),
    defineField({
      name: 'heroMedia',
      title: 'Hero media',
      type: 'mediaBlock',
      group: 'hero',
      description:
        'Image or video shown on the right side of the hero. ' +
        'Pick "Video (opens modal)" to make the visitor click to watch. ' +
        '1600×1000px recommended for images / 16:9 cover for videos.',
    }),

    /* ════════════════════════════════════════════════════════
       SECTION 2 — TAZIO PLATFORM STORY (centred IntroBlock)
    ════════════════════════════════════════════════════════ */
    defineField({
      name: 'tazioEvolutionHeading',
      title: 'Heading',
      type: 'string',
      group: 'tazioEvolution',
      description: 'Heading for the centred section about Tazio (e.g. "Tazio\'s tech evolution").',
    }),
    defineField({
      name: 'tazioEvolutionBody',
      title: 'Body paragraphs',
      type: 'array',
      group: 'tazioEvolution',
      description: 'Multiple paragraphs telling the Tazio platform story. Plain text — no rich formatting.',
      of: [{ type: 'block', styles: [{ title: 'Normal', value: 'normal' }], marks: { decorators: [] } }],
    }),
    defineField({
      name: 'tazioEvolutionMedia',
      title: 'Section media',
      type: 'mediaBlock',
      group: 'tazioEvolution',
      description: 'Image or clickable video shown beneath the body. Leave blank to skip the media slot.',
    }),
    defineField({
      name: 'tazioEvolutionCTALabel',
      title: 'Button — text',
      type: 'string',
      group: 'tazioEvolution',
      description: 'Optional button label (e.g. "Visit Tazio"). Leave blank to hide the button.',
    }),
    defineField({
      name: 'tazioEvolutionCTAHref',
      title: 'Button — link (full URL)',
      type: 'url',
      group: 'tazioEvolution',
      description: 'External link, e.g. https://www.tazio.io. Used by the button above.',
      hidden: ({ parent }) => !parent?.tazioEvolutionCTALabel,
    }),

    /* ════════════════════════════════════════════════════════
       SECTION 3 — CANDIDATE EXPERIENCE (split layout)
    ════════════════════════════════════════════════════════ */
    defineField({
      name: 'candidateExperiencesHeading',
      title: 'Heading',
      type: 'string',
      group: 'candidateExperiences',
      description: 'Heading for the split section about candidate experience.',
    }),
    defineField({
      name: 'candidateExperiencesBody',
      title: 'Body paragraphs',
      type: 'array',
      group: 'candidateExperiences',
      description: 'Multiple paragraphs. Plain text — no rich formatting.',
      of: [{ type: 'block', styles: [{ title: 'Normal', value: 'normal' }], marks: { decorators: [] } }],
    }),
    defineField({
      name: 'candidateExperiencesMedia',
      title: 'Section media',
      type: 'mediaBlock',
      group: 'candidateExperiences',
      description: 'Image or clickable video on the right side of the section. Recommended 4:3 ratio (e.g. 1200×900).',
    }),

    /* ════════════════════════════════════════════════════════
       SECTION 4 — CLIENTS & PARTNERS (logo marquees)
    ════════════════════════════════════════════════════════ */
    defineField({
      name: 'clientsHeading',
      title: 'Section heading',
      type: 'string',
      group: 'clients',
      description: 'Heading above both logo strips (e.g. "Trusted by hiring teams").',
    }),
    defineField({
      name: 'clientsIntro',
      title: 'Intro paragraph (above client logos)',
      type: 'text',
      rows: 2,
      group: 'clients',
      description: 'Short intro shown above the first logo strip. Optional.',
    }),
    defineField({
      name: 'clientLogos',
      title: 'Client logos (top strip)',
      type: 'array',
      group: 'clients',
      description: 'Logos shown in the first scrolling strip. SVG strongly preferred. Add at least 6 to ensure smooth looping.',
      of: [
        {
          type: 'object',
          preview: {
            select: { title: 'name', media: 'logo' },
            prepare: ({ title, media }) => ({ title: title || 'Untitled logo', media }),
          },
          fields: [
            defineField({
              name: 'name',
              title: 'Company name',
              type: 'string',
              description: 'Used as the alt text and shown if no logo is uploaded.',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'logo',
              title: 'Logo file (SVG / PNG / WebP)',
              type: 'file',
              options: { accept: 'image/svg+xml,image/png,image/webp' },
              description: 'SVG strongly preferred — keeps full vector quality at any size.',
            }),
          ],
        },
      ],
    }),
    defineField({
      name: 'rpoIntro',
      title: 'Intro paragraph (above RPO partner logos)',
      type: 'text',
      rows: 2,
      group: 'clients',
      description: 'Short intro shown above the second logo strip (RPO partners). Optional.',
    }),
    defineField({
      name: 'rpoLogos',
      title: 'RPO partner logos (bottom strip)',
      type: 'array',
      group: 'clients',
      description: 'Logos shown in the second scrolling strip. Same rules as above.',
      of: [
        {
          type: 'object',
          preview: {
            select: { title: 'name', media: 'logo' },
            prepare: ({ title, media }) => ({ title: title || 'Untitled logo', media }),
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
              title: 'Logo file (SVG / PNG / WebP)',
              type: 'file',
              options: { accept: 'image/svg+xml,image/png,image/webp' },
            }),
          ],
        },
      ],
    }),

    /* ════════════════════════════════════════════════════════
       SECTION 5 — TEAM GRID
    ════════════════════════════════════════════════════════ */
    defineField({
      name: 'teamHeading',
      title: 'Heading',
      type: 'string',
      group: 'team',
      description: 'Heading above the team grid (e.g. "Meet the team").',
    }),
    defineField({
      name: 'teamIntro',
      title: 'Intro paragraph',
      type: 'text',
      rows: 3,
      group: 'team',
      description: 'Sticky intro paragraph shown to the left of the team list as you scroll.',
    }),
    defineField({
      name: 'teamMembers',
      title: 'Team members',
      type: 'array',
      group: 'team',
      description:
        'Add a card for each team member. They\'re grouped automatically on the page by the Category field below. ' +
        'Aim for 2 or 4 members per category for the cleanest grid.',
      of: [
        {
          type: 'object',
          preview: {
            select: { title: 'name', subtitle: 'role', media: 'headshot' },
            prepare: ({ title, subtitle, media }) => ({
              title: title || 'Untitled member',
              subtitle: subtitle || 'No role set',
              media,
            }),
          },
          fields: [
            defineField({
              name: 'name',
              title: 'Name',
              type: 'string',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'role',
              title: 'Role / job title',
              type: 'string',
              description: 'e.g. "Head of Customer Success" or "Senior Engineer".',
            }),
            defineField({
              name: 'category',
              title: 'Team / department',
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
              description: 'Members are grouped under their team heading on the page.',
            }),
            defineField({
              name: 'headshot',
              title: 'Headshot',
              type: 'image',
              options: { hotspot: true },
              description: 'Square image works best (e.g. 800×800). Hotspot lets you set the focal point.',
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
