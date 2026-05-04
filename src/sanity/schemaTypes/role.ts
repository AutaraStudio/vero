import { defineField, defineType } from 'sanity'
import { UserIcon } from '@sanity/icons'

export const role = defineType({
  name: 'role',
  title: 'Role',
  type: 'document',
  icon: UserIcon,
  fields: [
    defineField({
      name: 'name',
      title: 'Role Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'name' },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'parentCategory',
      title: 'Job Category',
      type: 'reference',
      to: [{ type: 'jobCategory' }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'tasks',
      title: 'Tasks',
      type: 'text',
      rows: 2,
      description: 'A one-line summary of what this role does',
    }),
    defineField({
      name: 'strengths',
      title: 'Strengths',
      type: 'string',
      description: 'Comma-separated strengths, e.g. "Organisation, attention to detail, clear communication"',
    }),
    defineField({
      name: 'lottieFile',
      title: 'Lottie Animation',
      type: 'file',
      options: { accept: '.json' },
      description: 'Lottie JSON animation file',
    }),
    defineField({
      name: 'hubspotLabel',
      title: 'HubSpot Label',
      type: 'string',
      description:
        'How this role appears in the HubSpot "Vero Assess Roles" dropdown. Leave blank to use the Role Name.',
      group: 'hubspot',
    }),
    defineField({
      name: 'hubspotValue',
      title: 'HubSpot Internal Value',
      type: 'string',
      description:
        'Stable identifier sent to HubSpot (lowercase letters, numbers, hyphens, underscores). Leave blank to use the slug.',
      validation: (Rule) =>
        Rule.regex(/^[a-z0-9_-]+$/, {
          name: 'lowercase letters, numbers, hyphens, underscores only',
        }).custom((value) => {
          if (value && value.length > 100) return 'Max 100 characters';
          return true;
        }),
      group: 'hubspot',
    }),
  ],
  groups: [
    { name: 'hubspot', title: 'HubSpot Sync', default: false },
  ],
  preview: {
    select: {
      title: 'name',
      categoryName: 'parentCategory.name',
      categorySlug: 'parentCategory.slug.current',
      slug: 'slug.current',
      media: 'parentCategory.heroImage',
    },
    prepare({ title, categoryName, categorySlug, slug, media }) {
      const subtitle = categoryName
        ? `${categoryName} · /assessments/${categorySlug}/${slug ?? '…'}`
        : 'No category assigned';
      return {
        title: title ?? 'Untitled role',
        subtitle,
        media,
      }
    },
  },
})
