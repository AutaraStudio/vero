'use client';

import { useFadeUp } from '@/hooks/useFadeUp';
import type { ThemeVariant } from '@/lib/theme';
import './SocialProofStrip.css';

export interface SocialProofLogo {
  name: string;
  imageUrl?: string;
  imageAlt?: string;
}

interface Props {
  label?: string;
  logos: SocialProofLogo[];
  theme?: ThemeVariant;
}

export default function SocialProofStrip({
  label = 'Trusted by hiring teams at',
  logos,
  theme = 'dark',
}: Props) {
  const labelRef = useFadeUp({ delay: 0,    duration: 0.5, y: 12 });
  const rowRef   = useFadeUp({ delay: 0.15, duration: 0.6, y: 16 });

  if (!logos || logos.length === 0) return null;

  return (
    <section data-theme={theme} className="social-proof section--sm">
      <div className="container social-proof__inner">
        <span
          ref={labelRef as React.RefObject<HTMLSpanElement>}
          data-animate=""
          className="social-proof__label text-label--sm color--tertiary"
        >
          {label}
        </span>

        <ul
          ref={rowRef as React.RefObject<HTMLUListElement>}
          data-animate=""
          className="social-proof__row"
        >
          {logos.map((logo, i) => (
            <li key={`${logo.name}-${i}`} className="social-proof__item">
              {logo.imageUrl ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={logo.imageUrl}
                  alt={logo.imageAlt ?? logo.name}
                  className="social-proof__logo"
                  loading="lazy"
                />
              ) : (
                <span className="social-proof__name text-body--md font--medium color--secondary">
                  {logo.name}
                </span>
              )}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
