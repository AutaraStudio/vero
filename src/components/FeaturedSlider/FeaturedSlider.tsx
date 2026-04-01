'use client';

import './FeaturedSlider.css';
import { useRef, useState, useEffect, useCallback } from 'react';
import { gsap } from '@/lib/gsap';
import { useTextReveal } from '@/hooks/useTextReveal';
import { useFadeUp } from '@/hooks/useFadeUp';

interface UspItem {
  label: string;
  body?: string;
}

interface FeaturedSliderProps {
  heading?: string;
  intro?: string;
  usps: UspItem[];
}

export default function FeaturedSlider({ heading, intro, usps }: FeaturedSliderProps) {
  const headingRef = useTextReveal({ delay: 0.05 });
  const introRef   = useFadeUp({ delay: 0.15, y: 16 });
  const navRef     = useFadeUp({ delay: 0.25, y: 16 });

  const [current, setCurrent] = useState(0);
  const slideRef    = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isPausedRef = useRef(false);
  const isAnimRef   = useRef(false);
  const currentRef  = useRef(0);   // mirrors state — readable inside intervals

  const total = usps.length;

  // Keep ref in sync
  currentRef.current = current;

  /* ── Transition to a new index ──────────────────────────── */
  const goTo = useCallback((next: number) => {
    if (isAnimRef.current || next === currentRef.current) return;
    const slide = slideRef.current;
    if (!slide) { setCurrent(next); return; }

    isAnimRef.current = true;
    gsap.to(slide, {
      opacity: 0,
      y: 10,
      duration: 0.2,
      ease: 'power2.in',
      onComplete: () => {
        setCurrent(next);
        gsap.fromTo(slide,
          { opacity: 0, y: -10 },
          {
            opacity: 1,
            y: 0,
            duration: 0.38,
            ease: 'vero.out',
            onComplete: () => { isAnimRef.current = false; },
          },
        );
      },
    });
  }, []);

  /* ── Auto-advance ───────────────────────────────────────── */
  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      if (!isPausedRef.current && !isAnimRef.current) {
        goTo((currentRef.current + 1) % total);
      }
    }, 5000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [total, goTo]);

  const handleNav = (index: number) => {
    // Reset timer on manual nav
    if (intervalRef.current) clearInterval(intervalRef.current);
    goTo(index);
    intervalRef.current = setInterval(() => {
      if (!isPausedRef.current && !isAnimRef.current) {
        goTo((currentRef.current + 1) % total);
      }
    }, 5000);
  };

  if (!usps.length) return null;

  const usp = usps[current];

  return (
    <section className="featured-slider" data-theme="dark">
      <div className="featured-slider__inner">

        {(heading || intro) && (
          <div className="featured-slider__header">
            {heading && (
              <h2
                ref={headingRef as React.Ref<HTMLHeadingElement>}
                data-animate=""
                className="featured-slider__heading section-heading"
              >
                {heading}
              </h2>
            )}
            {intro && (
              <p
                ref={introRef as React.Ref<HTMLParagraphElement>}
                data-animate=""
                className="featured-slider__intro section-intro"
              >
                {intro}
              </p>
            )}
          </div>
        )}

        <div
          className="featured-slider__stage"
          onMouseEnter={() => { isPausedRef.current = true; }}
          onMouseLeave={() => { isPausedRef.current = false; }}
        >
          <div ref={slideRef} className="featured-slider__slide">
            <span className="featured-slider__index">
              {String(current + 1).padStart(2, '0')}
            </span>
            <h3 className="featured-slider__label">{usp.label}</h3>
            {usp.body && (
              <p className="featured-slider__body">{usp.body}</p>
            )}
          </div>

          <nav
            ref={navRef as React.Ref<HTMLElement>}
            data-animate=""
            className="featured-slider__nav"
            aria-label="Feature navigation"
          >
            {usps.map((item, i) => (
              <button
                key={i}
                className={`featured-slider__nav-item${i === current ? ' is-active' : ''}`}
                aria-label={item.label}
                aria-current={i === current ? 'true' : undefined}
                onClick={() => handleNav(i)}
              >
                <span className="featured-slider__nav-num">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="featured-slider__nav-label">{item.label}</span>
                <span className="featured-slider__nav-bar" aria-hidden="true" />
              </button>
            ))}
          </nav>
        </div>

      </div>
    </section>
  );
}
