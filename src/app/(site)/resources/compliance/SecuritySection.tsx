'use client';

import CheckIcon from '@/components/ui/CheckIcon';
import { useTextReveal } from '@/hooks/useTextReveal';
import { useFadeUp } from '@/hooks/useFadeUp';
import './SecuritySection.css';

interface Credential {
  label: string;
  description: string;
}

interface Props {
  heading: string;
  body?: string;
  credentials: Credential[];
  badgesImageUrl?: string;
  badgesImageAlt?: string;
}

/**
 * Compliance — Data security section.
 * Split layout: heading + body + credentials list on the left,
 * security badges graphic on the right (sticky on desktop).
 */
export default function SecuritySection({
  heading,
  body,
  credentials,
  badgesImageUrl,
  badgesImageAlt,
}: Props) {
  const labelRef    = useFadeUp({ delay: 0,    duration: 0.5, y: 12 });
  const headingRef  = useTextReveal({ delay: 0.05 });
  const bodyRef     = useFadeUp({ delay: 0.2,  duration: 0.6, y: 16 });
  const listRef     = useFadeUp({
    selector: '.security-section__item',
    stagger: 0.05,
    duration: 0.5,
    y: 12,
  });
  const visualRef   = useFadeUp({ delay: 0.1, duration: 0.7, y: 20 });

  return (
    <section id="data-security" data-theme="brand-purple" className="security-section section">
      <div className="container">
        <div className="security-section__grid">

          {/* ── Left — heading + body + checklist ─────────── */}
          <div className="security-section__text">
            <span ref={labelRef as React.RefObject<HTMLSpanElement>} data-animate="" className="section-label">
              Data security
            </span>
            <h2 ref={headingRef as React.RefObject<HTMLHeadingElement>} data-animate="" className="section-heading max-ch-20">
              {heading}
            </h2>
            {body && (
              <p ref={bodyRef as React.RefObject<HTMLParagraphElement>} data-animate="" className="section-intro text-body--lg leading--snug">
                {body}
              </p>
            )}

            <ul ref={listRef as React.RefObject<HTMLUListElement>} className="security-section__list">
              {credentials.map((c, i) => (
                <li key={`${c.label}-${i}`} className="security-section__item">
                  <span className="security-section__item-icon" aria-hidden="true">
                    <CheckIcon size={14} />
                  </span>
                  <div className="security-section__item-text">
                    <h3 className="security-section__item-label text-h5 color--primary">
                      {c.label}
                    </h3>
                    <p className="security-section__item-description text-body--sm leading--snug color--secondary">
                      {c.description}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Right — sticky badges visual ──────────────── */}
          <aside
            ref={visualRef as React.Ref<HTMLElement>}
            data-animate=""
            className="security-section__visual"
          >
            <div className="security-section__visual-sticky">
              {badgesImageUrl ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={badgesImageUrl}
                  alt={badgesImageAlt ?? 'Security accreditation badges'}
                  className="security-section__badges-img"
                  loading="lazy"
                />
              ) : (
                <div className="security-section__badges-placeholder" aria-hidden="true">
                  <BadgePlaceholders />
                </div>
              )}
            </div>
          </aside>

        </div>
      </div>
    </section>
  );
}

/* Placeholder visual — a tasteful 2×2 grid of "ISO / Cyber Essentials Plus /
   WCAG 2.2 / ISO 27001" badge mock-ups so the section reads correctly until
   the real graphic is uploaded. */
function BadgePlaceholders() {
  const badges = [
    'ISO 27001',
    'ISO 9001',
    'Cyber Essentials Plus',
    'WCAG 2.2',
  ];
  return (
    <div className="security-section__placeholder-grid">
      {badges.map((label) => (
        <div key={label} className="security-section__placeholder-badge">
          <div className="security-section__placeholder-icon" aria-hidden="true">
            <CheckIcon size={28} />
          </div>
          <span className="security-section__placeholder-label text-label--sm color--secondary">
            {label}
          </span>
        </div>
      ))}
    </div>
  );
}
