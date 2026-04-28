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
  stat4Heading?: string;
  stat4Body?: string;
  theme?: ThemeVariant;
}

export default function StatsSection({
  stat1Heading,
  stat1Body,
  stat2Heading,
  stat2Body,
  stat3Heading,
  stat3Body,
  stat4Heading,
  stat4Body,
  theme = 'brand-purple',
}: StatsSectionProps) {
  const gridRef = useFadeUp({
    selector: '.stats-section__stat',
    stagger: 0.08,
    y: 20,
  });

  const stats = [
    { heading: stat1Heading, body: stat1Body },
    { heading: stat2Heading, body: stat2Body },
    { heading: stat3Heading, body: stat3Body },
    ...(stat4Heading ? [{ heading: stat4Heading, body: stat4Body ?? '' }] : []),
  ];

  return (
    <section data-theme={theme} className="stats-section section border--bottom">
      <div className="container">
        <div
          ref={gridRef as React.RefObject<HTMLDivElement>}
          className="stats-section__grid"
          style={{ ['--stats-count' as string]: stats.length }}
        >
          {stats.map((stat, i) => (
            <article key={i} className="stats-section__stat" data-animate="">
              <span className="stats-section__index text-label--sm color--brand">
                0{i + 1}
              </span>
              <h3 className="stats-section__heading text-h3 text-balance color--primary">
                {stat.heading}
              </h3>
              <p className="stats-section__body text-body--md leading--snug color--secondary">
                {stat.body}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
