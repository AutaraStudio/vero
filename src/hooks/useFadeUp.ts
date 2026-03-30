'use client';
import { useEffect, useRef } from 'react';
import { gsap, ScrollTrigger } from '@/lib/gsap';

interface UseFadeUpOptions {
  /** CSS selector for child elements to stagger. If omitted, animates the ref element itself */
  selector?: string;
  stagger?: number;
  delay?: number;
  duration?: number;
  y?: number;
  start?: string;
  once?: boolean;
  /** Use scroll trigger (true, default) or animate immediately on mount (false) */
  scroll?: boolean;
}

export function useFadeUp(options: UseFadeUpOptions = {}) {
  const {
    selector,
    stagger = 0.08,
    delay = 0,
    duration = 0.65,
    y = 24,
    start = 'top 85%',
    once = true,
    scroll = true,
  } = options;

  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const container = ref.current;
    if (!container) return;

    const targets = selector
      ? container.querySelectorAll(selector)
      : [container];

    gsap.set(targets, { opacity: 0, y, visibility: 'visible' });

    const animProps: gsap.TweenVars = {
      opacity: 1,
      y: 0,
      duration,
      ease: 'vero.out',
      stagger,
      delay,
    };

    if (scroll) {
      animProps.scrollTrigger = {
        trigger: container,
        start,
        once,
      };
    }

    const tween = gsap.to(targets, animProps);

    return () => {
      tween.kill();
    };
  }, [selector, stagger, delay, duration, y, start, once, scroll]);

  return ref;
}
