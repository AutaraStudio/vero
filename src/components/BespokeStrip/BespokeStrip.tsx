'use client';

import { useEffect, useRef } from 'react';
import Button from '@/components/ui/Button';
import { gsap } from '@/lib/gsap';
import { useTextReveal } from '@/hooks/useTextReveal';
import { useFadeUp } from '@/hooks/useFadeUp';
import type { ThemeVariant } from '@/lib/theme';
import './BespokeStrip.css';

interface Props {
  heading: string;
  body?: string;
  ctaLabel: string;
  ctaHref: string;
  theme?: ThemeVariant;
  /**
   * Optional supporting image. When provided, the card switches to a
   * 2-column layout (text left, image right) and the brand-shape fan is
   * suppressed. When omitted, the card uses the centred text + fan layout.
   *
   * Used on assessment detail pages where the doc calls for an image of
   * the Tazio solution alongside the bespoke handoff copy.
   */
  image?: { src: string; alt: string };
}

// Same oval path used by CheckoutFan / BrandShapes — keeps brand language consistent.
const OVAL =
  'M179.706 0C110.336 0 54.198 21.485 23.683 65.807C-48.912 171.251 50.983 366.022 246.806 500.839C360.314 578.987 481.134 619.838 576.794 619.838C646.163 619.838 702.303 598.351 732.818 554.03C805.412 448.586 705.516 253.817 509.694 118.998C396.184 40.851 275.364 0 179.706 0Z';

// Three shapes that fan out from the bottom-right corner of the inner card.
const FAN = [
  { colour: 'var(--swatch--green-500)',  finalRotation: 30  },
  { colour: 'var(--swatch--blue-500)',   finalRotation: 0   },
  { colour: 'var(--swatch--yellow-500)', finalRotation: -30 },
];

/**
 * Brand-shape CTA strip — deep-purple peak card with a three-shape fan
 * anchored to the bottom-right corner. Used on /pricing and on assessment
 * detail pages as the bespoke-solutions handoff.
 */
export default function BespokeStrip({
  heading,
  body,
  ctaLabel,
  ctaHref,
  theme = 'brand-purple',
  image,
}: Props) {
  const headingRef = useTextReveal();
  const bodyRef    = useFadeUp({ delay: 0.2, duration: 0.6, y: 16 });
  const ctaRef     = useFadeUp({ delay: 0.35, duration: 0.5, y: 16 });
  const imageRef   = useFadeUp({ delay: 0.15, duration: 0.7, y: 24 });
  const fanRef     = useRef<HTMLDivElement>(null);

  const hasImage = Boolean(image?.src);

  useEffect(() => {
    /* Only animate the fan when there's no image (image variant suppresses it). */
    if (hasImage) return;

    const el = fanRef.current;
    if (!el) return;
    const shapes = el.querySelectorAll('.bespoke-fan__shape');
    if (shapes.length === 0) return;

    gsap.set(shapes, { rotation: 0, opacity: 0 });

    const tl = gsap.timeline({
      scrollTrigger: { trigger: el, start: 'top 90%', once: true },
    });

    FAN.forEach((shape, i) => {
      tl.to(
        shapes[i],
        {
          rotation: shape.finalRotation,
          opacity: 1,
          duration: 0.9,
          ease: 'power3.out',
        },
        i * 0.15,
      );
    });

    return () => { tl.kill(); };
  }, [hasImage]);

  return (
    <section data-theme={theme} className="pricing-bespoke section">
      <div className="container">
        {/*
          Inner card is the deep-purple block. Setting data-theme="brand-purple-deep"
          here makes every semantic token inside the card resolve to its deep-purple
          values (white text, yellow CTA, etc) without affecting the surrounding section.
        */}
        <div
          className={`pricing-bespoke__card${hasImage ? ' pricing-bespoke__card--with-image' : ''}`}
          data-theme="brand-purple-deep"
        >
          <div className="pricing-bespoke__inner">

            <div className="pricing-bespoke__text stack--md">
              <h2
                ref={headingRef as React.RefObject<HTMLHeadingElement>}
                data-animate=""
                className="text-h2 text-balance max-ch-30 color--primary"
              >
                {heading}
              </h2>
              {body && (
                <p
                  ref={bodyRef as React.RefObject<HTMLParagraphElement>}
                  data-animate=""
                  className="text-body--lg color--secondary leading--snug max-ch-50"
                >
                  {body}
                </p>
              )}
              <div ref={ctaRef as React.RefObject<HTMLDivElement>} data-animate="" className="pricing-bespoke__cta">
                <Button variant="primary" size="lg" href={ctaHref}>
                  {ctaLabel}
                </Button>
              </div>
            </div>

            {hasImage && image && (
              <div
                ref={imageRef as React.RefObject<HTMLDivElement>}
                data-animate=""
                className="pricing-bespoke__visual"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={image.src}
                  alt={image.alt}
                  className="pricing-bespoke__image"
                  loading="lazy"
                />
              </div>
            )}

          </div>

          {/* Brand-shape fan is only used in the no-image (centred) variant. */}
          {!hasImage && (
            <div ref={fanRef} className="bespoke-fan" aria-hidden="true">
              {FAN.map(({ colour }, i) => (
                <svg
                  key={i}
                  className="bespoke-fan__shape"
                  viewBox="0 0 757 620"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  style={{ color: colour }}
                >
                  <path d={OVAL} fill="currentColor" />
                </svg>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
