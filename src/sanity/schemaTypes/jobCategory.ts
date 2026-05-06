import { defineField, defineType } from 'sanity'
import { altRequiredWhenImagePresent } from '../lib/altFieldValidation'
import {
  UsersIcon,
  SearchIcon,
  StarIcon,
  BarChartIcon,
  PlayIcon,
  ImagesIcon,
  TrendUpwardIcon,
  ListIcon,
  PackageIcon,
} from '@sanity/icons'

export const jobCategory = defineType({
  name: 'jobCategory',
  title: 'Job Category',
  type: 'document',
  icon: UsersIcon,
  groups: [
    { name: 'seo',          title: 'SEO',                              icon: SearchIcon },
    { name: 'hero',         title: 'Section 1 — Hero',                 icon: StarIcon, default: true },
    { name: 'dimensions',   title: 'Section 2 — Dimensions explainer', icon: BarChartIcon },
    { name: 'inAction',     title: 'Section 3 — "In action" header',   icon: PlayIcon },
    { name: 'featureCards', title: 'Section 4 — Feature carousel cards', icon: ImagesIcon },
    { name: 'stats',        title: 'Section 5 — Headline stats',       icon: TrendUpwardIcon },
    { name: 'roster',       title: 'Section 6 — Role roster',          icon: ListIcon },
    { name: 'bespoke',      title: 'Section 7 — Bespoke CTA',          icon: PackageIcon },
  ],
  fields: [
    defineField({
      name: 'seo',
      title: 'Search engine + social sharing',
      type: 'seoFields',
      group: 'seo',
      description:
        'Browser tab title, search-result snippet, and link previews on social ' +
        'when this category page is shared. Anything left blank inherits from Site Settings.',
    }),

    /* ── Identity ── */
    defineField({
      name: 'name',
      title: 'Category name',
      type: 'string',
      description:
        'Display name for this category (e.g. "Sales", "Operations & Logistics"). ' +
        'Used in the URL slug, the navigation, the listing page, and search results.',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'URL slug',
      type: 'slug',
      options: { source: 'name' },
      description:
        'The URL path for this category (e.g. "sales" → /assessments/sales). ' +
        'Click "Generate" to derive from the name. ' +
        'Avoid changing this once published — it breaks any incoming links.',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'navDescription',
      title: 'Nav dropdown description',
      type: 'string',
      description:
        'One-line teaser shown beneath the category name in the Assessments nav dropdown ' +
        '(e.g. "Commercially-minded performers"). Keep it short — the dropdown is a glance, not a paragraph.',
      validation: (Rule) => Rule.max(60).warning('Stays on a single line up to ~60 chars.'),
    }),

    /* ════════════════════════════════════════════════════════
       SECTION 1 — HERO
    ════════════════════════════════════════════════════════ */
    defineField({
      name: 'heroHeadline',
      title: 'Headline',
      type: 'string',
      group: 'hero',
      description: 'Big headline at the top of the category page. e.g. "Hire confident, capable salespeople".',
      validation: (Rule) =>
        Rule.required().max(80).warning('Headlines longer than 80 chars start to wrap awkwardly.'),
    }),
    defineField({
      name: 'heroIntroCopy',
      title: 'Intro paragraph',
      type: 'text',
      rows: 3,
      group: 'hero',
      description: 'One or two sentences explaining who this category is for.',
    }),
    defineField({
      name: 'heroMedia',
      title: 'Hero media (image or video)',
      type: 'mediaBlock',
      group: 'hero',
      description: 'Image or clickable video on the right of the hero. Recommended 1200×900px (4:3) for images / 16:9 cover for videos.',
    }),

    /* ════════════════════════════════════════════════════════
       SECTION 2 — DIMENSIONS EXPLAINER (split layout)
    ════════════════════════════════════════════════════════ */
    defineField({
      name: 'keyDimensionsAssessed',
      title: 'Key dimensions assessed (short summary)',
      type: 'text',
      rows: 2,
      group: 'dimensions',
      description:
        'Comma-separated list of the most relevant dimensions for this category ' +
        '(e.g. "Collaboration, Trust, Goal orientation, Customer excellence"). ' +
        'Shown as small badges on this category\'s detail page hero, and as the ' +
        'preview line on the assessments listing page.',
    }),
    defineField({
      name: 'dimensionsSectionHeading',
      title: 'Heading',
      type: 'string',
      group: 'dimensions',
      description: 'e.g. "What we measure".',
    }),
    defineField({
      name: 'dimensionsSectionBody',
      title: 'Body paragraph',
      type: 'text',
      rows: 4,
      group: 'dimensions',
      description: 'Plain paragraph explaining which dimensions matter for this category.',
    }),
    defineField({
      name: 'dimensionsSectionMedia',
      title: 'Supporting media (image or video)',
      type: 'mediaBlock',
      group: 'dimensions',
      description: 'Optional right-side image or clickable video. Leave blank to show only text.',
    }),

    /* ════════════════════════════════════════════════════════
       SECTION 3 — "IN ACTION" SECTION HEADER
       Header above the Feature Cards carousel (Section 4).
    ════════════════════════════════════════════════════════ */
    defineField({
      name: 'inActionLabel',
      title: 'Small label above heading',
      type: 'string',
      group: 'inAction',
      description: 'Defaults to "In action" if left blank.',
    }),
    defineField({
      name: 'inActionHeading',
      title: 'Section heading',
      type: 'string',
      group: 'inAction',
      description: 'e.g. "How Vero Assess for Sales works".',
    }),
    defineField({
      name: 'inActionIntro',
      title: 'Intro paragraph',
      type: 'text',
      rows: 3,
      group: 'inAction',
      description: 'Short description shown under the heading. Optional.',
    }),

    /* ════════════════════════════════════════════════════════
       SECTION 4 — FEATURE CAROUSEL CARDS
       Horizontal carousel sitting under the "In action" header.
    ════════════════════════════════════════════════════════ */
    defineField({
      name: 'featureCardsHeading',
      title: 'Lead card — heading',
      type: 'string',
      group: 'featureCards',
      description:
        'The FIRST card in the carousel (the wider hero card) gets this heading — ' +
        'e.g. "Keeping your team on track". The remaining cards are added in the list below.',
    }),
    defineField({
      name: 'featureCardsSubheading',
      title: 'Lead card — body',
      type: 'text',
      rows: 2,
      group: 'featureCards',
      description: 'Body text for the first/lead card.',
    }),
    defineField({
      name: 'featureCards',
      title: 'Additional carousel cards',
      type: 'array',
      group: 'featureCards',
      description:
        'Cards shown after the lead card. 4–8 work best in the carousel. Each card has its own heading, body, and image.',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'heading',
              title: 'Card heading',
              type: 'string',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'body',
              title: 'Card body',
              type: 'text',
              rows: 3,
              description: 'Keep concise — 2–3 sentences max.',
            }),
            defineField({
              name: 'image',
              title: 'Card image',
              type: 'image',
              options: { hotspot: true },
              description: 'Shown at the top of the card. 16:10 ratio works best (e.g. 800×500).',
              fields: [defineField({ name: 'alt', title: 'Alt text', type: 'string', validation: altRequiredWhenImagePresent })],
            }),
          ],
          preview: {
            select: { title: 'heading', subtitle: 'body', media: 'image' },
            prepare: ({ title, subtitle, media }) => ({
              title: title || 'Untitled card',
              subtitle: subtitle ? subtitle.slice(0, 80) : undefined,
              media,
            }),
          },
        },
      ],
    }),

    /* ════════════════════════════════════════════════════════
       SECTION 5 — HEADLINE STATS
       Four stat tiles shown as a row beneath the carousel.
    ════════════════════════════════════════════════════════ */
    defineField({
      name: 'stat1Heading',
      title: 'Stat 1 — number',
      type: 'string',
      group: 'stats',
      description: 'The big number / value (e.g. "82%" or "3×").',
    }),
    defineField({
      name: 'stat1Body',
      title: 'Stat 1 — caption',
      type: 'string',
      group: 'stats',
      description: 'Short description below the number (e.g. "of hires retained at 12 months").',
    }),
    defineField({
      name: 'stat2Heading',
      title: 'Stat 2 — number',
      type: 'string',
      group: 'stats',
    }),
    defineField({
      name: 'stat2Body',
      title: 'Stat 2 — caption',
      type: 'string',
      group: 'stats',
    }),
    defineField({
      name: 'stat3Heading',
      title: 'Stat 3 — number',
      type: 'string',
      group: 'stats',
    }),
    defineField({
      name: 'stat3Body',
      title: 'Stat 3 — caption',
      type: 'string',
      group: 'stats',
    }),
    defineField({
      name: 'stat4Heading',
      title: 'Stat 4 — number',
      type: 'string',
      group: 'stats',
    }),
    defineField({
      name: 'stat4Body',
      title: 'Stat 4 — caption',
      type: 'string',
      group: 'stats',
    }),

    /* ════════════════════════════════════════════════════════
       SECTION 6 — ROLE ROSTER HEADER
       The roles themselves are managed separately under
       "Roles" in the sidebar — they auto-link to this category
       via the "Job Category" field on each role.
    ════════════════════════════════════════════════════════ */
    defineField({
      name: 'roleRosterHeading',
      title: 'Heading',
      type: 'string',
      group: 'roster',
      description: 'Heading above the grid of roles (e.g. "Roles in this category").',
    }),
    defineField({
      name: 'roleRosterSubheading',
      title: 'Subheading',
      type: 'string',
      group: 'roster',
      description: 'Optional one-line note shown beneath the heading.',
    }),

    /* ════════════════════════════════════════════════════════
       SECTION 7 — BESPOKE CTA
       Closing band offering custom assessment design.
    ════════════════════════════════════════════════════════ */
    defineField({
      name: 'bespokeSectionHeading',
      title: 'Heading',
      type: 'string',
      group: 'bespoke',
      description: 'Big closing headline (e.g. "Need something built around your roles?").',
    }),
    defineField({
      name: 'bespokeSectionBody',
      title: 'Body paragraph',
      type: 'text',
      rows: 3,
      group: 'bespoke',
      description: 'Short pitch underneath the heading.',
    }),
    defineField({
      name: 'bespokeCTALabel',
      title: 'Button — text',
      type: 'string',
      group: 'bespoke',
      description: 'e.g. "Talk to us".',
    }),
    defineField({
      name: 'bespokeCTAHref',
      title: 'Button — link',
      type: 'string',
      group: 'bespoke',
      description: 'Usually "/contact".',
      hidden: ({ parent }) => !parent?.bespokeCTALabel,
    }),
    defineField({
      name: 'bespokeSectionMedia',
      title: 'Optional supporting media (image or video)',
      type: 'mediaBlock',
      group: 'bespoke',
      description: 'Optional image or clickable video on the right side of the bespoke band.',
    }),
  ],
  preview: {
    select: {
      title: 'name',
      slug: 'slug.current',
      media: 'heroImage',
    },
    prepare({ title, slug, media }) {
      return {
        title: title ?? 'Untitled category',
        subtitle: slug ? `/assessments/${slug}` : 'No URL slug yet',
        media,
      }
    },
  },
})
