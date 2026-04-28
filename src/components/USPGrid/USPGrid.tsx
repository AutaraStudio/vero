'use client';

import Button from '@/components/ui/Button';
import { useFadeUp } from '@/hooks/useFadeUp';
import { useTextReveal } from '@/hooks/useTextReveal';
import type { ThemeVariant } from '@/lib/theme';
import './USPGrid.css';

export interface USP {
  label: string;
  body?: string;
  imageUrl?: string;
  imageAlt?: string;
}

interface Props {
  eyebrow?: string;
  heading: string;
  subheading?: string;
  usps: USP[];
  ctaLabel?: string;
  ctaHref?: string;
  theme?: ThemeVariant;
}

export default function USPGrid({
  eyebrow,
  heading,
  subheading,
  usps,
  ctaLabel,
  ctaHref,
  theme = 'dark',
}: Props) {
  const labelRef   = useFadeUp({ delay: 0,    duration: 0.5, y: 12 });
  const headingRef = useTextReveal({ delay: 0.05 });
  const introRef   = useFadeUp({ delay: 0.2,  duration: 0.6, y: 16 });
  const gridRef    = useFadeUp({
    selector: '.usp-grid__card',
    stagger: 0.08,
    duration: 0.6,
    y: 24,
  });
  const ctaRef     = useFadeUp({ delay: 0.2, duration: 0.5, y: 16 });

  if (!usps?.length) return null;

  return (
    <section data-theme={theme} className="usp-grid section">
      <div className="container">

        {/* ── Header ──────────────────────────────────────── */}
        <div className="usp-grid__header stack--md">
          {eyebrow && (
            <span
              ref={labelRef as React.RefObject<HTMLSpanElement>}
              data-animate=""
              className="section-label"
            >
              {eyebrow}
            </span>
          )}
          <h2
            ref={headingRef as React.RefObject<HTMLHeadingElement>}
            data-animate=""
            className="section-heading"
          >
            {heading}
          </h2>
          {subheading && (
            <p
              ref={introRef as React.RefObject<HTMLParagraphElement>}
              data-animate=""
              className="section-intro text-body--lg leading--snug"
            >
              {subheading}
            </p>
          )}
        </div>

        {/* ── Grid ────────────────────────────────────────── */}
        <div
          ref={gridRef as React.RefObject<HTMLDivElement>}
          className="usp-grid__cards"
        >
          {usps.map((usp, i) => (
            <article key={`${usp.label}-${i}`} className="usp-grid__card">
              {usp.imageUrl ? (
                <div className="usp-grid__card-visual">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={usp.imageUrl}
                    alt={usp.imageAlt ?? ''}
                    className="usp-grid__card-image"
                    loading="lazy"
                  />
                </div>
              ) : (
                <div className="usp-grid__card-visual usp-grid__card-visual--placeholder" aria-hidden="true">
                  <span className="usp-grid__card-index">0{i + 1}</span>
                </div>
              )}

              <div className="usp-grid__card-body">
                <h3 className="usp-grid__card-title text-h5 color--primary">{usp.label}</h3>
                {usp.body && (
                  <p className="usp-grid__card-text text-body--md leading--snug color--secondary">
                    {usp.body}
                  </p>
                )}
              </div>
            </article>
          ))}
        </div>

        {/* ── Optional CTA ────────────────────────────────── */}
        {ctaLabel && ctaHref && (
          <div
            ref={ctaRef as React.RefObject<HTMLDivElement>}
            data-animate=""
            className="usp-grid__cta"
          >
            <Button variant="secondary" href={ctaHref}>
              {ctaLabel}
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
