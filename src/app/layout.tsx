import type { Metadata } from 'next';
import { client } from '@/sanity/lib/client';
import { SITE_SETTINGS_QUERY } from '@/sanity/lib/queries';
import { generateRootMetadata, type SiteSeoSettings } from '@/lib/seo';
import { ConsentManager } from '@/components/ConsentManager/ConsentManager';
import { GoogleAnalytics } from '@/components/Analytics/GoogleAnalytics';
import './globals.css';
import './utilities.css';

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
        <ConsentManager>
          {children}
          {/* GA4 self-gates on `measurement` consent — renders Script
              tags only after the user accepts via the c15t banner. */}
          <GoogleAnalytics />
        </ConsentManager>
      </body>
    </html>
  );
}
