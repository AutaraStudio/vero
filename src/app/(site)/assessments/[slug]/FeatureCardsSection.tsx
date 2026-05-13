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

  /** Carousel cards — rendered in the order supplied. The first card is
   *  what the visitor sees on landing. */
  cards: FeatureCard[];

  theme?: ThemeVariant;
}

/**
 * "In action" carousel for an assessment category page. Composes the
 * FeatureSlider with a section header (label + heading + intro) above
 * a single flat list of cards (Sanity featureCards[]).
 */
export default function FeatureCardsSection({
  sectionLabel = 'In action',
  sectionHeading,
  sectionIntro,
  cards,
  theme = 'brand-purple',
}: FeatureCardsSectionProps) {
  const items: FeatureSliderItem[] = cards.map((c) => ({
    title: c.heading,
    body: c.body,
    imageUrl: c.imageUrl,
    imageAlt: c.imageAlt,
  }));

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
