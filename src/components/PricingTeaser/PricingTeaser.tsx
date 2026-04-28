'use client';

import Button from '@/components/ui/Button';
import CheckIcon from '@/components/ui/CheckIcon';
import { useFadeUp } from '@/hooks/useFadeUp';
import { useTextReveal } from '@/hooks/useTextReveal';
import type { ThemeVariant } from '@/lib/theme';
import './PricingTeaser.css';

interface Props {
  eyebrow?: string;
  heading: string;
  subheading?: string;
  highlights?: string[];
  ctaLabel?: string;
  ctaHref?: string;
  theme?: ThemeVariant;
}

export default function PricingTeaser({
  eyebrow = 'Pricing',
  heading,
  subheading,
  highlights,
  ctaLabel = 'See full pricing',
  ctaHref = '/pricing',
  theme = 'dark',
}: Props) {
  const labelRef     = useFadeUp({ delay: 0,    duration: 0.5, y: 12 });
  const headingRef   = useTextReveal({ delay: 0.05 });
  const subheadingRef = useFadeUp({ delay: 0.2,  duration: 0.6, y: 16 });
  const highlightsRef = useFadeUp({
    selector: '.pricing-teaser__highlight',
    stagger: 0.06,
    duration: 0.5,
    y: 12,
  });
  const ctaRef       = useFadeUp({ delay: 0.4,  duration: 0.5, y: 16 });

  return (
    <section data-theme={theme} className="pricing-teaser section">
      <div className="container">
        <div className="pricing-teaser__card">

          <div className="pricing-teaser__text stack--md">
            {eyebrow && (
              <span
                ref={labelRef as React.RefObject<HTMLSpanElement>}
                data-animate=""
                className="section-label"
              >
                {eyebrow}
              </span>
            )}

            <h2
              ref={headingRef as React.RefObject<HTMLHeadingElement>}
              data-animate=""
              className="section-heading max-ch-25"
            >
              {heading}
            </h2>

            {subheading && (
              <p
                ref={subheadingRef as React.RefObject<HTMLParagraphElement>}
                data-animate=""
                className="section-intro text-body--lg leading--snug"
              >
                {subheading}
              </p>
            )}

            <div
              ref={ctaRef as React.RefObject<HTMLDivElement>}
              data-animate=""
              className="pricing-teaser__cta"
            >
              <Button variant="primary" href={ctaHref}>
                {ctaLabel}
              </Button>
            </div>
          </div>

          {highlights && highlights.length > 0 && (
            <ul
              ref={highlightsRef as React.RefObject<HTMLUListElement>}
              className="pricing-teaser__highlights"
            >
              {highlights.map((item, i) => (
                <li key={i} className="pricing-teaser__highlight">
                  <span className="pricing-teaser__highlight-icon" aria-hidden="true">
                    <CheckIcon />
                  </span>
                  <span className="text-body--md color--secondary">{item}</span>
                </li>
              ))}
            </ul>
          )}

        </div>
      </div>
    </section>
  );
}
