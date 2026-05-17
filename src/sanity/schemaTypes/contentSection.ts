import { defineField, defineType } from 'sanity'
import { ComposeIcon } from '@sanity/icons'

/**
 * Reusable content section — eyebrow / heading / body / media / button
 * with a per-instance layout choice. Used wherever a page needs the
 * standard "heading + image + paragraph + button" block; replaces the
 * patchwork of bespoke per-page section field groups (tazioEvolution*,
 * candidateExperiences*, dimensionsSection*, etc.).
 *
 * Each field is optional except the heading — empty fields don't render.
 */
export const contentSection = defineType({
  name: 'contentSection',
  title: 'Content section',
  type: 'object',
  icon: ComposeIcon,
  fields: [
    defineField({
      name: 'eyebrow',
      title: 'Eyebrow / pill text',
      type: 'string',
      description:
        'Small pill above the heading (e.g. "How it works", "The product"). Leave blank to hide.',
    }),
    defineField({
      name: 'heading',
      title: 'Heading',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'body',
      title: 'Body',
      type: 'array',
      of: [{ type: 'block', styles: [{ title: 'Normal', value: 'normal' }], marks: { decorators: [] } }],
      description:
        'Body paragraphs. Press Enter to start a new paragraph. Leave blank to hide.',
    }),
    defineField({
      name: 'media',
      title: 'Image or video',
      type: 'mediaBlock',
      description:
        'Optional image or clickable video. Leave blank to render text-only.',
    }),
    defineField({
      name: 'ctaLabel',
      title: 'Button label',
      type: 'string',
      description:
        'Optional button shown below the body (e.g. "Read more"). Leave blank to hide the button — leave the href blank too.',
    }),
    defineField({
      name: 'ctaHref',
      title: 'Button link',
      type: 'link',
      description: 'Pick a page or paste an external URL.',
      hidden: ({ parent }) => !parent?.ctaLabel,
    }),
    defineField({
      name: 'layout',
      title: 'Layout',
      type: 'string',
      initialValue: 'split',
      options: {
        list: [
          { title: 'Split — text on the left, image on the right',          value: 'split' },
          { title: 'Centred — text and image stacked, centred',             value: 'centered' },
          { title: 'Two columns — heading/button left, body right, image below', value: 'two-column' },
        ],
        layout: 'radio',
      },
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: { title: 'heading', subtitle: 'eyebrow', layout: 'layout', media: 'media.image' },
    prepare: ({ title, subtitle, layout, media }) => ({
      title: title || 'Untitled section',
      subtitle: [subtitle, layout].filter(Boolean).join(' · '),
      media,
    }),
  },
})
