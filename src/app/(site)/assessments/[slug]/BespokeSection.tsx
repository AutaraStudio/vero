'use client';

import Image from 'next/image';
import Button from '@/components/ui/Button';
import { useTextReveal } from '@/hooks/useTextReveal';
import { useFadeUp } from '@/hooks/useFadeUp';
import type { ThemeVariant } from '@/lib/theme';

interface BespokeSectionProps {
  heading: string;
  body: string;
  ctaLabel: string;
  imageUrl?: string;
  theme?: ThemeVariant;
}

export default function BespokeSection({
  heading,
  body,
  ctaLabel,
  imageUrl,
  theme = 'brand-purple',
}: BespokeSectionProps) {
  const labelRef   = useFadeUp({ delay: 0, duration: 0.5, y: 16 });
  const headingRef = useTextReveal();
  const bodyRef    = useFadeUp({ delay: 0.2, duration: 0.6, y: 16 });
  const ctaRef     = useFadeUp({ delay: 0.35, duration: 0.5, y: 16 });
  const imageRef   = useFadeUp({ delay: 0.1, duration: 0.8, y: 32 });

  return (
    <section data-theme={theme} className="bespoke-section section border--bottom">
      <div className="container">
        <div className="bespoke-section__inner">
          <div className="bespoke-section__text">
            <span
              ref={labelRef as React.RefObject<HTMLSpanElement>}
              data-animate=""
              className="section-label"
            >
              Bespoke solutions
            </span>

            <h2
              ref={headingRef as React.RefObject<HTMLHeadingElement>}
              data-animate=""
              className="text-h2 text-balance"
            >
              {heading}
            </h2>

            <p
              ref={bodyRef as React.RefObject<HTMLParagraphElement>}
              data-animate=""
              className="text-body--lg leading--snug max-ch-40 color--secondary"
            >
              {body}
            </p>

            <div
              ref={ctaRef as React.RefObject<HTMLDivElement>}
              data-animate=""
            >
              <Button variant="primary" size="lg" href="/contact">
                {ctaLabel}
              </Button>
            </div>
          </div>

          <div
            ref={imageRef as React.RefObject<HTMLDivElement>}
            data-animate=""
            className="bespoke-section__visual"
          >
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt=""
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="bespoke-section__image"
              />
            ) : (
              <div className="bespoke-section__placeholder" />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
