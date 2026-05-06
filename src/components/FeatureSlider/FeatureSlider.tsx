'use client';

import { useRef, useEffect } from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import { useTextReveal } from '@/hooks/useTextReveal';
import { useFadeUp } from '@/hooks/useFadeUp';
import { initGSAPSlider } from './sliderAnimations';
import type { ThemeVariant } from '@/lib/theme';
import './FeatureSlider.css';

export interface FeatureSliderItem {
  title: string;
  body: string;
  imageUrl?: string;
  imageAlt?: string;
  /** Optional internal link — when provided, the card becomes clickable. */
  href?: string;
  /** Optional CTA label shown at the bottom of clickable cards. */
  ctaLabel?: string;
}

const DEFAULT_ITEMS: FeatureSliderItem[] = [
  { title: 'Skills-based assessments',  body: 'Designed using the latest academic research, Vero Assess includes trait-level validated personality tests, situational judgment tests, aptitude assessments and values-based assessments.' },
  { title: 'Tailored to specific roles', body: 'Choose from 10 job families, target specific roles within them and plug a package of ready-to-go and relevant assessments into your process.' },
  { title: 'Integrated into your systems', body: 'Compatible with individual tech architecture and capable of integrating with ATS software, Vero Assess can be implemented quickly and cost effectively.' },
  { title: 'Secure, compliant, accessible', body: 'Vero Assess meets the highest standards including ISO27001, ISO9001, Cyber Essentials Plus Certified and WCAG 2.2 AA, keeping data safe and giving everyone the opportunity to perform.' },
  { title: 'In-depth reporting', body: 'A simple dashboard gives assessors an at-a-glance view of each candidate’s progress including a percentage best-fit score, while individual profiles provide detailed performance data.' },
  { title: 'Powered by Tazio', body: 'Based on the same tech as our recruitment and career development platform, Vero Assess offers candidates and assessors dedicated portals, built for ease of use and accessibility.' },
  { title: 'Shaped around your needs', body: 'Buy a package that meets your demands, from smaller one-off campaigns to annual high volume recruitment campaigns across multiple roles.' },
];

interface FeatureSliderProps {
  items?: FeatureSliderItem[];
  eyebrow?: string;
  heading?: string;
  intro?: string;
  ctaLabel?: string;
  ctaHref?: string;
  theme?: ThemeVariant;
}

export default function FeatureSlider({
  items,
  eyebrow   = 'Why Vero Assess',
  heading   = 'Better experiences. Better hires.',
  intro     = 'Vero Assess puts a safe, accessible and scientifically-backed solution at the heart of your recruitment campaign.',
  ctaLabel,
  ctaHref,
  theme = 'brand-purple',
}: FeatureSliderProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  const labelRef   = useFadeUp({ delay: 0,    duration: 0.5, y: 16 });
  const headingRef = useTextReveal({ delay: 0.1 });
  const introRef   = useFadeUp({ delay: 0.2,  duration: 0.6, y: 16 });
  const ctaRef     = useFadeUp({ delay: 0.35, duration: 0.5, y: 16 });

  const resolvedItems = items && items.length > 0 ? items : DEFAULT_ITEMS;

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const cleanup = initGSAPSlider(el);
    return cleanup;
  }, []);

  return (
    <section className="feature-slider" data-theme={theme}>
      <div className="container">
        <div className="feature-slider__header stack--md">
          {eyebrow && (
            <span ref={labelRef as React.RefObject<HTMLSpanElement>} className="section-label">
              {eyebrow}
            </span>
          )}
          {heading && (
            <h2 ref={headingRef as React.RefObject<HTMLHeadingElement>} className="section-heading">
              {heading}
            </h2>
          )}
          {intro && (
            <p ref={introRef as React.RefObject<HTMLParagraphElement>} className="section-intro text-body--lg leading--snug">
              {intro}
            </p>
          )}
        </div>
      </div>

      <div
        ref={rootRef}
        aria-label={heading ?? 'Features'}
        data-gsap-slider-init=""
        role="region"
        aria-roledescription="carousel"
        className="gsap-slider"
      >
        <div data-gsap-slider-collection="" className="gsap-slider__collection">
          <div data-gsap-slider-list="" className="gsap-slider__list">
            {resolvedItems.map((item, i) => {
              const cardInner = (
                <>
                  {item.imageUrl ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={item.imageUrl}
                      alt={item.imageAlt ?? ''}
                      className="slider-card__image slider-card__image--photo"
                      loading="lazy"
                    />
                  ) : (
                    <div className="slider-card__image" aria-hidden="true" />
                  )}
                  <div className="slider-card__content stack--sm">
                    <h3 className="text-h5 color--primary">{item.title}</h3>
                    <p className="text-body--sm color--secondary leading--relaxed">{item.body}</p>
                    {item.href && (
                      <span className="slider-card__cta" aria-hidden="true">
                        {item.ctaLabel ?? 'Learn more'}
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                          <path
                            d="M3 8h10m0 0L8.5 3.5M13 8l-4.5 4.5"
                            stroke="currentColor"
                            strokeWidth="1.6"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </span>
                    )}
                  </div>
                </>
              );

              return (
                <div key={`${item.title}-${i}`} data-gsap-slider-item="" className="gsap-slider__item">
                  {item.href ? (
                    <Link href={item.href} className="slider-card slider-card--link">
                      {cardInner}
                    </Link>
                  ) : (
                    <div className="slider-card">{cardInner}</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div data-gsap-slider-controls="" className="gsap-slider__controls flex gap--sm">
          <button data-gsap-slider-control="prev" className="gsap-slider__control text-body--sm font--medium">Prev</button>
          <button data-gsap-slider-control="next" className="gsap-slider__control text-body--sm font--medium">Next</button>
        </div>
      </div>

      {ctaLabel && ctaHref && (
        <div className="container">
          <div
            ref={ctaRef as React.RefObject<HTMLDivElement>}
            data-animate=""
            className="feature-slider__cta"
          >
            <Button variant="secondary" href={ctaHref}>
              {ctaLabel}
            </Button>
          </div>
        </div>
      )}
    </section>
  );
}
