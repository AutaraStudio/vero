import type { CheckoutPayload, BespokePayload } from './checkout-schema';
import { TIER_DATA, getTierPrice } from './tierRecommendation';

const HUBSPOT_API = 'https://api.hubapi.com/crm/v3/objects/companies';
const HUBSPOT_CONTACTS_API = 'https://api.hubapi.com/crm/v3/objects/contacts';
const HUBSPOT_FILES_API = 'https://api.hubapi.com/files/v3/files';

// Contact → Company primary association (HubSpot built-in)
const CONTACT_TO_COMPANY_PRIMARY = 279;

// ── Upload file to HubSpot File Manager ───────────────────────

export async function uploadFileToHubSpot(
  base64DataUrl: string,
  fileName: string,
  folder: string = '/Vero Assess/Logos'
): Promise<string> {
  const token = process.env.HUBSPOT_ACCESS_TOKEN;
  if (!token) throw new Error('No HUBSPOT_ACCESS_TOKEN');

  // Convert base64 data URL to buffer
  const base64Data = base64DataUrl.split(',')[1];
  if (!base64Data) throw new Error('Invalid base64 data URL');

  const buffer = Buffer.from(base64Data, 'base64');

  // Detect MIME type from data URL
  const mimeMatch = base64DataUrl.match(/^data:([^;]+);/);
  const mimeType = mimeMatch?.[1] || 'image/png';

  // Build multipart form data using FormData-style boundary encoding
  const boundary = '----HubSpotUpload' + Date.now();
  const parts: Buffer[] = [];

  // File part
  parts.push(Buffer.from(
    `--${boundary}\r\n` +
    `Content-Disposition: form-data; name="file"; filename="${fileName}"\r\n` +
    `Content-Type: ${mimeType}\r\n\r\n`
  ));
  parts.push(buffer);
  parts.push(Buffer.from('\r\n'));

  // folderPath part (required by HubSpot — must be a separate form field)
  parts.push(Buffer.from(
    `--${boundary}\r\n` +
    `Content-Disposition: form-data; name="folderPath"\r\n\r\n` +
    `${folder}\r\n`
  ));

  // Options part (JSON — access settings)
  const options = JSON.stringify({
    access: 'PUBLIC_NOT_INDEXABLE',
    overwrite: true,
  });
  parts.push(Buffer.from(
    `--${boundary}\r\n` +
    `Content-Disposition: form-data; name="options"\r\n` +
    `Content-Type: application/json\r\n\r\n` +
    options + '\r\n'
  ));

  // End boundary
  parts.push(Buffer.from(`--${boundary}--\r\n`));

  const body = Buffer.concat(parts);

  const res = await fetch(HUBSPOT_FILES_API, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': `multipart/form-data; boundary=${boundary}`,
    },
    body,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    console.error('[HubSpot] File upload failed:', err);
    throw new Error(`HubSpot file upload error: ${res.status}`);
  }

  const data = await res.json();
  console.log(`[HubSpot] File uploaded: ${data.url}`);
  return data.url as string;
}

// ── Submit to HubSpot CRM API ──────────────────────────────────

async function submitCompany(
  properties: Record<string, string>
): Promise<string> {
  const token = process.env.HUBSPOT_ACCESS_TOKEN;
  if (!token) {
    console.warn('[HubSpot] No HUBSPOT_ACCESS_TOKEN — skipping submission');
    return 'skipped';
  }

  const res = await fetch(HUBSPOT_API, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ properties }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    console.error('[HubSpot] Failed to create company:', err);
    throw new Error(`HubSpot API error: ${res.status}`);
  }

  const data = await res.json();
  console.log(`[HubSpot] Created company: ${data.id}`);
  return data.id as string;
}

// ── Create (or associate existing) contact for a company ──────
//
// Strategy:
//   - Try to create a new Contact with an inline association to the Company.
//   - If 409 Conflict (contact already exists): don't update the contact's
//     properties; just extract the existing id and add the association so the
//     Company record still shows the buyer in its sidebar.
//   - All errors are swallowed + logged — never block the checkout response.

