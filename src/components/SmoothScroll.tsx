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

    return () => {
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
  }, [pathname]);

  return <>{children}</>;
}
