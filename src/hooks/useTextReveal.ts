'use client';
import { useEffect, useRef } from 'react';
import { gsap, SplitText, ScrollTrigger } from '@/lib/gsap';
import { createSplit, SplitType } from '@/lib/splitText';

interface UseTextRevealOptions {
  /** Force a specific split type instead of auto-detecting */
  type?: SplitType;
  /** Use scroll trigger (true) or animate immediately on mount (false) */
  scroll?: boolean;
  /** Delay before animation starts in seconds */
  delay?: number;
  /** ScrollTrigger start position */
  start?: string;
  /** Animation duration per element */
  duration?: number;
}

/**
 * Attaches a split text reveal animation to a heading element.
 *
 * Animation feel:
 * - Blur fades from 8px to 0
 * - Opacity fades from 0 to 1
 * - Y moves from 12px to 0 (very subtle — just enough to feel dynamic)
 * - Stagger varies by split type: chars=0.03s, words=0.06s, lines=0.1s
 */
export function useTextReveal(options: UseTextRevealOptions = {}) {
  const {
    type,
    scroll = true,
    delay = 0,
    start = 'top 85%',
    duration = 0.7,
  } = options;

  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const { split, type: splitType, elements } = createSplit(el, type);

    const staggerMap = {
      chars: 0.025,
      words: 0.055,
      lines: 0.1,
    };

    const stagger = staggerMap[splitType];

    // Set initial state
    gsap.set(elements, {
      opacity: 0,
      y: 12,
      filter: 'blur(8px)',
    });

    const animProps = {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      duration,
      ease: 'vero.out',
      stagger,
      delay,
    };

    let tween: gsap.core.Tween;

    if (scroll) {
      tween = gsap.to(elements, {
        ...animProps,
        scrollTrigger: {
          trigger: el,
          start,
          once: true,
        },
      });
    } else {
      tween = gsap.to(elements, animProps);
    }

    return () => {
      tween.kill();
      split.revert();
    };
  }, [type, scroll, delay, start, duration]);

  return ref;
}
