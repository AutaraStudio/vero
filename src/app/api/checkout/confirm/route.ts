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

    // Fire-and-forget — don't block the response
    submitCheckoutToHubSpot(payload).catch((err) => {
      console.error('[Confirm] HubSpot failed (non-blocking):', err);
    });
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
