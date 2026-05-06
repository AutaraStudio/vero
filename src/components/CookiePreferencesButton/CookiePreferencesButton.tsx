'use client'

import { useConsentManager } from '@c15t/nextjs'

/**
 * Re-opens the c15t preferences dialog. Intended for the footer so
 * visitors can withdraw or update consent at any time, as required by
 * GDPR Art. 7(3).
 */
export function CookiePreferencesButton({ className }: { className?: string }) {
  const { setActiveUI } = useConsentManager()
  return (
    <button
      type="button"
      onClick={() => setActiveUI('dialog', { force: true })}
      className={className}
    >
      Cookie preferences
    </button>
  )
}
