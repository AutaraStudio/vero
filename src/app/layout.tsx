import type { Metadata } from 'next';
import Script from 'next/script';
import { client } from '@/sanity/lib/client';
import { SITE_SETTINGS_QUERY } from '@/sanity/lib/queries';
import { generateRootMetadata, type SiteSeoSettings } from '@/lib/seo';
import './globals.css';
import './utilities.css';

/* Google Analytics 4 measurement ID. Hardcoded because it's a public
   identifier — appears in the page source on every visit anyway. */
const GA_MEASUREMENT_ID = 'G-T51RBV2C3W';

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
      <body suppressHydrationWarning>{children}</body>

      {/* Google Analytics — loaded after page becomes interactive so it
          never blocks first paint. Two scripts: the gtag library, then
          the init snippet that registers the GA4 property. */}
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
    </html>
  );
}
