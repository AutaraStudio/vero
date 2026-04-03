'use client';

import { useFadeUp } from '@/hooks/useFadeUp';
import type { ThemeVariant } from '@/lib/theme';

interface StatsSectionProps {
  stat1Heading: string;
  stat1Body: string;
  stat2Heading: string;
  stat2Body: string;
  stat3Heading: string;
  stat3Body: string;
  theme?: ThemeVariant;
}

export default function StatsSection({
  stat1Heading,
  stat1Body,
  stat2Heading,
  stat2Body,
  stat3Heading,
  stat3Body,
  theme = 'brand-purple',
}: StatsSectionProps) {
  const gridRef = useFadeUp({
    selector: '.stats-section__stat',
    stagger: 0.1,
    y: 20,
  });

  const stats = [
    { heading: stat1Heading, body: stat1Body },
    { heading: stat2Heading, body: stat2Body },
    { heading: stat3Heading, body: stat3Body },
  ];

  return (
    <section data-theme={theme} className="stats-section section border--bottom">
      <div className="container">
        <div
          ref={gridRef as React.RefObject<HTMLDivElement>}
          className="stats-section__grid"
        >
          {stats.map((stat, i) => (
            <div key={i} className="stats-section__stat" data-animate="">
              <span className="text-h2 font--semibold color--primary">{stat.heading}</span>
              <span className="text-body--sm color--secondary">{stat.body}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
