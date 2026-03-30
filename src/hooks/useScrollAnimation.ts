'use client';
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function useScrollFadeUp(selector: string, options?: { stagger?: number; delay?: number }) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const elements = ref.current.querySelectorAll(selector);

    gsap.fromTo(elements,
      { opacity: 0, y: 40 },
      {
        opacity: 1,
        y: 0,
        duration: 0.7,
        ease: 'power3.out',
        stagger: options?.stagger ?? 0.1,
        delay: options?.delay ?? 0,
        scrollTrigger: {
          trigger: ref.current,
          start: 'top 80%',
          once: true,
        },
      }
    );
  }, [selector, options?.stagger, options?.delay]);

  return ref;
}
