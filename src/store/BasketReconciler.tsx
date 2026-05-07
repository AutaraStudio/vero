'use client';

import { useEffect } from 'react';
import { useBasket } from './basketStore';

/**
 * Drops any role from the persisted basket whose id is no longer in the
 * live Sanity catalogue (deleted, archived, or slug-renamed roles can
 * linger in sessionStorage from a prior session). Without this, a single
 * stale entry inflates selectedRoles.length and can push the user across
 * a tier boundary they never crossed — e.g. picking the 50-role Scale
 * maximum would land at 51 and route to bespoke.
 *
 * Mounted once at the (site) layout so reconciliation happens before any
 * page reads tier state from the basket.
 */
export default function BasketReconciler({ validRoleIds }: { validRoleIds: string[] }) {
  const { dispatch, hydrated } = useBasket();

  useEffect(() => {
    if (!hydrated) return;
    dispatch({ type: 'RECONCILE_ROLES', payload: { validRoleIds } });
  }, [hydrated, validRoleIds, dispatch]);

  return null;
}
