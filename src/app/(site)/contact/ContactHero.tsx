'use client';

import { useTextReveal } from '@/hooks/useTextReveal';
import { useFadeUp } from '@/hooks/useFadeUp';
import './ContactHero.css';

interface Props {
  headline: string;
  intro?: string;
}

/**
 * Compact text-only hero for /contact. Centred eyebrow + heading + intro.
 * The actual contact methods + form sit in the section below.
 */
export default function ContactHero({ headline, intro }: Props) {
  const labelRef   = useFadeUp({ scroll: false, delay: 0.1, duration: 0.5, y: 12 });
  const headingRef = useTextReveal({ scroll: false, delay: 0.25 });
  const introRef   = useFadeUp({ scroll: false, delay: 0.55, duration: 0.6, y: 16 });

  return (
    <section data-theme="brand-purple" className="contact-hero">
      <div className="contact-hero__inner">
        <span
          ref={labelRef as React.Ref<HTMLSpanElement>}
          data-animate=""
          className="section-label"
        >
          Contact
        </span>
        <h1
          ref={headingRef as React.Ref<HTMLHeadingElement>}
          data-animate=""
          className="contact-hero__title text-display--xl text-balance max-ch-22"
        >
          {headline}
        </h1>
        {intro && (
          <p
            ref={introRef as React.Ref<HTMLParagraphElement>}
            data-animate=""
            className="contact-hero__intro text-body--lg leading--snug max-ch-50 text-centre mx-auto"
          >
            {intro}
          </p>
        )}
      </div>
    </section>
  );
}
