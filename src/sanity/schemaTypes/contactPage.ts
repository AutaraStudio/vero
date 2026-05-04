import { defineField, defineType } from 'sanity'
import { EnvelopeIcon } from '@sanity/icons'

export const contactPage = defineType({
  name: 'contactPage',
  title: 'Contact Page',
  type: 'document',
  icon: EnvelopeIcon,
  groups: [
    { name: 'seo', title: 'SEO' },
    { name: 'hero', title: 'Hero' },
    { name: 'faq', title: 'FAQ' },
  ],
  fields: [
    /* ── SEO (per-page overrides — falls back to siteSettings) ── */
    defineField({
      name: 'seo',
      title: 'SEO',
      type: 'seoFields',
      group: 'seo',
    }),

    /* ── Hero ── */
    defineField({
      name: 'heroHeadline',
      title: 'Headline',
      type: 'string',
      group: 'hero',
    }),
    defineField({
      name: 'heroIntro',
      title: 'Intro',
      type: 'text',
      rows: 3,
      group: 'hero',
    }),
    defineField({
      name: 'contactInstructions',
      title: 'Contact Instructions',
      type: 'text',
      rows: 2,
      group: 'hero',
      description: 'Short line shown above phone / email (e.g. "Fill out our contact form and we\'ll get back to you...").',
    }),
    defineField({
      name: 'phone',
      title: 'Phone',
      type: 'string',
      group: 'hero',
    }),
    defineField({
      name: 'email',
      title: 'Email',
      type: 'string',
      group: 'hero',
    }),

    /* ── FAQ ── */
    defineField({
      name: 'faqHeading',
      title: 'FAQ Heading',
      type: 'string',
      group: 'faq',
    }),
    defineField({
      name: 'faqs',
      title: 'FAQs',
      type: 'array',
      group: 'faq',
      of: [
        {
          type: 'object',
          preview: { select: { title: 'question' } },
          fields: [
            defineField({ name: 'question', title: 'Question', type: 'string' }),
            defineField({
              name: 'answer',
              title: 'Answer',
              type: 'array',
              of: [{ type: 'block', styles: [{ title: 'Normal', value: 'normal' }], marks: { decorators: [] } }],
            }),
          ],
        },
      ],
    }),
    defineField({
      name: 'faqFooter',
      title: 'FAQ Footer',
      type: 'text',
      rows: 2,
      group: 'faq',
      description: 'Short sign-off below the FAQ list (e.g. "Still have questions? Just get in touch.").',
    }),
  ],
  preview: {
    prepare() {
      return { title: 'Contact Page' }
    },
  },
})
