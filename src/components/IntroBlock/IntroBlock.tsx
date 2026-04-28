'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Button from '@/components/ui/Button';
import { gsap } from '@/lib/gsap';
import { useTextReveal } from '@/hooks/useTextReveal';
import { useFadeUp } from '@/hooks/useFadeUp';
import type { ThemeVariant } from '@/lib/theme';
import './IntroBlock.css';

interface PortableTextSpan { _type: 'span'; text: string; marks?: string[]; }
interface PortableTextBlock { _type: 'block'; children: PortableTextSpan[]; style?: string; }

interface Props {
  eyebrow?: string;
  heading: string;
  body?: PortableTextBlock[];
  ctaLabel?: string;
  ctaHref?: string;
  videoThumbnailUrl?: string;
  videoThumbnailAlt?: string;
  videoUrl?: string;
  theme?: ThemeVariant;
  /**
   * When true, always render the media column — even if no image / video URL
   * is provided yet. Shows a tasteful placeholder card so the slot is visible
   * during content build-out. Default: false (no media → editorial text split).
   */
  alwaysShowMedia?: boolean;
  /**
   * Layout variant.
   *  - 'split'    (default): text-left, image-right (2-col).
   *  - 'centered': text centred above, image stacked below at container width.
   *                Best for dashboard / screenshot moments where the image
   *                deserves to be the visual focus.
   */
  layout?: 'split' | 'centered';
}

function renderBody(blocks?: PortableTextBlock[]) {
  if (!blocks?.length) return null;
  return blocks.map((block, bi) => {
    if (block._type !== 'block') return null;
    return (
      <p key={bi} className="intro-block__paragraph text-body--lg leading--snug color--secondary">
        {block.children.map((span, si) => {
          let node: React.ReactNode = span.text;
          if (span.marks?.includes('strong')) node = <strong key={si}>{span.text}</strong>;
          return <span key={si}>{node}</span>;
        })}
      </p>
    );
  });
}

