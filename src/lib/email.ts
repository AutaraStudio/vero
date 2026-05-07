import { Resend } from 'resend';
import type { CheckoutPayload } from './checkout-schema';
import { TIER_DATA, getTierPrice } from './tierRecommendation';

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = 'Vero Assess <orders@veroassess.com>';

/* Internal recipients for the admin order-summary email. The three visible
   addresses are sent via Resend's `to:` array so each recipient sees the
   others and can hit Reply-All without losing context. matt@autara.studio
   is BCC'd for ops monitoring without showing up on the To line. */
const ADMIN_ORDER_RECIPIENTS = [
  'chelsea.francis@tazio.co.uk',
  'setup@veroassess.com',
  'louise.williams@tazio.co.uk',
  'kathryn.jones@tazio.co.uk',
];
const ADMIN_ORDER_BCC = ['matt@autara.studio'];

// ── Send order confirmation email ─────────────────────────────

export async function sendConfirmationEmail(payload: CheckoutPayload): Promise<void> {
  if (!process.env.RESEND_API_KEY) {
    console.warn('[Email] RESEND_API_KEY not set — skipping confirmation email');
    return;
  }

  const { contactDetails, selectedRoles, tier, paymentFrequency, autoRenewal, paymentMethod } = payload;
  const tierInfo = TIER_DATA[tier];
  const { price, priceNote } = getTierPrice(tierInfo, paymentFrequency);

  // Group roles by category
  const rolesByCategory: Record<string, string[]> = {};
  for (const role of selectedRoles) {
    if (!rolesByCategory[role.categoryName]) {
      rolesByCategory[role.categoryName] = [];
    }
    rolesByCategory[role.categoryName].push(role.roleName);
  }

  // Build campaign dates
  const campaignLines: string[] = [];
  for (const role of selectedRoles) {
    const dates = contactDetails.roleDates[role.roleId];
    if (dates?.openDate && dates?.closeDate) {
      const open = formatDate(dates.openDate);
      const close = formatDate(dates.closeDate);
      campaignLines.push(`${role.roleName}: ${open} – ${close}`);
    }
  }

  // Build user emails list
  const userEmails = contactDetails.usersToAdd
    .split('\n')
    .filter(Boolean);

  const frequencyLabel = tier === 'starter' ? 'One-off payment' : paymentFrequency === 'annual' ? 'Annual' : 'Monthly';
  const paymentMethodLabel = paymentMethod === 'card' ? 'Card payment' : 'Invoice';

  const html = buildConfirmationHtml({
    firstName: contactDetails.firstName,
    lastName: contactDetails.lastName,
    email: contactDetails.email,
    company: contactDetails.company,
    tierName: tierInfo.name,
    price,
    priceNote,
    frequencyLabel,
    paymentMethodLabel,
    autoRenewal: tier !== 'starter' && paymentFrequency === 'annual' ? autoRenewal : null,
    roleCount: selectedRoles.length,
    rolesByCategory,
    candidateLimit: tierInfo.candidateLimit,
    keyContactName: contactDetails.keyContactSameAsMe
      ? `${contactDetails.firstName} ${contactDetails.lastName}`
      : contactDetails.keyContactName,
    keyContactEmail: contactDetails.keyContactSameAsMe
      ? contactDetails.email
      : contactDetails.keyContactEmail,
    userEmails,
    portalUrl: contactDetails.bespokeUrl,
    campaignLines,
    sendFeedbackReports: contactDetails.sendFeedbackReports === 'yes',
  });

  const { data, error: sendError } = await resend.emails.send({
    from: FROM_EMAIL,
    to: contactDetails.email,
    subject: `Order confirmed — ${tierInfo.name} plan | Vero Assess`,
    html,
  });

  if (sendError) {
    console.error(`[Email] Resend API error:`, sendError);
    throw new Error(`Email send failed: ${sendError.message}`);
  }

  console.log(`[Email] Confirmation sent to ${contactDetails.email} (id: ${data?.id})`);
}

// ── Send invoice submission email (different from payment confirmation) ──

export async function sendInvoiceSubmissionEmail(payload: CheckoutPayload): Promise<void> {
  if (!process.env.RESEND_API_KEY) {
    console.warn('[Email] RESEND_API_KEY not set — skipping invoice email');
    return;
  }

  const { contactDetails, selectedRoles, tier, paymentFrequency, autoRenewal } = payload;
  const tierInfo = TIER_DATA[tier];
  const { price, priceNote } = getTierPrice(tierInfo, paymentFrequency);

  // Group roles by category
  const rolesByCategory: Record<string, string[]> = {};
  for (const role of selectedRoles) {
    if (!rolesByCategory[role.categoryName]) {
      rolesByCategory[role.categoryName] = [];
    }
    rolesByCategory[role.categoryName].push(role.roleName);
  }

  // Build campaign dates
  const campaignLines: string[] = [];
  for (const role of selectedRoles) {
    const dates = contactDetails.roleDates[role.roleId];
    if (dates?.openDate && dates?.closeDate) {
      const open = formatDate(dates.openDate);
      const close = formatDate(dates.closeDate);
      campaignLines.push(`${role.roleName}: ${open} – ${close}`);
    }
  }

  const userEmails = contactDetails.usersToAdd.split('\n').filter(Boolean);
  const frequencyLabel = tier === 'starter' ? 'One-off payment' : paymentFrequency === 'annual' ? 'Annual' : 'Monthly';

  const html = buildInvoiceSubmissionHtml({
    firstName: contactDetails.firstName,
    lastName: contactDetails.lastName,
    email: contactDetails.email,
    company: contactDetails.company,
    tierName: tierInfo.name,
    price,
    priceNote,
    frequencyLabel,
    paymentMethodLabel: 'Invoice',
    autoRenewal: tier !== 'starter' && paymentFrequency === 'annual' ? autoRenewal : null,
    roleCount: selectedRoles.length,
    rolesByCategory,
    candidateLimit: tierInfo.candidateLimit,
    keyContactName: contactDetails.keyContactSameAsMe
      ? `${contactDetails.firstName} ${contactDetails.lastName}`
      : contactDetails.keyContactName,
    keyContactEmail: contactDetails.keyContactSameAsMe
      ? contactDetails.email
      : contactDetails.keyContactEmail,
    userEmails,
    portalUrl: contactDetails.bespokeUrl,
    campaignLines,
    sendFeedbackReports: contactDetails.sendFeedbackReports === 'yes',
  });

  const { data, error: sendError } = await resend.emails.send({
    from: FROM_EMAIL,
    to: contactDetails.email,
    subject: `Order received — ${tierInfo.name} plan | Vero Assess`,
    html,
  });

  if (sendError) {
    console.error(`[Email] Resend API error:`, sendError);
    throw new Error(`Email send failed: ${sendError.message}`);
  }

  console.log(`[Email] Invoice submission email sent to ${contactDetails.email} (id: ${data?.id})`);
}

