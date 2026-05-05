/* ============================================================
   SEO helper — builds a Next.js Metadata object from the per-page
   `seo` block (Sanity) and the global siteSettings, with sensible
   fallbacks at every level.

   Usage in a page:

     import { generateSiteMetadata } from '@/lib/seo';

     export async function generateMetadata(): Promise<Metadata> {
       const [page, settings] = await Promise.all([
         client.fetch(MY_PAGE_QUERY),
         client.fetch(SITE_SETTINGS_QUERY),
       ]);
       return generateSiteMetadata({
         seo: page?.seo,
         settings,
         fallback: {
           title:       page?.heroHeadline,
           description: page?.heroIntro,
           imageUrl:    page?.heroImageUrl,
         },
         path: '/my-page',  // for canonical URL
       });
     }
   ============================================================ */

import type { Metadata } from 'next';
import { client } from '@/sanity/lib/client';
import { PAGE_SEO_QUERY } from '@/sanity/lib/queries';

export interface PageSeo {
  pageTitle?: string | null;
  metaDescription?: string | null;
  ogTitle?: string | null;
  ogDescription?: string | null;
  ogImageUrl?: string | null;
  ogImageAlt?: string | null;
  noIndex?: boolean | null;
}

export interface SiteSeoSettings {
  siteName?: string | null;
  titleTemplate?: string | null;
  defaultMetaDescription?: string | null;
  defaultOgImageUrl?: string | null;
  defaultOgImageAlt?: string | null;
  faviconUrl?: string | null;
  faviconMimeType?: string | null;
  appleTouchIconUrl?: string | null;
  twitterHandle?: string | null;
  siteUrl?: string | null;
  themeColor?: string | null;
}

interface GenerateMetadataInput {
  /** Per-page seo block from Sanity (may be undefined / empty) */
  seo?: PageSeo | null;
  /** Global siteSettings — used for defaults */
  settings?: SiteSeoSettings | null;
  /** Fallback values when both seo and settings are blank */
  fallback?: {
    title?: string | null;
    description?: string | null;
    imageUrl?: string | null;
    imageAlt?: string | null;
  };
  /** Path on the site (e.g. "/pricing") — used to build canonical + og:url */
  path?: string;
}

/**
 * Build a Next.js Metadata object from per-page SEO + global settings.
 * Resolution order for each field:
 *   1. page-level seo override
 *   2. fallback (e.g. page heading / intro / hero image)
 *   3. global siteSettings default
 *   4. hardcoded sensible default
 */
export function generateSiteMetadata({
  seo,
  settings,
  fallback,
  path,
}: GenerateMetadataInput): Metadata {
  const siteName    = settings?.siteName ?? 'Vero Assess';
  const template    = settings?.titleTemplate ?? '%s — %site';

  const rawTitle    = seo?.pageTitle ?? fallback?.title ?? siteName;
  const title       = rawTitle === siteName
    ? siteName
    : template.replace('%s', rawTitle).replace('%site', siteName);

  const description =
    seo?.metaDescription ??
    fallback?.description ??
    settings?.defaultMetaDescription ??
    undefined;

  const ogImage =
    seo?.ogImageUrl ??
    fallback?.imageUrl ??
    settings?.defaultOgImageUrl ??
    undefined;

  const ogImageAlt =
    seo?.ogImageAlt ??
    fallback?.imageAlt ??
    settings?.defaultOgImageAlt ??
    rawTitle;

  const ogTitle       = seo?.ogTitle       ?? rawTitle;
  const ogDescription = seo?.ogDescription ?? description;

  /* Build absolute URLs when we know the site origin */
  const baseUrl = settings?.siteUrl?.replace(/\/$/, '') ?? undefined;
  const canonical = baseUrl && path ? `${baseUrl}${path}` : undefined;

  const metadata: Metadata = {
    title,
    description,
    ...(canonical || baseUrl
      ? {
          metadataBase: baseUrl ? new URL(baseUrl) : undefined,
          alternates: canonical ? { canonical } : undefined,
        }
      : {}),
    openGraph: {
      type: 'website',
      siteName,
      title: ogTitle,
      description: ogDescription,
      url: canonical,
      images: ogImage
        ? [{ url: ogImage, alt: ogImageAlt ?? '', width: 1200, height: 630 }]
        : undefined,
    },
    twitter: {
      card: ogImage ? 'summary_large_image' : 'summary',
      title: ogTitle,
      description: ogDescription,
      images: ogImage ? [ogImage] : undefined,
      ...(settings?.twitterHandle
        ? { creator: `@${settings.twitterHandle.replace(/^@/, '')}` }
        : {}),
    },
    robots: seo?.noIndex
      ? { index: false, follow: false, googleBot: { index: false, follow: false } }
      : undefined,
  };

  return metadata;
}

/**
 * Fetch the SEO block for a singleton page from its companion `pageSeo`
 * document. The doc ID is derived from the page schema type:
 *   homePage → homePage.seo
 *   aboutPage → aboutPage.seo
 *   ... etc.
 *
 * Returns undefined when no SEO doc exists yet (in which case the
 * generateMetadata fallback chain — page heading / siteSettings — kicks in).
 */
export async function fetchPageSeo(schemaType: string): Promise<PageSeo | undefined> {
  const seoId = `${schemaType}.seo`;
  const result = await client.fetch<{ seo?: PageSeo } | null>(PAGE_SEO_QUERY, { seoId });
  return result?.seo ?? undefined;
}

/**
 * Site-wide metadata used by the root layout — sets siteName, default
 * metadataBase, and the favicon / appleTouchIcon. Pages can still
 * override individual fields via their own generateMetadata.
 */
export function generateRootMetadata(settings?: SiteSeoSettings | null): Metadata {
  const siteName = settings?.siteName ?? 'Vero Assess';
  const baseUrl = settings?.siteUrl?.replace(/\/$/, '');

  const icons: NonNullable<Metadata['icons']> = {};
  if (settings?.faviconUrl) {
    icons.icon = [
      {
        url: settings.faviconUrl,
        type: settings.faviconMimeType ?? undefined,
      },
    ];
  }
  if (settings?.appleTouchIconUrl) {
    icons.apple = [{ url: settings.appleTouchIconUrl, sizes: '180x180' }];
  }

  return {
    title: { default: siteName, template: settings?.titleTemplate?.replace('%site', siteName) ?? `%s — ${siteName}` },
    description: settings?.defaultMetaDescription ?? undefined,
    ...(baseUrl ? { metadataBase: new URL(baseUrl) } : {}),
    icons: Object.keys(icons).length > 0 ? icons : undefined,
    ...(settings?.themeColor ? { themeColor: settings.themeColor } : {}),
    openGraph: {
      type: 'website',
      siteName,
      images: settings?.defaultOgImageUrl
        ? [{ url: settings.defaultOgImageUrl, alt: settings.defaultOgImageAlt ?? siteName, width: 1200, height: 630 }]
        : undefined,
    },
    twitter: {
      card: settings?.defaultOgImageUrl ? 'summary_large_image' : 'summary',
      ...(settings?.twitterHandle
        ? { creator: `@${settings.twitterHandle.replace(/^@/, '')}` }
        : {}),
    },
  };
}
