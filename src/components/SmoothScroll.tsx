'use client';
import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import Lenis from 'lenis';
import { gsap, ScrollTrigger } from '@/lib/gsap';

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    /* Lerp-based config — simpler than duration+easing, scales naturally
       with frame rate, and avoids the small overshoot/jitter that the
       custom expo easing could produce on long pages with many sticky
       elements + ScrollTriggers. lerp: 0.1 is the Lenis default and
       feels smooth without dragging. */
    const lenis = new Lenis({
      lerp: 0.1,
      smoothWheel: true,
      /* Don't smooth touch — native iOS / Android momentum is better than
         anything we can synthesise, and forcing smooth touch is a common
         source of jitter on mobile. */
      syncTouch: false,
      touchMultiplier: 1.5,
    });
    lenisRef.current = lenis;

    lenis.on('scroll', ScrollTrigger.update);

    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    /* Refresh ScrollTrigger positions after Lenis is wired up AND after
       fonts / images / late layout have settled. Without this refresh,
       triggers measured at hydration can land at stale Y positions
       (especially for elements deep in the page like the footer
       CTAStatement) — they fire off-screen and, because we use
       once: true, the animation runs into nothing and the elements
       stay at opacity: 0. The symptom is "card outline visible, but
       heading / buttons missing" on intermittent loads. */
    const refresh = () => ScrollTrigger.refresh();
    const initialRefresh = window.setTimeout(refresh, 120);
    window.addEventListener('load', refresh);

    return () => {
      window.clearTimeout(initialRefresh);
      window.removeEventListener('load', refresh);
      lenis.destroy();
      lenisRef.current = null;
      gsap.ticker.remove(tick);
    };
  }, []);

  /* ── Scroll-to-top on route change ──
     Next.js's default scroll restoration calls window.scrollTo(0, 0) on
     navigation, but Lenis manages its own scroll state and that native
     call doesn't reset Lenis's tracked position. As a result the new page
     would land at the previous page's scroll offset. Force Lenis to jump
     to top whenever the pathname changes. */
  useEffect(() => {
    const lenis = lenisRef.current;
    if (!lenis) return;
    lenis.scrollTo(0, { immediate: true, force: true });
    /* New page layout = potentially different scroll heights for every
       trigger that lives inside the persistent layout (nav, footer,
       SmoothScroll wrapper). Re-measure once the new content has
       painted so triggers attach to correct Y positions. */
    const t = window.setTimeout(() => ScrollTrigger.refresh(), 80);
    return () => window.clearTimeout(t);
  }, [pathname]);

  return <>{children}</>;
}
