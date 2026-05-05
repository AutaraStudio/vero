'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Button from '@/components/ui/Button';
import CheckIcon from '@/components/ui/CheckIcon';
import { Tooltip, TooltipContent } from '@/components/Tooltip/Tooltip';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import { useTextReveal } from '@/hooks/useTextReveal';
import { useFadeUp } from '@/hooks/useFadeUp';
import type { ThemeVariant } from '@/lib/theme';
import type { PricingTier } from './page';

interface Props {
  tiers: PricingTier[];
  theme?: ThemeVariant;
  /** When true, hide rows past the threshold and show an expand button */
  collapsible?: boolean;
  /** How many feature rows to show when collapsed */
  collapsedRowCount?: number;
}

interface FeatureCell {
  included: boolean;
  value?: string;
  footnote?: string;
}

interface FeatureRow {
  label: string;
  cells: FeatureCell[];
  footnote?: string;
}

function buildRows(tiers: PricingTier[]): FeatureRow[] {
  const labelOrder: string[] = [];
  const tierMaps = tiers.map((t) => {
    const m = new Map<string, FeatureCell>();
    t.features?.forEach((f) => {
      m.set(f.label, { included: true, value: f.value, footnote: f.footnote });
      if (!labelOrder.includes(f.label)) labelOrder.push(f.label);
    });
    return m;
  });

  return labelOrder.map((label) => {
    const cells: FeatureCell[] = tierMaps.map((m) =>
      m.get(label) ?? { included: false },
    );
    // Use the first non-empty footnote for this row's tooltip.
    const footnote = cells.find((c) => c.footnote)?.footnote;
    return { label, cells, footnote };
  });
}

function tierHref(tier: PricingTier): string {
  if (tier.ctaType === 'contact') return '/contact';
  return tier.slug ? `/get-started?tier=${tier.slug}` : '/get-started';
}

