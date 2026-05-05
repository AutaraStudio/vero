import type { Metadata } from 'next';
import { client } from '@/sanity/lib/client';
import { SCIENCE_PAGE_QUERY, SITE_SETTINGS_QUERY } from '@/sanity/lib/queries';
import { generateSiteMetadata, fetchPageSeo, type SiteSeoSettings } from '@/lib/seo';
import HeroSplit         from '@/components/HeroSplit';
import IntroBlock        from '@/components/IntroBlock';
import ChecklistSection  from '@/components/ChecklistSection';
import BespokeStrip      from '@/components/BespokeStrip';
import { StickySteps }   from '@/components/StickySteps/StickySteps';
import DimensionsSection from './DimensionsSection';
import type { MediaBlockData } from '@/components/MediaBlock';

export async function generateMetadata(): Promise<Metadata> {
  const [page, settings, seo] = await Promise.all([
    client.fetch<{ heroHeadline?: string; heroBody?: string } | null>(SCIENCE_PAGE_QUERY),
    client.fetch<SiteSeoSettings | null>(SITE_SETTINGS_QUERY),
    fetchPageSeo('sciencePage'),
  ]);
  return generateSiteMetadata({
    seo,
    settings,
    fallback: {
      title:       page?.heroHeadline ?? 'The science',
      description: page?.heroBody ??
        'The thinking behind Vero Assess. Four perspectives, sixteen dimensions, scientifically-validated assessments built to predict role-specific potential.',
    },
    path: '/resources/science',
  });
}

/* ── Types matching the GROQ projection ──────────────────────── */

interface PortableTextSpan { _type: 'span'; text: string; marks?: string[] }
interface PortableTextBlock { _type: 'block'; children: PortableTextSpan[]; style?: string }

interface SciencePageData {
  heroHeadline?: string;
  heroBody?: string;

  authenticHeading?: string;
  authenticBody?: PortableTextBlock[];

  theoryHeading?: string;
  theoryIntro?: string;

  perspectivesHeading?: string;
  perspectivesIntro?: string;
  perspectives?: { name: string; description: string; imageUrl?: string; imageAlt?: string }[];

  dimensionsHeading?: string;
  dimensionsBody?: PortableTextBlock[];
  dimensionsMedia?: MediaBlockData;
  dimensionCategories?: { name: string; dimensions: string[] }[];

  insightsHeading?: string;
  insightsBody?: PortableTextBlock[];
  insightsMedia?: MediaBlockData;

  dataBackedHeading?: string;
  dataBackedIntro?: string;
  dataBackedPoints?: { heading: string; body: string }[];

  ctaBody?: string;
  ctaLabel?: string;
  ctaHref?: string;
}

export default async function SciencePage() {
  const data = await client.fetch<SciencePageData | null>(SCIENCE_PAGE_QUERY);

  return (
    <main>
      {/* ── 1. Hero ───────────────────────────────────────── */}
      <HeroSplit
        theme="brand-purple"
        eyebrow="The science"
        headline={data?.heroHeadline ?? 'Assessments you can trust'}
        intro={data?.heroBody}
        imageHeight="viewport"
        textAlign="bottom"
      />

      {/* ── 2. Finding authentic potential (text-only intro) ── */}
      {data?.authenticHeading && (
        <IntroBlock
          theme="brand-purple"
          eyebrow="Vero"
          heading={data.authenticHeading}
          body={data.authenticBody as never}
        />
      )}

      {/* ── 3. Four core perspectives — sticky-scroll element ── */}
      {data?.perspectivesHeading && (
        <section
          data-theme="brand-purple"
          className="section"
          style={{ paddingBottom: 0, borderBottom: 'none' }}
        >
          <div className="container">
            <div
              className="stack--md max-ch-60"
              style={{ marginInline: 'auto', textAlign: 'center', alignItems: 'center' }}
            >
              <span className="section-label">Perspectives</span>
              <h2 className="section-heading" style={{ marginInline: 'auto' }}>
                {data.perspectivesHeading}
              </h2>
              {data.perspectivesIntro && (
                <p
                  className="section-intro text-body--lg leading--snug"
                  style={{ marginInline: 'auto' }}
                >
                  {data.perspectivesIntro}
                </p>
              )}
            </div>
          </div>
        </section>
      )}

      {data?.perspectives && data.perspectives.length > 0 && (
        <StickySteps
          theme="brand-purple"
          steps={data.perspectives.map((p, i) => ({
            eyebrow:  `Perspective ${i + 1}`,
            headline: p.name,
            body:     p.description,
            imageSrc: p.imageUrl,
            imageAlt: p.imageAlt ?? p.name,
          }))}
        />
      )}

      {/* ── 4. 16 Dimensions (4 categories × 4 dimensions) ── */}
      {data?.dimensionsHeading && data?.dimensionCategories && data.dimensionCategories.length > 0 && (
        <DimensionsSection
          heading={data.dimensionsHeading}
          body={data.dimensionsBody}
          categories={data.dimensionCategories}
          imageUrl={
            data.dimensionsMedia?.type === 'video'
              ? data.dimensionsMedia.videoThumbnailUrl ?? undefined
              : data.dimensionsMedia?.imageUrl ?? undefined
          }
          imageAlt={
            data.dimensionsMedia?.type === 'video'
              ? data.dimensionsMedia.videoThumbnailAlt ?? undefined
              : data.dimensionsMedia?.imageAlt ?? undefined
          }
        />
      )}

      {/* ── 5. Detailed candidate insights (centred — text above, dashboard media below) ── */}
      {data?.insightsHeading && (
        <IntroBlock
          theme="brand-purple"
          eyebrow="The dashboard"
          heading={data.insightsHeading}
          body={data.insightsBody as never}
          media={data.insightsMedia}
          alwaysShowMedia
          layout="centered"
        />
      )}

      {/* ── 6. Data-backed recruitment ────────────────────── */}
      {data?.dataBackedHeading && data?.dataBackedPoints && data.dataBackedPoints.length > 0 && (
        <ChecklistSection
          theme="brand-purple"
          eyebrow="Outcomes"
          heading={data.dataBackedHeading}
          body={data.dataBackedIntro}
          items={data.dataBackedPoints.map((p) => ({
            label: p.heading,
            description: p.body,
          }))}
          columns={2}
        />
      )}

      {/* ── 7. Closing science CTA (deep-purple peak) ─────── */}
      {data?.ctaBody && (
        <BespokeStrip
          heading={data.ctaBody}
          ctaLabel={data.ctaLabel ?? 'Contact us'}
          ctaHref={data.ctaHref ?? '/contact'}
        />
      )}

      {/* Footer global CTA also still applies */}
    </main>
  );
}
