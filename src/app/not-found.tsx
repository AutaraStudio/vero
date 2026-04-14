'use client';

import { useRef, useEffect } from 'react';
import Link from 'next/link';
import { gsap } from '@/lib/gsap';
import { useTextReveal } from '@/hooks/useTextReveal';
import { useFadeUp } from '@/hooks/useFadeUp';
import './not-found.css';

const OVAL =
  'M179.706 0C110.336 0 54.198 21.485 23.683 65.807C-48.912 171.251 50.983 366.022 246.806 500.839C360.314 578.987 481.134 619.838 576.794 619.838C646.163 619.838 702.303 598.351 732.818 554.03C805.412 448.586 705.516 253.817 509.694 118.998C396.184 40.851 275.364 0 179.706 0Z';

interface ShapeDef {
  id: string;
  color: string;
  opacity: number;
}

const SHAPES: ShapeDef[] = [
  { id: 'a', color: 'var(--swatch--purple-500)', opacity: 0.35 },
  { id: 'b', color: 'var(--swatch--blue-500)',   opacity: 0.25 },
  { id: 'c', color: 'var(--swatch--green-500)',  opacity: 0.2  },
  { id: 'd', color: 'var(--swatch--orange-500)', opacity: 0.3  },
  { id: 'e', color: 'var(--swatch--yellow-500)', opacity: 0.15 },
];

export default function NotFound() {
  const shapesRef = useRef<HTMLDivElement>(null);

  const codeRef    = useTextReveal({ scroll: false, delay: 0.1, duration: 0.8 });
  const headingRef = useTextReveal({ scroll: false, delay: 0.3, duration: 0.7 });
  const bodyRef    = useFadeUp({ scroll: false, delay: 0.5, duration: 0.6, y: 16 });
  const ctaRef     = useFadeUp({ scroll: false, delay: 0.65, duration: 0.5, y: 16 });

  // Subtle floating animation on decorative shapes
  useEffect(() => {
    if (!shapesRef.current) return;

    const shapes = shapesRef.current.querySelectorAll('.not-found__shape');
    const tweens: gsap.core.Tween[] = [];

    shapes.forEach((shape, i) => {
      // Entrance — scale in from 0
      gsap.fromTo(
        shape,
        { scale: 0, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          duration: 1.2,
          delay: i * 0.08,
          ease: 'elastic.out(0.5, 0.4)',
        }
      );

      // Continuous gentle float
      const tween = gsap.to(shape, {
        y: `random(-12, 12)`,
        x: `random(-8, 8)`,
        rotation: `+=${(i % 2 === 0 ? 1 : -1) * 4}`,
        duration: `random(3, 5)`,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
        delay: i * 0.3,
      });

      tweens.push(tween);
    });

    return () => {
      tweens.forEach((t) => t.kill());
    };
  }, []);

  return (
    <main data-theme="dark" className="not-found">
      {/* Decorative background shapes */}
      <div ref={shapesRef} className="not-found__shapes" aria-hidden="true">
        {SHAPES.map(({ id, color, opacity }) => (
          <svg
            key={id}
            className={`not-found__shape not-found__shape--${id}`}
            viewBox="0 0 757 620"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ color, opacity: 0 }}
          >
            <path d={OVAL} fill="currentColor" fillOpacity={opacity} />
          </svg>
        ))}
      </div>

      {/* Content */}
      <div className="not-found__content">
        <h1 ref={codeRef} className="not-found__code">404</h1>
        <h2 ref={headingRef} className="not-found__heading">Page not found</h2>
        <p ref={bodyRef as React.RefObject<HTMLParagraphElement>} className="not-found__body">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link
          href="/"
          ref={ctaRef as React.RefObject<HTMLAnchorElement>}
          className="not-found__cta"
        >
          <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path
              d="M10 12L6 8l4-4"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Back to home
        </Link>
      </div>
    </main>
  );
}
