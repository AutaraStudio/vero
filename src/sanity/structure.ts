import { StructureBuilder } from 'sanity/structure'
import {
  HomeIcon,
  TagIcon,
  UsersIcon,
  UserIcon,
  CogIcon,
  SearchIcon,
  PlayIcon,
  InfoOutlineIcon,
  EnvelopeIcon,
  SparklesIcon,
  CheckmarkCircleIcon,
  DocumentsIcon,
  PackageIcon,
} from '@sanity/icons'

/**
 * Custom Studio desk structure.
 *
 * Designed for non-technical content editors:
 * - Singletons grouped under "Pages" so the top level isn't a long list
 * - Repeating content (categories, roles, pricing tiers) grouped under
 *   "Content library"
 * - Site Settings sit at the bottom under "Settings" — rarely touched
 *   global config separated from day-to-day editing
 * - Icons everywhere for visual scanning
 */
export const structure = (S: StructureBuilder) =>
  S.list()
    .title('Vero Assess')
    .items([

      /* ────────────────────────────────────────────────────────
         PAGES — singletons. These are the marketing pages of the
         site. Each has a fixed structure; clients edit content
         within the existing sections.
      ──────────────────────────────────────────────────────── */
      S.listItem()
        .title('Pages')
        .icon(DocumentsIcon)
        .child(
          S.list()
            .title('Pages')
            .items([
              S.listItem()
                .title('Home page')
                .icon(HomeIcon)
                .child(
                  S.document()
                    .schemaType('homePage')
                    .documentId('homePage')
                    .title('Home page')
                ),
              S.listItem()
                .title('Pricing page')
                .icon(TagIcon)
                .child(
                  S.document()
                    .schemaType('pricingPage')
                    .documentId('pricingPage')
                    .title('Pricing page')
                ),
              S.listItem()
                .title('Assessments overview')
                .icon(SearchIcon)
                .child(
                  S.document()
                    .schemaType('assessmentsPage')
                    .documentId('assessmentsPage')
                    .title('Assessments overview')
                ),
              S.listItem()
                .title('How it works')
                .icon(PlayIcon)
                .child(
                  S.document()
                    .schemaType('howItWorksPage')
                    .documentId('howItWorksPage')
                    .title('How it works')
                ),
              S.listItem()
                .title('About us')
                .icon(InfoOutlineIcon)
                .child(
                  S.document()
                    .schemaType('aboutPage')
                    .documentId('aboutPage')
                    .title('About us')
                ),
              S.listItem()
                .title('Contact')
                .icon(EnvelopeIcon)
                .child(
                  S.document()
                    .schemaType('contactPage')
                    .documentId('contactPage')
                    .title('Contact')
                ),
              S.listItem()
                .title('The science')
                .icon(SparklesIcon)
                .child(
                  S.document()
                    .schemaType('sciencePage')
                    .documentId('sciencePage')
                    .title('The science')
                ),
              S.listItem()
                .title('Compliance')
                .icon(CheckmarkCircleIcon)
                .child(
                  S.document()
                    .schemaType('compliancePage')
                    .documentId('compliancePage')
                    .title('Compliance')
                ),
            ])
        ),

      S.divider(),

      /* ────────────────────────────────────────────────────────
         CONTENT LIBRARY — repeating documents that feed multiple
         pages. Job categories appear on the Assessments overview;
         Roles appear inside their parent category; Pricing tiers
         appear on the Pricing page.
      ──────────────────────────────────────────────────────── */
      S.listItem()
        .title('Job categories')
        .icon(UsersIcon)
        .child(
          S.documentList()
            .title('Job categories')
            .filter('_type == "jobCategory"')
            .defaultOrdering([{ field: 'name', direction: 'asc' }])
        ),
      S.listItem()
        .title('Roles')
        .icon(UserIcon)
        .child(
          S.list()
            .title('Roles by category')
            .items([
              S.listItem()
                .title('All roles')
                .icon(UserIcon)
                .child(
                  S.documentList()
                    .title('All roles')
                    .filter('_type == "role"')
                    .defaultOrdering([{ field: 'name', direction: 'asc' }])
                ),
              S.divider(),
              ...([
                'Administration',
                'Operations and logistics',
                'Apprentices',
                'Claims and collections',
                'Field service and technicians',
                'Graduates',
                'Health and social care',
                'Interns',
                'Retail and hospitality',
                'Sales',
              ].map((cat) =>
                S.listItem()
                  .title(cat)
                  .child(
                    S.documentList()
                      .title(cat)
                      .filter('_type == "role" && parentCategory->name == $cat')
                      .params({ cat })
                      .defaultOrdering([{ field: 'name', direction: 'asc' }])
                  )
              )),
            ])
        ),
      S.listItem()
        .title('Pricing tiers')
        .icon(PackageIcon)
        .child(
          S.documentList()
            .title('Pricing tiers')
            .filter('_type == "pricingTier"')
            .defaultOrdering([{ field: 'order', direction: 'asc' }])
        ),

      S.divider(),

      /* ────────────────────────────────────────────────────────
         SETTINGS — global config that rarely changes. Lives at
         the bottom so day-to-day editing stays in Pages / Content.
      ──────────────────────────────────────────────────────── */
      S.listItem()
        .title('Site settings')
        .icon(CogIcon)
        .child(
          S.document()
            .schemaType('siteSettings')
            .documentId('siteSettings')
            .title('Site settings')
        ),
    ])
