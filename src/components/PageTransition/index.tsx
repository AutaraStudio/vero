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

  const wrapRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const panelTopRef = useRef<HTMLDivElement>(null);
  const panelBottomRef = useRef<HTMLDivElement>(null);
  const titleWrapRef = useRef<HTMLDivElement>(null);
  const titleInnerRef = useRef<HTMLSpanElement>(null);

  const reducedMotionRef = useRef(false);
  const wasTransitioningRef = useRef(false);
  const pendingHrefRef = useRef<string | null>(null);

  // Mount — register ease, check reduced motion, set initial GSAP states
  useEffect(() => {
    reducedMotionRef.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    CustomEase.create('osmo', '0.625, 0.05, 0, 1');
    if (panelRef.current) gsap.set(panelRef.current, { autoAlpha: 0, yPercent: 0 });
    if (panelTopRef.current) gsap.set(panelTopRef.current, { scaleY: 0, height: 0 });
    if (panelBottomRef.current) gsap.set(panelBottomRef.current, { scaleY: 0, height: 0 });
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
    const titleWrap = titleWrapRef.current;
    const titleInner = titleInnerRef.current;
    const mainEl = document.querySelector('main');

    if (!panel || !panelTop || !panelBottom || !titleWrap || !titleInner) return;

    titleInner.textContent = nextTitle;

    const tl = gsap.timeline({
      onComplete: () => {
        const dest = pendingHrefRef.current;
        if (dest) router.push(dest);
        onLeaveComplete();
      },
    });

    tl.set(panel, { autoAlpha: 1, yPercent: 0 }, 0);
    tl.set(panelTop, { height: '15vw', scaleY: 0 }, 0);
    tl.set(panelBottom, { height: '20vw', scaleY: 1 }, 0);
    tl.set(titleWrap, { opacity: 0 }, 0);
    tl.set(titleInner, { yPercent: 105 }, 0);

    tl.fromTo(panel, { yPercent: 0 }, { yPercent: -100, duration: 1, ease: 'osmo' }, 0);
    tl.fromTo(panelTop, { scaleY: 0 }, { scaleY: 1, duration: 1, ease: 'osmo' }, '<');
    if (mainEl) {
      tl.fromTo(mainEl, { y: 0 }, { y: '-15dvh', duration: 1, ease: 'osmo', clearProps: 'y' }, 0);
    }
    tl.to(titleWrap, { opacity: 1, duration: 0.01 }, '<+=0.3');
    tl.fromTo(titleInner, { yPercent: 105 }, { yPercent: 0, duration: 0.8, ease: 'expo.out' }, '<');
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
    const mainEl = document.querySelector('main');

    if (!panel || !panelBottom || !titleInner) return;

    const tl = gsap.timeline();

    tl.add('startEnter', 1.35);

    if (mainEl) tl.set(mainEl, { autoAlpha: 1 }, 'startEnter');

    tl.fromTo(
      panel,
      { yPercent: -100 },
      { yPercent: -200, duration: 1, ease: 'osmo', overwrite: 'auto', immediateRender: false },
      'startEnter'
    );
    tl.fromTo(panelBottom, { scaleY: 1 }, { scaleY: 0, duration: 1, ease: 'osmo' }, '<');
    tl.set(panel, { autoAlpha: 0 }, '>');
    tl.set(panelTopRef.current, { height: 0, scaleY: 0 }, '>');
    tl.set(panelBottomRef.current, { height: 0, scaleY: 0 }, '>');

    tl.to(titleInner, { yPercent: -130, duration: 1.2, ease: 'expo.inOut' }, 'startEnter-=0.4');

    if (mainEl) {
      tl.from(mainEl, { y: '25dvh', duration: 1, ease: 'osmo', clearProps: 'y' }, 'startEnter');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return (
    <div ref={wrapRef} className="pt-wrap">
      <div ref={panelRef} className="pt-panel">
        <div ref={panelTopRef} className="pt-panel-top">
          <div
            className="pt-panel-circle"
            style={{
              position: 'absolute',
              bottom: 0,
              left: '-12.5%',
              width: '125%',
              height: '500%',
              backgroundColor: '#201d1d',
              borderRadius: '50%',
            }}
          />
        </div>
        <div ref={panelBottomRef} className="pt-panel-bottom">
          <div
            className="pt-panel-circle"
            style={{
              position: 'absolute',
              top: 0,
              left: '-12.5%',
              width: '125%',
              height: '500%',
              backgroundColor: '#201d1d',
              borderRadius: '50%',
            }}
          />
        </div>
      </div>
      <div ref={titleWrapRef} className="pt-title">
        <span ref={titleInnerRef} className="pt-title-inner" />
      </div>
    </div>
  );
}
