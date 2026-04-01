import { StructureBuilder } from 'sanity/structure'
import { HomeIcon, TagIcon, UsersIcon, UserIcon, CogIcon, SearchIcon, PlayIcon, InfoOutlineIcon, EnvelopeIcon } from '@sanity/icons'

export const structure = (S: StructureBuilder) =>
  S.list()
    .title('Vero Assess')
    .items([
      /* ── Global ── */
      S.listItem()
        .title('Site Settings')
        .icon(CogIcon)
        .child(
          S.document()
            .schemaType('siteSettings')
            .documentId('siteSettings')
        ),
      S.divider(),

      /* ── Pages ── */
      S.listItem()
        .title('Home Page')
        .icon(HomeIcon)
        .child(
          S.document()
            .schemaType('homePage')
            .documentId('homePage')
        ),
      S.listItem()
        .title('Pricing Page')
        .icon(TagIcon)
        .child(
          S.document()
            .schemaType('pricingPage')
            .documentId('pricingPage')
        ),
      S.listItem()
        .title('Assessments Page')
        .icon(SearchIcon)
        .child(
          S.document()
            .schemaType('assessmentsPage')
            .documentId('assessmentsPage')
        ),
      S.listItem()
        .title('How It Works Page')
        .icon(PlayIcon)
        .child(
          S.document()
            .schemaType('howItWorksPage')
            .documentId('howItWorksPage')
        ),
      S.listItem()
        .title('About Page')
        .icon(InfoOutlineIcon)
        .child(
          S.document()
            .schemaType('aboutPage')
            .documentId('aboutPage')
        ),
      S.listItem()
        .title('Contact Page')
        .icon(EnvelopeIcon)
        .child(
          S.document()
            .schemaType('contactPage')
            .documentId('contactPage')
        ),
      S.divider(),

      /* ── Content ── */
      S.listItem()
        .title('Pricing Tiers')
        .icon(TagIcon)
        .child(
          S.documentList()
            .title('Pricing Tiers')
            .filter('_type == "pricingTier"')
            .defaultOrdering([{ field: 'order', direction: 'asc' }])
        ),
      S.divider(),
      S.listItem()
        .title('Job Categories')
        .icon(UsersIcon)
        .child(
          S.documentList()
            .title('Job Categories')
            .filter('_type == "jobCategory"')
            .defaultOrdering([{ field: 'name', direction: 'asc' }])
        ),
      S.listItem()
        .title('Roles')
        .icon(UserIcon)
        .child(
          S.list()
            .title('Roles by Category')
            .items([
              S.listItem()
                .title('All Roles')
                .child(
                  S.documentList()
                    .title('All Roles')
                    .filter('_type == "role"')
                    .defaultOrdering([{ field: 'name', direction: 'asc' }])
                ),
              S.divider(),
              ...([
                'Administration',
                'Operations and Logistics',
                'Apprentices',
                'Claims and Collections',
                'Field Service and Technicians',
                'Graduates',
                'Health and Social Care',
                'Interns',
                'Retail and Hospitality',
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
    ])
