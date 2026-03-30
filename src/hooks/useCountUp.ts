'use client';
import { useEffect, useRef } from 'react';
import { gsap, ScrollTrigger } from '@/lib/gsap';

interface UseCountUpOptions {
  end: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  start?: string;
}

export function useCountUp(options: UseCountUpOptions) {
  const {
    end,
    duration = 1.8,
    prefix = '',
    suffix = '',
    decimals = 0,
    start = 'top 85%',
  } = options;

  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const obj = { value: 0 };

    const tween = gsap.to(obj, {
      value: end,
      duration,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: el,
        start,
        once: true,
      },
      onUpdate: () => {
        el.textContent = `${prefix}${obj.value.toFixed(decimals)}${suffix}`;
      },
    });

    return () => { tween.kill(); };
  }, [end, duration, prefix, suffix, decimals, start]);

  return ref;
}
