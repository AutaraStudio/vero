import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { validateCheckoutPayload } from '@/lib/checkout-schema';
import { getStripePriceId } from '@/lib/tierRecommendation';
import { submitCheckoutToHubSpot } from '@/lib/hubspot';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = validateCheckoutPayload(body);

    if (!result.valid) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    const { payload } = result;
    const { tier, paymentFrequency, autoRenewal, contactDetails, selectedRoles } = payload;

    // Get the correct Stripe price
    const priceId = getStripePriceId(tier, paymentFrequency);
    if (!priceId) {
      return NextResponse.json({ error: 'No price configured for this tier' }, { status: 400 });
    }

    const isOneOff = tier === 'starter';
    const mode = isOneOff ? 'payment' : 'subscription';

    const origin = request.headers.get('origin') || 'http://localhost:3000';

    // Metadata for Stripe records
    const metadata: Record<string, string> = {
      tier,
      paymentFrequency,
      autoRenewal: String(autoRenewal),
      contactEmail: contactDetails.email,
      contactCompany: contactDetails.company,
      roleCount: String(selectedRoles.length),
      paymentMethod: 'card',
    };

    // Create embedded Checkout Session
    const sessionParams: Parameters<typeof stripe.checkout.sessions.create>[0] = {
      mode,
      ui_mode: 'embedded_page',
      line_items: [{ price: priceId, quantity: 1 }],
      customer_email: contactDetails.email,
      return_url: `${origin}/get-started/confirmation?session_id={CHECKOUT_SESSION_ID}`,
      metadata,
    };

    // For subscriptions, set cancel_at_period_end if auto-renewal is off
    if (!isOneOff) {
      sessionParams.subscription_data = {
        metadata,
        ...(paymentFrequency === 'annual' && !autoRenewal
          ? {} // We'll set cancel_at_period_end in the webhook after subscription is created
          : {}),
      };
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    // Push data to HubSpot (non-blocking)
    try {
      await submitCheckoutToHubSpot(payload);
    } catch (err) {
      console.error('[Checkout] HubSpot submission failed (non-blocking):', err);
    }

    return NextResponse.json({ clientSecret: session.client_secret });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[Checkout] Error:', message, err);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
