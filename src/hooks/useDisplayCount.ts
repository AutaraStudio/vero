'use client';

/**
 * useDisplayCount — Osmo display count utility
 *
 * Counts the number of rendered items in a group and returns the count.
 * Pure React — no DOM attribute scanning needed. Pass items array,
 * get count back. Use the count anywhere in JSX.
 *
 * DEPENDENCIES: none
 *
 * WHEN TO USE:
 *   - "X open positions", "Y assessments available", "Z integrations"
 *   - Any dynamic count that should reflect the actual rendered list length
 *   - Stat callouts that need to stay in sync with real data
 *
 * USAGE — single count:
 *
 *   const count = useDisplayCount(jobs);
 *   <p>We have <strong>{count}</strong> open positions</p>
 *
 * USAGE — multiple counts:
 *
 *   const counts = useDisplayCount({ jobs, articles, integrations });
 *   <p>{counts.jobs} open positions</p>
 *   <p>{counts.articles} articles published</p>
 */

import { useMemo } from 'react';

/**
 * Count items in a single array.
 */
export function useDisplayCount(items: unknown[]): number {
  return useMemo(() => items.length, [items]);
}

/**
 * Count items across multiple named groups simultaneously.
 */
export function useDisplayCounts<T extends Record<string, unknown[]>>(
  groups: T
): Record<keyof T, number> {
  return useMemo(() => {
    return Object.fromEntries(
      Object.entries(groups).map(([key, items]) => [key, items.length])
    ) as Record<keyof T, number>;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, Object.values(groups));
}
