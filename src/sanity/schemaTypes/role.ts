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
      description:
        'Display name shown to visitors on the website — on the category page, in the role roster, and as the page heading. Example: "Account Executive".',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'name' },
      description:
        'The URL piece for this role. Click "Generate" once to auto-create from the Role Name (e.g. "account-executive" → /assessments/sales/account-executive). Once a role is live, do not change the slug — it will break any external links pointing at the old URL.',
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
      name: 'archived',
      title: 'Archived',
      type: 'boolean',
      description:
        'Hides this role from the public site and removes it from the HubSpot dropdown. Existing HubSpot records that already reference this role keep their data — the option just stops appearing in new selections. Use this instead of deleting.',
      initialValue: false,
    }),
    defineField({
      name: 'hubspotLabel',
      title: 'HubSpot Label',
      type: 'string',
      description:
        'Advanced override. The human-readable name your sales team sees in the HubSpot "Vero Assess Roles" dropdown, reports, and deal records. Leave blank to use the Role Name (recommended). Only set this if HubSpot needs to display a different name than the website.',
      group: 'hubspot',
    }),
    defineField({
      name: 'hubspotValue',
      title: 'HubSpot Internal Value',
      type: 'string',
      description:
        'Advanced override. The behind-the-scenes code HubSpot stores to identify this role on company and deal records — never seen by sales reps or customers. Leave blank to use the slug (recommended). Only set this if you need to rename the slug but want HubSpot\'s historical records to keep working — set this to the OLD slug. Lowercase letters, numbers, hyphens, underscores only.',
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
      archived: 'archived',
    },
    prepare({ title, categoryName, categorySlug, slug, media, archived }) {
      const baseSubtitle = categoryName
        ? `${categoryName} · /assessments/${categorySlug}/${slug ?? '…'}`
        : 'No category assigned';
      const subtitle = archived ? `(Archived) ${baseSubtitle}` : baseSubtitle;
      return {
        title: title ?? 'Untitled role',
        subtitle,
        media,
      }
    },
  },
})