// ── Send admin-only order summary email ──────────────────────

export async function sendAdminOrderSummary(
  payload: CheckoutPayload,
  status: 'paid' | 'invoice-requested',
): Promise<void> {
  if (!process.env.RESEND_API_KEY) {
    console.warn('[Email] RESEND_API_KEY not set — skipping admin order summary');
    return;
  }

  const { contactDetails, selectedRoles, tier, paymentFrequency, autoRenewal, paymentMethod, submittedAt } = payload;
  const tierInfo = TIER_DATA[tier];
  const { price, priceNote } = getTierPrice(tierInfo, paymentFrequency);

  const rolesByCategory: Record<string, string[]> = {};
  for (const role of selectedRoles) {
    if (!rolesByCategory[role.categoryName]) rolesByCategory[role.categoryName] = [];
    rolesByCategory[role.categoryName].push(role.roleName);
  }

  const campaignLines: string[] = [];
  for (const role of selectedRoles) {
    const dates = contactDetails.roleDates[role.roleId];
    if (dates?.openDate && dates?.closeDate) {
      campaignLines.push(`${role.roleName}: ${formatDate(dates.openDate)} – ${formatDate(dates.closeDate)}`);
    }
  }

  const userEmails = contactDetails.usersToAdd.split('\n').map((s) => s.trim()).filter(Boolean);
  const frequencyLabel = tier === 'starter' ? 'One-off payment' : paymentFrequency === 'annual' ? 'Annual' : 'Monthly';
  const paymentMethodLabel = paymentMethod === 'card' ? 'Card payment' : 'Invoice';

  const html = buildAdminOrderHtml({
    status,
    submittedAt: submittedAt ?? new Date().toISOString(),
    firstName: contactDetails.firstName,
    lastName: contactDetails.lastName,
    email: contactDetails.email,
    phone: contactDetails.phone,
    jobTitle: contactDetails.jobTitle,
    company: contactDetails.company,
    tierName: tierInfo.name,
    price,
    priceNote,
    frequencyLabel,
    paymentMethodLabel,
    autoRenewal: tier !== 'starter' && paymentFrequency === 'annual' ? autoRenewal : null,
    candidateLimit: tierInfo.candidateLimit,
    roleCount: selectedRoles.length,
    rolesByCategory,
    campaignLines,
    userEmails,
    portalUrl: contactDetails.bespokeUrl,
    sendFeedbackReports: contactDetails.sendFeedbackReports,
    keyContactName: contactDetails.keyContactSameAsMe ? '' : contactDetails.keyContactName,
    keyContactEmail: contactDetails.keyContactSameAsMe ? '' : contactDetails.keyContactEmail,
    brandColour1: contactDetails.brandColour1,
    brandColour2: contactDetails.brandColour2,
    logoFileName: contactDetails.logoFileName,
  });

  const subjectPrefix = status === 'paid' ? '[Order paid]' : '[Invoice requested]';
  const subject = `${subjectPrefix} ${contactDetails.company} — ${tierInfo.name}, ${selectedRoles.length} role${selectedRoles.length !== 1 ? 's' : ''}, ${price}`;

  const { data, error: sendError } = await resend.emails.send({
    from: FROM_EMAIL,
    to: ADMIN_ORDER_RECIPIENTS,
    bcc: ADMIN_ORDER_BCC,
    subject,
    html,
  });

  if (sendError) {
    console.error('[Email] Admin summary Resend API error:', sendError);
    throw new Error(`Admin summary send failed: ${sendError.message}`);
  }

  console.log(`[Email] Admin order summary sent for ${contactDetails.company} (id: ${data?.id})`);
}

// ── Send contact-form acknowledgement to the enquirer ────────

interface ContactAcknowledgementPayload {
  name: string;
  email: string;
  company?: string;
  message: string;
}

export async function sendContactAcknowledgement(
  payload: ContactAcknowledgementPayload,
): Promise<void> {
  if (!process.env.RESEND_API_KEY) {
    console.warn('[Email] RESEND_API_KEY not set — skipping contact acknowledgement');
    return;
  }

  const firstName = payload.name.trim().split(/\s+/)[0] ?? payload.name.trim();
  const html = buildContactAcknowledgementHtml({
    firstName,
    company: payload.company ?? '',
    message: payload.message,
  });

  const { data, error: sendError } = await resend.emails.send({
    from: FROM_EMAIL,
    to: payload.email,
    replyTo: 'support@veroassess.com',
    subject: 'Thanks for getting in touch — Vero Assess',
    html,
  });

  if (sendError) {
    console.error('[Email] Contact acknowledgement Resend API error:', sendError);
    throw new Error(`Contact acknowledgement send failed: ${sendError.message}`);
  }

  console.log(`[Email] Contact acknowledgement sent to ${payload.email} (id: ${data?.id})`);
}

