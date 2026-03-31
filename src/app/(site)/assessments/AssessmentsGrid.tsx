'use client';

import Link from 'next/link';
import { useFadeUp } from '@/hooks/useFadeUp';
import { ACCENT_COLORS, accentStyles } from '@/lib/theme';

interface JobCategory {
  _id: string;
  name: string;
  slug: string;
  keyDimensionsAssessed?: string;
}

interface AssessmentsGridProps {
  categories: JobCategory[];
}

export default function AssessmentsGrid({ categories }: AssessmentsGridProps) {
  const gridRef = useFadeUp({ selector: '.job-family-card', stagger: 0.08, delay: 0.1, y: 24 });

  return (
    <section className="assessments-grid-section">
      <div className="container">
        <div
          ref={gridRef as React.RefObject<HTMLDivElement>}
          className="grid--auto"
        >
          {categories.map((category, index) => {
            const accent = ACCENT_COLORS[index % ACCENT_COLORS.length];
            const { border } = accentStyles[accent];
            return (
              <Link
                key={category._id}
                href={`/assessments/${category.slug}`}
                className="job-family-card"
                data-animate=""
              >
                <div
                  className="card"
                  style={{ borderTopColor: border }}
                >
                  <h5 className="text-h5 job-family-card__name">{category.name}</h5>
                  {category.keyDimensionsAssessed && (
                    <p className="text-body--xs color--tertiary job-family-card__dimensions">
                      {category.keyDimensionsAssessed}
                    </p>
                  )}
                  <span className="text-label--sm color--brand job-family-card__arrow">
                    View roles →
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
