'use client';

import { useFadeUp } from '@/hooks/useFadeUp';
import { useTextReveal } from '@/hooks/useTextReveal';

interface ExamplesSectionProps {
  heading?: string;
  subheading?: string;
  assessmentsBlockHeading?: string;
  assessmentsBlockBody?: string;
  portalBlockHeading?: string;
  portalBlockBody?: string;
  interviewBlockHeading?: string;
  interviewBlockBody?: string;
}

export default function ExamplesSection({
  heading,
  subheading,
  assessmentsBlockHeading,
  assessmentsBlockBody,
  portalBlockHeading,
  portalBlockBody,
  interviewBlockHeading,
  interviewBlockBody,
}: ExamplesSectionProps) {
  const headingRef = useTextReveal({ delay: 0.05 });
  const subheadingRef = useFadeUp({ delay: 0.2, duration: 0.6, y: 16 });
  const cardsRef = useFadeUp({ selector: '.card', stagger: 0.1, delay: 0.1, y: 28 });

  const blocks = [
    { badge: '01', blockHeading: assessmentsBlockHeading, blockBody: assessmentsBlockBody },
    { badge: '02', blockHeading: portalBlockHeading, blockBody: portalBlockBody },
    { badge: '03', blockHeading: interviewBlockHeading, blockBody: interviewBlockBody },
  ];

  return (
    <section className="examples-section">
      <div className="container">

        {(heading || subheading) && (
          <div className="examples-section__header">
            {heading && (
              <h2
                ref={headingRef as React.RefObject<HTMLHeadingElement>}
                data-animate=""
                className="section-heading"
              >
                {heading}
              </h2>
            )}
            {subheading && (
              <p
                ref={subheadingRef as React.RefObject<HTMLParagraphElement>}
                data-animate=""
                className="section-intro"
              >
                {subheading}
              </p>
            )}
          </div>
        )}

        <div
          ref={cardsRef as React.RefObject<HTMLDivElement>}
          className="grid--3"
        >
          {blocks.map(({ badge, blockHeading, blockBody }) => (
            <div key={badge} className="card" data-animate="">
              <span className="section-label example-card__badge">{badge}</span>
              {blockHeading && (
                <h5 className="text-h5">{blockHeading}</h5>
              )}
              {blockBody && (
                <p className="text-body--sm color--secondary">{blockBody}</p>
              )}
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
