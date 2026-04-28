'use client';

import Button from '@/components/ui/Button';
import { useTextReveal } from '@/hooks/useTextReveal';
import { useFadeUp } from '@/hooks/useFadeUp';
import type { ThemeVariant } from '@/lib/theme';
import './HeroSplit.css';

interface HeroSplitProps {
  theme?: ThemeVariant;
  /** Optional pill badge above the headline (clickable if href provided) */
  badge?: { label: string; href?: string };
  /** Optional pill eyebrow (no link) — visually identical to a badge.
   *  Provide *either* badge or eyebrow, not both. */
  eyebrow?: string;
  headline: string;
  intro?: string;
  primaryCTA?: { label: string; href: string };
  secondaryCTA?: { label: string; href: string };
  /** Optional supporting image rendered in the right column */
  image?: { src: string; alt: string };
  /** Reverse the columns so image sits left, text right. Default false. */
  reverse?: boolean;

  /* ── Layout variants ─────────────────────────────────── */
  /**
   * Image height variant.
   *  - 'auto' (default): image renders at a 4:3 aspect ratio
   *  - 'viewport':       image fills the viewport height (minus nav + spacing
   *                      top and bottom), so it stretches from just below the
   *                      nav to just above the bottom of the viewport.
   */
  imageHeight?: 'auto' | 'viewport';
  /**
   * Vertical alignment of the text column. Default: 'center'.
   * Mostly noticeable when imageHeight: 'viewport' makes the column tall.
   */
  textAlign?: 'top' | 'center' | 'bottom';
  /**
   * Horizontal alignment of the text column's contents. Default: 'left'.
   *  - 'left':   left-aligned (badge, headline, body, CTAs all flush left)
   *  - 'center': centred horizontally within the text column
   */
  textJustify?: 'left' | 'center';

  /**
   * Optional pills rendered below the headline (used on assessment detail
   *  pages to show "Key dimensions assessed", etc.). Each entry can be a
   *  plain string (renders as a static pill) or { label, href } (clickable).
   */
  badges?: Array<string | { label: string; href?: string }>;
}

/**
 * Subpage hero — text-left, image-right (or reversed).
 * Use this for marketing subpages (How it works, About, Resources, etc.).
 * Use HeroCentred for the home page or full-bleed centred heroes.
 *
 * Variants:
 *   <HeroSplit ... />                                 ← 4:3 image, centred text
 *   <HeroSplit imageHeight="viewport" />              ← image fills viewport
 *   <HeroSplit textAlign="bottom" textJustify="left" /> ← bottom-left text
 *   <HeroSplit textAlign="center" textJustify="center" /> ← centred text
 *   <HeroSplit reverse />                             ← image-left, text-right
 */
export default function HeroSplit({
  theme = 'brand-purple',
  badge,
  eyebrow,
  headline,
  intro,
  primaryCTA,
  secondaryCTA,
  image,
  reverse = false,
  imageHeight = 'auto',
  textAlign = 'center',
  textJustify = 'left',
  badges,
}: HeroSplitProps) {
  const labelRef   = useFadeUp({ scroll: false, delay: 0.1, duration: 0.5, y: 12 });
  const headingRef = useTextReveal({ scroll: false, delay: 0.25 });
  const introRef   = useFadeUp({ scroll: false, delay: 0.55, duration: 0.6, y: 16 });
  const ctaRef     = useFadeUp({ scroll: false, delay: 0.7,  duration: 0.5, y: 16 });
  const mediaRef   = useFadeUp({ scroll: false, delay: 0.15, duration: 0.8, y: 24 });

  const classes = [
    'hero-split',
    reverse                     && 'is-reverse',
    imageHeight === 'viewport'  && 'hero-split--image-viewport',
    `hero-split--text-v-${textAlign}`,
    `hero-split--text-h-${textJustify}`,
  ].filter(Boolean).join(' ');

  return (
    <section className={classes} data-theme={theme}>
      <div className="hero-split__inner">
        <div className="hero-split__grid">

          {/* ── Text column ─────────────────────────────── */}
          <div className="hero-split__text">
            {badge && (
              badge.href ? (
                <a
                  ref={labelRef as React.Ref<HTMLAnchorElement>}
                  href={badge.href}
                  data-animate=""
                  className="hero-split__badge section-label"
                >
                  {badge.label}
                </a>
              ) : (
                <span
                  ref={labelRef as React.Ref<HTMLSpanElement>}
                  data-animate=""
                  className="hero-split__badge section-label"
                >
                  {badge.label}
                </span>
              )
            )}

            {!badge && eyebrow && (
              <span
                ref={labelRef as React.Ref<HTMLSpanElement>}
                data-animate=""
                className="hero-split__badge section-label"
              >
                {eyebrow}
              </span>
            )}

            <h1
              ref={headingRef as React.Ref<HTMLHeadingElement>}
              data-animate=""
              className="hero-split__title text-h1 text-balance max-ch-18"
            >
              {headline}
            </h1>

            {badges && badges.length > 0 && (
              <ul className="hero-split__badges" aria-label="Key dimensions">
                {badges.map((badgeItem, i) => {
                  const isString = typeof badgeItem === 'string';
                  const label = isString ? badgeItem : badgeItem.label;
                  const href  = isString ? undefined : badgeItem.href;
                  return (
                    <li key={`${label}-${i}`} className="hero-split__badges-item">
                      {href ? (
                        <a href={href} className="hero-split__pill section-label">
                          {label}
                        </a>
                      ) : (
                        <span className="hero-split__pill section-label">
                          {label}
                        </span>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}

            {intro && (
              <p
                ref={introRef as React.Ref<HTMLParagraphElement>}
                data-animate=""
                className="hero-split__intro text-body--lg leading--snug max-ch-50"
              >
                {intro}
              </p>
            )}

            {(primaryCTA || secondaryCTA) && (
              <div
                ref={ctaRef as React.Ref<HTMLDivElement>}
                data-animate=""
                className="hero-split__cta"
              >
                {primaryCTA && (
                  <Button variant="cta" href={primaryCTA.href}>
                    {primaryCTA.label}
                  </Button>
                )}
                {secondaryCTA && (
                  <Button variant="secondary" href={secondaryCTA.href}>
                    {secondaryCTA.label}
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* ── Image column ────────────────────────────── */}
          <div
            ref={mediaRef as React.Ref<HTMLDivElement>}
            data-animate=""
            className="hero-split__media"
          >
            {image?.src ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={image.src}
                alt={image.alt}
                className="hero-split__image"
              />
            ) : (
              <div className="hero-split__image-placeholder" aria-hidden="true" />
            )}
          </div>

        </div>
      </div>
    </section>
  );
}