export default function ComparisonTable({
  tiers,
  theme = 'brand-purple',
  collapsible = false,
  collapsedRowCount = 4,
}: Props) {
  const labelRef   = useFadeUp({ delay: 0,   duration: 0.5, y: 16 });
  const headingRef = useTextReveal();
  const introRef   = useFadeUp({ delay: 0.2, duration: 0.6, y: 16 });
  const tableRef   = useFadeUp({ delay: 0.3, duration: 0.6, y: 24 });

  const [expanded, setExpanded] = useState(false);
  const allRows = buildRows(tiers);
  // Only collapse if there are more rows than the threshold
  const isCollapsed = collapsible && !expanded && allRows.length > collapsedRowCount;
  const rows = isCollapsed ? allRows.slice(0, collapsedRowCount) : allRows;
  const hiddenCount = allRows.length - rows.length;

  const gridRef = useRef<HTMLDivElement>(null);
  const expandBtnRef = useRef<HTMLButtonElement>(null);

  /* ── Scroll-reveal: stagger feature rows in row-by-row ── */
  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;

    // Group cells by their grid-row inline style so a whole row animates as one
    const cells = grid.querySelectorAll<HTMLElement>(
      '.pricing-compare-grid__feature-cell, .pricing-compare-grid__cell',
    );
    const rowGroups = new Map<string, HTMLElement[]>();
    cells.forEach((cell) => {
      const rowKey = cell.style.gridRow || cell.getAttribute('data-row') || '';
      if (!rowGroups.has(rowKey)) rowGroups.set(rowKey, []);
      rowGroups.get(rowKey)!.push(cell);
    });

    const groups = [...rowGroups.values()];
    if (groups.length === 0) return;

    // Set initial hidden state on every cell, then animate per-row
    gsap.set(cells, { opacity: 0, y: 16 });

    const trigger = ScrollTrigger.create({
      trigger: grid,
      start: 'top 85%',
      once: true,
      onEnter: () => {
        groups.forEach((group, i) => {
          gsap.to(group, {
            opacity: 1,
            y: 0,
            duration: 0.5,
            delay: i * 0.06,
            ease: 'power2.out',
          });
        });
      },
    });

    return () => { trigger.kill(); };
  }, [rows.length]); // re-run when expanding so newly-rendered rows animate in too

  /* ── Toggle: preserve scroll position so collapsing doesn't jump the page ── */
  const handleToggle = useCallback(() => {
    if (!expanded) {
      // Expanding: just open
      setExpanded(true);
      return;
    }
    // Collapsing: capture the button's screen position, then restore after re-render
    const btn = expandBtnRef.current;
    const beforeTop = btn?.getBoundingClientRect().top ?? 0;
    setExpanded(false);
    requestAnimationFrame(() => {
      const afterTop = expandBtnRef.current?.getBoundingClientRect().top ?? 0;
      const delta = afterTop - beforeTop;
      if (delta !== 0) {
        window.scrollBy({ top: delta, left: 0, behavior: 'instant' });
      }
    });
  }, [expanded]);

  return (
    <section data-theme={theme} className="pricing-compare section">
      <div className="container">

        <div className="pricing-compare__head stack--md">
          <span ref={labelRef as React.RefObject<HTMLSpanElement>} data-animate="" className="section-label">
            Compare plans
          </span>
          <h2
            ref={headingRef as React.RefObject<HTMLHeadingElement>}
            data-animate=""
            className="text-h2 text-balance max-ch-30 color--primary"
          >
            Everything that&rsquo;s included
          </h2>
          <p
            ref={introRef as React.RefObject<HTMLParagraphElement>}
            data-animate=""
            className="text-body--lg color--secondary leading--snug max-ch-50"
          >
            A side-by-side breakdown of features, limits and integrations across every plan.
          </p>
        </div>

        <div ref={tableRef as React.RefObject<HTMLDivElement>} className="pricing-compare__grid-wrap">
          <div
            ref={gridRef}
            className="pricing-compare-grid"
            style={{ ['--tier-count' as string]: tiers.length }}
            role="table"
            aria-label="Plan feature comparison"
          >

            {/* ── Header (sticky) ───────────────────────────── */}
            <div className="pricing-compare-grid__header" role="rowgroup">
              {/* Spacer cell */}
              <div
                className="pricing-compare-grid__feature-head"
                role="columnheader"
                aria-hidden="true"
                style={{ gridColumn: 1, gridRow: 1 }}
              />

              {tiers.map((tier, ti) => (
                <div
                  key={`name-${tier._id}`}
                  role="columnheader"
                  data-theme="brand-purple-deep"
                  className={`pricing-compare-grid__tier-head pricing-compare-grid__tier-head--name${tier.isFeatured ? ' is-featured' : ''}`}
                  style={{ gridColumn: ti + 2, gridRow: 1 }}
                >
                  <span className="text-label--lg color--primary">{tier.name}</span>
                </div>
              ))}
            </div>

            {/* ── Feature rows ──────────────────────────────── */}
            <div className="pricing-compare-grid__body" role="rowgroup">
              {rows.map((row, ri) => (
                <div key={row.label} className="pricing-compare-grid__row" role="row">
                  <div
                    className={`pricing-compare-grid__feature-cell${ri === 0 ? ' pricing-compare-grid__feature-cell--first' : ''}`}
                    role="rowheader"
                    style={{ gridColumn: 1, gridRow: ri + 2 }}
                  >
                    <span className="text-body--md color--primary">{row.label}</span>
                    {row.footnote && (
                      <span className="pricing-compare-grid__tooltip">
                        <Tooltip content={<TooltipContent body={row.footnote} />}>
                          {''}
                        </Tooltip>
                      </span>
                    )}
                  </div>

                  {row.cells.map((cell, ci) => (
                    <div
                      key={ci}
                      role="cell"
                      className={`pricing-compare-grid__cell${tiers[ci].isFeatured ? ' is-featured' : ''}`}
                      data-tier-mobile-label={tiers[ci].name}
                      style={{ gridColumn: ci + 2, gridRow: ri + 2 }}
                    >
                      {cell.included ? (
                        cell.value ? (
                          <span className="pricing-compare-grid__value text-body--md font--medium color--primary">
                            {cell.value}
                          </span>
                        ) : (
                          <CheckMark featured={tiers[ci].isFeatured} />
                        )
                      ) : (
                        <span className="pricing-compare-grid__absent" aria-label="Not included">
                          <svg width="14" height="2" viewBox="0 0 14 2" fill="none" aria-hidden="true">
                            <path d="M1 1H13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                          </svg>
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>

            {/* ── Footer (mirrors CTAs) — hidden when collapsed ──── */}
            {!isCollapsed && (
              <div className="pricing-compare-grid__footer" role="rowgroup">
                <div
                  className="pricing-compare-grid__feature-cell"
                  role="rowheader"
                  aria-hidden="true"
                  style={{ gridColumn: 1, gridRow: rows.length + 2 }}
                />
                {tiers.map((tier, ti) => (
                  <div
                    key={tier._id}
                    role="cell"
                    className={`pricing-compare-grid__footer-cell${tier.isFeatured ? ' is-featured' : ''}`}
                    style={{ gridColumn: ti + 2, gridRow: rows.length + 2 }}
                  >
                    <Button
                      variant={tier.isFeatured ? 'cta' : 'secondary'}
                      size="sm"
                      href={tierHref(tier)}
                    >
                      Get started
                    </Button>
                  </div>
                ))}
              </div>
            )}

          </div>
        </div>

        {/* ── Expand / collapse toggle (only when collapsible) ── */}
        {collapsible && allRows.length > collapsedRowCount && (
          <div className="pricing-compare__expand">
            <button
              ref={expandBtnRef}
              type="button"
              className="pricing-compare__expand-btn"
              onClick={handleToggle}
              aria-expanded={expanded}
            >
              {expanded
                ? 'Show less'
                : `Show all ${allRows.length} features`}
              <span className={`pricing-compare__expand-icon${expanded ? ' is-open' : ''}`} aria-hidden="true">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </button>
          </div>
        )}

      </div>
    </section>
  );
}

function CheckMark({ featured = false }: { featured?: boolean }) {
  return (
    <span
      className={`pricing-compare-grid__check${featured ? ' is-featured' : ''}`}
      aria-label="Included"
    >
      <CheckIcon size={14} />
    </span>
  );
}
