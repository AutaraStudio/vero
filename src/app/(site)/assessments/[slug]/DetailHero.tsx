'use client';

import './category.css';
import Image from 'next/image';
import Button from '@/components/ui/Button';
import BrandShapes from '@/components/BrandShapes/BrandShapes';
import { useTextReveal } from '@/hooks/useTextReveal';
import { useFadeUp } from '@/hooks/useFadeUp';
import type { ThemeVariant } from '@/lib/theme';

interface DetailHeroProps {
  heroHeadline: string;
  heroIntroCopy?: string;
  keyDimensionsAssessed?: string;
  slug: string;
  heroImageUrl?: string;
  theme?: ThemeVariant;
}

export default function DetailHero({
  heroHeadline,
  heroIntroCopy,
  keyDimensionsAssessed,
  slug,
  heroImageUrl,
  theme = 'brand-purple',
}: DetailHeroProps) {
  const badgeRef  = useFadeUp({ scroll: false, delay: 0.1, duration: 0.5, y: 16 });
  const titleRef  = useTextReveal({ scroll: false, delay: 0.3 });
  const introRef  = useFadeUp({ scroll: false, delay: 0.6, duration: 0.6, y: 16 });
  const tagsRef   = useFadeUp({ scroll: false, delay: 0.75, duration: 0.5, y: 16 });
  const ctaRef    = useFadeUp({ scroll: false, delay: 0.9, duration: 0.5, y: 16 });
  const visualRef = useFadeUp({ delay: 0, duration: 0.8, y: 32 });

  const dimensions = keyDimensionsAssessed
    ? keyDimensionsAssessed.split(',').map((d) => d.trim()).filter(Boolean)
    : [];

  return (
    <section className="detail-hero section--flush" data-theme={theme}>
      <div className="container">
        <div className="detail-hero__inner">

          {/* Left — text column */}
          <div className="detail-hero__text">
            <span
              ref={badgeRef as React.RefObject<HTMLSpanElement>}
              data-animate=""
              className="section-label"
            >
              Assessment
            </span>

            <h1
              ref={titleRef as React.RefObject<HTMLHeadingElement>}
              data-animate=""
              className="text-h1 text-balance"
            >
              {heroHeadline}
            </h1>

            {heroIntroCopy && (
              <p
                ref={introRef as React.RefObject<HTMLParagraphElement>}
                data-animate=""
                className="text-body--lg leading--snug detail-hero__intro"
              >
                {heroIntroCopy}
              </p>
            )}

            {dimensions.length > 0 && (
              <div
                ref={tagsRef as React.RefObject<HTMLDivElement>}
                data-animate=""
                className="detail-hero__tags"
              >
                {dimensions.map((dim) => (
                  <span key={dim} className="section-label">
                    {dim}
                  </span>
                ))}
              </div>
            )}

            <div
              ref={ctaRef as React.RefObject<HTMLDivElement>}
              data-animate=""
              className="detail-hero__cta"
            >
              <Button variant="primary" size="lg" href={`/get-started?category=${slug}`}>
                Get started
              </Button>
            </div>
          </div>

          {/* Right — visual column */}
          <div
            ref={visualRef as React.RefObject<HTMLDivElement>}
            className="detail-hero__visual"
          >
            <div className="detail-hero__image-card">
              {heroImageUrl ? (
                <Image
                  src={heroImageUrl}
                  alt={heroHeadline}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="detail-hero__image"
                  priority
                />
              ) : (
                <div className="detail-hero__image-placeholder" />
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Decorative brand shapes — full section width, behind both columns */}
      <BrandShapes />
    </section>
  );
}
