/* ============================================================
   Media adapters — convert the Sanity `mediaBlock` projection
   into the legacy prop shapes some components still expect.

   These exist because HeroCentred, IntroBlock, etc. were built
   before the unified mediaBlock schema. They each have their own
   nested media prop. Rather than refactor every component, the
   pages call these adapters at the boundary so the component
   surface stays stable.
============================================================ */

import type { MediaBlockData } from '@/components/MediaBlock';

/**
 * Convert a Sanity mediaBlock into the discriminated prop shape
 * HeroCentred expects:
 *   { type: 'image'; src; alt } | { type: 'video'; thumbnailSrc; videoSrc }
 *
 * Returns undefined if the mediaBlock doesn't have the minimum required
 * fields — HeroCentred renders in compact mode (no media slot) when its
 * media prop is undefined, which is the right fallback.
 */
export function mediaBlockToHeroCentredMedia(
  block?: MediaBlockData | null,
):
  | { type: 'image'; src: string; alt: string }
  | { type: 'video'; thumbnailSrc: string; videoSrc: string }
  | undefined {
  if (!block) return undefined;

  if (block.type === 'video') {
    if (!block.videoUrl) return undefined;
    return {
      type: 'video',
      thumbnailSrc: block.videoThumbnailUrl ?? '',
      videoSrc:     block.videoUrl,
    };
  }

  /* Default: image mode */
  if (!block.imageUrl) return undefined;
  return {
    type: 'image',
    src: block.imageUrl,
    alt: block.imageAlt ?? '',
  };
}

/**
 * Convert a Sanity mediaBlock into HeroSplit's legacy `image` prop.
 * HeroSplit also accepts `media={mediaBlock}` directly now (preferred).
 * This shim is for cases where you want the simple image-only path.
 */
export function mediaBlockToHeroSplitImage(
  block?: MediaBlockData | null,
): { src: string; alt: string } | undefined {
  if (!block) return undefined;
  const url = block.type === 'video' ? block.videoThumbnailUrl : block.imageUrl;
  const alt = block.type === 'video' ? block.videoThumbnailAlt : block.imageAlt;
  if (!url) return undefined;
  return { src: url, alt: alt ?? '' };
}
