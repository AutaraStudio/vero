import { NextResponse } from 'next/server';
import { validateBespokePayload } from '@/lib/checkout-schema';
import { submitBespokeToHubSpot } from '@/lib/hubspot';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = validateBespokePayload(body);

    if (!result.valid) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    const { payload } = result;

    // Push to HubSpot via Forms API
    await submitBespokeToHubSpot(payload);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[Bespoke] Error submitting enquiry:', err);
    return NextResponse.json(
      { error: 'Failed to submit enquiry' },
      { status: 500 }
    );
  }
}
