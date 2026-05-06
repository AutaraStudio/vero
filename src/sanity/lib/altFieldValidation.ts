import type { StringRule } from 'sanity'

/**
 * Validation for the `alt` field inside an image. Required only when an
 * image asset has actually been uploaded — keeps optional images
 * (e.g. mobile-specific variants) genuinely optional, while making alt
 * mandatory for every image that ends up on the page.
 *
 * Use as:
 *   defineField({
 *     name: 'alt',
 *     title: 'Alt text',
 *     type: 'string',
 *     validation: altRequiredWhenImagePresent,
 *   })
 */
export const altRequiredWhenImagePresent = (rule: StringRule) =>
  rule.custom<string>((value, context) => {
    const parent = context.parent as { asset?: { _ref?: string } } | undefined
    if (parent?.asset?._ref && (!value || !value.trim())) {
      return 'Alt text is required for accessibility — describe what the image shows.'
    }
    return true
  })
