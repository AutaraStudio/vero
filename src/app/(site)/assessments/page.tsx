import type { Metadata } from 'next';
import { client } from '@/sanity/lib/client';
import { ASSESSMENTS_PAGE_QUERY, JOB_CATEGORIES_QUERY, SITE_SETTINGS_QUERY } from '@/sanity/lib/queries';
import { generateSiteMetadata, fetchPageSeo, type SiteSeoSettings } from '@/lib/seo';
import HeroCentred  from '@/components/HeroCentred/HeroCentred';
import BespokeStrip from '@/components/BespokeStrip/BespokeStrip';
import FeatureSlider, { type FeatureSliderItem } from '@/components/FeatureSlider/FeatureSlider';

export async function generateMetadata(): Promise<Metadata> {
  const [page, settings, seo] = await Promise.all([
    client.fetch<{ heroHeadline?: string; heroIntro?: string } | null>(ASSESSMENTS_PAGE_QUERY),
    client.fetch<SiteSeoSettings | null>(SITE_SETTINGS_QUERY),
    fetchPageSeo('assessmentsPage'),
  ]);
  return generateSiteMetadata({
    seo,
    settings,
    fallback: {
      title:       page?.heroHeadline ?? 'Assessments',
      description: page?.heroIntro ??
        'Structured, scientifically-validated assessments designed around specific job families. Browse the categories and roles Vero Assess covers out of the box.',
    },
    path: '/assessments',
  });
}

interface AssessmentsPageData {
  heroHeadline?: string;
  heroIntro?: string;
  heroCTALabel?: string;
  heroCTAHref?: string;
}

interface JobCategory {
  _id: string;
  name: string;
  slug: string;
  keyDimensionsAssessed?: string;
  heroHeadline?: string;
  heroImage?: string;
}

export default async function AssessmentsPage() {
  /* Fetch the page-level content + all job categories in parallel */
  const [page, categories] = await Promise.all([
    client.fetch<AssessmentsPageData | null>(ASSESSMENTS_PAGE_QUERY),
    client.fetch<JobCategory[]>(JOB_CATEGORIES_QUERY),
  ]);

  /* Map each category into a FeatureSlider item — image at the top,
     name as the title, dimensions preview as the body, slug as the
     internal href so the card becomes clickable. */
  const sliderItems: FeatureSliderItem[] = (categories ?? []).map((cat) => ({
    title:    cat.name,
    body:     cat.keyDimensionsAssessed ?? '',
    imageUrl: cat.heroImage,
    imageAlt: cat.name,
    href:     `/assessments/${cat.slug}`,
    ctaLabel: 'View roles',
  }));

  return (
    <main>
      {/* ── 1. Hero ───────────────────────────────────────── */}
      <HeroCentred
        theme="brand-purple"
        badge={{ label: 'Assessments', href: '#categories' }}
        headline={page?.heroHeadline ?? 'Assessments built for your roles'}
        intro={
          page?.heroIntro ??
          'Structured assessments designed around specific job families. Identify the right people faster with tools built for the roles you’re actually hiring.'
        }
        primaryCTA={
          page?.heroCTALabel
            ? { label: page.heroCTALabel, href: page.heroCTAHref ?? '/get-started' }
            : { label: 'Get started', href: '/get-started' }
        }
      />

      {/* ── 2. Categories carousel ────────────────────────── */}
      {sliderItems.length > 0 && (
        <div id="categories">
          <FeatureSlider
            theme="brand-purple"
            eyebrow="Categories"
            heading="Find the right assessment for the job you’re hiring for"
            intro="Each category covers a family of roles, with assessments calibrated to the dimensions that matter most for that work."
            items={sliderItems}
          />
        </div>
      )}

      {/* ── 3. Closing CTA ────────────────────────────────── */}
      <BespokeStrip
        heading="Need something built around your roles?"
        body="If your roles don’t fit a standard category, we’ll work with you to design a bespoke assessment for them."
        ctaLabel="Talk to us"
        ctaHref="/contact"
      />
    </main>
  );
}
