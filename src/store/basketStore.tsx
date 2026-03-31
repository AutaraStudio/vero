'use client';

import { createContext, useContext, useReducer, type ReactNode } from 'react';
import { type TierKey, recommendTier } from '@/lib/tierRecommendation';

// ── Types ─────────────────────────────────────────────────────

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
}

// Internal reducer state — recommendedTier is derived, not stored
interface InternalState {
  selectedRoles: SelectedRole[];
  contactDetails: ContactDetails;
  contractAccepted: boolean;
}

// Public state shape (recommendedTier derived and added by useBasket)
export interface BasketState extends InternalState {
  recommendedTier: TierKey | null;
}

// ── Actions ───────────────────────────────────────────────────

export type BasketAction =
  | { type: 'ADD_ROLE'; payload: SelectedRole }
  | { type: 'REMOVE_ROLE'; payload: { roleId: string } }
  | { type: 'SET_CONTACT_DETAILS'; payload: ContactDetails }
  | { type: 'ACCEPT_CONTRACT' }
  | { type: 'CLEAR_BASKET' };

// ── Reducer ───────────────────────────────────────────────────

const emptyContact: ContactDetails = {
  firstName: '',
  lastName: '',
  email: '',
  company: '',
  jobTitle: '',
  phone: '',
};

const initialState: InternalState = {
  selectedRoles: [],
  contactDetails: emptyContact,
  contractAccepted: false,
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
    case 'SET_CONTACT_DETAILS':
      return { ...state, contactDetails: action.payload };
    case 'ACCEPT_CONTRACT':
      return { ...state, contractAccepted: true };
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
  const recommendedTier: TierKey | null =
    _internal.selectedRoles.length > 0 ? recommendTier(_internal.selectedRoles.length) : null;
  return {
    state: { ..._internal, recommendedTier } satisfies BasketState,
    dispatch,
  };
}
