'use client';

import { useRef, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { gsap, ScrollTrigger } from '@/lib/gsap';
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

function animateIn(shapes: Element[]) {
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

function animateOut(shapes: Element[]) {
  gsap.to(shapes, {
    scale: 0,
    opacity: 0,
    duration: 0.6,
    ease: 'power3.in',
    stagger: { each: 0.05, from: 'center' },
  });
}

export default function BrandShapes() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !wrapRef.current) return;

    const shapes = Array.from(wrapRef.current.querySelectorAll('.brand-shape'));
    if (shapes.length === 0) return;

    const triggers: ScrollTrigger[] = [];

    // ── 1. Hero entrance — animate in on page load ──
    animateIn(shapes);

    // ── 2. Hero exit/re-enter on scroll ──
    let isVisible = true;

    const onScroll = () => {
      if (window.scrollY > 100 && isVisible) {
        isVisible = false;
        animateOut(shapes);
      } else if (window.scrollY <= 30 && !isVisible) {
        isVisible = true;
        animateIn(shapes);
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });

    // ── 3. Section triggers via data-shapes-trigger ──
    const triggerEls = document.querySelectorAll('[data-shapes-trigger]');

    triggerEls.forEach((el) => {
      const start = el.getAttribute('data-shapes-trigger') || 'top 80%';

      const st = ScrollTrigger.create({
        trigger: el,
        start,
        end: 'bottom top',
        onEnter: () => { isVisible = true; animateIn(shapes); },
        onLeave: () => { isVisible = false; animateOut(shapes); },
        onEnterBack: () => { isVisible = true; animateIn(shapes); },
        onLeaveBack: () => { isVisible = false; animateOut(shapes); },
      });

      triggers.push(st);
    });

    return () => {
      window.removeEventListener('scroll', onScroll);
      triggers.forEach((st) => st.kill());
    };
  }, [mounted]);

  if (!mounted) return null;

  return createPortal(
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
    </div>,
    document.body
  );
}
