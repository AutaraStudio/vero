import IntroBlock from '@/components/IntroBlock';
import type { MediaBlockData } from '@/components/MediaBlock';
import type { ThemeVariant } from '@/lib/theme';

/**
 * Shape of a `contentSection` object as projected by the GROQ helper
 * `contentSectionProjection(...)` in src/sanity/lib/queries.ts.
 */
export interface ContentSectionData {
  eyebrow?: string;
  heading?: string;
  body?: unknown;
  media?: MediaBlockData | null;
  ctaLabel?: string;
  ctaHref?: string;
  layout?: 'split' | 'centered';
}

interface Props {
  section?: ContentSectionData | null;
  theme?: ThemeVariant;
}

/**
 * Adapter — turns a Sanity contentSection object into a rendered
 * <IntroBlock>. The reusable shape powers the unified heading / image /
 * paragraph / button block across the site; editors choose `split` vs
 * `centered` per instance in Studio, and any empty field is hidden by
 * IntroBlock automatically.
 *
 * Renders nothing if the section is missing or has no heading.
 */
export default function ContentSection({ section, theme = 'brand-purple' }: Props) {
  if (!section || !section.heading) return null;

  return (
    <IntroBlock
      theme={theme}
      eyebrow={section.eyebrow}
      heading={section.heading}
      body={section.body as never}
      media={section.media ?? undefined}
      ctaLabel={section.ctaLabel}
      ctaHref={section.ctaHref}
      layout={section.layout ?? 'split'}
      alwaysShowMedia={!!section.media}
    />
  );
}
