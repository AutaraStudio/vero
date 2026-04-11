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
      const amount = parseInt(price.replace(/[^0-9]/g, '')) * 100;

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

      // Extract client_secret from the expanded payment intent
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const latestInvoice = subscription.latest_invoice as any;
      const paymentIntent = latestInvoice?.payment_intent;

      if (!paymentIntent?.client_secret) {
        console.error('[Checkout] Subscription created but no client_secret found', {
          subscriptionId: subscription.id,
          invoiceType: typeof subscription.latest_invoice,
          hasPaymentIntent: !!paymentIntent,
        });
        throw new Error('Payment setup failed — please try again');
      }

      clientSecret = paymentIntent.client_secret;
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
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[Checkout] Error:', message);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
