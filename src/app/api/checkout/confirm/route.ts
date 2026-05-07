import { NextResponse } from 'next/server';
import { validateCheckoutPayload } from '@/lib/checkout-schema';
import { sendConfirmationEmail, sendAdminOrderSummary } from '@/lib/email';
import { submitCheckoutToHubSpot } from '@/lib/hubspot';

/**
 * POST /api/checkout/confirm
 * Called by the client AFTER Stripe payment succeeds.
 * Sends the order confirmation email and pushes to HubSpot.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = validateCheckoutPayload(body);

    if (!result.valid) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    const { payload } = result;

    // Await HubSpot — serverless will terminate fire-and-forget chains early,
    // cutting contact creation / logo upload off mid-flight. We accept the
    // 1–3s latency; the user is already on the confirmation page waiting.
    try {
      await submitCheckoutToHubSpot(payload);
    } catch (err) {
      console.error('[Confirm] HubSpot failed (non-blocking):', err);
    }

    /* Await both email sends — Netlify (and Vercel) freeze the function
       process the moment the response is returned, which kills any
       in-flight fetch from a fire-and-forget .catch() before Resend can
       accept it. Use allSettled so a Resend hiccup on one mail can't
       suppress the other, and so neither failure blocks the success
       response to the user. */
    const [customerResult, adminResult] = await Promise.allSettled([
      sendConfirmationEmail(payload),
      sendAdminOrderSummary(payload, 'paid'),
    ]);
    if (customerResult.status === 'rejected') {
      console.error('[Confirm] Customer email failed (non-blocking):', customerResult.reason);
    }
    if (adminResult.status === 'rejected') {
      console.error('[Confirm] Admin summary failed (non-blocking):', adminResult.reason);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[Confirm] Error:', err);
    return NextResponse.json(
      { error: 'Failed to send confirmation' },
      { status: 500 }
    );
  }
}
