export type TierKey = 'starter' | 'essential' | 'growth' | 'scale' | 'bespoke';

export function recommendTier(roleCount: number): TierKey {
  if (roleCount === 1) return 'starter';
  if (roleCount <= 5) return 'essential';
  if (roleCount <= 20) return 'growth';
  if (roleCount <= 50) return 'scale';
  return 'bespoke';
}

export interface TierInfo {
  key: TierKey;
  name: string;
  price: string;
  priceNote: string;
  candidateLimit: string;
  roleLimit: string;
}

export const TIER_DATA: Record<TierKey, TierInfo> = {
  starter: {
    key: 'starter',
    name: 'Starter',
    price: '£3,500',
    priceNote: 'pay in full',
    candidateLimit: 'Up to 250 candidates',
    roleLimit: '1 job role',
  },
  essential: {
    key: 'essential',
    name: 'Essential',
    price: '£9,000',
    priceNote: 'per year',
    candidateLimit: 'Up to 1,000 candidates',
    roleLimit: 'Up to 5 job roles',
  },
  growth: {
    key: 'growth',
    name: 'Growth',
    price: '£18,000',
    priceNote: 'per year',
    candidateLimit: 'Up to 2,500 candidates',
    roleLimit: 'Up to 20 job roles',
  },
  scale: {
    key: 'scale',
    name: 'Scale',
    price: '£30,000',
    priceNote: 'per year',
    candidateLimit: 'Up to 6,000 candidates',
    roleLimit: 'Access to all 50 roles',
  },
  bespoke: {
    key: 'bespoke',
    name: 'Bespoke',
    price: 'Contact us',
    priceNote: 'tailored pricing',
    candidateLimit: 'Unlimited candidates',
    roleLimit: 'Unlimited roles',
  },
};
