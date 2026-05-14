import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { sendContactAcknowledgement } from '@/lib/email';
import { isValidEmail } from '@/lib/emailValidation';

/* HubSpot Forms v3 submission — public endpoint, region-agnostic.
   Every contact-form submission is mirrored to HubSpot so the sales
   team can work the lead in the CRM. The IDs are not secrets — the
   same values sit in the public embed snippet HubSpot generates. */
const HUBSPOT_PORTAL_ID = '25935419';
const HUBSPOT_FORM_ID   = 'e0e03d8b-ada8-4940-9f54-172bd160ba63';
const HUBSPOT_FORM_URL  =
  `https://api.hsforms.com/submissions/v3/integration/submit/${HUBSPOT_PORTAL_ID}/${HUBSPOT_FORM_ID}`;

interface HubSpotPayload {
  firstName: string;
  lastName: string;
  email: string;
  company: string;
  pageUri: string;
  ipAddress: string | null;
}

async function submitToHubSpot(p: HubSpotPayload): Promise<void> {
  const body = {
    fields: [
      { name: 'firstname', value: p.firstName },
      { name: 'lastname',  value: p.lastName },
      { name: 'email',     value: p.email },
      { name: 'company',   value: p.company },
    ],
    /* Spam-flag avoidance comes from adding Vero domains to HubSpot's
       tracked-domain allowlist (Settings → Tracking Code) — not from
       the hubspotutk cookie. The tracking script isn't installed here,
       so there's no cookie to forward. */
    context: {
      pageUri: p.pageUri,
      pageName: 'Contact form',
      ...(p.ipAddress ? { ipAddress: p.ipAddress } : {}),
    },
    /* Required for any HubSpot form configured with GDPR consent. The
       text mirrors what users see beneath the form ("By submitting…").
       We're not opting them into a marketing subscription — that needs
       a subscriptionTypeId we don't yet have from the client. */
    legalConsentOptions: {
      consent: {
        consentToProcess: true,
        text: 'By submitting this form, I agree to allow Vero Assess (Tazio) to store and process my personal data to respond to my enquiry.',
      },
    },
  };

  const res = await fetch(HUBSPOT_FORM_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errBody = await res.text().catch(() => '');
    throw new Error(`HubSpot ${res.status}: ${errBody.slice(0, 300)}`);
  }
}

interface ContactPayload {
  firstName: string;
  lastName: string;
  email: string;
  company?: string;
  message: string;
}

