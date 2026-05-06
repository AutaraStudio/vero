import { defineArrayMember, defineField, defineType } from 'sanity'
import { TagsIcon } from '@sanity/icons'

/**
 * Single source of truth for the assessment-category groupings used in
 * the navigation dropdown and the footer column. Editors can rename the
 * groups, change the order of categories within them, and move
 * categories between groups — both surfaces re-render from this doc.
 *
 * The category links themselves come from `jobCategory` documents and
 * cannot be edited here (they're whole pages); only the order and the
 * group they sit under are editor-controlled.
 */
export const globalCategoryGroups = defineType({
  name: 'globalCategoryGroups',
  title: 'Category groups (nav + footer)',
  type: 'document',
  icon: TagsIcon,
  fields: [
    defineField({
      name: 'groups',
      title: 'Groups',
      description:
        'Each group becomes a column inside the Assessments dropdown and a labelled section in the footer. Drag to reorder; the order here matches the order on the site.',
      type: 'array',
      validation: (Rule) => Rule.required().min(1),
      of: [
        defineArrayMember({
          type: 'object',
          name: 'group',
          fields: [
            defineField({
              name: 'title',
              title: 'Group title',
              type: 'string',
              description:
                'The heading for this group, e.g. "Job families", "Early careers", "Specialist".',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'categories',
              title: 'Categories in this group',
              description:
                'Drag to reorder. Add a category by selecting one of the existing job-category documents.',
              type: 'array',
              of: [
                defineArrayMember({
                  type: 'reference',
                  to: [{ type: 'jobCategory' }],
                }),
              ],
            }),
          ],
          preview: {
            select: { title: 'title', count: 'categories.length' },
            prepare: ({ title, count }) => ({
              title: title || 'Untitled group',
              subtitle: `${count ?? 0} categor${count === 1 ? 'y' : 'ies'}`,
            }),
          },
        }),
      ],
    }),
  ],
  preview: {
    prepare: () => ({ title: 'Category groups (nav + footer)' }),
  },
})
