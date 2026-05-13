import type { Metadata } from 'next';
import { client } from '@/sanity/lib/client';
import { HOW_IT_WORKS_PAGE_QUERY, SITE_SETTINGS_QUERY } from '@/sanity/lib/queries';
import { generateSiteMetadata, fetchPageSeo, type SiteSeoSettings } from '@/lib/seo';
import HeroSplit      from '@/components/HeroSplit';
import IntroBlock     from '@/components/IntroBlock';
import FeatureSlider  from '@/components/FeatureSlider/FeatureSlider';
import type { MediaBlockData } from '@/components/MediaBlock';

export async function generateMetadata(): Promise<Metadata> {
  const [page, settings, seo] = await Promise.all([
    client.fetch<{ heroHeadline?: string; heroIntro?: string; heroMedia?: MediaBlockData } | null>(HOW_IT_WORKS_PAGE_QUERY),
    client.fetch<SiteSeoSettings | null>(SITE_SETTINGS_QUERY),
    fetchPageSeo('howItWorksPage'),
  ]);
  const heroFallbackImage =
    page?.heroMedia?.type === 'video'
      ? page?.heroMedia?.videoThumbnailUrl
      : page?.heroMedia?.imageUrl;
  return generateSiteMetadata({
    seo,
    settings,
    fallback: {
      title:       page?.heroHeadline ?? 'How it works',
      description: page?.heroIntro ??
        'How Vero Assess works — getting started, the candidate experience, and the benefits.',
      imageUrl:    heroFallbackImage ?? undefined,
    },
    path: '/how-it-works',
  });
}

/* ── Types matching the GROQ projection ──────────────────────────── */

interface PortableTextSpan { _type: 'span'; text: string; marks?: string[] }
interface PortableTextBlock { _type: 'block'; children: PortableTextSpan[]; style?: string }

interface HowItWorksData {
  // Hero
  heroHeadline?: string;
  heroIntro?: string;
  heroCTALabel?: string;
  heroCTAHref?: string;
  heroSecondaryCTALabel?: string;
  heroSecondaryCTAHref?: string;
  heroMedia?: MediaBlockData;

  // Getting started
  gettingStartedHeading?: string;
  gettingStartedBody?: PortableTextBlock[];
  gettingStartedMedia?: MediaBlockData;
  gettingStartedLinkLabel?: string;
  gettingStartedLinkHref?: string;

  // Candidate experience
  candidateExpHeading?: string;
  candidateExpBody?: PortableTextBlock[];
  candidateExpMedia?: MediaBlockData;

  // Benefits
  benefitsHeading?: string;
  benefits?: { label: string; body?: string; imageUrl?: string; imageAlt?: string }[];
  benefitsLinkLabel?: string;
  benefitsLinkHref?: string;
}

export default async function HowItWorksPage() {
  const data = await client.fetch<HowItWorksData | null>(HOW_IT_WORKS_PAGE_QUERY);

  return (
    <main id="main-content" tabIndex={-1}>
      {/* ── 1. Hero (split — viewport-tall image, bottom-left text) ── */}
      <HeroSplit
        theme="brand-purple"
        eyebrow="How it works"
        headline={data?.heroHeadline ?? 'How Vero Assess works'}
        intro={data?.heroIntro}
        primaryCTA={
          data?.heroCTALabel
            ? { label: data.heroCTALabel, href: data.heroCTAHref ?? '/get-started' }
            : { label: 'Get started', href: '/get-started' }
        }
        secondaryCTA={
          data?.heroSecondaryCTALabel
            ? { label: data.heroSecondaryCTALabel, href: data.heroSecondaryCTAHref ?? '/pricing' }
            : { label: 'View pricing', href: '/pricing' }
        }
        media={data?.heroMedia}
        imageHeight="viewport"
        textAlign="bottom"
      />

      {/* ── 2. Getting started ────────────────────────────── */}
      {data?.gettingStartedHeading && (
        <IntroBlock
          theme="brand-purple"
          eyebrow="Getting started"
          heading={data.gettingStartedHeading}
          body={data.gettingStartedBody as never}
          ctaLabel={data.gettingStartedLinkLabel}
          ctaHref={data.gettingStartedLinkHref}
          media={data.gettingStartedMedia}
        />
      )}

      {/* ── 3. Candidate experience ───────────────────────── */}
      {data?.candidateExpHeading && (
        <IntroBlock
          theme="brand-purple"
          eyebrow="Candidate experience"
          heading={data.candidateExpHeading}
          body={data.candidateExpBody as never}
          media={data.candidateExpMedia}
        />
      )}

      {/* ── 4. Benefits (slider) ──────────────────────────── */}
      {data?.benefitsHeading && data?.benefits && data.benefits.length > 0 && (
        <FeatureSlider
          theme="brand-purple"
          eyebrow="The benefits"
          heading={data.benefitsHeading}
          intro=""
          ctaLabel={data.benefitsLinkLabel}
          ctaHref={data.benefitsLinkHref}
          items={data.benefits.map((b) => ({
            title: b.label,
            body:  b.body ?? '',
            imageUrl: b.imageUrl,
            imageAlt: b.imageAlt,
          }))}
        />
      )}

      {/* Closing CTA is global — handled by Footer */}
    </main>
  );
}
