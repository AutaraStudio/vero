import type { CheckoutPayload, BespokePayload } from './checkout-schema';
import { TIER_DATA, getTierPrice } from './tierRecommendation';

const HUBSPOT_API = 'https://api.hubapi.com/crm/v3/objects/companies';
const HUBSPOT_FILES_API = 'https://api.hubapi.com/files/v3/files';

// ── Upload file to HubSpot File Manager ───────────────────────

export async function uploadFileToHubSpot(
  base64DataUrl: string,
  fileName: string,
  folder: string = 'vero-assess/logos'
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

  // Build multipart form data manually
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

  // Options part (JSON)
  const options = JSON.stringify({
    access: 'PUBLIC_NOT_INDEXABLE',
    folderPath: `/${folder}`,
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

// ── Submit checkout order ──────────────────────────────────────

export async function submitCheckoutToHubSpot(
  payload: CheckoutPayload
): Promise<void> {
  const properties = mapCheckoutToHubSpot(payload);

  // Upload logo if provided
  if (payload.contactDetails.logoFile && payload.contactDetails.logoFileName) {
    try {
      const logoUrl = await uploadFileToHubSpot(
        payload.contactDetails.logoFile,
        payload.contactDetails.logoFileName
      );
      properties.vero_assess_company_logo = logoUrl;
    } catch (err) {
      console.error('[HubSpot] Logo upload failed (non-blocking):', err);
    }
  }

  await submitCompany(properties);
}

// ── Submit bespoke enquiry ─────────────────────────────────────

export async function submitBespokeToHubSpot(
  payload: BespokePayload
): Promise<void> {
  const properties = mapBespokeToHubSpot(payload);
  await submitCompany(properties);
}

// ── Map checkout payload → HubSpot properties ──────────────────

function mapCheckoutToHubSpot(
  payload: CheckoutPayload
): Record<string, string> {
  const { selectedRoles, tier, paymentFrequency, autoRenewal, paymentMethod, contactDetails } = payload;
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

  // Build role names
  const roleNamesText = selectedRoles.map((r) => r.roleName).join('\n');
  // Normalize for HubSpot checkbox matching (strip spaces around slashes)
  const roleNamesCheckbox = selectedRoles.map((r) => r.roleName.replace(/\s*\/\s*/g, '/')).join(';');

  const props: Record<string, string> = {
    // Company name (required by HubSpot)
    name: contactDetails.company,

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
    vero_assess_roles_order: roleNamesText,
    // vero_assess_roles checkbox skipped — name mismatches between Sanity and HubSpot options

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
  const roleNamesText = selectedRoles.map((r) => r.roleName).join('\n');
  const roleNamesCheckbox = selectedRoles.map((r) => r.roleName.replace(/\s*\/\s*/g, '/')).join(';');

  const props: Record<string, string> = {
    name: bespokeDetails.company,
    vero_assess_buyer_first_name: bespokeDetails.firstName,
    vero_assess_buyer_last_name: bespokeDetails.lastName,
    vero_assess_buyer_email: bespokeDetails.email,
    vero_assess_buyer_job_title: bespokeDetails.jobTitle,
    vero_assess_buyer_phone: bespokeDetails.phone,
    vero_assess_tier: 'Bespoke',
    vero_assess_role_count: String(selectedRoles.length),
    vero_assess_roles_order: roleNamesText,
    // vero_assess_roles checkbox skipped — name mismatches between Sanity and HubSpot options
    vero_assess_approx_roles: bespokeDetails.approxRoles,
    vero_assess_approx_candidates: bespokeDetails.approxCandidates,
    vero_assess_target_go_live: bespokeDetails.targetGoLive,
    vero_assess_requirements: bespokeDetails.requirements,
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
