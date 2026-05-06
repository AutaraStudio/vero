'use client'

import { ConsentManagerProvider, ConsentBanner, ConsentDialog } from '@c15t/nextjs'

/**
 * Client wrapper around c15t's consent provider, banner, and preference dialog.
 *
 * Mounted once at the root layout so consent state is available throughout
 * the app via `useConsentManager()`.
 *
 * Mode: `offline` — consent is stored in the user's localStorage only,
 * with no calls to a c15t backend. We don't currently need centralised
 * audit records for our traffic level. Switch to `mode: 'hosted'` with a
 * `backendURL` later if we want server-side records.
 *
 * Categories: only `necessary` (always on) and `measurement` (Google
 * Analytics 4) are exposed. We don't currently load any marketing or
 * functionality scripts that require their own toggles.
 */
export function ConsentManager({ children }: { children: React.ReactNode }) {
  return (
    <ConsentManagerProvider
      options={{
        mode: 'offline',
        /* The runtime reads `consentCategories` from the top-level options
           (see c15t source: configureConsentManager). The Studio types
           document `store.initialConsentCategories` but the runtime path
           ignores it — only the top-level field controls which categories
           Accept All toggles on. */
        // @ts-expect-error — c15t typings do not surface this field
        consentCategories: ['necessary', 'measurement'],
      }}
    >
      <ConsentBanner />
      <ConsentDialog />
      {children}
    </ConsentManagerProvider>
  )
}
