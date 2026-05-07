'use client';

import Image from 'next/image';
import { useTextReveal } from '@/hooks/useTextReveal';
import { useFadeUp } from '@/hooks/useFadeUp';
import ContactForm from '@/components/ContactForm';
import ContactMethods from '@/app/(site)/contact/ContactMethods';
import FooterFan from '@/components/Footer/FooterFan';
import './coming-soon.css';

interface Props {
  heading: string;
  description?: string | null;
  launchDateLabel?: string | null;
  formInstructions?: string | null;
  phone?: string | null;
  email?: string | null;
}

export default function ComingSoonClient({
  heading,
  description,
  launchDateLabel,
  formInstructions,
  phone,
  email,
}: Props) {
  const logoRef    = useFadeUp({ scroll: false, delay: 0,    duration: 0.6, y: 12 });
  const eyebrowRef = useFadeUp({ scroll: false, delay: 0.15, duration: 0.5, y: 12 });
  const headingRef = useTextReveal({ scroll: false, delay: 0.3, duration: 0.7 });
  const bodyRef    = useFadeUp({ scroll: false, delay: 0.55, duration: 0.6, y: 16 });
  const formRef    = useFadeUp({ scroll: false, delay: 0.7,  duration: 0.6, y: 16 });
  const methodsRef = useFadeUp({ scroll: false, delay: 0.8,  duration: 0.6, y: 16 });

  return (
    /* FooterFan in the bottom-right corner — the same brand-shape
       fan used at the foot of marketing pages, set to fire on mount
       (no scroll trigger) since the holding page is single-viewport. */
    <main data-theme="brand-purple" className="coming-soon">
      <FooterFan position="bottom-right" trigger="load" />

      <div className="coming-soon__inner">

        <header className="coming-soon__header">
          <div
            ref={logoRef as React.RefObject<HTMLDivElement>}
            className="coming-soon__logo"
          >
            <Image
              src="/logo.svg"
              alt="Vero Assess"
              width={140}
              height={40}
              priority
              style={{ width: 'auto', height: 'clamp(2rem, 4vh, 2.75rem)' }}
            />
          </div>

          {launchDateLabel && (
            <p
              ref={eyebrowRef as React.RefObject<HTMLParagraphElement>}
              className="coming-soon__eyebrow text-label--sm"
            >
              Coming {launchDateLabel}
            </p>
          )}
          <h1
            ref={headingRef as React.RefObject<HTMLHeadingElement>}
            className="coming-soon__heading text-display--lg text-balance max-ch-22 color--primary"
          >
            {heading}
          </h1>
          {description && (
            <p
              ref={bodyRef as React.RefObject<HTMLParagraphElement>}
              className="coming-soon__body text-body--lg color--secondary leading--snug"
            >
              {description}
            </p>
          )}
        </header>

        <div className="coming-soon__grid">
          <div ref={formRef as React.RefObject<HTMLDivElement>} className="coming-soon__form">
            <header className="coming-soon__form-header stack--md">
              <h2 className="text-h4 color--primary">Send us a message</h2>
              {formInstructions && (
                <p className="text-body--md color--secondary leading--snug">
                  {formInstructions}
                </p>
              )}
            </header>
            <ContactForm />
          </div>

          <div
            ref={methodsRef as React.RefObject<HTMLDivElement>}
            className="coming-soon__methods"
          >
            <ContactMethods phone={phone ?? undefined} email={email ?? undefined} />
          </div>
        </div>
      </div>
    </main>
  );
}