// ── HTML template ──────────────────────────────────────────────

interface EmailData {
  firstName: string;
  lastName: string;
  email: string;
  company: string;
  tierName: string;
  price: string;
  priceNote: string;
  frequencyLabel: string;
  paymentMethodLabel: string;
  autoRenewal: boolean | null;
  roleCount: number;
  rolesByCategory: Record<string, string[]>;
  candidateLimit: string;
  keyContactName: string;
  keyContactEmail: string;
  userEmails: string[];
  portalUrl: string;
  campaignLines: string[];
  sendFeedbackReports: boolean;
}

// ── Shared HTML builders ──────────────────────────────────────

const SHOW_THRESHOLD = 10;

function buildRolesHtml(rolesByCategory: Record<string, string[]>): string {
  let html = '';
  for (const [category, roles] of Object.entries(rolesByCategory)) {
    const visible = roles.slice(0, SHOW_THRESHOLD);
    const hidden = roles.length - SHOW_THRESHOLD;

    html += `
      <tr><td style="padding: 12px 0 4px 0;">
        <span style="font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #6b5a7e;">${category}</span>
        <span style="font-size: 11px; color: #9b8dab; margin-left: 6px;">${roles.length} role${roles.length !== 1 ? 's' : ''}</span>
      </td></tr>`;

    for (const role of visible) {
      html += `
      <tr><td style="padding: 3px 0 3px 12px; font-size: 14px; color: #201530;">
        ${role}
      </td></tr>`;
    }

    if (hidden > 0) {
      html += `
      <tr><td style="padding: 3px 0 3px 12px; font-size: 13px; color: #9b8dab; font-style: italic;">
        +${hidden} more role${hidden !== 1 ? 's' : ''}
      </td></tr>`;
    }
  }
  return html;
}

function buildUsersHtml(userEmails: string[]): string {
  if (userEmails.length === 0) return '';
  let html = '';
  const visible = userEmails.slice(0, SHOW_THRESHOLD);
  const hidden = userEmails.length - SHOW_THRESHOLD;

  for (let i = 0; i < visible.length; i++) {
    html += `
      <tr><td style="padding: 3px 0; font-size: 14px; color: #201530;">
        <span style="color: #9b8dab; font-size: 12px; margin-right: 6px;">${i + 1}.</span>${visible[i]}
      </td></tr>`;
  }

  if (hidden > 0) {
    html += `
      <tr><td style="padding: 3px 0; font-size: 13px; color: #9b8dab; font-style: italic;">
        +${hidden} more user${hidden !== 1 ? 's' : ''}
      </td></tr>`;
  }
  return html;
}

function buildDatesHtml(campaignLines: string[]): string {
  if (campaignLines.length === 0) return '';
  let html = '';
  const visible = campaignLines.slice(0, SHOW_THRESHOLD);
  const hidden = campaignLines.length - SHOW_THRESHOLD;

  for (const line of visible) {
    html += `
      <tr><td style="padding: 3px 0; font-size: 14px; color: #201530;">
        ${line}
      </td></tr>`;
  }

  if (hidden > 0) {
    html += `
      <tr><td style="padding: 3px 0; font-size: 13px; color: #9b8dab; font-style: italic;">
        +${hidden} more date${hidden !== 1 ? 's' : ''}
      </td></tr>`;
  }
  return html;
}

// ── Payment confirmation HTML template ────────────────────────

