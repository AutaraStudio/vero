'use client';

import { createContext, useContext, useEffect, useReducer, useState, type ReactNode } from 'react';
import { type TierKey, type PaymentFrequency, recommendTier, isTierAtLeast } from '@/lib/tierRecommendation';

export type { PaymentFrequency };

// ── Types ─────────────────────────────────────────────────────

export interface BespokeDetails {
  firstName: string;
  lastName: string;
  email: string;
  company: string;
  jobTitle: string;
  phone: string;
  approxRoles: string;
  approxCandidates: string;
  targetGoLive: string;
  requirements: string;
}

export interface SelectedRole {
  roleId: string;
  roleName: string;
  roleSlug: string;
  roleHubspotValue?: string;
  categoryName: string;
  categorySlug: string;
}

export interface ContactDetails {
  firstName: string;
  lastName: string;
  email: string;
  company: string;
  jobTitle: string;
  phone: string;
  // Key project contact
  keyContactName: string;
  keyContactEmail: string;
  keyContactSameAsMe: boolean;
  // System access
  usersToAdd: string;
  // Portal
  bespokeUrl: string;
  sendFeedbackReports: 'yes' | 'no' | '';
  // Branding
  brandColour1: string;
  brandColour2: string;
  logoFile: string; // base64 data URL or empty
  logoFileName: string;
  // Campaign dates keyed by roleId
  roleDates: Record<string, { openDate: string; closeDate: string }>;
}

// Internal reducer state — recommendedTier is derived, not stored
interface InternalState {
  selectedRoles: SelectedRole[];
  tierOverride: TierKey | null;
  contactDetails: ContactDetails;
  contractAccepted: boolean;
  paymentFrequency: PaymentFrequency;
  autoRenewal: boolean;
  nudgeShown: boolean;
  bespokeDetails: BespokeDetails;
  isBespokeEnquiry: boolean;
}

// Public state shape (recommendedTier derived and added by useBasket)
export interface BasketState extends InternalState {
  recommendedTier: TierKey | null;
}

// ── Actions ───────────────────────────────────────────────────

export type BasketAction =
  | { type: 'ADD_ROLE'; payload: SelectedRole }
  | { type: 'REMOVE_ROLE'; payload: { roleId: string } }
  | { type: 'RECONCILE_ROLES'; payload: { validRoleIds: string[] } }
  | { type: 'SET_TIER_OVERRIDE'; payload: TierKey | null }
  | { type: 'SET_CONTACT_DETAILS'; payload: ContactDetails }
  | { type: 'ACCEPT_CONTRACT' }
  | { type: 'SET_PAYMENT_FREQUENCY'; payload: PaymentFrequency }
  | { type: 'SET_AUTO_RENEWAL'; payload: boolean }
  | { type: 'SET_NUDGE_SHOWN' }
  | { type: 'SET_BESPOKE_DETAILS'; payload: BespokeDetails }
  | { type: 'SUBMIT_BESPOKE_ENQUIRY' }
  | { type: 'RESTORE_STATE'; payload: InternalState }
  | { type: 'CLEAR_BASKET' };

// ── Reducer ───────────────────────────────────────────────────

const emptyContact: ContactDetails = {
  firstName: '',
  lastName: '',
  email: '',
  company: '',
  jobTitle: '',
  phone: '',
  keyContactName: '',
  keyContactEmail: '',
  keyContactSameAsMe: false,
  usersToAdd: '',
  bespokeUrl: '',
  sendFeedbackReports: '',
  brandColour1: '',
  brandColour2: '',
  logoFile: '',
  logoFileName: '',
  roleDates: {},
};

const emptyBespoke: BespokeDetails = {
  firstName: '',
  lastName: '',
  email: '',
  company: '',
  jobTitle: '',
  phone: '',
  approxRoles: '',
  approxCandidates: '',
  targetGoLive: '',
  requirements: '',
};

const initialState: InternalState = {
  selectedRoles: [],
  tierOverride: null,
  contactDetails: emptyContact,
  contractAccepted: false,
  paymentFrequency: 'annual',
  autoRenewal: true,
  nudgeShown: false,
  bespokeDetails: emptyBespoke,
  isBespokeEnquiry: false,
};

