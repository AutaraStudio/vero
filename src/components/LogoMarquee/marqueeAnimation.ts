/* ============================================================
   LogoMarquee — scroll-direction-aware GSAP marquee.

   Implementation notes
   ─────────────────────
   The canonical marquee pattern: clone the original collection N
   times so the total content width is at least 2× the viewport, then
   translate the entire scroll wrapper by exactly ONE collection's
   width per loop. Because every collection is an identical clone,
   when the wrapper resets from -collectionWidth back to 0 the visible
   layout is byte-identical — the loop is invisible.

   Why this is more reliable than animating xPercent on each
   collection individually: a single tween on a single element with a
   single fixed pixel distance cannot drift, cannot phase-shift between
   clones, and works the same regardless of `direction`.
============================================================ */

import { gsap, ScrollTrigger } from '@/lib/gsap';

interface MarqueeOptions {
  /** Pixels per second. Default: 60 (slow, premium feel). */
  pxPerSecond?: number;
  /** 'left' or 'right'. Default: 'left' */
  direction?: 'left' | 'right';
  /** Extra px-velocity tied to scroll. Default: 6 (vw units). */
  scrollSpeed?: number;
  /** Legacy: speed multiplier (lower = faster). Maps to pxPerSecond. */
  speed?: number;
}

/**
 * Initialise a marquee on the given root element. Returns a cleanup
 * function that kills all GSAP tweens + ScrollTriggers + listeners.
 *
 * Expected DOM:
 *   <root data-marquee>
 *     <div data-marquee-scroll>
 *       <div data-marquee-collection>…items…</div>
 *     </div>
 *   </root>
 */
export function initMarquee(root: HTMLElement, options: MarqueeOptions = {}) {
  const {
    direction = 'left',
    speed,
    pxPerSecond,
  } = options;

  /* Resolve speed: prefer pxPerSecond if given, else map legacy speed to a
     reasonable pixels-per-second value. Legacy speed of 25 ≈ 60 px/s. */
  const pps = pxPerSecond ?? (speed != null ? Math.max(20, 1500 / speed) : 60);

  const scrollEl     = root.querySelector<HTMLElement>('[data-marquee-scroll]');
  const collectionEl = root.querySelector<HTMLElement>('[data-marquee-collection]');
  if (!scrollEl || !collectionEl) return () => {};

  /* Cache the original collection HTML so we can fully reset on each
     re-build (resize) without compounding clones. */
  const originalHTML = collectionEl.outerHTML;

  let mainAnimation: gsap.core.Tween | null = null;
  let invertTrigger: ScrollTrigger | null = null;
  let resizeRaf = 0;

  const directionMul = direction === 'right' ? 1 : -1;

  function teardown() {
    mainAnimation?.kill();
    invertTrigger?.kill();
    mainAnimation = null;
    invertTrigger = null;
    /* Reset transforms so a re-build starts from a clean slate */
    gsap.set(scrollEl!, { clearProps: 'transform,x' });
  }

  function build() {
    teardown();

    /* Wipe and re-insert the original single collection so we never
       compound clones across rebuilds. */
    scrollEl!.innerHTML = originalHTML;
    const collection = scrollEl!.querySelector<HTMLElement>('[data-marquee-collection]');
    if (!collection) return;

    /* Reset any previously-applied padding overrides */
    scrollEl!.style.marginLeft = '';
    scrollEl!.style.width      = '';

    /* Measure ONE collection (post-layout). If somehow zero (e.g. images
       not yet laid out), bail and retry on next frame — never animate
       against a zero width. */
    const collectionWidth = collection.getBoundingClientRect().width;
    if (collectionWidth < 1) {
      requestAnimationFrame(build);
      return;
    }

    /* Determine how many copies we need so total content >= 2× viewport,
       guaranteeing the loop never reveals an empty patch even with very
       few items. Always at least 3 total copies. */
    const targetTotalWidth = window.innerWidth * 2;
    const totalCopies = Math.max(3, Math.ceil(targetTotalWidth / collectionWidth) + 1);

    for (let i = 0; i < totalCopies - 1; i++) {
      scrollEl!.appendChild(collection.cloneNode(true));
    }

    /* Animate the WHOLE scroll wrapper by exactly ONE collection's width
       per loop. Because every clone is identical, the snap-back from
       -collectionWidth (or +collectionWidth) to 0 is visually invisible.

       For 'left' direction: x: 0 → -collectionWidth
       For 'right' direction: x: -collectionWidth → 0 (start offset, animate to 0, modifier wraps)

       The cleanest trick: animate `x` from 0 to -collectionWidth always,
       and apply a wrap modifier so the value loops within [-cW, 0]. Then
       flip via timeScale for direction. */
    const duration = collectionWidth / pps;

    /* Set baseline and animate */
    gsap.set(scrollEl!, { x: 0 });
    mainAnimation = gsap.to(scrollEl!, {
      x: -collectionWidth,
      duration,
      ease: 'none',
      repeat: -1,
      modifiers: {
        x: gsap.utils.unitize(
          gsap.utils.wrap(-collectionWidth, 0),
          'px',
        ),
      },
    });

    /* Direction control: -1 for left (default), +1 for right */
    mainAnimation.timeScale(directionMul === -1 ? 1 : -1);
    root.setAttribute('data-marquee-status', 'normal');

    /* Scroll-direction inversion — flip the marquee's direction depending
       on whether the user is scrolling down or up. */
    invertTrigger = ScrollTrigger.create({
      trigger: root,
      start: 'top bottom',
      end: 'bottom top',
      onUpdate: (self) => {
        if (!mainAnimation) return;
        const isScrollingDown = self.direction === 1;
        const baseScale = directionMul === -1 ? 1 : -1;
        mainAnimation.timeScale(isScrollingDown ? baseScale : -baseScale);
        root.setAttribute('data-marquee-status', isScrollingDown ? 'normal' : 'inverted');
      },
    });

    /* (Scroll-tied parallax intentionally omitted — combining it with the
       main x loop on the same element causes drift and breaks seamlessness.
       The infinite loop alone reads as the right kind of motion here.) */
  }

  /* Initial build */
  build();

  /* Re-build on window resize (debounced via rAF). Keeps duplicate count
     correct when viewport changes. */
  function onResize() {
    if (resizeRaf) cancelAnimationFrame(resizeRaf);
    resizeRaf = requestAnimationFrame(() => build());
  }
  window.addEventListener('resize', onResize);

  /* Re-build once images inside have loaded — initial measurement may be
     based on intrinsic-zero lazy images; re-measuring after load
     guarantees correct collection width and clone count. */
  const imgs = scrollEl!.querySelectorAll('img');
  let pending = imgs.length;
  if (pending > 0) {
    const onAny = () => {
      pending -= 1;
      if (pending <= 0) build();
    };
    imgs.forEach((img) => {
      if (img.complete && img.naturalWidth > 0) onAny();
      else {
        img.addEventListener('load',  onAny, { once: true });
        img.addEventListener('error', onAny, { once: true });
      }
    });
  }

  return () => {
    teardown();
    window.removeEventListener('resize', onResize);
    if (resizeRaf) cancelAnimationFrame(resizeRaf);
  };
}