function buildConfirmationHtml(data: EmailData): string {
  const {
    firstName, company, tierName, price, priceNote,
    frequencyLabel, paymentMethodLabel, autoRenewal,
    roleCount, rolesByCategory, candidateLimit,
    keyContactName, keyContactEmail, userEmails,
    portalUrl, campaignLines, sendFeedbackReports,
  } = data;

  const rolesHtml = buildRolesHtml(rolesByCategory);
  const usersHtml = buildUsersHtml(userEmails);
  const datesHtml = buildDatesHtml(campaignLines);

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Confirmed — Vero Assess</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f3f0f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; -webkit-font-smoothing: antialiased;">

  <!-- Wrapper -->
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f0f6;">
    <tr>
      <td align="center" style="padding: 40px 16px;">

        <!-- Email container -->
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; width: 100%;">

          <!-- Logo -->
          <tr>
            <td align="center" style="padding: 0 0 32px 0;">
              <img src="https://veroassess.com/logo.svg" alt="Vero Assess" width="160" style="display: block; height: auto;" />
            </td>
          </tr>

          <!-- Hero card -->
          <tr>
            <td style="background-color: #472d6a; border-radius: 8px 8px 0 0; padding: 40px 40px 32px 40px; text-align: center;">
              <!-- Checkmark -->
              <div style="width: 56px; height: 56px; background-color: rgba(255,255,255,0.15); border-radius: 50%; margin: 0 auto 20px auto; line-height: 56px; font-size: 28px;">
                ✓
              </div>
              <h1 style="margin: 0 0 8px 0; font-size: 24px; font-weight: 700; color: #ffffff; line-height: 1.3;">
                Order confirmed
              </h1>
              <p style="margin: 0; font-size: 15px; color: rgba(255,255,255,0.75); line-height: 1.5;">
                Thanks ${firstName} — your ${tierName} plan is being set up.
              </p>
            </td>
          </tr>

          <!-- Order summary card -->
          <tr>
            <td style="background-color: #ffffff; padding: 32px 40px; border-left: 1px solid #e8e3ed; border-right: 1px solid #e8e3ed;">

              <!-- Plan + Price -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px; border-bottom: 1px solid #f0ecf4; padding-bottom: 24px;">
                <tr>
                  <td>
                    <span style="font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; color: #9b8dab;">Plan</span>
                    <br>
                    <span style="font-size: 20px; font-weight: 700; color: #472d6a;">${tierName}</span>
                  </td>
                  <td align="right" style="vertical-align: top;">
                    <span style="font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; color: #9b8dab;">Total</span>
                    <br>
                    <span style="font-size: 20px; font-weight: 700; color: #201530;">${price}</span>
                    <br>
                    <span style="font-size: 13px; color: #9b8dab;">${priceNote}</span>
                  </td>
                </tr>
              </table>

              <!-- Quick details -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
                ${detailRow('Company', company)}
                ${detailRow('Roles', `${roleCount} role${roleCount !== 1 ? 's' : ''} selected`)}
                ${detailRow('Candidates', candidateLimit)}
                ${detailRow('Billing', frequencyLabel)}
                ${detailRow('Payment', paymentMethodLabel)}
                ${autoRenewal !== null ? detailRow('Auto-renewal', autoRenewal ? 'Yes — renews in 12 months' : 'No — expires after 12 months') : ''}
                ${sendFeedbackReports ? detailRow('Feedback reports', 'Enabled') : ''}
                ${portalUrl ? detailRow('Portal URL', `${portalUrl}.veroassess.com`) : ''}
              </table>

              <!-- Divider -->
              <div style="height: 1px; background-color: #f0ecf4; margin: 0 0 24px 0;"></div>

              <!-- Roles by category -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
                <tr><td style="padding-bottom: 8px;">
                  <span style="font-size: 15px; font-weight: 600; color: #201530;">Selected roles</span>
                </td></tr>
                ${rolesHtml}
              </table>

              <!-- Key contact -->
              ${keyContactName ? `
              <div style="height: 1px; background-color: #f0ecf4; margin: 0 0 24px 0;"></div>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
                <tr><td style="padding-bottom: 8px;">
                  <span style="font-size: 15px; font-weight: 600; color: #201530;">Key project contact</span>
                </td></tr>
                ${detailRow('Name', keyContactName)}
                ${detailRow('Email', keyContactEmail)}
              </table>
              ` : ''}

              <!-- Users -->
              ${userEmails.length > 0 ? `
              <div style="height: 1px; background-color: #f0ecf4; margin: 0 0 24px 0;"></div>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
                <tr><td style="padding-bottom: 8px;">
                  <span style="font-size: 15px; font-weight: 600; color: #201530;">Users (${userEmails.length})</span>
                </td></tr>
                ${usersHtml}
              </table>
              ` : ''}

              <!-- Campaign dates -->
              ${campaignLines.length > 0 ? `
              <div style="height: 1px; background-color: #f0ecf4; margin: 0 0 24px 0;"></div>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
                <tr><td style="padding-bottom: 8px;">
                  <span style="font-size: 15px; font-weight: 600; color: #201530;">Campaign dates</span>
                </td></tr>
                ${datesHtml}
              </table>
              ` : ''}

            </td>
          </tr>

          <!-- What happens next -->
          <tr>
            <td style="background-color: #faf8fc; padding: 32px 40px; border-left: 1px solid #e8e3ed; border-right: 1px solid #e8e3ed;">
              <p style="margin: 0 0 20px 0; font-size: 15px; font-weight: 600; color: #201530;">What happens next</p>

              ${stepRow('1', 'Order confirmed', 'You\'ll receive this confirmation email with your order details.')}
              ${stepRow('2', 'Account set up', 'Our team will build your assessment portal based on the roles and settings you\'ve selected.')}
              ${stepRow('3', 'You\'re live', 'You\'ll receive your portal link and access instructions within 2 working days.')}
            </td>
          </tr>

          <!-- Support footer -->
          <tr>
            <td style="background-color: #ffffff; border-radius: 0 0 8px 8px; padding: 28px 40px; border: 1px solid #e8e3ed; border-top: 2px solid #472d6a; text-align: center;">
              <p style="margin: 0 0 4px 0; font-size: 15px; font-weight: 600; color: #201530;">Questions?</p>
              <p style="margin: 0 0 16px 0; font-size: 14px; color: #6b5a7e;">We're here to help.</p>
              <a href="mailto:support@veroassess.com" style="display: inline-block; padding: 10px 24px; background-color: #472d6a; color: #ffffff; text-decoration: none; border-radius: 4px; font-size: 14px; font-weight: 600;">
                Contact support
              </a>
            </td>
          </tr>

          <!-- Legal footer -->
          <tr>
            <td style="padding: 24px 40px; text-align: center;">
              <p style="margin: 0; font-size: 12px; color: #9b8dab; line-height: 1.6;">
                Vero Assess Ltd · support@veroassess.com
                <br>
                This email confirms your order. Please keep it for your records.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ── Invoice submission HTML template ──────────────────────────

function buildInvoiceSubmissionHtml(data: EmailData): string {
  const {
    firstName, company, tierName, price, priceNote,
    frequencyLabel, paymentMethodLabel, autoRenewal,
    roleCount, rolesByCategory, candidateLimit,
    keyContactName, keyContactEmail, userEmails,
    portalUrl, campaignLines, sendFeedbackReports,
  } = data;

  // Reuse the same role/user/date builders
  const rolesHtml = buildRolesHtml(rolesByCategory);
  const usersHtml = buildUsersHtml(userEmails);
  const datesHtml = buildDatesHtml(campaignLines);

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Received — Vero Assess</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f3f0f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; -webkit-font-smoothing: antialiased;">

  <!-- Wrapper -->
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f0f6;">
    <tr>
      <td align="center" style="padding: 40px 16px;">

        <!-- Email container -->
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; width: 100%;">

          <!-- Logo -->
          <tr>
            <td align="center" style="padding: 0 0 32px 0;">
              <img src="https://veroassess.com/logo.svg" alt="Vero Assess" width="160" style="display: block; height: auto;" />
            </td>
          </tr>

          <!-- Hero card -->
          <tr>
            <td style="background-color: #472d6a; border-radius: 8px 8px 0 0; padding: 40px 40px 32px 40px; text-align: center;">
              <!-- Clock icon -->
              <div style="width: 56px; height: 56px; background-color: rgba(255,255,255,0.15); border-radius: 50%; margin: 0 auto 20px auto; line-height: 56px; font-size: 28px;">
                ⏱
              </div>
              <h1 style="margin: 0 0 8px 0; font-size: 24px; font-weight: 700; color: #ffffff; line-height: 1.3;">
                Order received
              </h1>
              <p style="margin: 0; font-size: 15px; color: rgba(255,255,255,0.75); line-height: 1.5;">
                Thanks ${firstName} — we've received your order for the ${tierName} plan.
              </p>
            </td>
          </tr>

          <!-- Invoice notice -->
          <tr>
            <td style="background-color: #faf8fc; padding: 24px 40px; border-left: 1px solid #e8e3ed; border-right: 1px solid #e8e3ed;">
              <p style="margin: 0; font-size: 14px; color: #472d6a; line-height: 1.6; font-weight: 500;">
                You've selected to pay by invoice. Our team will send an invoice to
                <strong>${data.email}</strong> within one working day. Payment terms are
                30 days from invoice date.
              </p>
            </td>
          </tr>

          <!-- Order summary card -->
          <tr>
            <td style="background-color: #ffffff; padding: 32px 40px; border-left: 1px solid #e8e3ed; border-right: 1px solid #e8e3ed;">

              <!-- Plan + Price -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px; border-bottom: 1px solid #f0ecf4; padding-bottom: 24px;">
                <tr>
                  <td>
                    <span style="font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; color: #9b8dab;">Plan</span>
                    <br>
                    <span style="font-size: 20px; font-weight: 700; color: #472d6a;">${tierName}</span>
                  </td>
                  <td align="right" style="vertical-align: top;">
                    <span style="font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; color: #9b8dab;">Total</span>
                    <br>
                    <span style="font-size: 20px; font-weight: 700; color: #201530;">${price}</span>
                    <br>
                    <span style="font-size: 13px; color: #9b8dab;">${priceNote}</span>
                  </td>
                </tr>
              </table>

              <!-- Quick details -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
                ${detailRow('Company', company)}
                ${detailRow('Roles', `${roleCount} role${roleCount !== 1 ? 's' : ''} selected`)}
                ${detailRow('Candidates', candidateLimit)}
                ${detailRow('Billing', frequencyLabel)}
                ${detailRow('Payment', paymentMethodLabel)}
                ${autoRenewal !== null ? detailRow('Auto-renewal', autoRenewal ? 'Yes — renews in 12 months' : 'No — expires after 12 months') : ''}
                ${sendFeedbackReports ? detailRow('Feedback reports', 'Enabled') : ''}
                ${portalUrl ? detailRow('Portal URL', `${portalUrl}.veroassess.com`) : ''}
              </table>

              <!-- Divider -->
              <div style="height: 1px; background-color: #f0ecf4; margin: 0 0 24px 0;"></div>

              <!-- Roles by category -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
                <tr><td style="padding-bottom: 8px;">
                  <span style="font-size: 15px; font-weight: 600; color: #201530;">Selected roles</span>
                </td></tr>
                ${rolesHtml}
              </table>

              <!-- Key contact -->
              ${keyContactName ? `
              <div style="height: 1px; background-color: #f0ecf4; margin: 0 0 24px 0;"></div>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
                <tr><td style="padding-bottom: 8px;">
                  <span style="font-size: 15px; font-weight: 600; color: #201530;">Key project contact</span>
                </td></tr>
                ${detailRow('Name', keyContactName)}
                ${detailRow('Email', keyContactEmail)}
              </table>
              ` : ''}

              <!-- Users -->
              ${userEmails.length > 0 ? `
              <div style="height: 1px; background-color: #f0ecf4; margin: 0 0 24px 0;"></div>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
                <tr><td style="padding-bottom: 8px;">
                  <span style="font-size: 15px; font-weight: 600; color: #201530;">Users (${userEmails.length})</span>
                </td></tr>
                ${usersHtml}
              </table>
              ` : ''}

              <!-- Campaign dates -->
              ${campaignLines.length > 0 ? `
              <div style="height: 1px; background-color: #f0ecf4; margin: 0 0 24px 0;"></div>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
                <tr><td style="padding-bottom: 8px;">
                  <span style="font-size: 15px; font-weight: 600; color: #201530;">Campaign dates</span>
                </td></tr>
                ${datesHtml}
              </table>
              ` : ''}

            </td>
          </tr>

          <!-- What happens next -->
          <tr>
            <td style="background-color: #faf8fc; padding: 32px 40px; border-left: 1px solid #e8e3ed; border-right: 1px solid #e8e3ed;">
              <p style="margin: 0 0 20px 0; font-size: 15px; font-weight: 600; color: #201530;">What happens next</p>

              ${stepRow('1', 'Invoice sent', 'Our team will send you an invoice within one working day.')}
              ${stepRow('2', 'Our team will be in touch', 'A member of our team will reach out to confirm your requirements and answer any questions.')}
              ${stepRow('3', 'Account set up', 'Once payment is received, we\'ll build your assessment portal based on the roles and settings you\'ve selected.')}
              ${stepRow('4', 'You\'re live', 'You\'ll receive your portal link and access instructions within 2 working days of payment.')}
            </td>
          </tr>

          <!-- Support footer -->
          <tr>
            <td style="background-color: #ffffff; border-radius: 0 0 8px 8px; padding: 28px 40px; border: 1px solid #e8e3ed; border-top: 2px solid #472d6a; text-align: center;">
              <p style="margin: 0 0 4px 0; font-size: 15px; font-weight: 600; color: #201530;">Questions?</p>
              <p style="margin: 0 0 16px 0; font-size: 14px; color: #6b5a7e;">We're here to help.</p>
              <a href="mailto:support@veroassess.com" style="display: inline-block; padding: 10px 24px; background-color: #472d6a; color: #ffffff; text-decoration: none; border-radius: 4px; font-size: 14px; font-weight: 600;">
                Contact support
              </a>
            </td>
          </tr>

          <!-- Legal footer -->
          <tr>
            <td style="padding: 24px 40px; text-align: center;">
              <p style="margin: 0; font-size: 12px; color: #9b8dab; line-height: 1.6;">
                Vero Assess Ltd · support@veroassess.com
                <br>
                This email confirms we've received your order. An invoice will follow shortly.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ── Template helpers ──────────────────────────────────────────

function detailRow(label: string, value: string): string {
  return `
    <tr>
      <td style="padding: 4px 0;">
        <span style="font-size: 13px; color: #9b8dab; display: inline-block; width: 120px; vertical-align: top;">${label}</span>
        <span style="font-size: 14px; color: #201530;">${value}</span>
      </td>
    </tr>`;
}

function stepRow(num: string, title: string, body: string): string {
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 16px;">
      <tr>
        <td width="28" valign="top" style="padding-top: 2px;">
          <div style="width: 22px; height: 22px; background-color: #472d6a; border-radius: 50%; text-align: center; line-height: 22px; font-size: 12px; font-weight: 700; color: #ffffff;">${num}</div>
        </td>
        <td style="padding-left: 10px;">
          <span style="font-size: 14px; font-weight: 600; color: #201530;">${title}</span>
          <br>
          <span style="font-size: 13px; color: #6b5a7e; line-height: 1.5;">${body}</span>
        </td>
      </tr>
    </table>`;
}

// ── Admin order summary template ──────────────────────────────

interface AdminEmailData {
  status: 'paid' | 'invoice-requested';
  submittedAt: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  jobTitle: string;
  company: string;
  tierName: string;
  price: string;
  priceNote: string;
  frequencyLabel: string;
  paymentMethodLabel: string;
  autoRenewal: boolean | null;
  candidateLimit: string;
  roleCount: number;
  rolesByCategory: Record<string, string[]>;
  campaignLines: string[];
  userEmails: string[];
  portalUrl: string;
  sendFeedbackReports: string;
  keyContactName: string;
  keyContactEmail: string;
  brandColour1: string;
  brandColour2: string;
  logoFileName: string;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/* All roles fully expanded — admins want the full list, not a "+N more"
   summary. Same shape as buildRolesHtml minus the SHOW_THRESHOLD trim. */
function buildAdminRolesHtml(rolesByCategory: Record<string, string[]>): string {
  let html = '';
  for (const [category, roles] of Object.entries(rolesByCategory)) {
    html += `
      <tr><td style="padding: 12px 0 4px 0;">
        <span style="font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #6b5a7e;">${escapeHtml(category)}</span>
        <span style="font-size: 11px; color: #9b8dab; margin-left: 6px;">${roles.length} role${roles.length !== 1 ? 's' : ''}</span>
      </td></tr>`;
    for (const role of roles) {
      html += `
      <tr><td style="padding: 3px 0 3px 12px; font-size: 14px; color: #201530;">
        ${escapeHtml(role)}
      </td></tr>`;
    }
  }
  return html;
}

function buildAdminOrderHtml(data: AdminEmailData): string {
  const {
    status, submittedAt,
    firstName, lastName, email, phone, jobTitle, company,
    tierName, price, priceNote, frequencyLabel, paymentMethodLabel, autoRenewal,
    candidateLimit, roleCount, rolesByCategory, campaignLines, userEmails,
    portalUrl, sendFeedbackReports, keyContactName, keyContactEmail,
    brandColour1, brandColour2, logoFileName,
  } = data;

  /* Status banner palette — neutral inline hexes consistent with the rest
     of this file. Greens for paid, ambers for invoice-requested. */
  const banner = status === 'paid'
    ? { bg: '#dcfce7', border: '#86efac', text: '#15803d', label: 'Card paid' }
    : { bg: '#fef3c7', border: '#fcd34d', text: '#92400e', label: 'Invoice requested' };

  const buyerFullName = `${firstName} ${lastName}`.trim();

  const submittedFmt = (() => {
    try {
      const d = new Date(submittedAt);
      return d.toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Europe/London' });
    } catch {
      return submittedAt;
    }
  })();

  const rolesHtml = buildAdminRolesHtml(rolesByCategory);

  const datesHtml = campaignLines.length === 0 ? '' : campaignLines
    .map((line) => `
      <tr><td style="padding: 3px 0; font-size: 14px; color: #201530;">${escapeHtml(line)}</td></tr>`)
    .join('');

  const usersHtml = userEmails.length === 0 ? '' : userEmails
    .map((u, i) => `
      <tr><td style="padding: 3px 0; font-size: 14px; color: #201530;">
        <span style="color: #9b8dab; font-size: 12px; margin-right: 6px;">${i + 1}.</span>${escapeHtml(u)}
      </td></tr>`)
    .join('');

  const colourSwatch = (hex: string) => {
    if (!hex) return '';
    return `
      <span style="display: inline-block; width: 12px; height: 12px; background-color: ${escapeHtml(hex)}; border: 1px solid #d4cdde; border-radius: 2px; vertical-align: middle; margin-right: 8px;"></span>${escapeHtml(hex)}`;
  };

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Internal order summary — ${escapeHtml(company)}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f3f0f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; -webkit-font-smoothing: antialiased;">

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f0f6;">
    <tr>
      <td align="center" style="padding: 32px 16px;">

        <table role="presentation" width="640" cellpadding="0" cellspacing="0" style="max-width: 640px; width: 100%;">

          <!-- Status banner -->
          <tr>
            <td style="background-color: ${banner.bg}; border: 1px solid ${banner.border}; border-radius: 6px 6px 0 0; padding: 16px 24px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <span style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: ${banner.text};">${banner.label}</span>
                    <br>
                    <span style="font-size: 17px; font-weight: 700; color: #201530;">${escapeHtml(company)} — ${escapeHtml(tierName)}</span>
                  </td>
                  <td align="right" style="vertical-align: top;">
                    <span style="font-size: 17px; font-weight: 700; color: #201530;">${price}</span>
                    <br>
                    <span style="font-size: 12px; color: #6b5a7e;">${escapeHtml(priceNote)}</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Customer block (most prominent) -->
          <tr>
            <td style="background-color: #ffffff; padding: 24px; border-left: 1px solid #e8e3ed; border-right: 1px solid #e8e3ed;">
              <p style="margin: 0 0 12px 0; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: #472d6a;">Customer</p>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                ${detailRow('Name', escapeHtml(buyerFullName))}
                ${detailRow('Email', `<a href="mailto:${escapeHtml(email)}" style="color: #472d6a; text-decoration: underline;">${escapeHtml(email)}</a>`)}
                ${phone ? detailRow('Phone', `<a href="tel:${escapeHtml(phone)}" style="color: #472d6a; text-decoration: underline;">${escapeHtml(phone)}</a>`) : ''}
                ${jobTitle ? detailRow('Job title', escapeHtml(jobTitle)) : ''}
                ${detailRow('Company', escapeHtml(company))}
              </table>
            </td>
          </tr>

          <!-- Order block -->
          <tr>
            <td style="background-color: #ffffff; padding: 4px 24px 24px 24px; border-left: 1px solid #e8e3ed; border-right: 1px solid #e8e3ed; border-top: 1px solid #f0ecf4;">
              <p style="margin: 16px 0 12px 0; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: #472d6a;">Order</p>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                ${detailRow('Tier', `${escapeHtml(tierName)} (${roleCount} role${roleCount !== 1 ? 's' : ''})`)}
                ${detailRow('Price', `${price} <span style="color:#6b5a7e;">${escapeHtml(priceNote)}</span>`)}
                ${detailRow('Billing', escapeHtml(frequencyLabel))}
                ${detailRow('Payment method', escapeHtml(paymentMethodLabel))}
                ${autoRenewal !== null ? detailRow('Auto-renewal', autoRenewal ? 'Yes — renews in 12 months' : 'No — expires after 12 months') : ''}
                ${detailRow('Candidate limit', escapeHtml(candidateLimit))}
                ${detailRow('Feedback reports', sendFeedbackReports === 'yes' ? 'Yes' : sendFeedbackReports === 'no' ? 'No' : 'Not specified')}
                ${portalUrl ? detailRow('Portal URL', `${escapeHtml(portalUrl)}.veroassess.com`) : ''}
              </table>
            </td>
          </tr>

          <!-- Roles -->
          <tr>
            <td style="background-color: #ffffff; padding: 4px 24px 24px 24px; border-left: 1px solid #e8e3ed; border-right: 1px solid #e8e3ed; border-top: 1px solid #f0ecf4;">
              <p style="margin: 16px 0 0 0; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: #472d6a;">Roles (${roleCount})</p>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                ${rolesHtml}
              </table>
            </td>
          </tr>

          ${campaignLines.length > 0 ? `
          <!-- Campaign dates -->
          <tr>
            <td style="background-color: #ffffff; padding: 4px 24px 24px 24px; border-left: 1px solid #e8e3ed; border-right: 1px solid #e8e3ed; border-top: 1px solid #f0ecf4;">
              <p style="margin: 16px 0 12px 0; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: #472d6a;">Campaign dates (${campaignLines.length})</p>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                ${datesHtml}
              </table>
            </td>
          </tr>` : ''}

          ${userEmails.length > 0 ? `
          <!-- Users -->
          <tr>
            <td style="background-color: #ffffff; padding: 4px 24px 24px 24px; border-left: 1px solid #e8e3ed; border-right: 1px solid #e8e3ed; border-top: 1px solid #f0ecf4;">
              <p style="margin: 16px 0 12px 0; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: #472d6a;">Users to add (${userEmails.length})</p>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                ${usersHtml}
              </table>
            </td>
          </tr>` : ''}

          ${keyContactName || keyContactEmail ? `
          <!-- Key project contact -->
          <tr>
            <td style="background-color: #ffffff; padding: 4px 24px 24px 24px; border-left: 1px solid #e8e3ed; border-right: 1px solid #e8e3ed; border-top: 1px solid #f0ecf4;">
              <p style="margin: 16px 0 12px 0; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: #472d6a;">Key project contact</p>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                ${keyContactName ? detailRow('Name', escapeHtml(keyContactName)) : ''}
                ${keyContactEmail ? detailRow('Email', `<a href="mailto:${escapeHtml(keyContactEmail)}" style="color: #472d6a; text-decoration: underline;">${escapeHtml(keyContactEmail)}</a>`) : ''}
              </table>
            </td>
          </tr>` : ''}

          ${portalUrl || brandColour1 || brandColour2 || logoFileName ? `
          <!-- Branding -->
          <tr>
            <td style="background-color: #ffffff; padding: 4px 24px 24px 24px; border-left: 1px solid #e8e3ed; border-right: 1px solid #e8e3ed; border-top: 1px solid #f0ecf4;">
              <p style="margin: 16px 0 12px 0; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: #472d6a;">Branding</p>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                ${portalUrl ? detailRow('Portal URL', `${escapeHtml(portalUrl)}.veroassess.com`) : ''}
                ${brandColour1 ? detailRow('Brand colour 1', colourSwatch(brandColour1)) : ''}
                ${brandColour2 ? detailRow('Brand colour 2', colourSwatch(brandColour2)) : ''}
                ${logoFileName ? detailRow('Logo file', escapeHtml(logoFileName)) : ''}
              </table>
            </td>
          </tr>` : ''}

          <!-- Footer / submitted timestamp -->
          <tr>
            <td style="background-color: #ffffff; padding: 16px 24px; border: 1px solid #e8e3ed; border-radius: 0 0 6px 6px; border-top: 1px solid #f0ecf4;">
              <span style="font-size: 12px; color: #6b5a7e;">Submitted ${escapeHtml(submittedFmt)}</span>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ── Contact acknowledgement template ──────────────────────────

interface ContactAckTemplateData {
  firstName: string;
  company: string;
  message: string;
}

function buildContactAcknowledgementHtml(data: ContactAckTemplateData): string {
  const { firstName, company, message } = data;

  /* Preserve line breaks the user typed. escapeHtml first, then turn the
     newlines into <br> so HTML-mail clients render the message the way
     it was written. */
  const messageHtml = escapeHtml(message).replace(/\r?\n/g, '<br>');

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Thanks for getting in touch — Vero Assess</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f3f0f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; -webkit-font-smoothing: antialiased;">

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f0f6;">
    <tr>
      <td align="center" style="padding: 40px 16px;">

        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; width: 100%;">

          <!-- Logo -->
          <tr>
            <td align="center" style="padding: 0 0 32px 0;">
              <img src="https://veroassess.com/logo.svg" alt="Vero Assess" width="160" style="display: block; height: auto;" />
            </td>
          </tr>

          <!-- Hero card -->
          <tr>
            <td style="background-color: #472d6a; border-radius: 8px 8px 0 0; padding: 40px 40px 32px 40px; text-align: center;">
              <div style="width: 56px; height: 56px; background-color: rgba(255,255,255,0.15); border-radius: 50%; margin: 0 auto 20px auto; line-height: 56px; font-size: 28px;">
                ✓
              </div>
              <h1 style="margin: 0 0 8px 0; font-size: 24px; font-weight: 700; color: #ffffff; line-height: 1.3;">
                Thanks, ${escapeHtml(firstName)}
              </h1>
              <p style="margin: 0; font-size: 15px; color: rgba(255,255,255,0.75); line-height: 1.5;">
                We've received your message and a member of the team will get back to you shortly.
              </p>
            </td>
          </tr>

          <!-- Body card -->
          <tr>
            <td style="background-color: #ffffff; padding: 32px 40px; border-left: 1px solid #e8e3ed; border-right: 1px solid #e8e3ed;">

              <p style="margin: 0 0 20px 0; font-size: 15px; color: #6b5a7e; line-height: 1.6;">
                We typically reply within one working day. In the meantime, here's a copy of what you sent us — keep it for your records.
              </p>

              ${company ? `
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 16px;">
                ${detailRow('Company', escapeHtml(company))}
              </table>
              ` : ''}

              <!-- Message echo -->
              <div style="background-color: #faf8fc; border-left: 3px solid #472d6a; padding: 16px 20px; border-radius: 2px;">
                <span style="font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; color: #9b8dab;">Your message</span>
                <p style="margin: 8px 0 0 0; font-size: 14px; color: #201530; line-height: 1.6; white-space: pre-wrap;">${messageHtml}</p>
              </div>

            </td>
          </tr>

          <!-- Support footer -->
          <tr>
            <td style="background-color: #ffffff; border-radius: 0 0 8px 8px; padding: 28px 40px; border: 1px solid #e8e3ed; border-top: 2px solid #472d6a; text-align: center;">
              <p style="margin: 0 0 4px 0; font-size: 15px; font-weight: 600; color: #201530;">Need to add something?</p>
              <p style="margin: 0 0 16px 0; font-size: 14px; color: #6b5a7e;">Just reply to this email — it goes straight to our support team.</p>
              <a href="mailto:support@veroassess.com" style="display: inline-block; padding: 10px 24px; background-color: #472d6a; color: #ffffff; text-decoration: none; border-radius: 4px; font-size: 14px; font-weight: 600;">
                Email support
              </a>
            </td>
          </tr>

          <!-- Legal footer -->
          <tr>
            <td style="padding: 24px 40px; text-align: center;">
              <p style="margin: 0; font-size: 12px; color: #9b8dab; line-height: 1.6;">
                Vero Assess Ltd · support@veroassess.com
                <br>
                You received this because you submitted the contact form on veroassess.com.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ── Date helper ───────────────────────────────────────────────

function formatDate(iso: string): string {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}
