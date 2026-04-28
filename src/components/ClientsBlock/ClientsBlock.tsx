'use client';

import { useTextReveal } from '@/hooks/useTextReveal';
import { useFadeUp } from '@/hooks/useFadeUp';
import LogoMarquee, { type PartnerLogo } from '@/components/LogoMarquee';
import type { ThemeVariant } from '@/lib/theme';
import './ClientsBlock.css';

export interface ClientLogo {
  name?: string;
  url?: string;
}

interface Props {
  eyebrow?: string;
  heading: string;
  /** Lead intro paragraph (e.g. "We support clients across the public and private sector...") */
  intro?: string;
  /** Primary client logos */
  clientLogos?: ClientLogo[];
  /** Secondary intro paragraph (e.g. RPO partners) */
  secondaryIntro?: string;
  /** Secondary logos (e.g. RPO logos) */
  secondaryLogos?: ClientLogo[];
  theme?: ThemeVariant;
}

/* Map the about-page logo shape ({name, url}) to LogoMarquee's PartnerLogo shape */
function toMarqueeLogos(logos: ClientLogo[]): PartnerLogo[] {
  return (logos ?? [])
    .filter((l) => Boolean(l.url || l.name))
    .map((l) => ({
      name: l.name ?? '',
      logoUrl: l.url,
    }));
}

export default function ClientsBlock({
  eyebrow = 'Our clients',
  heading,
  intro,
  clientLogos = [],
  secondaryIntro,
  secondaryLogos = [],
  theme = 'brand-purple',
}: Props) {
  const labelRef    = useFadeUp({ delay: 0,    duration: 0.5, y: 12 });
  const headingRef  = useTextReveal({ delay: 0.05 });
  const introRef    = useFadeUp({ delay: 0.2,  duration: 0.6, y: 16 });
  const rpoIntroRef = useFadeUp({ delay: 0.1,  duration: 0.6, y: 16 });

  const mappedClients = toMarqueeLogos(clientLogos);
  const mappedRpo     = toMarqueeLogos(secondaryLogos);

  return (
    <section data-theme={theme} className="clients-block section">
      <div className="container">
        <div className="clients-block__header stack--md">
          {eyebrow && (
            <span ref={labelRef as React.RefObject<HTMLSpanElement>} data-animate="" className="section-label">
              {eyebrow}
            </span>
          )}
          <h2 ref={headingRef as React.RefObject<HTMLHeadingElement>} data-animate="" className="section-heading">
            {heading}
          </h2>
          {intro && (
            <p ref={introRef as React.RefObject<HTMLParagraphElement>} data-animate="" className="section-intro text-body--lg leading--snug">
              {intro}
            </p>
          )}
        </div>
      </div>

      {/* Primary client logo marquee — scrolls left */}
      {mappedClients.length > 0 && (
        <div className="clients-block__row">
          <LogoMarquee
            variant="inline"
            theme={theme}
            logos={mappedClients}
            direction="left"
            speed={28}
            />
        </div>
      )}

      {/* Secondary intro + RPO logo marquee — scrolls right (opposite direction
          for visual interest and to differentiate the two sets) */}
      {(secondaryIntro || mappedRpo.length > 0) && (
        <div className="clients-block__secondary">
          {secondaryIntro && (
            <div className="container">
              <p
                ref={rpoIntroRef as React.RefObject<HTMLParagraphElement>}
                data-animate=""
                className="text-body--lg leading--snug color--secondary max-ch-50"
              >
                {secondaryIntro}
              </p>
            </div>
          )}
          {mappedRpo.length > 0 && (
            <div className="clients-block__row">
              <LogoMarquee
                variant="inline"
                theme={theme}
                logos={mappedRpo}
                direction="right"
                speed={28}
                    />
            </div>
          )}
        </div>
      )}
    </section>
  );
}
