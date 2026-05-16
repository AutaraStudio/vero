import type { Metadata } from 'next';
import { client } from '@/sanity/lib/client';
import { HOW_IT_WORKS_PAGE_QUERY, SITE_SETTINGS_QUERY } from '@/sanity/lib/queries';
import { generateSiteMetadata, fetchPageSeo, type SiteSeoSettings } from '@/lib/seo';
import HeroSplit      from '@/components/HeroSplit';
import ContentSection, { type ContentSectionData } from '@/components/ContentSection';
import StickyTabs, { type StickyTabItem } from '@/components/StickyTabs';
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

  // Steps (7-step sticky-tabs process)
  stepsHeading?: string;
  stepsIntro?: string;
  steps?: { headline?: string; label?: string; body: string; imageUrl?: string; imageAlt?: string }[];

  // Benefits
  benefitsHeading?: string;
  benefits?: { label: string; body?: string; imageUrl?: string; imageAlt?: string }[];
  benefitsLinkLabel?: string;
  benefitsLinkHref?: string;
}

/* ── Fallback step headlines ─────────────────────────────────────── */
/* Used only when a step's `headline` field is blank in Sanity. Editors
   can fully override per step via the Headline + Tab label fields. */
const STEP_HEADLINE_FALLBACKS: string[] = [
  'Add your team',
  'Configure your campaign',
  'Brand your candidate portal',
  'Sign and pay',
  'Get your portal access',
  'Meet your CSM',
  'Go live',
];

export default async function HowItWorksPage() {
  const data = await client.fetch<HowItWorksData | null>(HOW_IT_WORKS_PAGE_QUERY);

  /* Compose the StickyTabs array from the Sanity steps. Each step's
     headline and tab label are fully editable; we only fall back to the
     hardcoded headline if Sanity has nothing for that slot. */
  const stepTabs: StickyTabItem[] = (data?.steps ?? []).map((step, i) => {
    const headline = step.headline?.trim() || STEP_HEADLINE_FALLBACKS[i] || `Step ${i + 1}`;
    const label    = step.label?.trim() || `Step ${i + 1}: ${headline}`;
    return {
      theme: 'brand-purple',
      label,
      children: (
        <>
          <div className="sticky-tab__text stack--lg">
            <div className="stack--md">
              <h4 className="text-h4 color--primary">{headline}</h4>
              <p className="text-body--md leading--relaxed color--secondary">{step.body}</p>
            </div>
          </div>

          <div className="sticky-tab__image">
            {step.imageUrl ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={step.imageUrl}
                alt={step.imageAlt ?? ''}
                loading="lazy"
              />
            ) : (
              <div className="sticky-tab__image-placeholder" />
            )}
          </div>
        </>
      ),
    };
  });

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
            ? { label: data.heroCTALabel, href: data.heroCTAHref ?? '#' }
            : undefined
        }
        secondaryCTA={
          data?.heroSecondaryCTALabel
            ? { label: data.heroSecondaryCTALabel, href: data.heroSecondaryCTAHref ?? '#' }
            : undefined
        }
        media={data?.heroMedia}
      />

      {/* ── 2. Getting started ────────────────────────────── */}
      <ContentSection theme="brand-purple" section={data?.gettingStartedSection} />

      {/* ── 3. The 7-step process (sticky tabs) ───────────── */}
      {stepTabs.length > 0 && (
        <section className="how-it-works__steps section" data-theme="brand-purple">
          {(data?.stepsHeading || data?.stepsIntro) && (
            <div className="container">
              <div className="how-it-works__steps-header stack--md max-ch-60">
                <span className="section-label">The process</span>
                {data?.stepsHeading && (
                  <h2 className="section-heading">{data.stepsHeading}</h2>
                )}
                {data?.stepsIntro && (
                  <p className="section-intro text-body--lg leading--snug">
                    {data.stepsIntro}
                  </p>
                )}
              </div>
            </div>
          )}

          <StickyTabs tabs={stepTabs} />
        </section>
      )}

      {/* ── 4. Candidate experience ───────────────────────── */}
      <ContentSection theme="brand-purple" section={data?.candidateExperienceSection} />

      {/* ── 5. Benefits (slider) ──────────────────────────── */}
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
