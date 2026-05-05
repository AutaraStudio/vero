import type { Metadata } from 'next';
import { client } from '@/sanity/lib/client';
import { ABOUT_PAGE_QUERY, SITE_SETTINGS_QUERY } from '@/sanity/lib/queries';
import { generateSiteMetadata, fetchPageSeo, type SiteSeoSettings } from '@/lib/seo';
import HeroSplit     from '@/components/HeroSplit';
import IntroBlock    from '@/components/IntroBlock';
import ClientsBlock  from '@/components/ClientsBlock';
import TeamGrid      from '@/components/TeamGrid';
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

interface PortableTextSpan { _type: 'span'; text: string; marks?: string[] }
interface PortableTextBlock { _type: 'block'; children: PortableTextSpan[]; style?: string }

interface AboutPageData {
  heroHeadline?: string;
  heroIntro?: string;
  heroMedia?: MediaBlockData;

  tazioEvolutionHeading?: string;
  tazioEvolutionBody?: PortableTextBlock[];
  tazioEvolutionMedia?: MediaBlockData;
  tazioEvolutionCTALabel?: string;
  tazioEvolutionCTAHref?: string;

  candidateExperiencesHeading?: string;
  candidateExperiencesBody?: PortableTextBlock[];
  candidateExperiencesMedia?: MediaBlockData;

  clientsHeading?: string;
  clientsIntro?: string;
  clientLogos?: { name?: string; url?: string }[];
  rpoIntro?: string;
  rpoLogos?: { name?: string; url?: string }[];

  teamHeading?: string;
  teamIntro?: string;
  teamMembers?: {
    name: string;
    role?: string;
    category?: string;
    headshotUrl?: string;
    headshotAlt?: string;
  }[];
}

export default async function AboutPage() {
  const data = await client.fetch<AboutPageData | null>(ABOUT_PAGE_QUERY);

  return (
    <main>
      {/* ── 1. Hero ───────────────────────────────────────── */}
      <HeroSplit
        theme="brand-purple"
        eyebrow="About us"
        headline={data?.heroHeadline ?? 'Powered by trusted technology'}
        intro={data?.heroIntro}
        media={data?.heroMedia}
        imageHeight="viewport"
        textAlign="bottom"
      />

      {/* ── 2. Tazio's tech evolution (centred — image / video as featured visual) ── */}
      {data?.tazioEvolutionHeading && (
        <IntroBlock
          theme="brand-purple"
          eyebrow="Tazio"
          heading={data.tazioEvolutionHeading}
          body={data.tazioEvolutionBody as never}
          ctaLabel={data.tazioEvolutionCTALabel}
          ctaHref={data.tazioEvolutionCTAHref}
          media={data.tazioEvolutionMedia}
          alwaysShowMedia
          layout="centered"
        />
      )}

      {/* ── 3. Enhancing candidate experiences (text + image / video) ── */}
      {data?.candidateExperiencesHeading && (
        <IntroBlock
          theme="brand-purple"
          eyebrow="Candidate experience"
          heading={data.candidateExperiencesHeading}
          body={data.candidateExperiencesBody as never}
          media={data.candidateExperiencesMedia}
          alwaysShowMedia
        />
      )}

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

      {/* ── 5. Team grid ─────────────────────────────────── */}
      {data?.teamHeading && (
        <TeamGrid
          theme="brand-purple"
          eyebrow="The team"
          heading={data.teamHeading}
          intro={data.teamIntro}
          members={data.teamMembers ?? []}
        />
      )}

      {/* Closing CTA is global — handled by Footer */}
    </main>
  );
}
