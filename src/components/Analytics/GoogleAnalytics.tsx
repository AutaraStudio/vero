'use client'

import Script from 'next/script'
import { useConsentManager } from '@c15t/nextjs'

/**
 * Loads Google Analytics 4 only after the user grants `measurement`
 * consent via the c15t banner. Until then, neither the gtag library
 * nor the init snippet is rendered, so no GA cookies are set and no
 * pageviews are recorded.
 *
 * Strictly necessary cookies (Stripe, Sanity admin session, basket
 * sessionStorage) are unaffected — they don't run through c15t.
 */

const GA_MEASUREMENT_ID = 'G-T51RBV2C3W'

export function GoogleAnalytics() {
  const { consents } = useConsentManager()
  if (!consents.measurement) return null

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script id="ga-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_MEASUREMENT_ID}');
        `}
      </Script>
    </>
  )
}
