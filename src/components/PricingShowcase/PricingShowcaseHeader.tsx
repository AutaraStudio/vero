'use client';

import { useTextReveal } from '@/hooks/useTextReveal';
import { useFadeUp } from '@/hooks/useFadeUp';
import type { ThemeVariant } from '@/lib/theme';

interface Props {
  label?: string;
  heading: string;
  intro?: string;
  theme?: ThemeVariant;
}

export default function PricingShowcaseHeader({
  label = 'Pricing',
  heading,
  intro,
  theme = 'brand-purple',
}: Props) {
  const labelRef   = useFadeUp({ delay: 0,    duration: 0.5, y: 16 });
  const headingRef = useTextReveal();
  const introRef   = useFadeUp({ delay: 0.2,  duration: 0.6, y: 16 });

  return (
    <section data-theme={theme} className="pricing-showcase-header section">
      <div className="container">
        <div className="pricing-showcase-header__inner">
          <span
            ref={labelRef as React.RefObject<HTMLSpanElement>}
            data-animate=""
            className="section-label"
          >
            {label}
          </span>
          <h2
            ref={headingRef as React.RefObject<HTMLHeadingElement>}
            data-animate=""
            className="text-h1 text-balance color--primary max-ch-30"
          >
            {heading}
          </h2>
          {intro && (
            <p
              ref={introRef as React.RefObject<HTMLParagraphElement>}
              data-animate=""
              className="text-body--lg color--secondary leading--snug max-ch-50"
            >
              {intro}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
