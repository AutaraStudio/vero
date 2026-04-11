import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { validateCheckoutPayload } from '@/lib/checkout-schema';
import { getStripePriceId, TIER_DATA, getTierPrice } from '@/lib/tierRecommendation';
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

    let clientSecret: string;
    let intentType: 'payment' | 'subscription';

    if (isOneOff) {
      // ── Starter: one-off Payment Intent ──
      const tierInfo = TIER_DATA[tier];
      const { price } = getTierPrice(tierInfo, paymentFrequency);
      const amount = parseInt(price.replace(/[^0-9]/g, '')) * 100; // £3,500 → 350000 pence

      const paymentIntent = await stripe.paymentIntents.create({
        amount,
        currency: 'gbp',
        metadata,
        receipt_email: contactDetails.email,
      });

      clientSecret = paymentIntent.client_secret!;
      intentType = 'payment';
    } else {
      // ── Subscription: create Customer + Subscription ──
      const customer = await stripe.customers.create({
        email: contactDetails.email,
        name: `${contactDetails.firstName} ${contactDetails.lastName}`,
        metadata: {
          company: contactDetails.company,
          tier,
        },
      });

      const subscription = await stripe.subscriptions.create({
        customer: customer.id,
        items: [{ price: priceId }],
        payment_behavior: 'default_incomplete',
        payment_settings: {
          save_default_payment_method: 'on_subscription',
        },
        metadata,
        cancel_at_period_end: paymentFrequency === 'annual' && !autoRenewal,
        expand: ['latest_invoice.payment_intent'],
      });

      // Get the payment intent from the subscription's first invoice
      const invoice = subscription.latest_invoice as Record<string, unknown> | string | null;
      if (typeof invoice === 'string' || !invoice) {
        throw new Error('Failed to expand subscription invoice');
      }
      const paymentIntent = invoice.payment_intent as Record<string, unknown> | string | null;
      if (typeof paymentIntent === 'string' || !paymentIntent) {
        throw new Error('Failed to expand payment intent');
      }

      clientSecret = paymentIntent.client_secret as string;
      intentType = 'subscription';
    }

    // Push data to HubSpot (non-blocking)
    try {
      await submitCheckoutToHubSpot(payload);
    } catch (err) {
      console.error('[Checkout] HubSpot submission failed (non-blocking):', err);
    }

    return NextResponse.json({ clientSecret, type: intentType });
  } catch (err) {
    console.error('[Checkout] Error:', err);
    return NextResponse.json(
      { error: 'Failed to create payment' },
      { status: 500 }
    );
  }
}
