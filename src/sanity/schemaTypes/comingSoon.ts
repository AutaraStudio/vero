import { defineField, defineType } from 'sanity'
import { RocketIcon } from '@sanity/icons'

/**
 * Coming-soon mode singleton. When `enabled` is true, every public-site
 * route renders the coming-soon page only — no MegaNav, no Footer, no
 * other content. Editors flip the toggle to put the site behind a
 * holding page without a deploy.
 *
 * Phone / email / opening-hours come from the existing Contact page
 * document so editors only maintain those details in one place.
 */
export const comingSoon = defineType({
  name: 'comingSoon',
  title: 'Coming soon',
  type: 'document',
  icon: RocketIcon,
  fields: [
    defineField({
      name: 'enabled',
      title: 'Show coming-soon page on the live site',
      type: 'boolean',
      description:
        'When ON, every public route shows the coming-soon page only. Nav and footer are hidden. /admin/studio still works.',
      initialValue: false,
    }),
    defineField({
      name: 'heading',
      title: 'Heading',
      type: 'string',
      description: 'Main headline shown on the coming-soon page.',
      initialValue: 'Something new is coming',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Short description',
      type: 'text',
      rows: 3,
      description: 'One short paragraph under the heading.',
      initialValue:
        "We're putting the finishing touches on the new Vero Assess. Drop us a line below and we'll be in touch as soon as we're live.",
    }),
    defineField({
      name: 'launchDate',
      title: 'Launch date',
      type: 'date',
      description: 'Optional. Shown as "Coming {Month Day}" above the heading.',
    }),
    defineField({
      name: 'formInstructions',
      title: 'Form instructions',
      type: 'string',
      description: 'Short sentence shown above the contact form.',
      initialValue: 'Have a question? Send us a message and we\'ll be in touch.',
    }),
  ],
  preview: {
    select: { enabled: 'enabled', heading: 'heading' },
    prepare: ({ enabled, heading }) => ({
      title: 'Coming soon',
      subtitle: enabled ? `LIVE — ${heading ?? ''}` : 'Off — site is normal',
    }),
  },
})
