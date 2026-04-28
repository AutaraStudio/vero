// Adapted from: Untitled UI — Hero with media
// Vero Assess pattern: HeroCentred

'use client';

import './HeroCentred.css';
import { useRef, useState, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { gsap } from '@/lib/gsap';
import { useTextReveal } from '@/hooks/useTextReveal';
import { useFadeUp } from '@/hooks/useFadeUp';
import Button from '@/components/ui/Button';
import type { ThemeVariant } from '@/lib/theme';

interface HeroCentredProps {
  theme?: ThemeVariant;
  badge?: { label: string; href: string };
  headline: string;
  intro?: string;
  primaryCTA?: { label: string; href: string };
  secondaryCTA?: { label: string; href: string };
  media?:
    | { type: 'image'; src: string; alt: string }
    | { type: 'video'; thumbnailSrc: string; videoSrc: string };
  /** Optional content rendered between the CTAs and the media (e.g. a logo strip) */
  belowCta?: React.ReactNode;
}

export default function HeroCentred({
  theme = 'brand-purple',
  badge,
  headline,
  intro,
  primaryCTA,
  secondaryCTA,
  media,
  belowCta,
}: HeroCentredProps) {
  const badgeRef    = useFadeUp({ scroll: false, delay: 0.1, duration: 0.5, y: 16 });
  const headingRef  = useTextReveal({ scroll: false, delay: 0.3 });
  const introRef    = useFadeUp({ scroll: false, delay: 0.7, duration: 0.6, y: 16 });
  const ctaRef      = useFadeUp({ scroll: false, delay: 0.9, duration: 0.5, y: 16 });
  const mediaRef    = useFadeUp({ scroll: true,  delay: 0,   duration: 0.8, y: 32 });

  const [modalOpen, setModalOpen] = useState(false);
  const [mounted, setMounted]     = useState(false);

  const overlayRef  = useRef<HTMLDivElement>(null);
  const modalRef    = useRef<HTMLDivElement>(null);
  const videoRef    = useRef<HTMLVideoElement>(null);
  const playBtnRef  = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  /* ── Play button spring hover ───────────────────────────── */
  useEffect(() => {
    const btn = playBtnRef.current;
    if (!btn) return;

    const onEnter = () =>
      gsap.to(btn, { scale: 1.08, duration: 0.3, ease: 'vero.spring' });
    const onLeave = () =>
      gsap.to(btn, { scale: 1, duration: 0.3, ease: 'vero.spring' });

    btn.addEventListener('mouseenter', onEnter);
    btn.addEventListener('mouseleave', onLeave);
    return () => {
      btn.removeEventListener('mouseenter', onEnter);
      btn.removeEventListener('mouseleave', onLeave);
    };
  }, []);

  /* ── Modal close ────────────────────────────────────────── */
  const closeModal = useCallback(() => {
    const overlay = overlayRef.current;
    const modal   = modalRef.current;
    const video   = videoRef.current;
    if (!overlay || !modal) return;

    gsap.to(modal, { scale: 0.95, opacity: 0, duration: 0.25, ease: 'power2.in' });
    gsap.to(overlay, {
      opacity: 0,
      duration: 0.25,
      ease: 'power2.in',
      onComplete: () => {
        if (video) video.src = '';
        document.body.style.overflow = '';
        setModalOpen(false);
      },
    });
  }, []);

  /* ── Modal open animation ───────────────────────────────── */
  useEffect(() => {
    if (!modalOpen) return;
    const overlay = overlayRef.current;
    const modal   = modalRef.current;
    const video   = videoRef.current;
    if (!overlay || !modal) return;

    document.body.style.overflow = 'hidden';
    if (video && media?.type === 'video') video.src = media.videoSrc;

    gsap.fromTo(overlay,
      { opacity: 0 },
      { opacity: 1, duration: 0.3, ease: 'power2.out' },
    );
    gsap.fromTo(modal,
      { scale: 0.92, opacity: 0 },
      { scale: 1,    opacity: 1, duration: 0.4, ease: 'power3.out' },
    );

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeModal();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [modalOpen, media, closeModal]);

  /* When there's no media slot, render in compact mode — smaller headline
     and proper bottom padding so the hero ends cleanly instead of dropping
     off into the next section. */
  const isCompact = !media;

  return (
    <section
      className={`hero-centred${isCompact ? ' hero-centred--compact' : ''}`}
      data-theme={theme}
    >

      {/* ── Content ───────────────────────────────────────── */}
      <div className="hero-centred__inner">
        <div className="hero-centred__header">

          {badge && (
            <a
              ref={badgeRef as React.Ref<HTMLAnchorElement>}
              href={badge.href}
              data-animate=""
              className="hero-centred__badge section-label"
            >
              {badge.label}
            </a>
          )}

          <h1
            ref={headingRef as React.Ref<HTMLHeadingElement>}
            data-animate=""
            className={`hero-centred__title max-ch-25 ${isCompact ? 'text-h1' : 'text-display--xl'}`}
          >
            {headline}
          </h1>

          {intro && (
            <p
              ref={introRef as React.Ref<HTMLParagraphElement>}
              data-animate=""
              className="hero-centred__intro section-intro text-centre"
            >
              {intro}
            </p>
          )}

          {(primaryCTA || secondaryCTA) && (
            <div
              ref={ctaRef as React.Ref<HTMLDivElement>}
              data-animate=""
              className="hero-centred__cta"
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

          {belowCta && (
            <div className="hero-centred__below-cta">
              {belowCta}
            </div>
          )}
        </div>
      </div>

      {/* ── Media (optional) ──────────────────────────────── */}
      {media && (
        <div className="hero-centred__media-wrap">
          <div
            ref={mediaRef as React.Ref<HTMLDivElement>}
            data-animate=""
            className="hero-centred__media"
          >
            {media.type === 'image' ? (
              <img
                src={media.src}
                alt={media.alt}
                className="hero-centred__media-img"
              />
            ) : (
              <div className="hero-centred__thumbnail">
                {media.thumbnailSrc && (
                  <img
                    src={media.thumbnailSrc}
                    alt="Video preview"
                    className="hero-centred__media-img"
                  />
                )}
                <button
                  ref={playBtnRef}
                  className="hero-centred__play"
                  aria-label="Play video"
                  onClick={() => setModalOpen(true)}
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 16 16"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path d="M2.2 2.863C2.2 1.612 3.572.845 4.638 1.5l8.347 5.137c1.016.625 1.016 2.1 0 2.725L4.638 14.5c-1.066.656-2.438-.11-2.438-1.363V2.863Z" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Video modal portal ────────────────────────────── */}
      {mounted && modalOpen &&
        createPortal(
          <div
            ref={overlayRef}
            className="hero-centred__overlay"
            onClick={closeModal}
            role="dialog"
            aria-modal="true"
            aria-label="Video player"
          >
            <div
              ref={modalRef}
              className="hero-centred__modal"
              onClick={(e) => e.stopPropagation()}
            >
              <video
                ref={videoRef}
                className="hero-centred__modal-video"
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
