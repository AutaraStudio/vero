'use client';

import { useRef, useEffect, useState } from 'react';
import { gsap } from '@/lib/gsap';

const OVAL =
  'M179.706 0C110.336 0 54.198 21.485 23.683 65.807C-48.912 171.251 50.983 366.022 246.806 500.839C360.314 578.987 481.134 619.838 576.794 619.838C646.163 619.838 702.303 598.351 732.818 554.03C805.412 448.586 705.516 253.817 509.694 118.998C396.184 40.851 275.364 0 179.706 0Z';

const SHAPES = [
  { colour: 'var(--swatch--purple-500)', finalRotation: 30  },
  { colour: 'var(--swatch--blue-500)',   finalRotation: 0   },
  { colour: 'var(--swatch--green-500)',  finalRotation: -30 },
];

export default function CheckoutFan() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [barHeight, setBarHeight] = useState(0);

  // ── Measure the fixed bar height and watch for changes ──
  useEffect(() => {
    const measure = () => {
      const bar = document.querySelector('.fixed-bar');
      if (bar) {
        setBarHeight(bar.getBoundingClientRect().height);
      } else {
        setBarHeight(0);
      }
    };

    // Measure on mount and after a short delay (bar animates in)
    measure();
    const timer = setTimeout(measure, 600);

    // Re-measure on resize and when DOM changes (bar appears/disappears)
    window.addEventListener('resize', measure);
    const observer = new MutationObserver(measure);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', measure);
      observer.disconnect();
    };
  }, []);

  // ── Fan animation ──
  useEffect(() => {
    if (!wrapRef.current) return;

    const shapes = wrapRef.current.querySelectorAll('.checkout-fan__shape');

    gsap.set(shapes, { rotation: 0, opacity: 0 });

    const tl = gsap.timeline({ delay: 0.5 });

    SHAPES.forEach((shape, i) => {
      tl.to(
        shapes[i],
        {
          rotation: shape.finalRotation,
          opacity: 0.85,
          duration: 0.9,
          ease: 'power3.out',
        },
        i * 0.15
      );
    });

    return () => { tl.kill(); };
  }, []);

  return (
    <div
      ref={wrapRef}
      className="checkout-fan"
      aria-hidden="true"
      style={{ bottom: `calc(${barHeight}px + clamp(-60px, -4vw, -40px))` }}
    >
      {SHAPES.map(({ colour }, i) => (
        <svg
          key={i}
          className="checkout-fan__shape"
          viewBox="0 0 757 620"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ color: colour }}
        >
          <path d={OVAL} fill="currentColor" />
        </svg>
      ))}
    </div>
  );
}
