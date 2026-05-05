'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { gsap } from '@/lib/gsap';
import './MediaBlock.css';

/**
 * Resolved shape of a `mediaBlock` field once it's been pulled through the
 * `mediaProjection()` GROQ helper (see queries.ts).
 *
 * Every field is optional — when nothing is uploaded the component renders
 * a coloured placeholder card so the layout never collapses.
 */
export interface MediaBlockData {
  type?: 'image' | 'video' | null;
  imageUrl?: string | null;
  imageAlt?: string | null;
  videoUrl?: string | null;
  /** How the video should play. Default: 'modal'.
   *  - 'modal'              — static thumbnail with play button → modal
   *  - 'modal-with-preview' — autoplaying muted-loop video as preview, play button overlay → modal with sound
   *  - 'autoplay'           — autoplaying muted-loop, no modal, no click (background-video style) */
  videoPlayback?: 'modal' | 'modal-with-preview' | 'autoplay' | null;
  videoThumbnailUrl?: string | null;
  videoThumbnailAlt?: string | null;
}

interface MediaBlockProps {
  /** The projected mediaBlock data from Sanity */
  media?: MediaBlockData | null;

  /** Aspect ratio for both the image and the placeholder. Default '16 / 10'. */
  aspectRatio?: string;

  /** Optional accent CSS variable used to tint the placeholder card. */
  placeholderAccent?: string;

  /** Border radius — accepts a CSS var or value. Default `var(--radius--lg)`. */
  borderRadius?: string;

  /** Object-fit on the rendered image / thumbnail. Default 'cover'. */
  objectFit?: 'cover' | 'contain';

  /** Extra className to merge with the wrapper. */
  className?: string;

  /** Pass-through alt text override (used when the field-level alt is blank). */
  fallbackAlt?: string;
}

/**
 * Renders an image, a clickable video thumbnail (opens a modal player),
 * or a coloured placeholder card — based on the media block's `type`.
 *
 * Visuals match the existing IntroBlock / HeroCentred placeholder + modal
 * patterns so this drops in anywhere on the site without looking foreign.
 */
