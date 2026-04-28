'use client';

import CheckIcon from '@/components/ui/CheckIcon';
import { useTextReveal } from '@/hooks/useTextReveal';
import { useFadeUp } from '@/hooks/useFadeUp';
import type { ThemeVariant } from '@/lib/theme';
import './ChecklistSection.css';

export interface ChecklistItem {
  label: string;
  description: string;
}

interface Props {
  eyebrow?: string;
  heading: string;
  body?: string;
  items: ChecklistItem[];
  /** Number of card columns at desktop. Default: 2 */
  columns?: 2 | 3;
  theme?: ThemeVariant;
}

/**
 * Section header + responsive grid of check-icon trust cards.
 * Used for compliance / credentials / accessibility-feature sections.
 */
export default function ChecklistSection({
  eyebrow,
  heading,
  body,
  items,
  columns = 2,
  theme = 'brand-purple',
}: Props) {
  const labelRef   = useFadeUp({ delay: 0,    duration: 0.5, y: 12 });
  const headingRef = useTextReveal({ delay: 0.05 });
  const bodyRef    = useFadeUp({ delay: 0.2,  duration: 0.6, y: 16 });
  const gridRef    = useFadeUp({
    selector: '.checklist-section__item',
    stagger: 0.06,
    duration: 0.5,
    y: 16,
  });

  if (!items || items.length === 0) return null;

  return (
    <section data-theme={theme} className="checklist-section section">
      <div className="container">
        <div className="checklist-section__header stack--md">
          {eyebrow && (
            <span ref={labelRef as React.RefObject<HTMLSpanElement>} data-animate="" className="section-label">
              {eyebrow}
            </span>
          )}
          <h2 ref={headingRef as React.RefObject<HTMLHeadingElement>} data-animate="" className="section-heading">
            {heading}
          </h2>
          {body && (
            <p ref={bodyRef as React.RefObject<HTMLParagraphElement>} data-animate="" className="section-intro text-body--lg leading--snug">
              {body}
            </p>
          )}
        </div>

        <div
          ref={gridRef as React.RefObject<HTMLDivElement>}
          className={`checklist-section__items checklist-section__items--cols-${columns}`}
        >
          {items.map((item, i) => (
            <article key={`${item.label}-${i}`} className="checklist-section__item">
              <span className="checklist-section__icon" aria-hidden="true">
                <CheckIcon size={16} />
              </span>
              <div className="checklist-section__text">
                <h3 className="checklist-section__label text-h5 color--primary">
                  {item.label}
                </h3>
                <p className="checklist-section__description text-body--md leading--snug color--secondary">
                  {item.description}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
