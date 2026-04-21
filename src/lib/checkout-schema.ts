import type { TierKey, PaymentFrequency } from './tierRecommendation';

// ── Payload sent from client to /api/checkout and /api/checkout/invoice ──

export interface CheckoutPayload {
  selectedRoles: {
    roleId: string;
    roleName: string;
    categoryName: string;
    categorySlug: string;
  }[];
  tier: TierKey;
  paymentFrequency: PaymentFrequency;
  autoRenewal: boolean;
  paymentMethod: 'card' | 'invoice';
  // Payment traceability — populated after Stripe calls (card only)
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  stripePaymentIntentId?: string;
  // ISO datetime when the order was submitted (client-stamped; server will fallback)
  submittedAt?: string;
  contactDetails: {
    firstName: string;
    lastName: string;
    email: string;
    company: string;
    jobTitle: string;
    phone: string;
    keyContactName: string;
    keyContactEmail: string;
    keyContactSameAsMe: boolean;
    usersToAdd: string;
    bespokeUrl: string;
    sendFeedbackReports: string;
    brandColour1: string;
    brandColour2: string;
    logoFile: string;
    logoFileName: string;
    roleDates: Record<string, { openDate: string; closeDate: string }>;
    // Optional alternate invoice recipient — only used when paymentMethod === 'invoice'
    invoiceEmail?: string;
  };
}

// ── Payload sent from client to /api/checkout/bespoke ──

export interface BespokePayload {
  selectedRoles: {
    roleId: string;
    roleName: string;
    categoryName: string;
    categorySlug: string;
  }[];
  submittedAt?: string;
  bespokeDetails: {
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
  };
}

// ── Validation ──

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const VALID_TIERS: TierKey[] = ['starter', 'essential', 'growth', 'scale'];

export function validateCheckoutPayload(
  data: unknown
): { valid: true; payload: CheckoutPayload } | { valid: false; error: string } {
  const d = data as Record<string, unknown>;

  if (!d || typeof d !== 'object') {
    return { valid: false, error: 'Invalid request body' };
  }

  if (!Array.isArray(d.selectedRoles) || d.selectedRoles.length === 0) {
    return { valid: false, error: 'At least one role must be selected' };
  }

  if (!VALID_TIERS.includes(d.tier as TierKey)) {
    return { valid: false, error: 'Invalid tier' };
  }

  if (d.paymentFrequency !== 'annual' && d.paymentFrequency !== 'monthly') {
    return { valid: false, error: 'Invalid payment frequency' };
  }

  if (d.paymentMethod !== 'card' && d.paymentMethod !== 'invoice') {
    return { valid: false, error: 'Invalid payment method' };
  }

  const c = d.contactDetails as Record<string, unknown>;
  if (!c || typeof c !== 'object') {
    return { valid: false, error: 'Contact details are required' };
  }

  if (!c.firstName || !c.lastName || !c.email || !c.company) {
    return { valid: false, error: 'Name, email, and company are required' };
  }

  if (!EMAIL_RE.test(c.email as string)) {
    return { valid: false, error: 'Invalid email address' };
  }

  return { valid: true, payload: data as CheckoutPayload };
}

export function validateBespokePayload(
  data: unknown
): { valid: true; payload: BespokePayload } | { valid: false; error: string } {
  const d = data as Record<string, unknown>;

  if (!d || typeof d !== 'object') {
    return { valid: false, error: 'Invalid request body' };
  }

  const b = d.bespokeDetails as Record<string, unknown>;
  if (!b || typeof b !== 'object') {
    return { valid: false, error: 'Bespoke details are required' };
  }

  if (!b.firstName || !b.lastName || !b.email || !b.company) {
    return { valid: false, error: 'Name, email, and company are required' };
  }

  if (!EMAIL_RE.test(b.email as string)) {
    return { valid: false, error: 'Invalid email address' };
  }

  return { valid: true, payload: data as BespokePayload };
}
