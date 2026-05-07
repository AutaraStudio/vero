import type { Metadata } from 'next';
import Script from 'next/script';
import { client } from '@/sanity/lib/client';
import { SITE_SETTINGS_QUERY } from '@/sanity/lib/queries';
import { generateRootMetadata, type SiteSeoSettings } from '@/lib/seo';
import { CookieConsentBanner } from '@/components/CookieConsent/CookieConsent';
import './globals.css';
import './utilities.css';

/* HubSpot portal tracking script. Sets the hubspotutk cookie so server-
   side form submissions can pass it through as context.hutk and avoid
   being spam-flagged as "unregistered site domain". Also enables
   contact-attribution and visit tracking inside HubSpot's CRM. EU1
   region matches the Tazio portal. afterInteractive so it doesn't
   block first paint. */
const HUBSPOT_TRACKING_SCRIPT = '//js-eu1.hs-scripts.com/25935419.js';

/**
 * Root metadata pulled from Sanity siteSettings — provides the global
 * favicon, default Open Graph image, theme colour, twitter handle, and
 * the title template (e.g. "%s — Vero Assess") that page-level metadata
 * inherits.
 *
 * generateMetadata runs at build time for static pages (or on each
 * request for dynamic pages), so changes in Studio show up the next
 * time the page is rebuilt.
 */
export async function generateMetadata(): Promise<Metadata> {
  const settings = await client.fetch<SiteSeoSettings | null>(SITE_SETTINGS_QUERY);
  return generateRootMetadata(settings);
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        {children}
        {/* Banner + preferences dialog. GA4 only loads after the
            user accepts the analytics category. */}
        <CookieConsentBanner />
        <Script
          id="hs-script-loader"
          src={HUBSPOT_TRACKING_SCRIPT}
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
