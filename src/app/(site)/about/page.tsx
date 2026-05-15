import type { Metadata } from 'next';
import { client } from '@/sanity/lib/client';
import { ABOUT_PAGE_QUERY, SITE_SETTINGS_QUERY } from '@/sanity/lib/queries';
import { generateSiteMetadata, fetchPageSeo, type SiteSeoSettings } from '@/lib/seo';
import HeroSplit     from '@/components/HeroSplit';
import ContentSection, { type ContentSectionData } from '@/components/ContentSection';
import ClientsBlock  from '@/components/ClientsBlock';
import type { MediaBlockData } from '@/components/MediaBlock';

export async function generateMetadata(): Promise<Metadata> {
  const [page, settings, seo] = await Promise.all([
    client.fetch<{ heroHeadline?: string; heroIntro?: string; heroMedia?: MediaBlockData } | null>(ABOUT_PAGE_QUERY),
    client.fetch<SiteSeoSettings | null>(SITE_SETTINGS_QUERY),
    fetchPageSeo('aboutPage'),
  ]);
  /* For OG fallback, use whichever image lives in the heroMedia block —
     the image when type=image, the video poster when type=video. */
  const heroFallbackImage =
    page?.heroMedia?.type === 'video'
      ? page?.heroMedia?.videoThumbnailUrl
      : page?.heroMedia?.imageUrl;
  return generateSiteMetadata({
    seo,
    settings,
    fallback: {
      title:       page?.heroHeadline ?? 'About us',
      description: page?.heroIntro ??
        'Vero Assess is part of Tazio — built on the same trusted technology powering enterprise recruitment platforms since 2010.',
      imageUrl:    heroFallbackImage ?? undefined,
    },
    path: '/about',
  });
}

/* ── Types matching the GROQ projection ──────────────────────── */

interface AboutPageData {
  heroHeadline?: string;
  heroIntro?: string;
  heroMedia?: MediaBlockData;

  tazioEvolutionSection?: ContentSectionData;
  candidateExperiencesSection?: ContentSectionData;

  clientsHeading?: string;
  clientsIntro?: string;
  clientLogos?: { name?: string; url?: string }[];
  rpoIntro?: string;
  rpoLogos?: { name?: string; url?: string }[];
}

export default async function AboutPage() {
  const data = await client.fetch<AboutPageData | null>(ABOUT_PAGE_QUERY);

  return (
    <main id="main-content" tabIndex={-1}>
      {/* ── 1. Hero ───────────────────────────────────────── */}
      <HeroSplit
        theme="brand-purple"
        layout="stacked"
        eyebrow="About us"
        headline={data?.heroHeadline ?? 'Powered by trusted technology'}
        intro={data?.heroIntro}
        media={data?.heroMedia}
      />

      {/* ── 2. Tazio's tech evolution ── */}
      <ContentSection theme="brand-purple" section={data?.tazioEvolutionSection} />

      {/* ── 3. Enhancing candidate experiences ── */}
      <ContentSection theme="brand-purple" section={data?.candidateExperiencesSection} />

      {/* ── 4. Clients (logos + RPO partners) ────────────── */}
      {data?.clientsHeading && (
        <ClientsBlock
          theme="brand-purple"
          eyebrow="Our clients"
          heading={data.clientsHeading}
          intro={data.clientsIntro}
          clientLogos={data.clientLogos}
          secondaryIntro={data.rpoIntro}
          secondaryLogos={data.rpoLogos}
        />
      )}

      {/* Closing CTA is global — handled by Footer */}
    </main>
  );
}
