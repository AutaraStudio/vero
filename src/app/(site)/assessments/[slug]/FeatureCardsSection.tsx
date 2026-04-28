'use client';

import FeatureSlider, { type FeatureSliderItem } from '@/components/FeatureSlider/FeatureSlider';
import type { ThemeVariant } from '@/lib/theme';

export interface FeatureCard {
  heading: string;
  body: string;
  imageUrl?: string;
  imageAlt?: string;
}

interface FeatureCardsSectionProps {
  /** Section header — eyebrow / heading / intro shown above the carousel */
  sectionLabel?: string;
  sectionHeading?: string;
  sectionIntro?: string;

  /** First slider card — the "lead" card with the category-level promise */
  leadHeading?: string;
  leadBody?: string;

  /** Remaining slider cards — the specific value points */
  cards: FeatureCard[];

  theme?: ThemeVariant;
}

/**
 * "In action" carousel for an assessment category page.
 * Composes the FeatureSlider with:
 *   • a section header (label + heading + intro) above the slider
 *   • a lead card (Sanity featureCardsHeading + featureCardsSubheading)
 *   • N value cards (Sanity featureCards[])
 */
export default function FeatureCardsSection({
  sectionLabel = 'In action',
  sectionHeading,
  sectionIntro,
  leadHeading,
  leadBody,
  cards,
  theme = 'brand-purple',
}: FeatureCardsSectionProps) {
  /* Compose the slider items: optional lead card first, then the value cards */
  const items: FeatureSliderItem[] = [
    ...(leadHeading
      ? [{ title: leadHeading, body: leadBody ?? '' }]
      : []),
    ...cards.map((c) => ({
      title: c.heading,
      body:  c.body,
      imageUrl: c.imageUrl,
      imageAlt: c.imageAlt,
    })),
  ];

  if (items.length === 0) return null;

  return (
    <FeatureSlider
      theme={theme}
      eyebrow={sectionLabel}
      heading={sectionHeading ?? ''}
      intro={sectionIntro ?? ''}
      items={items}
    />
  );
}