export default function IntroBlock({
  eyebrow,
  heading,
  body,
  ctaLabel,
  ctaHref,
  videoThumbnailUrl,
  videoThumbnailAlt,
  videoUrl,
  theme = 'brand-blue',
  alwaysShowMedia = false,
  layout = 'split',
}: Props) {
  const labelRef   = useFadeUp({ delay: 0,    duration: 0.5, y: 12 });
  const headingRef = useTextReveal({ delay: 0.05 });
  const bodyRef    = useFadeUp({ delay: 0.2,  duration: 0.6, y: 16 });
  const ctaRef     = useFadeUp({ delay: 0.35, duration: 0.5, y: 16 });
  const mediaRef   = useFadeUp({ delay: 0.1,  duration: 0.8, y: 32 });

  const [mounted, setMounted]     = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const overlayRef = useRef<HTMLDivElement>(null);
  const modalRef   = useRef<HTMLDivElement>(null);
  const videoRef   = useRef<HTMLVideoElement>(null);

  useEffect(() => setMounted(true), []);

  /* ── Modal close ──────────────────────────────────────────── */
  const closeModal = useCallback(() => {
    const overlay = overlayRef.current;
    const modal   = modalRef.current;
    const video   = videoRef.current;
    if (!overlay || !modal) return;

    gsap.to(modal,   { scale: 0.95, opacity: 0, duration: 0.25, ease: 'power2.in' });
    gsap.to(overlay, { opacity: 0, duration: 0.25, ease: 'power2.in', onComplete: () => {
      if (video) video.src = '';
      document.body.style.overflow = '';
      setModalOpen(false);
    }});
  }, []);

  /* ── Modal open animation + esc handler ───────────────────── */
  useEffect(() => {
    if (!modalOpen) return;
    const overlay = overlayRef.current;
    const modal   = modalRef.current;
    const video   = videoRef.current;
    if (!overlay || !modal) return;

    document.body.style.overflow = 'hidden';
    if (video && videoUrl) video.src = videoUrl;

    gsap.fromTo(overlay, { opacity: 0 }, { opacity: 1, duration: 0.3, ease: 'power2.out' });
    gsap.fromTo(modal,   { scale: 0.92, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.4, ease: 'power3.out' });

    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closeModal(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [modalOpen, videoUrl, closeModal]);

  const hasMedia = Boolean(videoThumbnailUrl || videoUrl) || alwaysShowMedia;

  const isCentered = layout === 'centered';
  const gridClass =
    'intro-block__grid' +
    (hasMedia ? '' : ' is-editorial') +
    (isCentered && hasMedia ? ' is-centered' : '');

  return (
    <section data-theme={theme} className="intro-block section">
      <div className="container">
        <div className={gridClass}>

          {hasMedia ? (
            /* ── With-media layout: text + thumbnail ──────── */
            <div className="intro-block__text">
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
                className="intro-block__heading section-heading"
              >
                {heading}
              </h2>
              <div
                ref={bodyRef as React.RefObject<HTMLDivElement>}
                data-animate=""
                className="intro-block__body"
              >
                {renderBody(body)}
              </div>
              {ctaLabel && ctaHref && (
                <div
                  ref={ctaRef as React.RefObject<HTMLDivElement>}
                  data-animate=""
                  className="intro-block__cta"
                >
                  <Button variant="primary" href={ctaHref}>
                    {ctaLabel}
                  </Button>
                </div>
              )}
            </div>
          ) : (
            /* ── Editorial split: heading column + body column ── */
            <>
              <div className="intro-block__heading-col">
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
                  className="intro-block__heading intro-block__heading--editorial section-heading"
                >
                  {heading}
                </h2>
              </div>

              <div className="intro-block__body-col">
                <div
                  ref={bodyRef as React.RefObject<HTMLDivElement>}
                  data-animate=""
                  className="intro-block__body"
                >
                  {renderBody(body)}
                </div>
                {ctaLabel && ctaHref && (
                  <div
                    ref={ctaRef as React.RefObject<HTMLDivElement>}
                    data-animate=""
                    className="intro-block__cta"
                  >
                    <Button variant="primary" href={ctaHref}>
                      {ctaLabel}
                    </Button>
                  </div>
                )}
              </div>
            </>
          )}

          {/* ── Media column ──────────────────────────────── */}
          {hasMedia && (
            <div
              ref={mediaRef as React.RefObject<HTMLDivElement>}
              data-animate=""
              className="intro-block__media"
            >
              {videoUrl ? (
                <button
                  type="button"
                  className="intro-block__thumb"
                  onClick={() => setModalOpen(true)}
                  aria-label="Play product demo video"
                >
                  {videoThumbnailUrl && (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={videoThumbnailUrl}
                      alt={videoThumbnailAlt ?? 'Product demo preview'}
                      className="intro-block__thumb-img"
                    />
                  )}
                  <span className="intro-block__play" aria-hidden="true">
                    <svg width="22" height="22" viewBox="0 0 16 16" fill="currentColor">
                      <path d="M2.2 2.863C2.2 1.612 3.572.845 4.638 1.5l8.347 5.137c1.016.625 1.016 2.1 0 2.725L4.638 14.5c-1.066.656-2.438-.11-2.438-1.363V2.863Z" />
                    </svg>
                  </span>
                </button>
              ) : videoThumbnailUrl ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={videoThumbnailUrl}
                  alt={videoThumbnailAlt ?? ''}
                  className="intro-block__thumb-img intro-block__thumb-img--static"
                />
              ) : (
                /* No image uploaded yet — show a tasteful placeholder card so
                   the slot is visible during content build-out. Disappears
                   automatically as soon as a thumbnail is set. */
                <div className="intro-block__thumb-img--static intro-block__placeholder" aria-hidden="true" />
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Video modal portal ──────────────────────────────── */}
      {mounted && modalOpen && createPortal(
        <div
          ref={overlayRef}
          className="intro-block__overlay"
          onClick={closeModal}
          role="dialog"
          aria-modal="true"
          aria-label="Product demo video"
        >
          <div
            ref={modalRef}
            className="intro-block__modal"
            onClick={(e) => e.stopPropagation()}
          >
            <video
              ref={videoRef}
              className="intro-block__modal-video"
              controls
              autoPlay
              playsInline
            />
          </div>
        </div>,
        document.body,
      )}
    </section>
  );
}
