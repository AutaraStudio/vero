'use client';

import { useRef, useEffect } from 'react';
import { gsap } from '@/lib/gsap';
import { ScrollTrigger } from '@/lib/gsap';
import './StickyTabs.css';

export interface StickyTabItem {
  theme?: string;
  label: string;
  children: React.ReactNode;
}

interface StickyTabsProps {
  tabs: StickyTabItem[];
}

export default function StickyTabs({ tabs }: StickyTabsProps) {
  const groupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = groupRef.current;
    if (!root) return;

    const headings = gsap.utils.toArray<HTMLElement>('.sticky-tab__title', root);

    const triggers = headings.map((heading) =>
      gsap.fromTo(
        heading,
        { opacity: 0, y: 12, filter: 'blur(6px)' },
        {
          opacity: 1,
          y: 0,
          filter: 'blur(0px)',
          duration: 0.7,
          ease: 'vero.out',
          scrollTrigger: {
            trigger: heading,
            start: 'top 85%',
          },
        }
      )
    );

    return () => {
      triggers.forEach((t) => {
        if (t.scrollTrigger) t.scrollTrigger.kill();
        t.kill();
      });
    };
  }, []);

  return (
    <div ref={groupRef} className="sticky-tab-group">
      <div className="sticky-tab-group__nav-bg" />

      {tabs.map((tab, index) => (
        <section key={index} className="sticky-tab" data-theme={tab.theme}>
          {/* Sticky heading bar */}
          <div className="sticky-tab__sticky">
            <div className="sticky-tab__inner border--top border--bottom">
              <div className="container">
                <div className="sticky-tab__content flex--between">
                  <h3 className="sticky-tab__title text-h3 color--primary">
                    {tab.label}
                  </h3>
                </div>
              </div>
            </div>
          </div>

          {/* Tab body */}
          <div className="container">
            <div className="sticky-tab__body bordered-section">
              <div className="sticky-tab__body-inner">
                {tab.children}
              </div>
            </div>
          </div>
        </section>
      ))}
    </div>
  );
}
