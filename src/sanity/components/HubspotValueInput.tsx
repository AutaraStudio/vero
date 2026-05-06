import { useCallback, type ChangeEvent, type FocusEvent } from 'react'
import { TextInput } from '@sanity/ui'
import { type StringInputProps, set, unset } from 'sanity'

/**
 * Auto-slugify input for the HubSpot Internal Value field.
 *
 * The user can type anything — spaces, capitals, punctuation — and it
 * stays as-is while the cursor is in the field. On blur, the value is
 * normalised to lowercase letters, numbers, and hyphens. Saves the
 * editor from having to remember the exact format and matches the rule
 * already enforced by the validation regex.
 */

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function HubspotValueInput(props: StringInputProps) {
  const { value = '', onChange, elementProps } = props

  const handleChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const next = event.currentTarget.value
      onChange(next ? set(next) : unset())
    },
    [onChange],
  )

  const handleBlur = useCallback(
    (event: FocusEvent<HTMLInputElement>) => {
      const raw = event.currentTarget.value
      const slug = slugify(raw)
      if (slug !== raw) {
        onChange(slug ? set(slug) : unset())
      }
      elementProps.onBlur?.(event)
    },
    [elementProps, onChange],
  )

  return (
    <TextInput
      {...elementProps}
      value={value as string}
      onChange={handleChange}
      onBlur={handleBlur}
    />
  )
}
