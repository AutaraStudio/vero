import { NextResponse } from 'next/server';
import { validateCheckoutPayload } from '@/lib/checkout-schema';
import { submitCheckoutToHubSpot } from '@/lib/hubspot';
import { sendConfirmationEmail } from '@/lib/email';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = validateCheckoutPayload(body);

    if (!result.valid) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    const { payload } = result;

    // Push to HubSpot
    await submitCheckoutToHubSpot(payload);

    // Send confirmation email (fire-and-forget)
    sendConfirmationEmail(payload).catch((err) => {
      console.error('[Invoice] Email failed (non-blocking):', err);
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[Invoice] Error submitting order:', err);
    return NextResponse.json(
      { error: 'Failed to submit order' },
      { status: 500 }
    );
  }
}
