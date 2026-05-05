import type { StructureBuilder } from 'sanity/structure'
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
  EditIcon,
  DocumentTextIcon,
} from '@sanity/icons'
import type { ComponentType } from 'react'

/**
 * Custom Studio desk structure.
 *
 * Designed for non-technical content editors:
 * - Singletons grouped under "Pages" so the top level isn't a long list
 * - Each page expands into "Content" + "SEO" sub-items so SEO is its
 *   own focused area in the sidebar (separate from the section editing)
 * - Repeating content (categories, roles, pricing tiers) under "Content library"
 * - Site Settings sit at the bottom under "Settings"
 * - Icons everywhere for visual scanning
 */
export const structure = (S: StructureBuilder) =>
  S.list()
    .title('Vero Assess')
    .items([

      /* ────────────────────────────────────────────────────────
         PAGES — singletons. Each page expands to two children:
         "Content" (the section editing) and "SEO" (search engine
         + social sharing fields). Both open the same underlying
         document; the user picks which area they want to focus on.
      ──────────────────────────────────────────────────────── */
      S.listItem()
        .title('Pages')
        .icon(DocumentsIcon)
        .child(
          S.list()
            .title('Pages')
            .items([
              pageWithContentAndSeo(S, 'homePage',         'Home page',           HomeIcon),
              pageWithContentAndSeo(S, 'pricingPage',      'Pricing page',        TagIcon),
              pageWithContentAndSeo(S, 'assessmentsPage',  'Assessments overview', SearchIcon),
              pageWithContentAndSeo(S, 'howItWorksPage',   'How it works',        PlayIcon),
              pageWithContentAndSeo(S, 'aboutPage',        'About us',            InfoOutlineIcon),
              pageWithContentAndSeo(S, 'contactPage',      'Contact',             EnvelopeIcon),
              pageWithContentAndSeo(S, 'sciencePage',      'The science',         SparklesIcon),
              pageWithContentAndSeo(S, 'compliancePage',   'Compliance',          CheckmarkCircleIcon),
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

      /* Legal — repeating documents (privacy, cookies, security, etc.).
         Each one becomes a route at /legal/<slug>. */
      S.listItem()
        .title('Legal pages')
        .icon(DocumentTextIcon)
        .child(
          S.documentList()
            .title('Legal pages')
            .filter('_type == "legalPage"')
            .defaultOrdering([{ field: 'title', direction: 'asc' }])
        ),

      S.divider(),

      /* ────────────────────────────────────────────────────────
         SETTINGS — global config that rarely changes.
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

/**
 * Build a sidebar item for a singleton page that expands into two children:
 *
 * - "Content" — opens the page document (sections, hero, etc.). The SEO
 *   field has been removed from this document so the form only shows
 *   the section tabs.
 *
 * - "SEO"     — opens a SEPARATE `pageSeo` document with a deterministic
 *   ID like `homePage.seo`. Its form contains only the SEO fields, so
 *   the editor sees a clean focused view with no section tabs at all.
 *
 * generateMetadata on each page fetches both documents and merges the
 * pageSeo into the SEO fallback chain.
 */
function pageWithContentAndSeo(
  S: StructureBuilder,
  schemaType: string,
  title: string,
  icon: ComponentType,
) {
  const seoDocId = `${schemaType}.seo`;
  return S.listItem()
    .title(title)
    .icon(icon)
    .child(
      S.list()
        .title(title)
        .items([
          S.listItem()
            .title('Content')
            .icon(EditIcon)
            .child(
              S.document()
                .schemaType(schemaType)
                .documentId(schemaType)
                .title(`${title} — Content`)
            ),
          S.listItem()
            .title('SEO')
            .icon(SearchIcon)
            .child(
              S.document()
                .schemaType('pageSeo')
                .documentId(seoDocId)
                .title(`${title} — SEO`)
            ),
        ])
    )
}
