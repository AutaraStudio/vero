'use client';

import type { TierInfo } from './tierRecommendation';

// ── Types ────────────────────────────────────────────────────

interface SummaryData {
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

// ── Build summary HTML (mirrors the email template exactly) ──

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

function buildSummaryHtml(data: SummaryData): string {
  const {
    firstName, company, tierName, price, priceNote,
    frequencyLabel, paymentMethodLabel, autoRenewal,
    roleCount, rolesByCategory, candidateLimit,
    keyContactName, keyContactEmail, userEmails,
    portalUrl, campaignLines, sendFeedbackReports,
  } = data;

  // Build roles HTML
  let rolesHtml = '';
  for (const [category, roles] of Object.entries(rolesByCategory)) {
    rolesHtml += `
      <tr><td style="padding: 12px 0 4px 0;">
        <span style="font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #6b5a7e;">${category}</span>
        <span style="font-size: 11px; color: #9b8dab; margin-left: 6px;">${roles.length} role${roles.length !== 1 ? 's' : ''}</span>
      </td></tr>`;
    for (const role of roles) {
      rolesHtml += `
      <tr><td style="padding: 3px 0 3px 12px; font-size: 14px; color: #201530;">
        ${role}
      </td></tr>`;
    }
  }

  // Build user emails HTML
  let usersHtml = '';
  if (userEmails.length > 0) {
    for (let i = 0; i < userEmails.length; i++) {
      usersHtml += `
      <tr><td style="padding: 3px 0; font-size: 14px; color: #201530;">
        <span style="color: #9b8dab; font-size: 12px; margin-right: 6px;">${i + 1}.</span>${userEmails[i]}
      </td></tr>`;
    }
  }

  // Build campaign dates HTML
  let datesHtml = '';
  for (const line of campaignLines) {
    datesHtml += `
      <tr><td style="padding: 3px 0; font-size: 14px; color: #201530;">
        ${line}
      </td></tr>`;
  }

  return `
<div style="margin: 0; padding: 0; background-color: #f3f0f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; -webkit-font-smoothing: antialiased;">

  <!-- Wrapper -->
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f0f6;">
    <tr>
      <td align="center" style="padding: 40px 16px;">

        <!-- Container -->
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; width: 100%;">

          <!-- Logo -->
          <tr>
            <td align="center" style="padding: 0 0 32px 0;">
              <img src="https://vero-assess.netlify.app/logo.svg" alt="Vero Assess" width="160" style="display: block; height: auto;" />
            </td>
          </tr>

          <!-- Hero card -->
          <tr>
            <td style="background-color: #472d6a; border-radius: 8px 8px 0 0; padding: 40px 40px 32px 40px; text-align: center;">
              <div style="width: 56px; height: 56px; background-color: rgba(255,255,255,0.15); border-radius: 50%; margin: 0 auto 20px auto; line-height: 56px; font-size: 28px; color: #ffffff;">
                ✓
              </div>
              <h1 style="margin: 0 0 8px 0; font-size: 24px; font-weight: 700; color: #ffffff; line-height: 1.3;">
                Order summary
              </h1>
              <p style="margin: 0; font-size: 15px; color: rgba(255,255,255,0.75); line-height: 1.5;">
                ${firstName} — ${tierName} plan
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

              ${stepRow('1', 'Order confirmed', 'You\'ll receive a confirmation email with your order details.')}
              ${stepRow('2', 'Account set up', 'Our team will build your assessment portal based on the roles and settings you\'ve selected.')}
              ${stepRow('3', 'You\'re live', 'You\'ll receive your portal link and access instructions within 2 working days.')}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #ffffff; border-radius: 0 0 8px 8px; padding: 28px 40px; border: 1px solid #e8e3ed; border-top: 2px solid #472d6a; text-align: center;">
              <p style="margin: 0 0 4px 0; font-size: 15px; font-weight: 600; color: #201530;">Questions?</p>
              <p style="margin: 0 0 8px 0; font-size: 14px; color: #6b5a7e;">support@veroassess.com</p>
            </td>
          </tr>

          <!-- Legal footer -->
          <tr>
            <td style="padding: 24px 40px; text-align: center;">
              <p style="margin: 0; font-size: 12px; color: #9b8dab; line-height: 1.6;">
                Vero Assess Ltd · support@veroassess.com
                <br>
                Generated on ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</div>`;
}

// ── Generate and download PDF ────────────────────────────────

export async function downloadSummaryPdf(opts: {
  contactDetails: {
    firstName: string;
    lastName: string;
    email: string;
    company: string;
    keyContactName: string;
    keyContactEmail: string;
    keyContactSameAsMe: boolean;
    usersToAdd: string;
    bespokeUrl: string;
    sendFeedbackReports: string;
    roleDates: Record<string, { openDate: string; closeDate: string }>;
  };
  selectedRoles: { roleId: string; roleName: string; categoryName: string }[];
  tierInfo: TierInfo;
  price: string;
  priceNote: string;
  paymentFrequency: string;
  autoRenewal: boolean;
  paymentMethod: string;
}): Promise<void> {
  const {
    contactDetails, selectedRoles, tierInfo, price, priceNote,
    paymentFrequency, autoRenewal, paymentMethod,
  } = opts;

  // Group roles by category
  const rolesByCategory: Record<string, string[]> = {};
  for (const role of selectedRoles) {
    if (!rolesByCategory[role.categoryName]) {
      rolesByCategory[role.categoryName] = [];
    }
    rolesByCategory[role.categoryName].push(role.roleName);
  }

  // Build campaign date lines
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
  const isStarter = tierInfo.key === 'starter';
  const frequencyLabel = isStarter ? 'One-off payment' : paymentFrequency === 'annual' ? 'Annual' : 'Monthly';

  const html = buildSummaryHtml({
    firstName: contactDetails.firstName,
    lastName: contactDetails.lastName,
    email: contactDetails.email,
    company: contactDetails.company,
    tierName: tierInfo.name,
    price,
    priceNote,
    frequencyLabel,
    paymentMethodLabel: paymentMethod === 'card' ? 'Card payment' : 'Invoice',
    autoRenewal: !isStarter && paymentFrequency === 'annual' ? autoRenewal : null,
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

  // Render into a visible container — html2canvas requires fully visible elements.
  // We scroll the user to the top and place the container off-screen below
  // the fold so it's in the DOM and painted but not seen by the user.
  const container = document.createElement('div');
  container.style.position = 'absolute';
  container.style.left = '0';
  container.style.top = `${document.body.scrollHeight + 100}px`;
  container.style.width = '650px';
  container.style.background = '#f3f0f6';
  container.innerHTML = html;
  document.body.appendChild(container);

  // Wait for browser to lay out and paint the content
  await new Promise<void>((resolve) => {
    setTimeout(resolve, 300);
  });

  try {
    const html2pdf = (await import('html2pdf.js')).default;

    await html2pdf()
      .set({
        margin: [10, 0, 10, 0],
        filename: `Vero Assess — Order Summary.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          logging: false,
          scrollY: 0,
          windowHeight: container.scrollHeight,
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
      })
      .from(container)
      .save();
  } finally {
    document.body.removeChild(container);
  }
}

function formatDate(iso: string): string {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}
