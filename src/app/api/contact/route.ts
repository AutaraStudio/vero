import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { sendContactAcknowledgement } from '@/lib/email';

interface ContactPayload {
  name: string;
  email: string;
  company?: string;
  message: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/* Server-side validation mirrors the client. Always re-validate server-side. */
function validate(payload: unknown): { ok: true; data: ContactPayload } | { ok: false; error: string } {
  if (!payload || typeof payload !== 'object') return { ok: false, error: 'Invalid payload' };
  const p = payload as Record<string, unknown>;

  const name    = typeof p.name === 'string' ? p.name.trim() : '';
  const email   = typeof p.email === 'string' ? p.email.trim() : '';
  const company = typeof p.company === 'string' ? p.company.trim() : '';
  const message = typeof p.message === 'string' ? p.message.trim() : '';

  if (!name)               return { ok: false, error: 'Name is required' };
  if (!email)              return { ok: false, error: 'Email is required' };
  if (!EMAIL_RE.test(email)) return { ok: false, error: 'Invalid email' };
  if (!message)            return { ok: false, error: 'Message is required' };
  if (message.length < 10) return { ok: false, error: 'Message is too short' };

  return { ok: true, data: { name, email, company, message } };
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

  const { name, email, company, message } = validation.data;
  const apiKey = process.env.RESEND_API_KEY;
  const from   = process.env.CONTACT_FROM_EMAIL ?? 'Vero Assess <hello@veroassess.com>';
  const to     = process.env.CONTACT_TO_EMAIL   ?? 'support@veroassess.com';

  /* Build a clean plain-text + HTML email body. */
  const subject = `New contact enquiry — ${name}`;
  const text = [
    `New enquiry from the Vero Assess contact form.`,
    ``,
    `Name:    ${name}`,
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
        <tr><td style="color:#5a4f6e">Name</td><td><strong>${escapeHtml(name)}</strong></td></tr>
        <tr><td style="color:#5a4f6e">Email</td><td><a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></td></tr>
        <tr><td style="color:#5a4f6e">Company</td><td>${escapeHtml(company || '—')}</td></tr>
      </table>
      <h3 style="margin:1.5rem 0 0.5rem 0">Message</h3>
      <p style="white-space:pre-wrap;margin:0">${escapeHtml(message)}</p>
    </div>
  `;

  /* Dev / no-key fallback: log it server-side and pretend success. Means the
     form works locally without a Resend setup. */
  if (!apiKey) {
    console.log('[contact-form] RESEND_API_KEY missing — message NOT sent. Logged here:');
    console.log({ to, from, subject, text });
    return NextResponse.json({ ok: true, devOnly: true });
  }

  try {
    const resend = new Resend(apiKey);

    /* Send the team-facing email and the customer acknowledgement in
       parallel. allSettled means a Resend hiccup on the acknowledgement
       can't drop the team's lead — getting the enquiry to the team is
       what the form is for; the acknowledgement is a bonus on top. */
    const [teamResult, ackResult] = await Promise.allSettled([
      resend.emails.send({
        from,
        to: [to],
        replyTo: email,
        subject,
        text,
        html,
      }),
      sendContactAcknowledgement({ name, email, company, message }),
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
