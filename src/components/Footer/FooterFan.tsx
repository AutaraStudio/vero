'use client';

import { useEffect, useRef } from 'react';
import { gsap } from '@/lib/gsap';

const OVAL =
  'M179.706 0C110.336 0 54.198 21.485 23.683 65.807C-48.912 171.251 50.983 366.022 246.806 500.839C360.314 578.987 481.134 619.838 576.794 619.838C646.163 619.838 702.303 598.351 732.818 554.03C805.412 448.586 705.516 253.817 509.694 118.998C396.184 40.851 275.364 0 179.706 0Z';

const FAN = [
  { colour: 'var(--swatch--green-500)',  finalRotation: 30  },
  { colour: 'var(--swatch--blue-500)',   finalRotation: 0   },
  { colour: 'var(--swatch--yellow-500)', finalRotation: -30 },
];

interface FooterFanProps {
  /** Corner anchor. Default: 'bottom-right' */
  position?: 'top-left' | 'bottom-right';
  /**
   * 'scroll' fires the fan when its parent footer enters the viewport
   * (the default — used at the bottom of long marketing pages).
   * 'load' fires immediately on mount, for short single-viewport pages
   * like /coming-soon where the fan is already visible at first paint.
   */
  trigger?: 'scroll' | 'load';
}

export default function FooterFan({ position = 'bottom-right', trigger = 'scroll' }: FooterFanProps) {
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const shapes = el.querySelectorAll('.footer-fan__shape');
    if (shapes.length === 0) return;

    gsap.set(shapes, { rotation: 0, opacity: 0 });

    /* 'scroll' uses the closest ancestor as the scroll trigger; the fan
       wrap itself has zero box (absolutely-positioned children) which
       confuses ScrollTrigger's start/end calc. 'load' just runs the
       timeline immediately on mount. */
    const tl = trigger === 'scroll'
      ? gsap.timeline({
          scrollTrigger: {
            trigger: el.closest('footer, [data-fan-trigger]') ?? el,
            start: 'top 85%',
            once: true,
          },
        })
      : gsap.timeline({ delay: 0.15 });

    /* For the top-left variant we mirror the shape (scale -1, -1) AND the
       rotation, so the fan opens outward (down-right) — same visual rhythm
       as the bottom-right anchor opening up-left, just rotationally flipped. */
    const isTopLeft = position === 'top-left';
    const direction = isTopLeft ? -1 : 1;
    const baseScale = isTopLeft ? -1 : 1;

    /* Initial state — bake in the scale so GSAP composes it into the same
       transform matrix as the rotation tween below. */
    gsap.set(shapes, { scale: baseScale });

    FAN.forEach((shape, i) => {
      tl.to(
        shapes[i],
        {
          rotation: shape.finalRotation * direction,
          scale: baseScale,
          opacity: 1,
          duration: 0.9,
          ease: 'power3.out',
        },
        i * 0.15,
      );
    });

    return () => { tl.kill(); };
  }, [position, trigger]);

  return (
    <div
      ref={wrapRef}
      className={`footer-fan footer-fan--${position}`}
      aria-hidden="true"
    >
      {FAN.map(({ colour }, i) => (
        <svg
          key={i}
          className="footer-fan__shape"
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
