'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { gsap, CustomEase } from '@/lib/gsap';
import { useTransition } from '@/context/TransitionContext';
import './PageTransition.css';

export default function PageTransition() {
  const { isTransitioning, nextTitle, pendingHref, onLeaveComplete } = useTransition();
  const pathname = usePathname();
  const router = useRouter();

  const panelRef = useRef<HTMLDivElement>(null);
  const panelTopRef = useRef<HTMLDivElement>(null);
  const panelBottomRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const titleInnerRef = useRef<HTMLSpanElement>(null);

  const reducedMotionRef = useRef(false);
  const wasTransitioningRef = useRef(false);
  const pendingHrefRef = useRef<string | null>(null);

  useEffect(() => {
    reducedMotionRef.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    CustomEase.create('osmo', '0.625, 0.05, 0, 1');
  }, []);

  useEffect(() => {
    pendingHrefRef.current = pendingHref;
  }, [pendingHref]);

  // Leave animation — fires when a transition is triggered
  useEffect(() => {
    if (!isTransitioning) return;

    wasTransitioningRef.current = true;

    const href = pendingHrefRef.current;

    if (reducedMotionRef.current) {
      if (href) router.push(href);
      onLeaveComplete();
      return;
    }

    const panel = panelRef.current;
    const panelTop = panelTopRef.current;
    const panelBottom = panelBottomRef.current;
    const titleWrapper = titleRef.current;
    const titleInner = titleInnerRef.current;

    if (!panel || !panelTop || !panelBottom || !titleWrapper || !titleInner) return;

    titleInner.textContent = nextTitle;

    const tl = gsap.timeline({
      onComplete: () => {
        const dest = pendingHrefRef.current;
        if (dest) router.push(dest);
        onLeaveComplete();
      },
    });

    tl.set(panel, { autoAlpha: 1, yPercent: 0 });
    tl.set(panelTop, { scaleY: 0, height: '15vw' });
    tl.set(panelBottom, { scaleY: 1, height: '20vw' });
    tl.set(titleInner, { yPercent: 105 });
    tl.fromTo(panel, { yPercent: 0 }, { yPercent: -100, duration: 1, ease: 'osmo', overwrite: 'auto' });
    tl.fromTo(panelTop, { scaleY: 0 }, { scaleY: 1, duration: 1, overwrite: 'auto' }, '<');
    tl.to(titleWrapper, { opacity: 1, duration: 0 }, '<+=0.3');
    tl.fromTo(titleInner, { yPercent: 105 }, { yPercent: 0, duration: 0.8, ease: 'expo.out', overwrite: 'auto' }, '<');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTransitioning]);

  // Enter animation — fires when the new page's pathname is active
  useEffect(() => {
    if (!wasTransitioningRef.current) return;
    wasTransitioningRef.current = false;

    if (reducedMotionRef.current) return;

    const panel = panelRef.current;
    const panelBottom = panelBottomRef.current;
    const titleInner = titleInnerRef.current;

    if (!panel || !panelBottom || !titleInner) return;

    const tl = gsap.timeline();

    tl.fromTo(panel, { yPercent: -100 }, { yPercent: -200, duration: 1, ease: 'osmo', overwrite: 'auto' }, 1.35);
    tl.fromTo(panelBottom, { scaleY: 1 }, { scaleY: 0, duration: 1, overwrite: 'auto' }, '<');
    tl.to(titleInner, { yPercent: -130, duration: 1.2, ease: 'expo.inOut', overwrite: 'auto' }, 1.0);
    tl.set(panel, { autoAlpha: 0 }, '>');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return (
    <div className="pt-wrap">
      <div ref={panelRef} className="pt-panel">
        <div ref={panelTopRef} className="pt-panel-top">
          <div className="pt-panel-circle" />
        </div>
        <div ref={panelBottomRef} className="pt-panel-bottom">
          <div className="pt-panel-circle" />
        </div>
      </div>
      <div ref={titleRef} className="pt-title">
        <span ref={titleInnerRef} className="pt-title-inner" />
      </div>
    </div>
  );
}
