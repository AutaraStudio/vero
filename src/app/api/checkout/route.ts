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

    // Determine mode: one-off for Starter, subscription for others
    const isOneOff = tier === 'starter';
    const mode = isOneOff ? 'payment' : 'subscription';

    // Build origin for redirect URLs
    const origin = request.headers.get('origin') || 'http://localhost:3000';

    // Metadata to store on the Stripe session (for webhook use)
    const metadata: Record<string, string> = {
      tier,
      paymentFrequency,
      autoRenewal: String(autoRenewal),
      contactEmail: contactDetails.email,
      contactCompany: contactDetails.company,
      roleCount: String(selectedRoles.length),
      paymentMethod: 'card',
    };

    // Build Stripe Checkout Session params
    const params: Parameters<typeof stripe.checkout.sessions.create>[0] = {
      mode,
      line_items: [{ price: priceId, quantity: 1 }],
      customer_email: contactDetails.email,
      success_url: `${origin}/get-started/confirmation?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/get-started/payment?cancelled=true`,
      metadata,
      billing_address_collection: 'required',
      currency: 'gbp',
    };

    // For subscriptions, attach metadata to the subscription too
    if (!isOneOff) {
      params.subscription_data = {
        metadata,
      };
    }

    // Create the session
    const session = await stripe.checkout.sessions.create(params);

    // Push data to HubSpot (non-blocking — don't fail checkout if HubSpot is down)
    try {
      await submitCheckoutToHubSpot(payload);
    } catch (err) {
      console.error('[Checkout] HubSpot submission failed (non-blocking):', err);
    }

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error('[Checkout] Error creating session:', err);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
