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
 *
 * Layout: pill + heading + paragraph stacked at the top (left-aligned),
 * then a two-column row beneath — credential blocks on the left, single
 * security graphic on the right (sticky on desktop).
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
        {/* ── Header — label + heading + paragraph, full width ───── */}
        <div className="security-section__header stack--md">
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
        </div>

        {/* ── Body — credential blocks left, single graphic right ─── */}
        <div className="security-section__grid">

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
                  alt={badgesImageAlt ?? 'Security accreditation graphic'}
                  className="security-section__badges-img"
                  loading="lazy"
                />
              ) : (
                <div className="security-section__badges-placeholder" aria-hidden="true">
                  <BadgePlaceholder />
                </div>
              )}
            </div>
          </aside>

        </div>
      </div>
    </section>
  );
}

/* Single tile placeholder shown until the editor uploads the real graphic.
   Subtle brand-purple tint matches the placeholder style used elsewhere. */
function BadgePlaceholder() {
  return (
    <div className="security-section__placeholder-single">
      <div className="security-section__placeholder-icon" aria-hidden="true">
        <CheckIcon size={32} />
      </div>
      <span className="security-section__placeholder-label text-label--sm color--secondary">
        Upload your security graphic
      </span>
    </div>
  );
}
