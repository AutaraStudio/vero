'use client';

import Button from '@/components/ui/Button';
import { useTextReveal } from '@/hooks/useTextReveal';
import { useFadeUp } from '@/hooks/useFadeUp';

export default function AssessmentsHero() {
  const badgeRef = useFadeUp({ scroll: false, delay: 0.1, duration: 0.5, y: 16 });
  const titleRef = useTextReveal({ scroll: false, delay: 0.3 });
  const introRef = useFadeUp({ scroll: false, delay: 0.7, duration: 0.6, y: 16 });
  const ctaRef = useFadeUp({ scroll: false, delay: 0.9, duration: 0.5, y: 16 });

  return (
    <section className="assessments-hero section--flush">
      <div className="container">
        <div className="bordered-section assessments-hero__header">
          <div className="assessments-hero__header-inner">
            <span
              ref={badgeRef as React.RefObject<HTMLSpanElement>}
              data-animate=""
              className="section-label"
            >
              Assessments
            </span>

            <h1
              ref={titleRef as React.RefObject<HTMLHeadingElement>}
              data-animate=""
              className="text-h1 text-balance assessments-hero__title"
            >
              Assessments built for your roles
            </h1>

            <p
              ref={introRef as React.RefObject<HTMLParagraphElement>}
              data-animate=""
              className="text-body--lg leading--snug text-centre max-ch-55 mx-auto assessments-hero__intro"
            >
              Structured assessments designed around specific job families. Identify the right people faster with tools built for the roles you&apos;re actually hiring.
            </p>

            <div
              ref={ctaRef as React.RefObject<HTMLDivElement>}
              data-animate=""
              className="assessments-hero__cta"
            >
              <Button variant="cta" size="lg" href="/get-started">
                Get started
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
