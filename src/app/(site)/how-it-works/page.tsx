import type { Metadata } from 'next';
import { client } from '@/sanity/lib/client';
import { HOW_IT_WORKS_PAGE_QUERY, SITE_SETTINGS_QUERY } from '@/sanity/lib/queries';
import { generateSiteMetadata, fetchPageSeo, type SiteSeoSettings } from '@/lib/seo';
import HeroSplit      from '@/components/HeroSplit';
import ContentSection, { type ContentSectionData } from '@/components/ContentSection';
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

interface HowItWorksData {
  // Hero
  heroHeadline?: string;
  heroIntro?: string;
  heroCTALabel?: string;
  heroCTAHref?: string;
  heroSecondaryCTALabel?: string;
  heroSecondaryCTAHref?: string;
  heroMedia?: MediaBlockData;

  // Unified content sections
  gettingStartedSection?: ContentSectionData;
  candidateExperienceSection?: ContentSectionData;

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
      {/* ── 1. Hero (stacked — centred text, 16:9 image below) ── */}
      <HeroSplit
        theme="brand-purple"
        layout="stacked"
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
      />

      {/* ── 2. Getting started ────────────────────────────── */}
      <ContentSection theme="brand-purple" section={data?.gettingStartedSection} />

      {/* ── 3. Candidate experience ───────────────────────── */}
      <ContentSection theme="brand-purple" section={data?.candidateExperienceSection} />

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
