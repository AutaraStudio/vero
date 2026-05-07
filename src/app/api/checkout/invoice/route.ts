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

    /* Await both email sends — see /api/checkout/confirm for details.
       Serverless freezes the process on response return, killing any
       fire-and-forget fetch before it reaches Resend. */
    const [customerResult, adminResult] = await Promise.allSettled([
      sendInvoiceSubmissionEmail(payload),
      sendAdminOrderSummary(payload, 'invoice-requested'),
    ]);
    if (customerResult.status === 'rejected') {
      console.error('[Invoice] Customer email failed (non-blocking):', customerResult.reason);
    }
    if (adminResult.status === 'rejected') {
      console.error('[Invoice] Admin summary failed (non-blocking):', adminResult.reason);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[Invoice] Error submitting order:', err);
    return NextResponse.json(
      { error: 'Failed to submit order' },
      { status: 500 }
    );
  }
}
