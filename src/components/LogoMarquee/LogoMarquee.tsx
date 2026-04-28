'use client';

import { useEffect, useRef } from 'react';
import { useFadeUp } from '@/hooks/useFadeUp';
import type { ThemeVariant } from '@/lib/theme';
import { initMarquee } from './marqueeAnimation';
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
  const marqueeInitRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const el = trackRef.current as HTMLElement | null;
    if (!el) return;
    const cleanup = initMarquee(el, { speed, direction, scrollSpeed: 6 });
    marqueeInitRef.current = cleanup;
    return () => {
      marqueeInitRef.current?.();
      marqueeInitRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [speed, direction, logos.length]);

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
        >
          <div data-marquee-scroll="" className="logo-marquee__scroll">
            <div data-marquee-collection="" className="logo-marquee__collection">
              {renderable.map(renderItem)}
            </div>
          </div>
        </div>
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
      >
        <div data-marquee-scroll="" className="logo-marquee__scroll">
          <div data-marquee-collection="" className="logo-marquee__collection">
            {renderable.map(renderItem)}
          </div>
        </div>
      </div>
    </section>
  );
}
