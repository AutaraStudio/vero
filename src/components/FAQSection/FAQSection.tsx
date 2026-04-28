'use client';

import { useState } from 'react';
import { useTextReveal } from '@/hooks/useTextReveal';
import { useFadeUp } from '@/hooks/useFadeUp';
import type { ThemeVariant } from '@/lib/theme';
import './FAQSection.css';

export interface PortableTextSpan {
  _type: 'span';
  text: string;
  marks?: string[];
}

export interface PortableTextBlock {
  _type: 'block';
  children: PortableTextSpan[];
  style?: string;
}

export interface FAQItem {
  question: string;
  answer: PortableTextBlock[];
}

interface Props {
  heading: string;
  faqs: FAQItem[];
  footer?: string;
  theme?: ThemeVariant;
}

function renderAnswer(blocks: PortableTextBlock[]) {
  return blocks.map((block, bi) => {
    if (block._type !== 'block') return null;
    return (
      <p key={bi} className="text-body--md color--secondary leading--snug">
        {block.children.map((span, si) => {
          const text = span.text;
          let node: React.ReactNode = text;
          if (span.marks?.includes('strong')) node = <strong key={si}>{text}</strong>;
          if (span.marks?.includes('em')) node = <em key={si}>{node}</em>;
          return <span key={si}>{node}</span>;
        })}
      </p>
    );
  });
}

/**
 * Reusable FAQ accordion section. Used on /pricing and /contact.
 * Heading + list of click-to-expand questions + optional footer line.
 */
export default function FAQSection({ heading, faqs, footer, theme = 'brand-purple' }: Props) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const headingRef = useTextReveal();
  const listRef    = useFadeUp({ selector: '.pricing-faq-item', stagger: 0.06, y: 16 });
  const footerRef  = useFadeUp({ delay: 0.2, y: 12 });

  const toggle = (i: number) => setOpenIndex((cur) => (cur === i ? null : i));

  return (
    <section data-theme={theme} className="pricing-faq section">
      <div className="container container--narrow">

        <div className="pricing-faq__head stack--md">
          <h2
            ref={headingRef as React.RefObject<HTMLHeadingElement>}
            data-animate=""
            className="text-h2 text-balance max-ch-30 color--primary"
          >
            {heading}
          </h2>
        </div>

        <ul ref={listRef as React.RefObject<HTMLUListElement>} className="pricing-faq__list">
          {faqs.map((faq, i) => {
            const isOpen = openIndex === i;
            const id = `faq-${i}`;
            return (
              <li key={i} className={`pricing-faq-item${isOpen ? ' is-open' : ''}`}>
                <button
                  type="button"
                  className="pricing-faq-item__question"
                  aria-expanded={isOpen}
                  aria-controls={`${id}-panel`}
                  id={`${id}-trigger`}
                  onClick={() => toggle(i)}
                >
                  <span className="text-body--lg font--medium color--primary">
                    {faq.question}
                  </span>
                  <span className="pricing-faq-item__icon" aria-hidden="true">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path
                        d="M5 7.5L10 12.5L15 7.5"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                </button>
                <div
                  id={`${id}-panel`}
                  role="region"
                  aria-labelledby={`${id}-trigger`}
                  className="pricing-faq-item__panel"
                  hidden={!isOpen}
                >
                  <div className="pricing-faq-item__answer stack--sm">
                    {renderAnswer(faq.answer)}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>

        {footer && (
          <p ref={footerRef as React.RefObject<HTMLParagraphElement>} data-animate="" className="pricing-faq__footer text-body--sm color--tertiary">
            {footer}
          </p>
        )}

      </div>
    </section>
  );
}
