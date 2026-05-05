'use client';

import { useEffect, useMemo, useState } from 'react';
import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import './legal.css';

interface Props {
  title: string;
  intro?: string | null;
  lastUpdated?: string | null;
  markdown: string;
}

/**
 * Long-form legal document renderer.
 *
 * - Theme: brand-purple-deep hero band, plain page-bg below for max readability
 * - Sticky table of contents on wide screens (auto-built from H2s)
 * - Active heading highlighted in the TOC via IntersectionObserver
 * - Markdown body rendered through react-markdown + remark-gfm so editors can
 *   paste straight from policy docs without learning a custom block schema
 */
export default function LegalDocument({ title, intro, lastUpdated, markdown }: Props) {
  const headings = useMemo(() => extractHeadings(markdown), [markdown]);
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveId(entry.target.id);
        });
      },
      { rootMargin: '-20% 0px -65% 0px', threshold: 0 },
    );
    headings.forEach((h) => {
      const el = document.getElementById(h.id);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, [headings]);

  const components: Components = {
    h1: ({ children }) => <h1 className="legal__h1">{children}</h1>,
    h2: ({ children }) => {
      const id = slug(extractText(children));
      return (
        <h2 id={id} className="legal__h2">
          <a href={`#${id}`} className="legal__heading-anchor" aria-label="Link to section">
            {children}
          </a>
        </h2>
      );
    },
    h3: ({ children }) => {
      const id = slug(extractText(children));
      return <h3 id={id} className="legal__h3">{children}</h3>;
    },
    h4: ({ children }) => <h4 className="legal__h4">{children}</h4>,
    p:  ({ children }) => <p  className="legal__p">{children}</p>,
    ul: ({ children }) => <ul className="legal__ul">{children}</ul>,
    ol: ({ children }) => <ol className="legal__ol">{children}</ol>,
    li: ({ children }) => <li className="legal__li">{children}</li>,
    a:  ({ children, href }) => {
      const isExternal = !!href && /^(https?:|mailto:|tel:)/.test(href);
      return (
        <a
          href={href}
          className="legal__link"
          {...(isExternal && href?.startsWith('http')
            ? { target: '_blank', rel: 'noopener noreferrer' }
            : {})}
        >
          {children}
        </a>
      );
    },
    strong: ({ children }) => <strong className="legal__strong">{children}</strong>,
    hr:    () => <hr className="legal__hr" />,
    blockquote: ({ children }) => <blockquote className="legal__blockquote">{children}</blockquote>,
  };

  const formattedDate = lastUpdated ? formatDate(lastUpdated) : null;

  return (
    <main className="legal" data-theme="brand-purple">
      {/* Hero band */}
      <header className="legal__hero" data-theme="brand-purple-deep">
        <div className="legal__hero-inner">
          <span className="legal__eyebrow section-label">Legal</span>
          <h1 className="legal__hero-title">{title}</h1>
          {intro && <p className="legal__hero-intro">{intro}</p>}
          {formattedDate && (
            <p className="legal__hero-meta">Last updated {formattedDate}</p>
          )}
        </div>
      </header>

      {/* Body + sticky TOC */}
      <div className="legal__container">
        <article className="legal__article">
          <ReactMarkdown components={components} remarkPlugins={[remarkGfm]}>
            {markdown}
          </ReactMarkdown>
        </article>

        <aside className="legal__toc" aria-label="On this page">
          <span className="legal__toc-label">On this page</span>
          <ol className="legal__toc-list">
            {headings.map((h) => (
              <li
                key={h.id}
                className={`legal__toc-item${activeId === h.id ? ' is-active' : ''}`}
              >
                <a href={`#${h.id}`} className="legal__toc-link">{h.text}</a>
              </li>
            ))}
          </ol>
        </aside>
      </div>
    </main>
  );
}

/* ── Helpers ─────────────────────────────────────────────────── */

function extractText(node: React.ReactNode): string {
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(extractText).join('');
  if (node && typeof node === 'object' && 'props' in node) {
    return extractText((node as { props: { children?: React.ReactNode } }).props.children);
  }
  return '';
}

function slug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

function extractHeadings(markdown: string): { id: string; text: string }[] {
  const headings: { id: string; text: string }[] = [];
  const lines = markdown.split('\n');
  let inFence = false;
  for (const line of lines) {
    if (line.startsWith('```')) inFence = !inFence;
    if (inFence) continue;
    const m = line.match(/^##\s+(.+)$/);
    if (m) {
      const text = m[1].trim();
      headings.push({ id: slug(text), text });
    }
  }
  return headings;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}
