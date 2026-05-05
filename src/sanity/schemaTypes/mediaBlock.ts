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
      name: 'videoPlayback',
      title: 'How should the video play?',
      type: 'string',
      description:
        'Three behaviours: ' +
        '"Popup with image preview" — static cover image + play button, click opens modal. ' +
        '"Popup with looping video preview" — silent looping video preview + play button, click opens full modal with sound. ' +
        '"Autoplay only" — silent looping video plays in place, no popup, no click.',
      options: {
        list: [
          { title: 'Popup with image preview — click to play with sound',         value: 'modal' },
          { title: 'Popup with looping video preview — click to play with sound', value: 'modal-with-preview' },
          { title: 'Autoplay only (muted, looping) — no popup, no click',         value: 'autoplay' },
        ],
        layout: 'radio',
      },
      initialValue: 'modal',
      hidden: ({ parent }) => parent?.type !== 'video',
    }),
    defineField({
      name: 'videoThumbnail',
      title: 'Video cover image (poster)',
      type: 'image',
      options: { hotspot: true },
      description:
        'Still image shown before the video starts. Recommended 16:9 (e.g. 1280×720). ' +
        'For autoplay videos this acts as the poster while the video file is loading. ' +
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
        'Direct link to an .mp4 file (or HLS .m3u8). For modal videos, loaded only when the ' +
        'visitor clicks Play. For autoplay videos, loaded immediately on page load.',
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
