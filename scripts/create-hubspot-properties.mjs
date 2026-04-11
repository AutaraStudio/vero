/**
 * Creates all Vero Assess HubSpot company properties via the API.
 *
 * Usage:
 *   HUBSPOT_TOKEN=pat-xxx node scripts/create-hubspot-properties.mjs
 *
 * Requirements:
 *   - HubSpot Private App token with scope: crm.schemas.companies.write
 *
 * Safe to re-run: skips properties that already exist (409 conflict).
 */

const TOKEN = process.env.HUBSPOT_TOKEN;
if (!TOKEN) {
  console.error('Missing HUBSPOT_TOKEN env var.');
  console.error('Create a Private App in HubSpot with scope: crm.schemas.companies.write');
  process.exit(1);
}

const API = 'https://api.hubapi.com/crm/v3/properties/company';

const GROUP_NAME = 'vero_assess';

// ── Step 1: Ensure property group exists ───────────────────────

async function ensureGroup() {
  const res = await fetch(`${API}/groups`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${TOKEN}`,
    },
    body: JSON.stringify({
      name: GROUP_NAME,
      label: 'Vero Assess',
      displayOrder: 0,
    }),
  });

  if (res.ok) {
    console.log('✓ Created property group: Vero Assess');
  } else if (res.status === 409) {
    console.log('· Property group "Vero Assess" already exists — skipping');
  } else {
    const err = await res.json();
    console.error('✗ Failed to create group:', err.message || JSON.stringify(err));
  }
}

// ── Step 2: Define all properties ──────────────────────────────

const PROPERTIES = [
  // ── Already created by client (included for completeness / safe re-run) ──

  {
    name: 'key_contract_contact',
    label: 'Key contact for project',
    type: 'string',
    fieldType: 'text',
    description: 'Name and email of the key project contact',
  },
  {
    name: 'vero_assess_roles',
    label: 'Roles',
    type: 'enumeration',
    fieldType: 'checkbox',
    description: 'Assessment roles added to basket',
    options: [], // Options populated dynamically from Sanity — leave empty for now
  },
  {
    name: 'vero_assess_users',
    label: 'Users to be added',
    type: 'string',
    fieldType: 'textarea',
    description: 'Email addresses of users who need system access',
  },
  {
    name: 'vero_assess_url',
    label: 'Bespoke URL',
    type: 'string',
    fieldType: 'text',
    description: 'Custom portal subdomain (e.g. acme → acme.veroassess.com)',
  },
  {
    name: 'vero_candidate_feedback_reports',
    label: 'Candidate feedback reports',
    type: 'bool',
    fieldType: 'booleancheckbox',
    description: 'Whether the company wants to send candidate feedback reports',
  },
  {
    name: 'vero_assess_brand_colour_1',
    label: 'Brand colour 1',
    type: 'string',
    fieldType: 'text',
    description: 'Primary brand hex colour (e.g. #472d6a)',
  },
  {
    name: 'vero_assess_brand_colour_2',
    label: 'Brand colour 2',
    type: 'string',
    fieldType: 'text',
    description: 'Secondary brand hex colour (e.g. #fec601)',
  },
  {
    name: 'vero_assess_company_logo',
    label: 'Company logo',
    type: 'string',
    fieldType: 'file',
    description: 'Uploaded company logo for portal branding',
  },
  {
    name: 'vero_assess_payment_method',
    label: 'Payment method',
    type: 'enumeration',
    fieldType: 'select',
    description: 'How the company chose to pay',
    options: [
      { label: 'Online card payment', value: 'card', displayOrder: 1 },
      { label: 'Invoice', value: 'invoice', displayOrder: 2 },
    ],
  },
  {
    name: 'vero_assess_autorenewal_annual',
    label: 'Auto-renewal (annual)',
    type: 'bool',
    fieldType: 'booleancheckbox',
    description: 'Whether the annual licence should auto-renew in 12 months',
  },

  // ── New properties to capture all form data ──

  {
    name: 'vero_assess_tier',
    label: 'Pricing tier',
    type: 'enumeration',
    fieldType: 'select',
    description: 'Selected pricing tier at checkout',
    options: [
      { label: 'Starter', value: 'starter', displayOrder: 1 },
      { label: 'Essential', value: 'essential', displayOrder: 2 },
      { label: 'Growth', value: 'growth', displayOrder: 3 },
      { label: 'Scale', value: 'scale', displayOrder: 4 },
      { label: 'Bespoke', value: 'bespoke', displayOrder: 5 },
    ],
  },
  {
    name: 'vero_assess_payment_frequency',
    label: 'Payment frequency',
    type: 'enumeration',
    fieldType: 'select',
    description: 'Billing frequency — annual or monthly',
    options: [
      { label: 'Annual', value: 'annual', displayOrder: 1 },
      { label: 'Monthly', value: 'monthly', displayOrder: 2 },
      { label: 'One-off', value: 'one-off', displayOrder: 3 },
    ],
  },
  {
    name: 'vero_assess_order_value',
    label: 'Order value',
    type: 'number',
    fieldType: 'number',
    description: 'Total order value at checkout (GBP)',
  },
  {
    name: 'vero_assess_key_contact_name',
    label: 'Key contact name',
    type: 'string',
    fieldType: 'text',
    description: 'Full name of the key project contact',
  },
  {
    name: 'vero_assess_key_contact_email',
    label: 'Key contact email',
    type: 'string',
    fieldType: 'text',
    description: 'Email address of the key project contact',
  },
  {
    name: 'vero_assess_campaign_dates',
    label: 'Campaign dates',
    type: 'string',
    fieldType: 'textarea',
    description: 'Per-role campaign dates in readable format (e.g. "Administrative Assistant: 01/05/2026 – 01/08/2026")',
  },
  {
    name: 'vero_assess_earliest_campaign_open_date',
    label: 'Earliest campaign open date',
    type: 'date',
    fieldType: 'date',
    description: 'Earliest open date across all roles — for filtering and workflows',
  },
  {
    name: 'vero_assess_latest_close_date',
    label: 'Latest campaign close date',
    type: 'date',
    fieldType: 'date',
    description: 'Latest close date across all roles — for filtering and workflows',
  },
  {
    name: 'vero_assess_contract_accepted',
    label: 'Contract accepted',
    type: 'bool',
    fieldType: 'booleancheckbox',
    description: 'Whether the customer accepted the service agreement',
  },
  {
    name: 'vero_assess_contract_accepted_date',
    label: 'Contract accepted date',
    type: 'datetime',
    fieldType: 'date',
    description: 'Timestamp when the contract was accepted',
  },
  {
    name: 'vero_assess_role_count',
    label: 'Number of roles',
    type: 'number',
    fieldType: 'number',
    description: 'Total number of assessment roles selected',
  },

  // ── Bespoke enquiry fields ──

  {
    name: 'vero_assess_approx_roles',
    label: 'Approx. roles (bespoke)',
    type: 'string',
    fieldType: 'text',
    description: 'Approximate number of roles for bespoke enquiry',
  },
  {
    name: 'vero_assess_approx_candidates',
    label: 'Approx. candidates/year (bespoke)',
    type: 'string',
    fieldType: 'text',
    description: 'Approximate candidates per year for bespoke enquiry',
  },
  {
    name: 'vero_assess_target_go_live',
    label: 'Target go-live date (bespoke)',
    type: 'date',
    fieldType: 'date',
    description: 'Target go-live date for bespoke enquiry',
  },
  {
    name: 'vero_assess_requirements',
    label: 'Specific requirements (bespoke)',
    type: 'string',
    fieldType: 'textarea',
    description: 'Free-text requirements for bespoke enquiry',
  },

  // ── Contact details captured at checkout ──

  {
    name: 'vero_assess_buyer_first_name',
    label: 'Buyer first name',
    type: 'string',
    fieldType: 'text',
    description: 'First name of the person who completed checkout',
  },
  {
    name: 'vero_assess_buyer_last_name',
    label: 'Buyer last name',
    type: 'string',
    fieldType: 'text',
    description: 'Last name of the person who completed checkout',
  },
  {
    name: 'vero_assess_buyer_email',
    label: 'Buyer email',
    type: 'string',
    fieldType: 'text',
    description: 'Email of the person who completed checkout',
  },
  {
    name: 'vero_assess_buyer_job_title',
    label: 'Buyer job title',
    type: 'string',
    fieldType: 'text',
    description: 'Job title of the person who completed checkout',
  },
  {
    name: 'vero_assess_buyer_phone',
    label: 'Buyer phone',
    type: 'string',
    fieldType: 'text',
    description: 'Phone number of the person who completed checkout',
  },
];

// ── Step 3: Create each property ───────────────────────────────

async function createProperty(prop) {
  const body = {
    name: prop.name,
    label: prop.label,
    type: prop.type,
    fieldType: prop.fieldType,
    groupName: GROUP_NAME,
    description: prop.description || '',
  };

  if (prop.options && prop.options.length > 0) {
    body.options = prop.options;
  }

  const res = await fetch(API, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${TOKEN}`,
    },
    body: JSON.stringify(body),
  });

  if (res.ok) {
    console.log(`  ✓ ${prop.name}`);
    return true;
  }

  if (res.status === 409) {
    console.log(`  · ${prop.name} (already exists)`);
    return true;
  }

  const err = await res.json();
  console.error(`  ✗ ${prop.name}: ${err.message || JSON.stringify(err)}`);
  return false;
}

// ── Run ────────────────────────────────────────────────────────

async function main() {
  console.log('\n🔧 Creating Vero Assess HubSpot properties\n');

  await ensureGroup();

  console.log(`\nCreating ${PROPERTIES.length} company properties...\n`);

  let created = 0;
  let failed = 0;

  for (const prop of PROPERTIES) {
    const ok = await createProperty(prop);
    if (ok) {
      created++;
    } else {
      failed++;
    }
  }

  console.log(`\n✅ Done: ${created} created/skipped, ${failed} failed\n`);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