function basketReducer(state: InternalState, action: BasketAction): InternalState {
  switch (action.type) {
    case 'ADD_ROLE': {
      if (state.selectedRoles.some((r) => r.roleId === action.payload.roleId)) {
        return state;
      }
      return {
        ...state,
        selectedRoles: [...state.selectedRoles, action.payload],
        nudgeShown: false,
        /* Clear any prior tier override (URL ?tier= or manual click) so the
           plan auto-tracks the actual role count. Otherwise a buyer who lands
           from /pricing?tier=scale and then picks 3 roles would stay on Scale
           — the client wants the smallest plan that fits the basket. */
        tierOverride: null,
      };
    }
    case 'REMOVE_ROLE':
      return {
        ...state,
        selectedRoles: state.selectedRoles.filter((r) => r.roleId !== action.payload.roleId),
        nudgeShown: false,
        tierOverride: null,
      };
    case 'RECONCILE_ROLES': {
      /* Drop any role whose id is no longer in the live catalogue. Without
         this, a stale entry persisted in sessionStorage (a role that has
         since been deleted, archived, or renamed in Sanity) inflates the
         basket count by one — pushing 50 selected → 51 → bespoke even
         when the user picked exactly the Scale-tier maximum. */
      const valid = new Set(action.payload.validRoleIds);
      const next = state.selectedRoles.filter((r) => valid.has(r.roleId));
      if (next.length === state.selectedRoles.length) return state;
      return { ...state, selectedRoles: next };
    }
    case 'SET_TIER_OVERRIDE':
      return { ...state, tierOverride: action.payload };
    case 'SET_CONTACT_DETAILS':
      return { ...state, contactDetails: action.payload };
    case 'ACCEPT_CONTRACT':
      return { ...state, contractAccepted: true };
    case 'SET_PAYMENT_FREQUENCY':
      return { ...state, paymentFrequency: action.payload };
    case 'SET_AUTO_RENEWAL':
      return { ...state, autoRenewal: action.payload };
    case 'SET_NUDGE_SHOWN':
      return { ...state, nudgeShown: true };
    case 'SET_BESPOKE_DETAILS':
      return { ...state, bespokeDetails: action.payload };
    case 'SUBMIT_BESPOKE_ENQUIRY':
      return { ...state, isBespokeEnquiry: true };
    case 'RESTORE_STATE':
      return { ...action.payload };
    case 'CLEAR_BASKET':
      return initialState;
    default:
      return state;
  }
}

// ── Session persistence ───────────────────────────────────────

const STORAGE_KEY = 'vero_basket_state';

function loadPersistedState(): InternalState | null {
  if (typeof window === 'undefined') return null;
  try {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved) as InternalState;
  } catch {
    // Ignore parse errors
  }
  return null;
}

function persistState(state: InternalState): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Ignore quota errors
  }
}

// ── Context ───────────────────────────────────────────────────

interface BasketContextValue {
  _internal: InternalState;
  dispatch: React.Dispatch<BasketAction>;
  hydrated: boolean;
}

const BasketContext = createContext<BasketContextValue | null>(null);

export function BasketProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(basketReducer, initialState);
  const [hydrated, setHydrated] = useState(false);

  // Restore from sessionStorage on first mount.
  // Always restore if anything is persisted — otherwise non-role state (e.g. a
  // paymentFrequency picked on the pricing page before any roles are added)
  // gets clobbered by the initialState on the next page mount.
  useEffect(() => {
    const saved = loadPersistedState();
    if (saved) {
      dispatch({ type: 'RESTORE_STATE', payload: saved });
    }
    setHydrated(true);
  }, []);

  // Persist to sessionStorage on every state change (after hydration)
  useEffect(() => {
    if (hydrated) {
      persistState(state);
    }
  }, [state, hydrated]);

  return (
    <BasketContext.Provider value={{ _internal: state, dispatch, hydrated }}>
      {children}
    </BasketContext.Provider>
  );
}

// ── Hook ──────────────────────────────────────────────────────

export function useBasket() {
  const ctx = useContext(BasketContext);
  if (!ctx) throw new Error('useBasket must be used within a BasketProvider');
  const { _internal, dispatch, hydrated } = ctx;

  // Auto-tier from role count
  const autoTier: TierKey | null =
    _internal.selectedRoles.length > 0 ? recommendTier(_internal.selectedRoles.length) : null;

  // Override only applies if it's at least as high as the auto-tier
  let recommendedTier = autoTier;
  if (_internal.tierOverride) {
    if (!autoTier || isTierAtLeast(_internal.tierOverride, autoTier)) {
      recommendedTier = _internal.tierOverride;
    }
  }

  return {
    state: { ..._internal, recommendedTier } satisfies BasketState,
    dispatch,
    hydrated,
  };
}
