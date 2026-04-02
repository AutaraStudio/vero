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
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'parentCategory.name',
    },
    prepare({ title, subtitle }) {
      return {
        title,
        subtitle: subtitle ? `↳ ${subtitle}` : 'No category',
      }
    },
  },
})
