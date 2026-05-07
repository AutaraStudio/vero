import { NextResponse } from 'next/server';
import { validateCheckoutPayload } from '@/lib/checkout-schema';
import { submitCheckoutToHubSpot } from '@/lib/hubspot';
import { sendInvoiceSubmissionEmail, sendAdminOrderSummary } from '@/lib/email';

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

    // Send invoice submission email (fire-and-forget)
    sendInvoiceSubmissionEmail(payload).catch((err) => {
      console.error('[Invoice] Email failed (non-blocking):', err);
    });

    // Internal admin summary — separate template, fire-and-forget.
    sendAdminOrderSummary(payload, 'invoice-requested').catch((err) => {
      console.error('[Invoice] Admin summary failed (non-blocking):', err);
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
