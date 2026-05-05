'use client';

import { useEffect, useMemo, useState } from 'react';
import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Props {
  markdown: string;
}

/**
 * Polished renderer for the client-manual markdown.
 *
 * - Uses react-markdown + remark-gfm (tables, task lists, etc.)
 * - Custom component overrides apply our design tokens to every element
 * - Blockquotes that start with the 🎬 cinema-clapper emoji get rendered
 *   as a special "video placeholder" callout — until you swap them with
 *   actual recordings, they stand out as obvious gaps.
 * - Renders the table-of-contents heading (h2 #1) without rendering the
 *   ToC list itself when a `#toc` anchor is rendered server-side; in this
 *   simplified version we just let it render as a normal list.
 */
export default function ManageGuide({ markdown }: Props) {
  /* Track which heading is currently in view so the right side TOC can
     highlight it. Built with IntersectionObserver client-side. */
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
    h1: ({ children }) => <h1 className="manage__h1">{children}</h1>,
    h2: ({ children }) => {
      const id = slug(extractText(children));
      return (
        <h2 id={id} className="manage__h2">
          <a href={`#${id}`} className="manage__heading-anchor" aria-label="Link to section">{children}</a>
        </h2>
      );
    },
    h3: ({ children }) => {
      const id = slug(extractText(children));
      return <h3 id={id} className="manage__h3">{children}</h3>;
    },
    h4: ({ children }) => <h4 className="manage__h4">{children}</h4>,
    p:  ({ children }) => <p  className="manage__p">{children}</p>,
    ul: ({ children }) => <ul className="manage__ul">{children}</ul>,
    ol: ({ children }) => <ol className="manage__ol">{children}</ol>,
    li: ({ children }) => <li className="manage__li">{children}</li>,
    a:  ({ children, href }) => {
      const isExternal = href?.startsWith('http');
      return (
        <a
          href={href}
          className="manage__link"
          {...(isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        >
          {children}
        </a>
      );
    },
    code: ({ children, className }) => {
      /* Block code (multi-line) gets className like 'language-foo';
         inline code has none. */
      const isBlock = !!className;
      if (isBlock) return <pre className="manage__pre"><code>{children}</code></pre>;
      return <code className="manage__code">{children}</code>;
    },
    table: ({ children }) => (
      <div className="manage__table-wrap">
        <table className="manage__table">{children}</table>
      </div>
    ),
    thead: ({ children }) => <thead className="manage__thead">{children}</thead>,
    tbody: ({ children }) => <tbody className="manage__tbody">{children}</tbody>,
    tr:    ({ children }) => <tr className="manage__tr">{children}</tr>,
    th:    ({ children }) => <th className="manage__th">{children}</th>,
    td:    ({ children }) => <td className="manage__td">{children}</td>,
    hr:    () => <hr className="manage__hr" />,
    blockquote: ({ children }) => {
      const text = extractText(children);
      /* Special-case the 🎬 placeholder blockquotes — render as a callout
         card that obviously stands out as a "to-do: drop a video here". */
      if (text.includes('🎬')) {
        return <BlockquoteVideoPlaceholder>{children}</BlockquoteVideoPlaceholder>;
      }
      /* TL;DR / warning callouts — also a callout, but a normal one */
      return <blockquote className="manage__callout">{children}</blockquote>;
    },
    strong: ({ children }) => <strong className="manage__strong">{children}</strong>,
  };

  return (
    <main className="manage" data-theme="brand-purple">
      <div className="manage__container">
        <article className="manage__article">
          <ReactMarkdown components={components} remarkPlugins={[remarkGfm]}>
            {markdown}
          </ReactMarkdown>
        </article>

        {/* Sticky table of contents — only on wide screens */}
        <aside className="manage__toc" aria-label="On this page">
          <span className="manage__toc-label">On this page</span>
          <ol className="manage__toc-list">
            {headings.map((h) => (
              <li
                key={h.id}
                className={`manage__toc-item${activeId === h.id ? ' is-active' : ''}`}
              >
                <a href={`#${h.id}`} className="manage__toc-link">{h.text}</a>
              </li>
            ))}
          </ol>
        </aside>
      </div>
    </main>
  );
}

/* ── Helpers ─────────────────────────────────────────────────────── */

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
    .replace(/[^\w\s-]/g, '')   // strip punctuation + emoji
    .replace(/\s+/g, '-')        // spaces → hyphens
    .replace(/-+/g, '-');        // collapse repeats
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

function BlockquoteVideoPlaceholder({ children }: { children: React.ReactNode }) {
  return (
    <div className="manage__video-placeholder" role="figure" aria-label="Screen recording placeholder">
      <div className="manage__video-placeholder-icon" aria-hidden="true">
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
          <rect x="2" y="6" width="14" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" />
          <path d="M16 10l6-3v10l-6-3" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        </svg>
      </div>
      <div className="manage__video-placeholder-body">
        {children}
      </div>
    </div>
  );
}