interface ContactInput {
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  jobTitle?: string;
}

async function createContactForCompany(
  companyId: string,
  contact: ContactInput
): Promise<void> {
  const token = process.env.HUBSPOT_ACCESS_TOKEN;
  if (!token) return;
  if (!companyId || companyId === 'skipped') return;

  const properties: Record<string, string> = {
    email: contact.email,
    firstname: contact.firstName,
    lastname: contact.lastName,
  };
  if (contact.phone) properties.phone = contact.phone;
  if (contact.jobTitle) properties.jobtitle = contact.jobTitle;

  const body = {
    properties,
    associations: [
      {
        to: { id: companyId },
        types: [
          {
            associationCategory: 'HUBSPOT_DEFINED',
            associationTypeId: CONTACT_TO_COMPANY_PRIMARY,
          },
        ],
      },
    ],
  };

  const res = await fetch(HUBSPOT_CONTACTS_API, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  if (res.ok) {
    const data = await res.json().catch(() => ({}));
    console.log(`[HubSpot] Created contact ${data.id} → company ${companyId}`);
    return;
  }

  // 409 = contact already exists. Extract id and add association only.
  if (res.status === 409) {
    const err = await res.json().catch(() => ({} as { message?: string }));
    const match = typeof err.message === 'string' ? err.message.match(/Existing ID:\s*(\d+)/i) : null;
    const existingId = match?.[1];

    if (!existingId) {
      console.warn('[HubSpot] Contact conflict but existing id not found:', err);
      return;
    }

    console.log(`[HubSpot] Contact ${existingId} exists — skipping update, adding company association`);

    const assocRes = await fetch(
      `https://api.hubapi.com/crm/v4/objects/contacts/${existingId}/associations/default/companies/${companyId}`,
      {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (!assocRes.ok) {
      const assocErr = await assocRes.json().catch(() => ({}));
      console.error('[HubSpot] Failed to associate existing contact to company:', assocErr);
    }
    return;
  }

  const err = await res.json().catch(() => ({}));
  console.error('[HubSpot] Failed to create contact:', err);
}

// ── Submit checkout order ──────────────────────────────────────

export async function submitCheckoutToHubSpot(
  payload: CheckoutPayload
): Promise<void> {
  const properties = mapCheckoutToHubSpot(payload);

  // Upload logo if provided — rename to Company-Name-Logo.ext
  if (payload.contactDetails.logoFile && payload.contactDetails.logoFileName) {
    try {
      const ext = payload.contactDetails.logoFileName.split('.').pop() || 'png';
      const sluggedCompany = payload.contactDetails.company
        .trim()
        .replace(/[^a-zA-Z0-9\s-]/g, '')
        .replace(/\s+/g, '-');
      const logoFileName = `${sluggedCompany}-Logo.${ext}`;

      const logoUrl = await uploadFileToHubSpot(
        payload.contactDetails.logoFile,
        logoFileName
      );
      properties.vero_assess_company_logo = logoUrl;
    } catch (err) {
      console.error('[HubSpot] Logo upload failed (non-blocking):', err);
    }
  }

  const companyId = await submitCompany(properties);

  // Create buyer contact + associate to this company (non-blocking)
  try {
    await createContactForCompany(companyId, {
      email: payload.contactDetails.email,
      firstName: payload.contactDetails.firstName,
      lastName: payload.contactDetails.lastName,
      phone: payload.contactDetails.phone,
      jobTitle: payload.contactDetails.jobTitle,
    });
  } catch (err) {
    console.error('[HubSpot] Contact creation failed (non-blocking):', err);
  }
}

// ── Submit bespoke enquiry ─────────────────────────────────────

export async function submitBespokeToHubSpot(
  payload: BespokePayload
): Promise<void> {
  const properties = mapBespokeToHubSpot(payload);
  const companyId = await submitCompany(properties);

  try {
    await createContactForCompany(companyId, {
      email: payload.bespokeDetails.email,
      firstName: payload.bespokeDetails.firstName,
      lastName: payload.bespokeDetails.lastName,
      phone: payload.bespokeDetails.phone,
      jobTitle: payload.bespokeDetails.jobTitle,
    });
  } catch (err) {
    console.error('[HubSpot] Contact creation failed (non-blocking):', err);
  }
}

// ── Map checkout payload → HubSpot properties ──────────────────

function mapCheckoutToHubSpot(
  payload: CheckoutPayload
): Record<string, string> {
  const {
    selectedRoles,
    tier,
    paymentFrequency,
    autoRenewal,
    paymentMethod,
    contactDetails,
    stripeCustomerId,
    stripeSubscriptionId,
    stripePaymentIntentId,
    submittedAt,
  } = payload;
  const tierInfo = TIER_DATA[tier];
  const { price } = getTierPrice(tierInfo, paymentFrequency);

  // Build readable campaign dates
  const campaignLines: string[] = [];
  let earliestOpen = '';
  let latestClose = '';

  for (const role of selectedRoles) {
    const dates = contactDetails.roleDates[role.roleId];
    if (dates?.openDate && dates?.closeDate) {
      const open = formatDate(dates.openDate);
      const close = formatDate(dates.closeDate);
      campaignLines.push(`${role.roleName}: ${open} – ${close}`);

      if (!earliestOpen || dates.openDate < earliestOpen) earliestOpen = dates.openDate;
      if (!latestClose || dates.closeDate > latestClose) latestClose = dates.closeDate;
    }
  }

  // Determine payment frequency label
  const frequencyLabel = tier === 'starter' ? 'One-off' : paymentFrequency === 'annual' ? 'Annual' : 'Monthly';

  // Build multi-checkbox values — use hubspotValue override if set, else slug.
  // These must match option internal names on the HubSpot `vero_assess_roles`
  // property, which is kept in sync by /api/hubspot/sync-roles from Sanity.
  const roleCheckboxValues = selectedRoles
    .map((r) => r.roleHubspotValue || r.roleSlug)
    .filter(Boolean)
    .join(';');

  const props: Record<string, string> = {
    // Company name (required by HubSpot)
    name: contactDetails.company,

    // Domain — enables HubSpot auto-association to find this record by the
    // buyer email's domain instead of spawning a duplicate company. Skipped
    // for personal email providers (gmail, outlook, etc.) to avoid pollution.
    domain: getCompanyDomainFromEmail(contactDetails.email),

    // Buyer details
    vero_assess_buyer_first_name: contactDetails.firstName,
    vero_assess_buyer_last_name: contactDetails.lastName,
    vero_assess_buyer_email: contactDetails.email,
    vero_assess_buyer_job_title: contactDetails.jobTitle,
    vero_assess_buyer_phone: contactDetails.phone,

    // Key contact
    vero_assess_key_contact_name: contactDetails.keyContactSameAsMe
      ? `${contactDetails.firstName} ${contactDetails.lastName}`
      : contactDetails.keyContactName,
    vero_assess_key_contact_email: contactDetails.keyContactSameAsMe
      ? contactDetails.email
      : contactDetails.keyContactEmail,

    // Order
    vero_assess_tier: tier.charAt(0).toUpperCase() + tier.slice(1),
    vero_assess_payment_frequency: frequencyLabel,
    vero_assess_payment_method: paymentMethod === 'card' ? 'Online card payment' : 'Invoice',
    vero_assess_order_value: price.replace(/[^0-9.]/g, ''),
    vero_assess_role_count: String(selectedRoles.length),
    vero_assess_roles: roleCheckboxValues,

    // Auto-renewal (only meaningful for annual subscriptions)
    vero_assess_autorenewal_annual: (tier !== 'starter' && paymentFrequency === 'annual')
      ? String(autoRenewal)
      : '',

    // Contract
    vero_assess_contract_accepted: 'true',
    vero_assess_contract_accepted_date: new Date().toISOString().split('T')[0],

    // Portal & branding
    vero_assess_url: contactDetails.bespokeUrl,
    vero_assess_users: contactDetails.usersToAdd
      .split('\n')
      .filter(Boolean)
      .map((email, i) => `${i + 1}. ${email}`)
      .join('\n'),
    vero_candidate_feedback_reports: contactDetails.sendFeedbackReports === 'yes' ? 'true' : 'false',
    vero_assess_brand_colour_1: contactDetails.brandColour1,
    vero_assess_brand_colour_2: contactDetails.brandColour2,

    // Campaign dates
    vero_assess_campaign_dates: campaignLines.join('\n'),
    vero_assess_earliest_campaign_open_date: earliestOpen,
    vero_assess_latest_close_date: latestClose,

    // Payment traceability (card orders only — empty for invoice)
    vero_assess_stripe_customer_id: stripeCustomerId ?? '',
    vero_assess_stripe_subscription_id: stripeSubscriptionId ?? '',
    vero_assess_stripe_payment_intent_id: stripePaymentIntentId ?? '',

    // Alternate invoice email — only set when invoice payment AND different from buyer
    vero_assess_invoice_email:
      paymentMethod === 'invoice'
        && contactDetails.invoiceEmail
        && contactDetails.invoiceEmail.trim().toLowerCase() !== contactDetails.email.trim().toLowerCase()
        ? contactDetails.invoiceEmail.trim()
        : '',

    // Submission timestamp (YYYY-MM-DD for HubSpot Date picker). Server fallback if client omits.
    vero_assess_submission_timestamp: (submittedAt || new Date().toISOString()).split('T')[0],
  };

  // Remove empty values
  return Object.fromEntries(
    Object.entries(props).filter(([, v]) => v !== '' && v !== undefined)
  );
}

// ── Map bespoke payload → HubSpot properties ───────────────────

function mapBespokeToHubSpot(
  payload: BespokePayload
): Record<string, string> {
  const { selectedRoles, bespokeDetails } = payload;
  const roleCheckboxValues = selectedRoles
    .map((r) => r.roleHubspotValue || r.roleSlug)
    .filter(Boolean)
    .join(';');

  const props: Record<string, string> = {
    name: bespokeDetails.company,
    domain: getCompanyDomainFromEmail(bespokeDetails.email),
    vero_assess_buyer_first_name: bespokeDetails.firstName,
    vero_assess_buyer_last_name: bespokeDetails.lastName,
    vero_assess_buyer_email: bespokeDetails.email,
    vero_assess_buyer_job_title: bespokeDetails.jobTitle,
    vero_assess_buyer_phone: bespokeDetails.phone,
    vero_assess_tier: 'Bespoke',
    vero_assess_role_count: String(selectedRoles.length),
    vero_assess_roles: roleCheckboxValues,
    vero_assess_approx_roles: bespokeDetails.approxRoles,
    vero_assess_approx_candidates: bespokeDetails.approxCandidates,
    vero_assess_target_go_live: bespokeDetails.targetGoLive,
    vero_assess_requirements: bespokeDetails.requirements,
    vero_assess_submission_timestamp: (payload.submittedAt || new Date().toISOString()).split('T')[0],
  };

  return Object.fromEntries(
    Object.entries(props).filter(([, v]) => v !== '' && v !== undefined)
  );
}

// ── Helpers ─────────────────────────────────────────────────────

function formatDate(iso: string): string {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

// Personal / free-mail providers — never set as a company domain, or every
// Gmail user gets linked to the same phantom company.
const PERSONAL_EMAIL_DOMAINS = new Set([
  'gmail.com', 'googlemail.com',
  'outlook.com', 'hotmail.com', 'hotmail.co.uk', 'live.com', 'live.co.uk', 'msn.com',
  'yahoo.com', 'yahoo.co.uk', 'ymail.com',
  'icloud.com', 'me.com', 'mac.com',
  'aol.com',
  'protonmail.com', 'proton.me', 'pm.me',
  'mail.com', 'gmx.com', 'gmx.co.uk',
  'zoho.com', 'yandex.com', 'tutanota.com', 'fastmail.com', 'hey.com',
]);

function getCompanyDomainFromEmail(email: string): string {
  const domain = email.split('@')[1]?.trim().toLowerCase();
  if (!domain) return '';
  if (PERSONAL_EMAIL_DOMAINS.has(domain)) return '';
  return domain;
}
