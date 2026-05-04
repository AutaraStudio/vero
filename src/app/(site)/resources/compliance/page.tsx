import type { Metadata } from 'next';
import { client } from '@/sanity/lib/client';
import { COMPLIANCE_PAGE_QUERY, SITE_SETTINGS_QUERY } from '@/sanity/lib/queries';
import { generateSiteMetadata, type PageSeo, type SiteSeoSettings } from '@/lib/seo';
import HeroCentred       from '@/components/HeroCentred/HeroCentred';
import IntroBlock        from '@/components/IntroBlock';
import { StickySteps }   from '@/components/StickySteps/StickySteps';
import SecuritySection   from './SecuritySection';
import type { MediaBlockData } from '@/components/MediaBlock';

export async function generateMetadata(): Promise<Metadata> {
  const [page, settings] = await Promise.all([
    client.fetch<{ seo?: PageSeo; heroHeadline?: string; heroBody?: string } | null>(COMPLIANCE_PAGE_QUERY),
    client.fetch<SiteSeoSettings | null>(SITE_SETTINGS_QUERY),
  ]);
  return generateSiteMetadata({
    seo: page?.seo,
    settings,
    fallback: {
      title:       page?.heroHeadline ?? 'Compliance',
      description: page?.heroBody ??
        'Safe, secure, compliant. ISO 27001, ISO 9001, Cyber Essentials Plus, WCAG 2.2 — the regulatory frameworks Vero Assess is built on.',
    },
    path: '/resources/compliance',
  });
}

/* ── Types matching the GROQ projection ──────────────────────── */

interface PortableTextSpan { _type: 'span'; text: string; marks?: string[] }
interface PortableTextBlock { _type: 'block'; children: PortableTextSpan[]; style?: string }

interface ChecklistItem { label: string; description: string }
interface AccessibilityItem extends ChecklistItem { imageUrl?: string; imageAlt?: string }

interface CompliancePageData {
  heroHeadline?: string;
  heroBody?: string;

  securityHeading?: string;
  securityBody?: string;
  securityBadgesMedia?: MediaBlockData;
  securityCredentials?: ChecklistItem[];

  qualityHeading?: string;
  qualityBody?: string;
  qualityItems?: AccessibilityItem[];   /* same shape (label + description + image) */

  aiHeading?: string;
  aiBody?: PortableTextBlock[];
  aiMedia?: MediaBlockData;

  accessibilityHeading?: string;
  accessibilityBody?: string;
  accessibilityItems?: AccessibilityItem[];
}

export default async function CompliancePage() {
  const data = await client.fetch<CompliancePageData | null>(COMPLIANCE_PAGE_QUERY);

  return (
    <main>
      {/* ── 1. Hero — text-only (compact mode) ──────────────── */}
      <HeroCentred
        theme="brand-purple"
        badge={{ label: 'Compliance', href: '#data-security' }}
        headline={data?.heroHeadline ?? 'Safe, secure, compliant'}
        intro={data?.heroBody}
      />

      {/* ── 2. Data security credentials — split with badges graphic ── */}
      {data?.securityHeading && data?.securityCredentials && data.securityCredentials.length > 0 && (
        <SecuritySection
          heading={data.securityHeading}
          body={data.securityBody}
          credentials={data.securityCredentials}
          badgesImageUrl={
            data.securityBadgesMedia?.type === 'video'
              ? data.securityBadgesMedia.videoThumbnailUrl ?? undefined
              : data.securityBadgesMedia?.imageUrl ?? undefined
          }
          badgesImageAlt={
            data.securityBadgesMedia?.type === 'video'
              ? data.securityBadgesMedia.videoThumbnailAlt ?? undefined
              : data.securityBadgesMedia?.imageAlt ?? undefined
          }
        />
      )}

      {/* ── 3. Quality assurance — section header + sticky-scroll element ── */}
      {data?.qualityHeading && (
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
              <span className="section-label">Quality assurance</span>
              <h2 className="section-heading" style={{ marginInline: 'auto' }}>
                {data.qualityHeading}
              </h2>
              {data.qualityBody && (
                <p
                  className="section-intro text-body--lg leading--snug"
                  style={{ marginInline: 'auto' }}
                >
                  {data.qualityBody}
                </p>
              )}
            </div>
          </div>
        </section>
      )}

      {data?.qualityItems && data.qualityItems.length > 0 && (
        <StickySteps
          theme="brand-purple"
          steps={data.qualityItems.map((item, i) => ({
            eyebrow:  `Pillar ${i + 1}`,
            headline: item.label,
            body:     item.description,
            imageSrc: item.imageUrl,
            imageAlt: item.imageAlt ?? item.label,
          }))}
        />
      )}

      {/* ── 4. Our approach to AI (centred — conceptual statement moment) ── */}
      {data?.aiHeading && (
        <IntroBlock
          theme="brand-purple"
          eyebrow="AI"
          heading={data.aiHeading}
          body={data.aiBody as never}
          media={data.aiMedia}
          alwaysShowMedia
          layout="centered"
        />
      )}

      {/* ── 5. Accessibility — section header + sticky-scroll element ── */}
      {data?.accessibilityHeading && (
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
              <span className="section-label">Accessibility</span>
              <h2 className="section-heading" style={{ marginInline: 'auto' }}>
                {data.accessibilityHeading}
              </h2>
              {data.accessibilityBody && (
                <p
                  className="section-intro text-body--lg leading--snug"
                  style={{ marginInline: 'auto' }}
                >
                  {data.accessibilityBody}
                </p>
              )}
            </div>
          </div>
        </section>
      )}

      {data?.accessibilityItems && data.accessibilityItems.length > 0 && (
        <StickySteps
          theme="brand-purple"
          steps={data.accessibilityItems.map((item, i) => ({
            eyebrow:  `Feature ${i + 1}`,
            headline: item.label,
            body:     item.description,
            imageSrc: item.imageUrl,
            imageAlt: item.imageAlt ?? item.label,
          }))}
        />
      )}

      {/* Closing CTA is global — handled by Footer */}
    </main>
  );
}
