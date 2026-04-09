export type TierKey = 'starter' | 'essential' | 'growth' | 'scale' | 'bespoke';
export type PaymentFrequency = 'annual' | 'monthly';

/** Ordered list of tiers from lowest to highest */
const TIER_ORDER: TierKey[] = ['starter', 'essential', 'growth', 'scale', 'bespoke'];

/** Returns the numeric rank of a tier (0 = starter, 4 = bespoke) */
export function tierRank(tier: TierKey): number {
  return TIER_ORDER.indexOf(tier);
}

/** Returns true if `a` is a higher or equal tier to `b` */
export function isTierAtLeast(a: TierKey, b: TierKey): boolean {
  return tierRank(a) >= tierRank(b);
}

/** All selectable tiers (excludes bespoke which is a separate flow) */
export const SELECTABLE_TIERS: TierKey[] = ['starter', 'essential', 'growth', 'scale'];

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
  annualPrice: string;
  annualPriceNote: string;
  monthlyPrice: string | null;
  monthlyPriceNote: string | null;
  candidateLimit: string;
  roleLimit: string;
  hasFrequencyToggle: boolean;
}

export function getTierPrice(
  tier: TierInfo,
  frequency: PaymentFrequency
): { price: string; priceNote: string } {
  if (!tier.hasFrequencyToggle || frequency === 'annual') {
    return { price: tier.annualPrice, priceNote: tier.annualPriceNote };
  }
  return {
    price: tier.monthlyPrice ?? tier.annualPrice,
    priceNote: tier.monthlyPriceNote ?? tier.annualPriceNote,
  };
}

export interface NudgeContent {
  type: 'slots-remaining' | 'upgrade';
  headline: string;
  body: string;
  primaryLabel: string;
  secondaryLabel: string;
  // slots-remaining
  tierName?: string;
  selectedCount?: number;
  maxRoles?: number;
  // upgrade
  fromTierName?: string;
  fromDetail?: string;
  toTierName?: string;
  toDetail?: string;
}

export function getNudgeContent(
  tier: TierKey,
  roleCount: number
): NudgeContent | null {
  if (tier === 'essential' && roleCount >= 2 && roleCount <= 4) {
    const remaining = 5 - roleCount;
    return {
      type: 'slots-remaining',
      headline: `You have ${remaining} role slot${remaining !== 1 ? 's' : ''} left`,
      body: `Your Essential plan includes up to 5 roles at the same price. You've selected ${roleCount} — you could add ${remaining} more before continuing at no extra cost.`,
      primaryLabel: 'Add more roles',
      secondaryLabel: `Continue with ${roleCount} role${roleCount !== 1 ? 's' : ''} →`,
      tierName: 'Essential',
      selectedCount: roleCount,
      maxRoles: 5,
    };
  }

  if (tier === 'growth' && roleCount >= 6 && roleCount <= 19) {
    const remaining = 20 - roleCount;
    return {
      type: 'slots-remaining',
      headline: `You have ${remaining} role slot${remaining !== 1 ? 's' : ''} left`,
      body: `Your Growth plan includes up to 20 roles at the same price. You've selected ${roleCount} — you could add ${remaining} more before continuing at no extra cost.`,
      primaryLabel: 'Add more roles',
      secondaryLabel: `Continue with ${roleCount} roles →`,
      tierName: 'Growth',
      selectedCount: roleCount,
      maxRoles: 20,
    };
  }

  if (tier === 'starter' && roleCount === 1) {
    return {
      type: 'upgrade',
      headline: 'Hiring for more than one role?',
      body: 'Our Essential plan covers up to 5 roles for £9,000/yr. If you have multiple positions to fill, it could be worth exploring before you continue.',
      primaryLabel: 'Explore Essential',
      secondaryLabel: 'Continue with Starter →',
      fromTierName: 'Starter',
      fromDetail: '1 role · £3,500',
      toTierName: 'Essential',
      toDetail: 'Up to 5 roles · from £750/mo',
    };
  }

  return null;
}

export const TIER_DATA: Record<TierKey, TierInfo> = {
  starter: {
    key: 'starter',
    name: 'Starter',
    annualPrice: '£3,500',
    annualPriceNote: 'one-off payment',
    monthlyPrice: null,
    monthlyPriceNote: null,
    candidateLimit: 'Up to 250 candidates',
    roleLimit: '1 job role',
    hasFrequencyToggle: false,
  },
  essential: {
    key: 'essential',
    name: 'Essential',
    annualPrice: '£9,000',
    annualPriceNote: 'per year',
    monthlyPrice: '£750',
    monthlyPriceNote: 'per month',
    candidateLimit: 'Up to 1,000 candidates',
    roleLimit: 'Up to 5 job roles',
    hasFrequencyToggle: true,
  },
  growth: {
    key: 'growth',
    name: 'Growth',
    annualPrice: '£18,000',
    annualPriceNote: 'per year',
    monthlyPrice: '£1,500',
    monthlyPriceNote: 'per month',
    candidateLimit: 'Up to 2,500 candidates',
    roleLimit: 'Up to 20 job roles',
    hasFrequencyToggle: true,
  },
  scale: {
    key: 'scale',
    name: 'Scale',
    annualPrice: '£30,000',
    annualPriceNote: 'per year',
    monthlyPrice: '£2,500',
    monthlyPriceNote: 'per month',
    candidateLimit: 'Up to 6,000 candidates',
    roleLimit: 'Access to all 50 roles',
    hasFrequencyToggle: true,
  },
  bespoke: {
    key: 'bespoke',
    name: 'Bespoke',
    annualPrice: 'Contact us',
    annualPriceNote: 'tailored pricing',
    monthlyPrice: null,
    monthlyPriceNote: null,
    candidateLimit: 'Unlimited candidates',
    roleLimit: 'Unlimited roles',
    hasFrequencyToggle: false,
  },
};
