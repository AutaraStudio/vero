'use client';

import Button from '@/components/ui/Button';
import { useTextReveal } from '@/hooks/useTextReveal';
import { useFadeUp } from '@/hooks/useFadeUp';

interface CategoryHeroProps {
  heroHeadline: string;
  heroIntroCopy?: string;
  keyDimensionsAssessed?: string;
  slug: string;
}

export default function CategoryHero({
  heroHeadline,
  heroIntroCopy,
  keyDimensionsAssessed,
  slug,
}: CategoryHeroProps) {
  const badgeRef = useFadeUp({ scroll: false, delay: 0.1, duration: 0.5, y: 16 });
  const titleRef = useTextReveal({ scroll: false, delay: 0.3 });
  const introRef = useFadeUp({ scroll: false, delay: 0.6, duration: 0.6, y: 16 });
  const pillsRef = useFadeUp({ scroll: false, delay: 0.75, duration: 0.5, y: 16 });
  const ctaRef = useFadeUp({ scroll: false, delay: 0.9, duration: 0.5, y: 16 });
  const visualRef = useFadeUp({ delay: 0, duration: 0.8, y: 32 });

  const dimensions = keyDimensionsAssessed
    ? keyDimensionsAssessed.split(',').map((d) => d.trim()).filter(Boolean)
    : [];

  return (
    <section className="category-hero section--flush">
      <div className="container">
        <div className="bordered-section category-hero__header">
          <div className="category-hero__header-inner">

            <div className="category-hero__text">
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
                  className="text-body--lg leading--snug category-hero__intro"
                >
                  {heroIntroCopy}
                </p>
              )}

              {dimensions.length > 0 && (
                <div
                  ref={pillsRef as React.RefObject<HTMLDivElement>}
                  data-animate=""
                  className="category-hero__pills"
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
                className="category-hero__cta"
              >
                <Button variant="primary" size="lg" href={`/get-started?category=${slug}`}>
                  Get started
                </Button>
              </div>
            </div>

            <div
              ref={visualRef as React.RefObject<HTMLDivElement>}
              className="category-hero__visual"
            >
              <div className="category-hero__placeholder" />
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
