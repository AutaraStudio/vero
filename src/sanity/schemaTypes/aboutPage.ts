import { defineField, defineType } from 'sanity'
import { altRequiredWhenImagePresent } from '../lib/altFieldValidation'
import {
  InfoOutlineIcon,
  SearchIcon,
  StarIcon,
  RocketIcon,
  HeartFilledIcon,
  CaseIcon,
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
      name: 'heroCTALabel',
      title: 'Primary button — text',
      type: 'string',
      group: 'hero',
      description: 'Optional. Leave blank to hide the primary button.',
    }),
    defineField({
      name: 'heroCTAHref',
      title: 'Primary button — link',
      type: 'link',
      group: 'hero',
      hidden: ({ parent }) => !parent?.heroCTALabel,
    }),
    defineField({
      name: 'heroSecondaryCTALabel',
      title: 'Secondary button — text',
      type: 'string',
      group: 'hero',
      description: 'Optional second button — usually quieter (e.g. "See pricing").',
    }),
    defineField({
      name: 'heroSecondaryCTAHref',
      title: 'Secondary button — link',
      type: 'link',
      group: 'hero',
      hidden: ({ parent }) => !parent?.heroSecondaryCTALabel,
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
      hidden: true,
      name: 'tazioEvolutionHeading',
      title: 'Heading',
      type: 'string',
      group: 'tazioEvolution',
      description: 'Heading for the centred section about Tazio (e.g. "Tazio\'s tech evolution").',
    }),
    defineField({
      hidden: true,
      name: 'tazioEvolutionBody',
      title: 'Body paragraphs',
      type: 'array',
      group: 'tazioEvolution',
      description: 'Multiple paragraphs telling the Tazio platform story. Plain text — no rich formatting.',
      of: [{ type: 'block', styles: [{ title: 'Normal', value: 'normal' }], marks: { decorators: [] } }],
    }),
    defineField({
      hidden: true,
      name: 'tazioEvolutionMedia',
      title: 'Section media',
      type: 'mediaBlock',
      group: 'tazioEvolution',
      description: 'Image or clickable video shown beneath the body. Leave blank to skip the media slot.',
    }),
    defineField({
      hidden: true,
      name: 'tazioEvolutionCTALabel',
      title: 'Button — text',
      type: 'string',
      group: 'tazioEvolution',
      description: 'Optional button label (e.g. "Visit Tazio"). Leave blank to hide the button.',
    }),
    defineField({
      hidden: true,
      name: 'tazioEvolutionCTAHref',
      title: 'Button — link (full URL)',
      type: 'url',
      group: 'tazioEvolution',
      description: 'External link, e.g. https://www.tazio.io. Used by the button above.',
    }),
    /* Unified content-section migration target. */
    defineField({
      name: 'tazioEvolutionSection',
      title: 'Section content',
      type: 'contentSection',
      group: 'tazioEvolution',
      description: 'Migrated equivalent of the fields above — edit here once Phase 2 ships.',
    }),

    /* ════════════════════════════════════════════════════════
       SECTION 3 — CANDIDATE EXPERIENCE (split layout)
    ════════════════════════════════════════════════════════ */
    defineField({
      hidden: true,
      name: 'candidateExperiencesHeading',
      title: 'Heading',
      type: 'string',
      group: 'candidateExperiences',
      description: 'Heading for the split section about candidate experience.',
    }),
    defineField({
      hidden: true,
      name: 'candidateExperiencesBody',
      title: 'Body paragraphs',
      type: 'array',
      group: 'candidateExperiences',
      description: 'Multiple paragraphs. Plain text — no rich formatting.',
      of: [{ type: 'block', styles: [{ title: 'Normal', value: 'normal' }], marks: { decorators: [] } }],
    }),
    defineField({
      hidden: true,
      name: 'candidateExperiencesMedia',
      title: 'Section media',
      type: 'mediaBlock',
      group: 'candidateExperiences',
      description: 'Image or clickable video on the right side of the section. Recommended 4:3 ratio (e.g. 1200×900).',
    }),
    /* Unified content-section migration target. */
    defineField({
      name: 'candidateExperiencesSection',
      title: 'Section content',
      type: 'contentSection',
      group: 'candidateExperiences',
      description: 'Migrated equivalent of the fields above — edit here once Phase 2 ships.',
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

  ],
  preview: {
    prepare() {
      return { title: 'About us page', subtitle: 'Singleton — only one of these exists' }
    },
  },
})
