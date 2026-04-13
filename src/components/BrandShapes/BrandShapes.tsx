'use client';

import { useRef, useEffect } from 'react';
import { gsap } from '@/lib/gsap';
import './BrandShapes.css';

const OVAL =
  'M179.706 0C110.336 0 54.198 21.485 23.683 65.807C-48.912 171.251 50.983 366.022 246.806 500.839C360.314 578.987 481.134 619.838 576.794 619.838C646.163 619.838 702.303 598.351 732.818 554.03C805.412 448.586 705.516 253.817 509.694 118.998C396.184 40.851 275.364 0 179.706 0Z';

interface ShapeDef {
  id: string;
  colourVar: string;
  opacity: number;
}

const SHAPES: ShapeDef[] = [
  { id: 'a', colourVar: 'var(--shape-c1)', opacity: 1    },
  { id: 'b', colourVar: 'var(--shape-c2)', opacity: 0.6  },
  { id: 'c', colourVar: 'var(--shape-c3)', opacity: 0.25 },
  { id: 'd', colourVar: 'var(--shape-c4)', opacity: 1    },
  { id: 'e', colourVar: 'var(--shape-c1)', opacity: 0.15 },
  { id: 'f', colourVar: 'var(--shape-c5)', opacity: 0.08 },
];

export default function BrandShapes() {
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!wrapRef.current) return;

    const shapes = Array.from(wrapRef.current.querySelectorAll('.brand-shape'));
    if (shapes.length === 0) return;

    // ── Entrance: smooth scale + fade in on page load ──
    const enterTl = gsap.timeline();

    enterTl.fromTo(
      shapes,
      { opacity: 0, scale: 0.3 },
      {
        opacity: 1,
        scale: 1,
        duration: 1.4,
        ease: 'elastic.out(0.6, 0.4)',
        stagger: { each: 0.1, from: 'edges' },
        delay: 0.4,
      }
    );

    // ── Exit on scroll down, replay on scroll back to top ──
    let isVisible = true;

    const onScroll = () => {
      const scrollY = window.scrollY;

      if (scrollY > 100 && isVisible) {
        // Scrolled down — pop out
        isVisible = false;
        gsap.to(shapes, {
          scale: 0,
          opacity: 0,
          duration: 0.6,
          ease: 'power3.in',
          stagger: { each: 0.05, from: 'center' },
        });
      } else if (scrollY <= 30 && !isVisible) {
        // Scrolled back to top — replay entrance
        isVisible = true;
        gsap.fromTo(
          shapes,
          { opacity: 0, scale: 0.3 },
          {
            opacity: 1,
            scale: 1,
            duration: 1.4,
            ease: 'elastic.out(0.6, 0.4)',
            stagger: { each: 0.1, from: 'edges' },
          }
        );
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      enterTl.kill();
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  return (
    <div ref={wrapRef} className="brand-shapes" aria-hidden="true">
      {SHAPES.map(({ id, colourVar, opacity }) => (
        <svg
          key={id}
          className={`brand-shape brand-shape--${id}`}
          viewBox="0 0 757 620"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ color: colourVar, '--shape-opacity': opacity } as React.CSSProperties}
        >
          <path d={OVAL} fill="currentColor" />
        </svg>
      ))}
    </div>
  );
}
