import { defineField, defineType } from 'sanity'
import { ImageIcon } from '@sanity/icons'

/**
 * Reusable Image-or-Video toggle.
 *
 * Drop into any page document via:
 *   defineField({ name: 'heroMedia', title: 'Hero media', type: 'mediaBlock', group: 'hero' }),
 *
 * Either field set is optional. The MediaBlock React component falls back
 * to a placeholder accent card when nothing is uploaded — so the layout
 * never collapses.
 *
 * GROQ projection helper lives in queries.ts as `${MEDIA_PROJECTION('fieldName')}`.
 */
export const mediaBlock = defineType({
  name: 'mediaBlock',
  title: 'Image or video',
  type: 'object',
  icon: ImageIcon,
  options: { collapsible: false },
  fields: [
    defineField({
      name: 'type',
      title: 'What to show',
      type: 'string',
      description: 'Pick a static image or a clickable video that opens in a modal.',
      options: {
        list: [
          { title: 'Image', value: 'image' },
          { title: 'Video (opens modal on click)', value: 'video' },
        ],
        layout: 'radio',
      },
      initialValue: 'image',
    }),

    /* ── Image-mode field ─────────────────────────────── */
    defineField({
      name: 'image',
      title: 'Image',
      type: 'image',
      options: { hotspot: true },
      description:
        'Upload an image. Hotspot lets you set the focal point so it crops nicely at any aspect ratio. ' +
        'Leave blank to show a coloured placeholder card.',
      hidden: ({ parent }) => parent?.type === 'video',
      fields: [
        defineField({ name: 'alt', title: 'Alt text (for screen readers)', type: 'string' }),
      ],
    }),

    /* ── Video-mode fields ────────────────────────────── */
    defineField({
      name: 'videoThumbnail',
      title: 'Video cover image (poster)',
      type: 'image',
      options: { hotspot: true },
      description:
        'Still image shown before the video plays. Recommended 16:9 (e.g. 1280×720). ' +
        'Leave blank to show a coloured placeholder card.',
      hidden: ({ parent }) => parent?.type !== 'video',
      fields: [
        defineField({ name: 'alt', title: 'Alt text', type: 'string' }),
      ],
    }),
    defineField({
      name: 'videoUrl',
      title: 'Video file URL',
      type: 'url',
      description:
        'Direct link to an .mp4 file (or HLS .m3u8). Loaded only when the visitor clicks Play.',
      hidden: ({ parent }) => parent?.type !== 'video',
    }),
  ],
  preview: {
    select: {
      type: 'type',
      image: 'image',
      thumb: 'videoThumbnail',
    },
    prepare: ({ type, image, thumb }) => ({
      title: type === 'video' ? 'Video' : 'Image',
      media: type === 'video' ? thumb : image,
    }),
  },
})
