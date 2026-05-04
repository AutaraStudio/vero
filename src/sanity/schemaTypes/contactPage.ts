import { defineField, defineType } from 'sanity'
import { EnvelopeIcon, SearchIcon, StarIcon, HelpCircleIcon } from '@sanity/icons'

export const contactPage = defineType({
  name: 'contactPage',
  title: 'Contact Page',
  type: 'document',
  icon: EnvelopeIcon,
  groups: [
    { name: 'seo',  title: 'SEO',                icon: SearchIcon },
    { name: 'hero', title: 'Section 1 — Hero',   icon: StarIcon, default: true },
    { name: 'faq',  title: 'Section 2 — FAQ',    icon: HelpCircleIcon },
  ],
  fields: [
    defineField({
      name: 'seo',
      title: 'Search engine + social sharing',
      type: 'seoFields',
      group: 'seo',
      description:
        'Browser tab title, search-result snippet, and link previews on social. ' +
        'Anything left blank inherits from Site Settings.',
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
