import { NextResponse } from 'next/server';
import { validateCheckoutPayload } from '@/lib/checkout-schema';
import { sendConfirmationEmail } from '@/lib/email';
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

    // Email can stay async — Resend is fast and failure doesn't break the CRM
    sendConfirmationEmail(payload).catch((err) => {
      console.error('[Confirm] Email failed (non-blocking):', err);
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[Confirm] Error:', err);
    return NextResponse.json(
      { error: 'Failed to send confirmation' },
      { status: 500 }
    );
  }
}
