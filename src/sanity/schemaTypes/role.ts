import { defineField, defineType } from 'sanity'
import { UserIcon } from '@sanity/icons'
import { HubspotValueInput } from '../components/HubspotValueInput'

/**
 * Strip `drafts.` prefix so a draft of the same doc isn't flagged as a
 * duplicate of its own published version. Returns the canonical id.
 */
function publishedId(id: string): string {
  return id.replace(/^drafts\./, '')
}

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
        'Website only. Display name shown to visitors on the website — on the category page, in the role roster, and as the page heading. Example: "Account Executive". This value is never sent to HubSpot.',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'name' },
      description:
        'Website only. The URL piece for this role. Click "Generate" once to auto-create from the Role Name (e.g. "account-executive" → /assessments/sales/account-executive). Once a role is live, do not change the slug — it will break any external links pointing at the old URL. This value is never sent to HubSpot.',
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
        'HubSpot only. The name your sales team sees in the HubSpot "Vero Assess Roles" dropdown, reports, and deal records. Fill this in (along with HubSpot Internal Value) if you want this role to be selectable in HubSpot. Leave blank to keep the role website-only — it will not appear in HubSpot at all.',
      group: 'hubspot',
      validation: (Rule) =>
        Rule.custom(async (value, context) => {
          if (!value) return true
          const trimmed = value.trim()
          if (!trimmed) return true
          const client = context.getClient({ apiVersion: '2024-09-01' })
          const currentId = publishedId((context.document?._id as string) ?? '')
          const dupe = await client.fetch<string | null>(
            `*[_type == "role" && lower(hubspotLabel) == lower($value) && _id != $id && _id != "drafts." + $id][0]._id`,
            { value: trimmed, id: currentId },
          )
          return dupe ? `Another role already uses this HubSpot Label.` : true
        }),
    }),
    defineField({
      name: 'hubspotValue',
      title: 'HubSpot Internal Value',
      type: 'string',
      description:
        'HubSpot only. The behind-the-scenes code HubSpot stores to identify this role on company and deal records. Never seen by sales reps or customers. Fill this in (along with HubSpot Label) if you want this role to appear in HubSpot. Once set, do not change it — historical HubSpot records reference this value and would lose context. Lowercase letters, numbers, hyphens, underscores only — anything else is auto-formatted when you click out of the field.',
      group: 'hubspot',
      components: { input: HubspotValueInput },
      validation: (Rule) =>
        Rule.regex(/^[a-z0-9_-]+$/, {
          name: 'lowercase letters, numbers, hyphens, underscores only',
        })
          .max(100)
          .custom(async (value, context) => {
            if (!value) return true
            const client = context.getClient({ apiVersion: '2024-09-01' })
            const currentId = publishedId((context.document?._id as string) ?? '')
            const dupe = await client.fetch<string | null>(
              `*[_type == "role" && hubspotValue == $value && _id != $id && _id != "drafts." + $id][0]._id`,
              { value, id: currentId },
            )
            return dupe ? `Another role already uses this HubSpot Internal Value.` : true
          }),
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
