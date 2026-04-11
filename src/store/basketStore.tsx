'use client';

import { createContext, useContext, useReducer, type ReactNode } from 'react';
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
      };
    }
    case 'REMOVE_ROLE':
      return {
        ...state,
        selectedRoles: state.selectedRoles.filter((r) => r.roleId !== action.payload.roleId),
      };
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

// ── Context ───────────────────────────────────────────────────

interface BasketContextValue {
  _internal: InternalState;
  dispatch: React.Dispatch<BasketAction>;
}

const BasketContext = createContext<BasketContextValue | null>(null);

export function BasketProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(basketReducer, initialState);
  return (
    <BasketContext.Provider value={{ _internal: state, dispatch }}>
      {children}
    </BasketContext.Provider>
  );
}

// ── Hook ──────────────────────────────────────────────────────

export function useBasket() {
  const ctx = useContext(BasketContext);
  if (!ctx) throw new Error('useBasket must be used within a BasketProvider');
  const { _internal, dispatch } = ctx;

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
  };
}
