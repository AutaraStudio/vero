'use client';

import { useTextReveal } from '@/hooks/useTextReveal';
import { useFadeUp } from '@/hooks/useFadeUp';
import './DimensionsSection.css';

interface PortableTextSpan { _type: 'span'; text: string; marks?: string[] }
interface PortableTextBlock { _type: 'block'; children: PortableTextSpan[]; style?: string }

interface Props {
  heading: string;
  body?: PortableTextBlock[];
  categories: { name: string; dimensions: string[] }[];
  /** Optional supporting graphic — shown below the columns. */
  imageUrl?: string;
  imageAlt?: string;
}

function renderBody(blocks?: PortableTextBlock[]) {
  if (!blocks?.length) return null;
  return blocks.map((block, bi) => {
    if (block._type !== 'block') return null;
    return (
      <p key={bi} className="science-dimensions__body-paragraph text-body--lg leading--snug color--secondary">
        {block.children.map((span, si) => (
          <span key={si}>{span.text}</span>
        ))}
      </p>
    );
  });
}

/**
 * Science page — "Measuring up to 16 dimensions".
 * Quiet, simple typographic layout: centred header with comfortably-wide
 * body, then four columns of dimensions separated by light vertical
 * hairlines. No cards, no bullets, no hover treatments — just type.
 */
export default function DimensionsSection({
  heading,
  body,
  categories,
  imageUrl,
  imageAlt,
}: Props) {
  const labelRef    = useFadeUp({ delay: 0,    duration: 0.5, y: 12 });
  const headingRef  = useTextReveal({ delay: 0.05 });
  const bodyRef     = useFadeUp({ delay: 0.2,  duration: 0.6, y: 16 });
  const colsRef     = useFadeUp({
    selector: '.science-dimensions__col',
    stagger: 0.06,
    duration: 0.6,
    y: 16,
  });
  const imageRef    = useFadeUp({ delay: 0.3,  duration: 0.7, y: 20 });

  const totalDimensions = categories.reduce((n, c) => n + (c.dimensions?.length ?? 0), 0);

  return (
    <section data-theme="brand-purple" className="science-dimensions section">
      <div className="container">

        {/* ── Centred intro ───────────────────────────── */}
        <header className="science-dimensions__intro">
          <span
            ref={labelRef as React.RefObject<HTMLSpanElement>}
            data-animate=""
            className="section-label"
          >
            {totalDimensions} dimensions
          </span>
          <h2
            ref={headingRef as React.RefObject<HTMLHeadingElement>}
            data-animate=""
            className="section-heading"
          >
            {heading}
          </h2>
          {body && (
            <div
              ref={bodyRef as React.RefObject<HTMLDivElement>}
              data-animate=""
              className="science-dimensions__body"
            >
              {renderBody(body)}
            </div>
          )}
        </header>

        {/* ── 4 typographic columns ───────────────────── */}
        <div
          ref={colsRef as React.RefObject<HTMLDivElement>}
          className="science-dimensions__cols"
        >
          {categories.map((cat, i) => (
            <div key={`${cat.name}-${i}`} className="science-dimensions__col">
              <h3 className="science-dimensions__col-name">{cat.name}</h3>
              <ul className="science-dimensions__col-list">
                {(cat.dimensions ?? []).map((dim, j) => (
                  <li key={`${dim}-${j}`} className="science-dimensions__col-item">
                    {dim}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* ── Optional supporting graphic ─────────────── */}
        {imageUrl && (
          <div
            ref={imageRef as React.RefObject<HTMLDivElement>}
            data-animate=""
            className="science-dimensions__visual"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt={imageAlt ?? ''}
              className="science-dimensions__visual-img"
              loading="lazy"
            />
          </div>
        )}

      </div>
    </section>
  );
}
