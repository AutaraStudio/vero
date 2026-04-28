import type { Metadata } from 'next';
import { client } from '@/sanity/lib/client';
import { COMPLIANCE_PAGE_QUERY } from '@/sanity/lib/queries';
import HeroCentred       from '@/components/HeroCentred/HeroCentred';
import IntroBlock        from '@/components/IntroBlock';
import { StickySteps }   from '@/components/StickySteps/StickySteps';
import SecuritySection   from './SecuritySection';

export const metadata: Metadata = {
  title: 'Compliance — Vero Assess',
  description:
    'Safe, secure, compliant. ISO 27001, ISO 9001, Cyber Essentials Plus, WCAG 2.2 — the regulatory frameworks Vero Assess is built on.',
};

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
  securityBadgesImageUrl?: string;
  securityBadgesImageAlt?: string;
  securityCredentials?: ChecklistItem[];

  qualityHeading?: string;
  qualityBody?: string;
  qualityItems?: AccessibilityItem[];   /* same shape (label + description + image) */

  aiHeading?: string;
  aiBody?: PortableTextBlock[];
  aiImageUrl?: string;
  aiImageAlt?: string;

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
          badgesImageUrl={data.securityBadgesImageUrl}
          badgesImageAlt={data.securityBadgesImageAlt}
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
          videoThumbnailUrl={data.aiImageUrl}
          videoThumbnailAlt={data.aiImageAlt}
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
