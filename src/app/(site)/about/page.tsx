import type { Metadata } from 'next';
import { client } from '@/sanity/lib/client';
import { ABOUT_PAGE_QUERY } from '@/sanity/lib/queries';
import HeroSplit     from '@/components/HeroSplit';
import IntroBlock    from '@/components/IntroBlock';
import ClientsBlock  from '@/components/ClientsBlock';
import TeamGrid      from '@/components/TeamGrid';

export const metadata: Metadata = {
  title: 'About us — Vero Assess',
  description:
    'Vero Assess is part of Tazio — built on the same trusted technology powering enterprise recruitment platforms since 2010.',
};

/* ── Types matching the GROQ projection ──────────────────────── */

interface PortableTextSpan { _type: 'span'; text: string; marks?: string[] }
interface PortableTextBlock { _type: 'block'; children: PortableTextSpan[]; style?: string }

interface AboutPageData {
  heroHeadline?: string;
  heroIntro?: string;
  heroImageUrl?: string;
  heroImageAlt?: string;

  tazioEvolutionHeading?: string;
  tazioEvolutionBody?: PortableTextBlock[];
  tazioEvolutionImageUrl?: string;
  tazioEvolutionImageAlt?: string;
  tazioEvolutionCTALabel?: string;
  tazioEvolutionCTAHref?: string;

  candidateExperiencesHeading?: string;
  candidateExperiencesBody?: PortableTextBlock[];
  candidateExperiencesImageUrl?: string;
  candidateExperiencesImageAlt?: string;

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
        image={
          data?.heroImageUrl
            ? { src: data.heroImageUrl, alt: data.heroImageAlt ?? 'Tazio platform' }
            : undefined
        }
        imageHeight="viewport"
        textAlign="bottom"
      />

      {/* ── 2. Tazio's tech evolution (centred — platform image as featured visual) ── */}
      {data?.tazioEvolutionHeading && (
        <IntroBlock
          theme="brand-purple"
          eyebrow="Tazio"
          heading={data.tazioEvolutionHeading}
          body={data.tazioEvolutionBody as never}
          ctaLabel={data.tazioEvolutionCTALabel}
          ctaHref={data.tazioEvolutionCTAHref}
          videoThumbnailUrl={data.tazioEvolutionImageUrl}
          videoThumbnailAlt={data.tazioEvolutionImageAlt}
          alwaysShowMedia
          layout="centered"
        />
      )}

      {/* ── 3. Enhancing candidate experiences (text + image) ── */}
      {data?.candidateExperiencesHeading && (
        <IntroBlock
          theme="brand-purple"
          eyebrow="Candidate experience"
          heading={data.candidateExperiencesHeading}
          body={data.candidateExperiencesBody as never}
          videoThumbnailUrl={data.candidateExperiencesImageUrl}
          videoThumbnailAlt={data.candidateExperiencesImageAlt}
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
