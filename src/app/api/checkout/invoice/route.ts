import { NextResponse } from 'next/server';
import { validateCheckoutPayload } from '@/lib/checkout-schema';
import { submitCheckoutToHubSpot } from '@/lib/hubspot';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = validateCheckoutPayload(body);

    if (!result.valid) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    const { payload } = result;

    // Push to HubSpot via Forms API
    await submitCheckoutToHubSpot(payload);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[Invoice] Error submitting order:', err);
    return NextResponse.json(
      { error: 'Failed to submit order' },
      { status: 500 }
    );
  }
}