/* Server-side validation mirrors the client. Always re-validate server-side. */
function validate(payload: unknown): { ok: true; data: ContactPayload } | { ok: false; error: string } {
  if (!payload || typeof payload !== 'object') return { ok: false, error: 'Invalid payload' };
  const p = payload as Record<string, unknown>;

  const firstName = typeof p.firstName === 'string' ? p.firstName.trim() : '';
  const lastName  = typeof p.lastName  === 'string' ? p.lastName.trim()  : '';
  const email     = typeof p.email     === 'string' ? p.email.trim()     : '';
  const company   = typeof p.company   === 'string' ? p.company.trim()   : '';
  const message   = typeof p.message   === 'string' ? p.message.trim()   : '';

  if (!firstName)            return { ok: false, error: 'First name is required' };
  if (!lastName)             return { ok: false, error: 'Surname is required' };
  if (!email)                return { ok: false, error: 'Email is required' };
  if (!isValidEmail(email))  return { ok: false, error: 'Invalid email' };
  if (!message)              return { ok: false, error: 'Message is required' };
  if (message.length < 10)   return { ok: false, error: 'Message is too short' };

  return { ok: true, data: { firstName, lastName, email, company, message } };
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const validation = validate(body);
  if (!validation.ok) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  const { firstName, lastName, email, company, message } = validation.data;
  const fullName = `${firstName} ${lastName}`.trim();
  /* Best-effort tracking context for HubSpot. Referer (where the form
     was submitted from) lets HubSpot show the originating page on the
     contact record. */
  const pageUri = request.headers.get('referer') ?? 'https://veroassess.com/contact';
  const ipAddress = request.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? null;
  const apiKey = process.env.RESEND_API_KEY;
  const from   = process.env.CONTACT_FROM_EMAIL ?? 'Vero Assess <orders@veroassess.com>';
  /* Single recipient. Hardcoded so a stale CONTACT_TO_EMAIL on the
     Netlify side can't accidentally route leads elsewhere. */
  const to = 'sales@veroassess.com';

  /* Build a clean plain-text + HTML email body. */
  const subject = `New contact enquiry — ${fullName}`;
  const text = [
    `New enquiry from the Vero Assess contact form.`,
    ``,
    `Name:    ${fullName}`,
    `Email:   ${email}`,
    `Company: ${company || '—'}`,
    ``,
    `Message:`,
    message,
  ].join('\n');

  const html = `
    <div style="font-family:system-ui,-apple-system,sans-serif;line-height:1.5;color:#1a0f2b">
      <h2 style="margin:0 0 1rem 0">New contact enquiry</h2>
      <p style="margin:0 0 1rem 0;color:#5a4f6e">From the Vero Assess contact form</p>
      <table cellpadding="6" style="border-collapse:collapse;margin:1rem 0">
        <tr><td style="color:#5a4f6e">Name</td><td><strong>${escapeHtml(fullName)}</strong></td></tr>
        <tr><td style="color:#5a4f6e">Email</td><td><a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></td></tr>
        <tr><td style="color:#5a4f6e">Company</td><td>${escapeHtml(company || '—')}</td></tr>
      </table>
      <h3 style="margin:1.5rem 0 0.5rem 0">Message</h3>
      <p style="white-space:pre-wrap;margin:0">${escapeHtml(message)}</p>
    </div>
  `;

  try {
    /* The HubSpot Forms public endpoint doesn't need an API key, so it
       fires regardless of whether Resend is configured — keeps the
       lead capture path working locally / in preview where the dev
       might not have RESEND_API_KEY set. */
    const hubspotPromise = submitToHubSpot({
      firstName,
      lastName,
      email,
      company: company ?? '',
      pageUri,
      ipAddress,
    });

    /* Dev / no-key fallback: skip the email sends, still hit HubSpot. */
    if (!apiKey) {
      console.log('[contact-form] RESEND_API_KEY missing — emails skipped. HubSpot submission still firing.');
      console.log({ to, from, subject, text });
      const hsResult = await hubspotPromise.then(
        () => ({ ok: true as const }),
        (err: unknown) => ({ ok: false as const, err }),
      );
      if (!hsResult.ok) {
        console.error('[contact-form] HubSpot submission failed (non-blocking):', hsResult.err);
      }
      return NextResponse.json({ ok: true, devOnly: true });
    }

    const resend = new Resend(apiKey);

    /* Send the team-facing email, the customer acknowledgement, and the
       HubSpot CRM submission in parallel. allSettled so a hiccup on any
       one path can't suppress the others — getting the enquiry to the
       team is what the form is for; HubSpot + the acknowledgement are
       bonuses on top. */
    const [teamResult, ackResult, hubspotResult] = await Promise.allSettled([
      resend.emails.send({
        from,
        to: [to],
        replyTo: email,
        subject,
        text,
        html,
      }),
      sendContactAcknowledgement({ name: fullName, email, company, message }),
      hubspotPromise,
    ]);

    if (teamResult.status === 'rejected') {
      console.error('[contact-form] Team email failed:', teamResult.reason);
      return NextResponse.json({ error: 'Could not send your message' }, { status: 500 });
    }
    if (teamResult.value.error) {
      console.error('[contact-form] Resend error:', teamResult.value.error);
      return NextResponse.json({ error: 'Could not send your message' }, { status: 500 });
    }

    if (ackResult.status === 'rejected') {
      /* Don't fail the request — the team got the lead, the customer
         just didn't get the bonus acknowledgement. Log so we can spot
         it in the function logs. */
      console.error('[contact-form] Acknowledgement email failed (non-blocking):', ackResult.reason);
    }

    if (hubspotResult.status === 'rejected') {
      /* Same rationale — HubSpot is a CRM mirror; the email already
         landed with the team. Log loudly so we can investigate. */
      console.error('[contact-form] HubSpot submission failed (non-blocking):', hubspotResult.reason);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[contact-form] Unexpected error:', err);
    return NextResponse.json({ error: 'Could not send your message' }, { status: 500 });
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
