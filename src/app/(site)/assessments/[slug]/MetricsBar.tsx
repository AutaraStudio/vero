'use client';

import { useCountUp } from '@/hooks/useCountUp';
import type { ThemeVariant } from '@/lib/theme';

function parseStatHeading(heading: string): { prefix: string; end: number; suffix: string } | null {
  const match = heading.match(/^([^0-9]*)([0-9][0-9,]*(?:\.[0-9]+)?)(.*)$/);
  if (!match) return null;
  const num = parseFloat(match[2].replace(/,/g, ''));
  if (isNaN(num)) return null;
  return { prefix: match[1], end: num, suffix: match[3] };
}

function StatItem({ heading, body }: { heading?: string; body?: string }) {
  const parsed = heading ? parseStatHeading(heading) : null;
  const countRef = useCountUp({
    end: parsed?.end ?? 0,
    prefix: parsed?.prefix ?? '',
    suffix: parsed?.suffix ?? '',
  });

  if (!heading) return null;

  return (
    <div className="metrics-bar__stat">
      {parsed ? (
        <span
          ref={countRef as React.RefObject<HTMLSpanElement>}
          className="text-h3 color--primary"
        >
          {heading}
        </span>
      ) : (
        <span className="text-h3 color--primary">{heading}</span>
      )}
      {body && (
        <p className="text-body--sm color--secondary">{body}</p>
      )}
    </div>
  );
}

interface MetricsBarProps {
  stat1Heading?: string;
  stat1Body?: string;
  stat2Heading?: string;
  stat2Body?: string;
  stat3Heading?: string;
  stat3Body?: string;
  theme?: ThemeVariant;
}

export default function MetricsBar({
  stat1Heading,
  stat1Body,
  stat2Heading,
  stat2Body,
  stat3Heading,
  stat3Body,
  theme = 'brand-purple-deep',
}: MetricsBarProps) {
  return (
    <section data-theme={theme} className="metrics-bar">
      <div className="container">
        <div className="metrics-bar__inner">
          <StatItem heading={stat1Heading} body={stat1Body} />
          <StatItem heading={stat2Heading} body={stat2Body} />
          <StatItem heading={stat3Heading} body={stat3Body} />
        </div>
      </div>
    </section>
  );
}