export default function MediaBlock({
  media,
  aspectRatio = '16 / 10',
  placeholderAccent,
  borderRadius = 'var(--radius--lg)',
  objectFit = 'cover',
  className = '',
}: MediaBlockProps) {
  const [open, setOpen]   = useState(false);
  const [mounted, setMounted] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);
  const modalRef   = useRef<HTMLDivElement>(null);
  const videoRef   = useRef<HTMLVideoElement>(null);

  useEffect(() => setMounted(true), []);

  /* Open animation */
  useEffect(() => {
    if (!open) return;
    const overlay = overlayRef.current;
    const modal = modalRef.current;
    const video = videoRef.current;
    if (!overlay || !modal) return;

    document.body.style.overflow = 'hidden';
    gsap.fromTo(overlay, { opacity: 0 }, { opacity: 1, duration: 0.3, ease: 'power2.out' });
    gsap.fromTo(
      modal,
      { scale: 0.92, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.4, ease: 'power3.out' },
    );

    /* Lazy-set the video src so the file isn't fetched until the modal opens */
    if (video && media?.videoUrl) {
      video.src = media.videoUrl;
      void video.play().catch(() => { /* user gesture required on some browsers */ });
    }

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function close() {
    const overlay = overlayRef.current;
    const modal = modalRef.current;
    const video = videoRef.current;
    if (!overlay || !modal) {
      setOpen(false);
      document.body.style.overflow = '';
      return;
    }
    gsap.to(modal, { scale: 0.95, opacity: 0, duration: 0.25, ease: 'power2.in' });
    gsap.to(overlay, {
      opacity: 0,
      duration: 0.25,
      ease: 'power2.in',
      onComplete: () => {
        if (video) {
          video.pause();
          video.removeAttribute('src');
          video.load();
        }
        document.body.style.overflow = '';
        setOpen(false);
      },
    });
  }

  /* ── Render ─────────────────────────────────────────────── */

  /* When aspectRatio is 'auto' (e.g. HeroSplit lets its parent control
     the height), don't set the inline aspect-ratio at all — that way the
     parent CSS gets to define the dimensions. Otherwise apply the value
     so the slot keeps its shape even when empty. */
  const wrapperStyle = {
    ...(aspectRatio !== 'auto' ? { aspectRatio } : {}),
    borderRadius,
    ...(placeholderAccent ? { ['--media-accent' as string]: placeholderAccent } : {}),
  } as React.CSSProperties;

  /* The editor's chosen mode — independent of whether all the underlying
     fields have been uploaded yet. Lets us render a video preview slot
     (with cover) even before the videoUrl has been pasted in. */
  const isVideoMode      = media?.type === 'video';
  const hasVideoUrl      = !!media?.videoUrl;
  const playbackMode     = media?.videoPlayback ?? 'modal';
  const isAutoplayMode   = isVideoMode && playbackMode === 'autoplay';
  const isModalWithPrev  = isVideoMode && playbackMode === 'modal-with-preview';
  const thumbnailUrl     = isVideoMode ? media?.videoThumbnailUrl : null;
  const imageUrl       = media?.type === 'image' || !media?.type ? media?.imageUrl : null;
  const altText        = isVideoMode
    ? media?.videoThumbnailAlt ?? ''
    : media?.imageAlt ?? '';

  /* ── Autoplay mode — inline muted-loop "background video" ── */
  if (isAutoplayMode) {
    /* If the URL hasn't been uploaded yet, render the same disabled-look
       preview as the modal mode so the editor sees their slot. */
    if (!hasVideoUrl) {
      return (
        <div
          className={`media-block ${className}`.trim()}
          style={wrapperStyle}
          aria-label="Video URL not set yet"
          title="Video URL not set yet — add one in Sanity Studio"
        >
          {thumbnailUrl ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={thumbnailUrl}
              alt={altText}
              className="media-block__img"
              style={{ objectFit }}
              loading="lazy"
            />
          ) : (
            <span className="media-block__placeholder" aria-hidden="true" />
          )}
        </div>
      );
    }

    return (
      <div className={`media-block media-block--autoplay ${className}`.trim()} style={wrapperStyle}>
        <video
          className="media-block__autoplay-video"
          src={media!.videoUrl!}
          poster={thumbnailUrl ?? undefined}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          aria-label={altText || 'Background video'}
          /* These three attributes are critical for iOS — without
             playsInline + muted + autoPlay, mobile Safari refuses to
             autoplay. */
        />
      </div>
    );
  }

  /* ── Modal-with-autoplay-preview mode ──
     Looping muted preview plays in the slot. Click anywhere on the
     preview opens the full modal player with sound. */
  if (isModalWithPrev && hasVideoUrl) {
    return (
      <>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className={`media-block media-block--video media-block--preview ${className}`.trim()}
          style={wrapperStyle}
          aria-label="Play video with sound"
        >
          <video
            className="media-block__autoplay-video"
            src={media!.videoUrl!}
            poster={thumbnailUrl ?? undefined}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            aria-hidden="true"
          />
          <span className="media-block__play" aria-hidden="true">
            <svg width="28" height="28" viewBox="0 0 16 16" fill="currentColor">
              <path d="M2.2 2.863C2.2 1.612 3.572.845 4.638 1.5l8.347 5.137c1.016.625 1.016 2.1 0 2.725L4.638 14.5c-1.066.656-2.438-.11-2.438-1.363V2.863Z" />
            </svg>
          </span>
        </button>

        {mounted && open && createPortal(
          <div
            ref={overlayRef}
            className="media-block__overlay"
            onClick={close}
            role="dialog"
            aria-modal="true"
            aria-label="Video player"
          >
            <div
              ref={modalRef}
              className="media-block__modal"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={close}
                className="media-block__close"
                aria-label="Close video"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M6 6l12 12M6 18L18 6"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
              <video
                ref={videoRef}
                className="media-block__video"
                controls
                playsInline
                preload="none"
              />
            </div>
          </div>,
          document.body,
        )}
      </>
    );
  }

  /* ── Modal video mode — clickable thumbnail with play button ── */
  if (isVideoMode) {
    return (
      <>
        <button
          type="button"
          onClick={() => hasVideoUrl && setOpen(true)}
          disabled={!hasVideoUrl}
          className={`media-block media-block--video ${className}`.trim()}
          style={wrapperStyle}
          aria-label={hasVideoUrl ? 'Play video' : 'Video URL not set yet'}
          title={hasVideoUrl ? undefined : 'Video URL not set yet — add one in Sanity Studio'}
        >
          {thumbnailUrl ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={thumbnailUrl}
              alt={altText}
              className="media-block__img"
              style={{ objectFit }}
              loading="lazy"
            />
          ) : (
            <span className="media-block__placeholder" aria-hidden="true" />
          )}
          <span className="media-block__play" aria-hidden="true">
            <svg width="28" height="28" viewBox="0 0 16 16" fill="currentColor">
              {/* Rounded-corner play triangle — fills more of the button than
                 the geometric SVG triangle and reads as a friendlier "play"
                 affordance. Matches the IntroBlock + HeroCentred play icon. */}
              <path d="M2.2 2.863C2.2 1.612 3.572.845 4.638 1.5l8.347 5.137c1.016.625 1.016 2.1 0 2.725L4.638 14.5c-1.066.656-2.438-.11-2.438-1.363V2.863Z" />
            </svg>
          </span>
        </button>

        {mounted && open && createPortal(
          <div
            ref={overlayRef}
            className="media-block__overlay"
            onClick={close}
            role="dialog"
            aria-modal="true"
            aria-label="Video player"
          >
            <div
              ref={modalRef}
              className="media-block__modal"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={close}
                className="media-block__close"
                aria-label="Close video"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M6 6l12 12M6 18L18 6"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
              <video
                ref={videoRef}
                className="media-block__video"
                controls
                playsInline
                preload="none"
              />
            </div>
          </div>,
          document.body,
        )}
      </>
    );
  }

  /* ── Image mode ─────────────────────────────────────────── */
  if (imageUrl) {
    return (
      <div className={`media-block ${className}`.trim()} style={wrapperStyle}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl}
          alt={altText}
          className="media-block__img"
          style={{ objectFit }}
          loading="lazy"
        />
      </div>
    );
  }

  /* ── Placeholder — no upload yet ────────────────────────── */
  return (
    <div
      className={`media-block media-block--placeholder ${className}`.trim()}
      style={wrapperStyle}
      aria-hidden="true"
    />
  );
}
