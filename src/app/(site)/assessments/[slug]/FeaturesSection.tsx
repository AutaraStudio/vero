'use client';

import Button from '@/components/ui/Button';
import { useFadeUp } from '@/hooks/useFadeUp';
import { useTextReveal } from '@/hooks/useTextReveal';
import type { ThemeVariant } from '@/lib/theme';

interface FeaturesSectionProps {
  heading?: string;
  body?: string;
  theme?: ThemeVariant;
}

export default function FeaturesSection({ heading, body, theme = 'brand-purple' }: FeaturesSectionProps) {
  const headingRef = useTextReveal({ delay: 0.05 });
  const bodyRef = useFadeUp({ delay: 0.2, duration: 0.6, y: 20 });
  const ctaRef = useFadeUp({ delay: 0.35, duration: 0.5, y: 16 });
  const visualRef = useFadeUp({ delay: 0.1, duration: 0.8, y: 32 });

  return (
    <section data-theme={theme} className="features-section">
      <div className="container">
        <div className="grid--asymmetric">

          <div className="features-section__text">
            {heading && (
              <h2
                ref={headingRef as React.RefObject<HTMLHeadingElement>}
                data-animate=""
                className="section-heading"
              >
                {heading}
              </h2>
            )}
            {body && (
              <p
                ref={bodyRef as React.RefObject<HTMLParagraphElement>}
                data-animate=""
                className="text-body--md leading--relaxed max-ch-60"
              >
                {body}
              </p>
            )}
            <div
              ref={ctaRef as React.RefObject<HTMLDivElement>}
              data-animate=""
            >
              <Button variant="secondary" size="md" href="/resources/science">
                The science behind it
              </Button>
            </div>
          </div>

          <div
            ref={visualRef as React.RefObject<HTMLDivElement>}
            className="features-section__placeholder"
          />

        </div>
      </div>
    </section>
  );
}
