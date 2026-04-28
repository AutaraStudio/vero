'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Button from '@/components/ui/Button';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import type { ThemeVariant } from '@/lib/theme';
import './StickySteps.css';

export interface StickyStep {
  eyebrow: string;
  headline: string;
  body: string;
  imageSrc?: string;
  imageAlt?: string;
  visual?: React.ReactNode;
  /** Optional CTA rendered below the body */
  ctaLabel?: string;
  ctaHref?: string;
}

interface StickyStepsProps {
  steps: StickyStep[];
  theme?: ThemeVariant;
  accentSwatch?: string;
}

/**
 * Scroll-driven feature section with sticky visuals on the right.
 *
 * Structure (must match the CSS):
 *   <section .sticky-steps>
 *     <div .sticky-steps__container>
 *       <div .sticky-steps__collection>     ← position: relative
 *         <div .sticky-steps__list>
 *           <div .sticky-steps__item>       ← natural-height row
 *             <div .sticky-steps__text>     ← anchor for ScrollTrigger
 *             <div .sticky-steps__media>    ← position: absolute (over right
 *                                              half of the COLLECTION, not item)
 *               <div .sticky-steps__sticky> ← min-height: 100vh + sticky
 *                 <div .sticky-steps__visual>
 *
 * All items' media slots overlay each other in the same right-half spot.
 * Opacity transitions controlled by `data-sticky-steps-status` swap which
 * one is visible.
 */
export function StickySteps({
  steps,
  theme = 'brand-purple',
  accentSwatch = 'var(--swatch--purple-500)',
}: StickyStepsProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const anchorRefs  = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const triggers: ScrollTrigger[] = [];

    anchorRefs.current.forEach((anchor, index) => {
      if (!anchor) return;
      const t = ScrollTrigger.create({
        trigger: anchor,
        start: 'center center',
        onEnter:     () => setActiveIndex(index),
        onEnterBack: () => setActiveIndex(index),
      });
      triggers.push(t);
    });

    setActiveIndex(0);

    return () => {
      triggers.forEach((t) => t.kill());
    };
  }, [steps.length]);

  return (
    <section
      className="sticky-steps"
      data-theme={theme}
      style={{ '--sticky-steps-accent': accentSwatch } as React.CSSProperties}
    >
      <div className="sticky-steps__container">
        <div className="sticky-steps__collection">
          <div className="sticky-steps__list">
            {steps.map((step, index) => {
              const isActive = index === activeIndex;
              const isBefore = index < activeIndex;
              const status = isActive ? 'active' : isBefore ? 'before' : 'after';

              return (
                <div
                  key={index}
                  className="sticky-steps__item"
                  data-sticky-steps-status={status}
                >
                  <div
                    ref={(el) => { anchorRefs.current[index] = el; }}
                    className="sticky-steps__text"
                  >
                    <span className="sticky-steps__eyebrow section-label">{step.eyebrow}</span>
                    <h2 className="sticky-steps__headline text-h2 text-balance max-ch-15">
                      {step.headline}
                    </h2>
                    <p className="sticky-steps__body text-body--lg max-ch-40 leading--snug">
                      {step.body}
                    </p>
                    {step.ctaLabel && step.ctaHref && (
                      <div className="sticky-steps__cta">
                        <Button variant="primary" href={step.ctaHref}>
                          {step.ctaLabel}
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="sticky-steps__media">
                    <div className="sticky-steps__sticky">
                      <div className="sticky-steps__visual">
                        {step.visual ? (
                          step.visual
                        ) : step.imageSrc ? (
                          <Image
                            src={step.imageSrc}
                            alt={step.imageAlt ?? ''}
                            fill
                            sizes="(max-width: 991px) 100vw, 50vw"
                            className="sticky-steps__image"
                          />
                        ) : (
                          <div className="sticky-steps__placeholder" aria-hidden="true" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
