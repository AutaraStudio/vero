'use client';

import { useRef, useEffect } from 'react';
import Image from 'next/image';
import { useTextReveal } from '@/hooks/useTextReveal';
import { useFadeUp } from '@/hooks/useFadeUp';
import { initGSAPSlider } from './sliderAnimations';
import type { ThemeVariant } from '@/lib/theme';
import './FeaturedSlider.css';

interface UspItem {
  label: string;
  body?: string;
  imageUrl?: string;
  imageAlt?: string;
}

interface FeaturedSliderProps {
  sectionLabel?: string;
  heading?: string;
  intro?: string;
  usps: UspItem[];
  theme?: ThemeVariant;
}

export default function FeaturedSlider({ sectionLabel, heading, intro, usps, theme = 'brand-purple' }: FeaturedSliderProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  const labelRef   = useFadeUp({ delay: 0, duration: 0.5, y: 16 });
  const headingRef = useTextReveal({ delay: 0.1 });
  const introRef   = useFadeUp({ delay: 0.2, duration: 0.6, y: 16 });

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    return initGSAPSlider(el);
  }, []);

  if (!usps.length) return null;

  return (
    <section className="usp-slider-section" data-theme={theme}>
      <div className="container">
        <div className="usp-slider__header stack--md">
          {sectionLabel && (
            <span
              ref={labelRef as React.RefObject<HTMLSpanElement>}
              data-animate=""
              className="section-label"
            >
              {sectionLabel}
            </span>
          )}
          {heading && (
            <h2
              ref={headingRef as React.RefObject<HTMLHeadingElement>}
              data-animate=""
              className="section-heading"
            >
              {heading}
            </h2>
          )}
          {intro && (
            <p
              ref={introRef as React.RefObject<HTMLParagraphElement>}
              data-animate=""
              className="section-intro text-body--lg leading--snug"
            >
              {intro}
            </p>
          )}
        </div>
      </div>

      <div
        ref={rootRef}
        aria-label="Features"
        data-gsap-slider-init=""
        role="region"
        aria-roledescription="carousel"
        className="gsap-slider"
      >
        <div data-gsap-slider-collection="" className="gsap-slider__collection">
          <div data-gsap-slider-list="" className="gsap-slider__list">
            {usps.map((usp, i) => (
              <div key={i} data-gsap-slider-item="" className="gsap-slider__item">
                <div className="usp-card">
                  <div className="usp-card__image">
                    {usp.imageUrl && (
                      <Image
                        src={usp.imageUrl}
                        alt={usp.imageAlt ?? usp.label}
                        fill
                        style={{ objectFit: 'cover' }}
                        sizes="(max-width: 767px) 90vw, (max-width: 991px) 50vw, 40vw"
                      />
                    )}
                  </div>
                  <div className="usp-card__content stack--sm">
                    <h3 className="text-h5 color--primary">{usp.label}</h3>
                    {usp.body && (
                      <p className="text-body--sm color--secondary leading--relaxed">{usp.body}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div data-gsap-slider-controls="" className="gsap-slider__controls flex gap--sm">
          <button data-gsap-slider-control="prev" className="gsap-slider__control text-body--sm font--medium">Prev</button>
          <button data-gsap-slider-control="next" className="gsap-slider__control text-body--sm font--medium">Next</button>
        </div>
      </div>
    </section>
  );
}
