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
  isInvoice: boolean;
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
    portalUrl, campaignLines, sendFeedbackReports, isInvoice,
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
              <img src="https://veroassess.com/logo.svg" alt="Vero Assess" width="160" style="display: block; height: auto;" />
            </td>
          </tr>

          <!-- Hero card -->
          <tr>
            <td style="background-color: #472d6a; border-radius: 8px 8px 0 0; padding: 40px 40px 32px 40px; text-align: center;">
              <div style="width: 56px; height: 56px; background-color: rgba(255,255,255,0.15); border-radius: 50%; margin: 0 auto 20px auto; line-height: 56px; font-size: 28px; color: #ffffff;">
                ${isInvoice ? '⏱' : '✓'}
              </div>
              <h1 style="margin: 0 0 8px 0; font-size: 24px; font-weight: 700; color: #ffffff; line-height: 1.3;">
                ${isInvoice ? 'Order received' : 'Order confirmed'}
              </h1>
              <p style="margin: 0; font-size: 15px; color: rgba(255,255,255,0.75); line-height: 1.5;">
                Thanks ${firstName} — ${isInvoice ? `we've received your order for the ${tierName} plan.` : `your ${tierName} plan is being set up.`}
              </p>
            </td>
          </tr>

          ${isInvoice ? `
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
          ` : ''}

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

              ${isInvoice
                ? `${stepRow('1', 'Invoice sent', 'Our team will send you an invoice within one working day.')}
                   ${stepRow('2', 'Our team will be in touch', 'A member of our team will reach out to confirm your requirements and answer any questions.')}
                   ${stepRow('3', 'Account set up', 'Once payment is received, we\'ll build your assessment portal based on the roles and settings you\'ve selected.')}
                   ${stepRow('4', 'You\'re live', 'You\'ll receive your portal link and access instructions within 2 working days of payment.')}`
                : `${stepRow('1', 'Order confirmed', 'You\'ll receive this confirmation email with your order details.')}
                   ${stepRow('2', 'Account set up', 'Our team will build your assessment portal based on the roles and settings you\'ve selected.')}
                   ${stepRow('3', 'You\'re live', 'You\'ll receive your portal link and access instructions within 2 working days.')}`
              }
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
                ${isInvoice ? 'This confirms we\'ve received your order. An invoice will follow shortly.' : 'This email confirms your order. Please keep it for your records.'}
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
    isInvoice: paymentMethod === 'invoice',
  });

  // Wrap the email-style HTML in a full document
  const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Vero Assess — Order Summary</title>
  <style>
    * { box-sizing: border-box; }
    body { margin: 0; padding: 0; background: #f3f0f6; }
  </style>
</head>
<body>${html}</body>
</html>`;

  // Render in a hidden iframe — iframes have their own rendering context
  // so the content is fully painted regardless of visibility on the main page
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.left = '0';
  iframe.style.top = '0';
  iframe.style.width = '660px';
  iframe.style.height = '900px';
  iframe.style.opacity = '0.01';       // near-invisible but still painted
  iframe.style.pointerEvents = 'none';
  iframe.style.zIndex = '-9999';
  document.body.appendChild(iframe);

  const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
  if (!iframeDoc) {
    document.body.removeChild(iframe);
    return;
  }

  iframeDoc.open();
  iframeDoc.write(fullHtml);
  iframeDoc.close();

  // Wait for iframe content to fully render (images, layout, paint)
  await new Promise<void>((resolve) => {
    iframe.onload = () => resolve();
    // Fallback in case onload already fired
    setTimeout(resolve, 1500);
  });

  // Extra paint frame
  await new Promise<void>((r) => setTimeout(r, 500));

  try {
    const html2canvas = (await import('html2canvas')).default;
    const { jsPDF } = await import('jspdf');

    // Capture the iframe body as a canvas
    const canvas = await html2canvas(iframeDoc.body, {
      scale: 2,
      useCORS: true,
      logging: false,
      width: 650,
      windowWidth: 650,
      backgroundColor: '#f3f0f6',
    });

    // Convert canvas to PDF (A4 proportions)
    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    const pdfWidth = 210; // A4 width in mm
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    const pdf = new jsPDF({
      orientation: pdfHeight > pdfWidth ? 'portrait' : 'landscape',
      unit: 'mm',
      format: 'a4',
    });

    const pageHeight = 297; // A4 height in mm
    let yOffset = 0;

    // Add image across multiple pages if needed
    while (yOffset < pdfHeight) {
      if (yOffset > 0) pdf.addPage();
      pdf.addImage(imgData, 'JPEG', 0, -yOffset, pdfWidth, pdfHeight);
      yOffset += pageHeight;
    }

    pdf.save('Vero Assess — Order Summary.pdf');
  } finally {
    document.body.removeChild(iframe);
  }
}

function formatDate(iso: string): string {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}
