import type { Metadata } from 'next';
import { client } from '@/sanity/lib/client';
import { HOME_PAGE_QUERY, SITE_SETTINGS_QUERY } from '@/sanity/lib/queries';
import { generateSiteMetadata, type PageSeo, type SiteSeoSettings } from '@/lib/seo';
import HeroCentred       from '@/components/HeroCentred/HeroCentred';
import LogoMarquee       from '@/components/LogoMarquee';
import IntroBlock        from '@/components/IntroBlock';
import FeatureSlider     from '@/components/FeatureSlider/FeatureSlider';
import PricingShowcase   from '@/components/PricingShowcase/PricingShowcase';

export async function generateMetadata(): Promise<Metadata> {
  const [page, settings] = await Promise.all([
    client.fetch<{ seo?: PageSeo; heroTitle?: string; heroIntro?: string; heroImageUrl?: string } | null>(HOME_PAGE_QUERY),
    client.fetch<SiteSeoSettings | null>(SITE_SETTINGS_QUERY),
  ]);
  return generateSiteMetadata({
    seo: page?.seo,
    settings,
    fallback: {
      title:       page?.heroTitle,
      description: page?.heroIntro,
      imageUrl:    page?.heroImageUrl,
    },
    path: '/',
  });
}

/* ── Types matching the HOME_PAGE_QUERY projection ────────── */

interface HomePageData {
  // Hero
  heroBadgeLabel?: string;
  heroBadgeHref?: string;
  heroTitle?: string;
  heroIntro?: string;
  heroCTALabel?: string;
  heroCTAHref?: string;
  heroSecondaryCTALabel?: string;
  heroSecondaryCTAHref?: string;
  heroMediaType?: 'image' | 'video';
  heroImageUrl?: string;
  heroImageAlt?: string;
  heroVideoThumbnailUrl?: string;
  heroVideoThumbnailAlt?: string;
  heroVideoUrl?: string;

  // Intro block
  introBlockEyebrow?: string;
  introBlockHeading?: string;
  introBlockBody?: unknown[];
  introBlockCtaLabel?: string;
  introBlockCtaHref?: string;
  introBlockVideoThumbnailUrl?: string;
  introBlockVideoThumbnailAlt?: string;
  introBlockVideoUrl?: string;

  // USPs
  uspsSectionLabel?: string;
  uspsSectionHeading?: string;
  uspsSectionSubheading?: string;
  usps?: { label: string; body?: string; imageUrl?: string; imageAlt?: string }[];
  uspsCtaLabel?: string;
  uspsCtaHref?: string;

  // Steps
  stepsSectionLabel?: string;
  stepsSectionHeading?: string;
  stepsSectionIntro?: string;
  steps?: { title: string; body: string; ctaLabel?: string; ctaHref?: string }[];

  // Pricing teaser
  pricingSectionLabel?: string;
  pricingSectionHeading?: string;
  pricingSectionSubheading?: string;
  pricingHighlights?: string[];
  pricingCtaLabel?: string;
  pricingCtaHref?: string;

  // Closing CTA
  closingStatement?: string;
  closingEyebrow?: string;
  closingBenefits?: string[];
  closingCtaLabel?: string;
  closingCtaHref?: string;
}

interface SiteSettingsLogos {
  partnerLogosLabel?: string;
  partnerLogos?: { name: string; logoUrl?: string; logoMimeType?: string }[];
}

export default async function Home() {
  const [data, settings] = await Promise.all([
    client.fetch<HomePageData | null>(HOME_PAGE_QUERY),
    client.fetch<SiteSettingsLogos | null>(SITE_SETTINGS_QUERY),
  ]);

  /* ── Hero media (image vs video) ──────────────────────── */
  const badge = data?.heroBadgeLabel
    ? { label: data.heroBadgeLabel, href: data.heroBadgeHref ?? '#' }
    : undefined;

  const media = (() => {
    if (data?.heroMediaType === 'video' && data.heroVideoUrl) {
      return {
        type: 'video' as const,
        thumbnailSrc: data.heroVideoThumbnailUrl ?? '',
        videoSrc: data.heroVideoUrl,
      };
    }
    if (data?.heroImageUrl) {
      return {
        type: 'image' as const,
        src: data.heroImageUrl,
        alt: data.heroImageAlt ?? 'Vero Assess platform preview',
      };
    }
    return undefined;
  })();

  return (
    <main>
      {/* ── 1. Hero ───────────────────────────────────────── */}
      <HeroCentred
        theme="brand-purple"
        badge={badge}
        headline={data?.heroTitle ?? 'Hire the right people, every time.'}
        intro={
          data?.heroIntro ??
          'Science-backed skills assessments built for modern hiring teams. Objective, fast, and fair.'
        }
        primaryCTA={{
          label: data?.heroCTALabel ?? 'Get started',
          href:  data?.heroCTAHref  ?? '/get-started',
        }}
        secondaryCTA={
          data?.heroSecondaryCTALabel
            ? { label: data.heroSecondaryCTALabel, href: data.heroSecondaryCTAHref ?? '#' }
            : { label: 'See how it works', href: '/how-it-works' }
        }
        media={media}
      />

      {/* ── 2. Partner logo marquee (global, from siteSettings) ──── */}
      {settings?.partnerLogos && settings.partnerLogos.length > 0 && (
        <LogoMarquee
          theme="brand-purple"
          label={settings.partnerLogosLabel}
          logos={settings.partnerLogos}
        />
      )}

      {/* ── 3. Intro block (text + demo video) ────────────── */}
      {data?.introBlockHeading && (
        <IntroBlock
          theme="brand-purple"
          eyebrow={data.introBlockEyebrow}
          heading={data.introBlockHeading}
          body={data.introBlockBody as never}
          ctaLabel={data.introBlockCtaLabel}
          ctaHref={data.introBlockCtaHref}
          videoThumbnailUrl={data.introBlockVideoThumbnailUrl}
          videoThumbnailAlt={data.introBlockVideoThumbnailAlt}
          videoUrl={data.introBlockVideoUrl}
        />
      )}

      {/* ── 4. USPs (slider) ──────────────────────────────── */}
      {data?.uspsSectionHeading && data?.usps && data.usps.length > 0 && (
        <FeatureSlider
          theme="brand-purple"
          eyebrow={data.uspsSectionLabel}
          heading={data.uspsSectionHeading}
          intro={data.uspsSectionSubheading}
          ctaLabel={data.uspsCtaLabel}
          ctaHref={data.uspsCtaHref}
          items={data.usps.map((u) => ({
            title: u.label,
            body: u.body ?? '',
            imageUrl: u.imageUrl,
            imageAlt: u.imageAlt,
          }))}
        />
      )}

      {/* "How it works" lives on its own page now — link from intro block CTA */}

      {/* ── 5. Pricing — full tier cards + collapsible compare table ── */}
      <PricingShowcase
        withHeader
        collapsible
        heading={data?.pricingSectionHeading}
        intro={data?.pricingSectionSubheading}
      />

      {/* Closing CTA lives globally in the footer — see Footer.tsx */}
    </main>
  );
}
