import { StructureBuilder } from 'sanity/structure'
import { TagIcon, UsersIcon, UserIcon } from '@sanity/icons'

export const structure = (S: StructureBuilder) =>
  S.list()
    .title('Vero Assess')
    .items([
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
