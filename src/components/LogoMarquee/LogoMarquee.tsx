'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useFadeUp } from '@/hooks/useFadeUp';
import type { ThemeVariant } from '@/lib/theme';
import { initMarquee, type MarqueeControls } from './marqueeAnimation';
import './LogoMarquee.css';

export interface PartnerLogo {
  name: string;
  logoUrl?: string;
  logoMimeType?: string;
}

interface Props {
  label?: string;
  logos: PartnerLogo[];
  /** 'left' or 'right'. Default: 'left' */
  direction?: 'left' | 'right';
  /** Marquee speed multiplier — lower = faster. Default: 25 */
  speed?: number;
  theme?: ThemeVariant;
  /**
   * Layout variant.
   *  - 'section' (default): renders as a full-bleed <section> with section padding
   *  - 'inline':  renders as a contained <div> that fits inside a parent container
   *               (no section wrapper, no full-bleed track)
   */
  variant?: 'section' | 'inline';
  /**
   * When true, entries without an uploaded `logoUrl` render as the company
   * name text instead of being skipped. Useful while the content team uploads
   * SVGs — keeps the section visible. Default: false.
   */
  showFallback?: boolean;
}

/**
 * Reusable logo marquee strip — auto-scrolling, scroll-direction aware.
 * Logos come from siteSettings.partnerLogos so the same set renders
 * everywhere this is dropped in.
 */
export default function LogoMarquee({
  label,
  logos,
  direction = 'left',
  speed = 25,
  theme = 'brand-purple',
  variant = 'section',
  showFallback = false,
}: Props) {
  const labelRef = useFadeUp({ delay: 0,    duration: 0.5, y: 12 });
  const trackRef = useFadeUp({ delay: 0.15, duration: 0.6, y: 16 });

  /* Marquee init runs on the same node as the trackRef. We compose by reading
     trackRef.current after mount instead of trying to merge two refs. */
  const marqueeRef = useRef<MarqueeControls | null>(null);
  /* WCAG 2.2.2 — auto-playing motion over 5s must be pauseable. The marquee
     loops forever, so we expose a user-controlled pause/play button and
     additionally pause on hover/focus-within for a smoother UX. */
  const [paused, setPaused] = useState(false);
  /* Tracks pauses caused by hover/focus so they don't override a user's
     explicit click on the toggle. */
  const autoPausedRef = useRef(false);

  useEffect(() => {
    const el = trackRef.current as HTMLElement | null;
    if (!el) return;
    const controls = initMarquee(el, { speed, direction, scrollSpeed: 6 });
    marqueeRef.current = controls;
    return () => {
      controls.destroy();
      marqueeRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [speed, direction, logos.length]);

  const togglePaused = useCallback(() => {
    const controls = marqueeRef.current;
    if (!controls) return;
    /* User clicking the toggle is the source of truth — clear any auto-pause
       state so a subsequent mouseleave / blur doesn't override the choice. */
    autoPausedRef.current = false;
    if (paused) {
      controls.play();
      setPaused(false);
    } else {
      controls.pause();
      setPaused(true);
    }
  }, [paused]);

  const handleAutoPause = useCallback(() => {
    if (paused) return; // user already paused — leave it
    marqueeRef.current?.pause();
    autoPausedRef.current = true;
  }, [paused]);

  const handleAutoResume = useCallback(() => {
    if (!autoPausedRef.current) return;
    marqueeRef.current?.play();
    autoPausedRef.current = false;
  }, []);

  /* When showFallback is true, keep entries even if they don't have a logo file
     — we'll render the company name as text. Otherwise filter them out. */
  const renderable = (logos ?? []).filter((l) =>
    showFallback ? Boolean(l.logoUrl || l.name) : Boolean(l.logoUrl),
  );
  if (renderable.length === 0) return null;

  /* Render either an <img> (when logoUrl is present) or the company name as
     a text fallback when showFallback is enabled. */
  const renderItem = (logo: PartnerLogo, i: number) => (
    <div key={`${logo.name}-${i}`} className="logo-marquee__item">
      {logo.logoUrl ? (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={logo.logoUrl}
          alt={logo.name}
          className="logo-marquee__logo"
          loading="lazy"
          draggable={false}
        />
      ) : (
        <span className="logo-marquee__name text-h5 color--secondary">
          {logo.name}
        </span>
      )}
    </div>
  );

  const isInline = variant === 'inline';

  const pauseButton = (
    <button
      type="button"
      onClick={togglePaused}
      aria-pressed={paused}
      aria-label={paused ? 'Play logo animation' : 'Pause logo animation'}
      className="logo-marquee__pause"
    >
      {paused ? (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <path d="M3 1.5v11l9-5.5-9-5.5Z" fill="currentColor" />
        </svg>
      ) : (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <rect x="3" y="2" width="3" height="10" fill="currentColor" />
          <rect x="8" y="2" width="3" height="10" fill="currentColor" />
        </svg>
      )}
    </button>
  );

  /* Inline variant — no section wrapper, fits inside the parent's container.
     Used in places like the hero, where the marquee should respect the
     surrounding layout's max-width instead of going full-bleed. */
  if (isInline) {
    return (
      <div data-theme={theme} className="logo-marquee logo-marquee--inline">
        {label && (
          <span
            ref={labelRef as React.RefObject<HTMLSpanElement>}
            data-animate=""
            className="logo-marquee__label text-label--sm color--tertiary"
          >
            {label}
          </span>
        )}

        <div
          ref={trackRef as React.RefObject<HTMLDivElement>}
          data-animate=""
          data-marquee=""
          data-marquee-status="normal"
          className="logo-marquee__track"
          aria-label="Trusted partners"
          onMouseEnter={handleAutoPause}
          onMouseLeave={handleAutoResume}
          onFocus={handleAutoPause}
          onBlur={handleAutoResume}
        >
          <div data-marquee-scroll="" className="logo-marquee__scroll">
            <div data-marquee-collection="" className="logo-marquee__collection">
              {renderable.map(renderItem)}
            </div>
          </div>
        </div>
        <div className="logo-marquee__controls">{pauseButton}</div>
      </div>
    );
  }

  /* Default section variant — full-bleed band with section padding */
  return (
    <section data-theme={theme} className="logo-marquee section">
      {label && (
        <div className="container">
          <span
            ref={labelRef as React.RefObject<HTMLSpanElement>}
            data-animate=""
            className="logo-marquee__label text-label--sm color--tertiary"
          >
            {label}
          </span>
        </div>
      )}

      <div
        ref={trackRef as React.RefObject<HTMLDivElement>}
        data-animate=""
        data-marquee=""
        data-marquee-status="normal"
        className="logo-marquee__track"
        aria-label="Trusted partners"
        onMouseEnter={handleAutoPause}
        onMouseLeave={handleAutoResume}
        onFocus={handleAutoPause}
        onBlur={handleAutoResume}
      >
        <div data-marquee-scroll="" className="logo-marquee__scroll">
          <div data-marquee-collection="" className="logo-marquee__collection">
            {renderable.map(renderItem)}
          </div>
        </div>
      </div>
      <div className="container">
        <div className="logo-marquee__controls">{pauseButton}</div>
      </div>
    </section>
  );
}
