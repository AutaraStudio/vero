import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { validateCheckoutPayload } from '@/lib/checkout-schema';
import { getStripePriceId, TIER_DATA, getTierPrice } from '@/lib/tierRecommendation';
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = validateCheckoutPayload(body);

    if (!result.valid) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    const { payload } = result;
    const { tier, paymentFrequency, autoRenewal, contactDetails, selectedRoles } = payload;

    const priceId = getStripePriceId(tier, paymentFrequency);
    if (!priceId) {
      return NextResponse.json({ error: 'No price configured for this tier' }, { status: 400 });
    }

    const isOneOff = tier === 'starter';

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
    let customerId: string | undefined;
    let subscriptionId: string | undefined;
    let paymentIntentId: string | undefined;

    if (isOneOff) {
      // ── Starter: single PaymentIntent call ──
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
      paymentIntentId = paymentIntent.id;
    } else {
      // ── Subscription: Customer + Subscription (2 calls) + raw invoice fetch ──
      const customer = await stripe.customers.create({
        email: contactDetails.email,
        name: `${contactDetails.firstName} ${contactDetails.lastName}`,
        metadata: { company: contactDetails.company, tier },
      });

      const subscription = await stripe.subscriptions.create({
        customer: customer.id,
        items: [{ price: priceId }],
        payment_behavior: 'default_incomplete',
        payment_settings: { save_default_payment_method: 'on_subscription' },
        metadata,
        cancel_at_period_end: paymentFrequency === 'annual' && !autoRenewal,
      });

      const invoiceId = typeof subscription.latest_invoice === 'string'
        ? subscription.latest_invoice
        : subscription.latest_invoice?.id;

      if (!invoiceId) throw new Error('No invoice created for subscription');

      // Fetch invoice + payment intent client_secret in one raw API call
      const piRes = await fetch(
        `https://api.stripe.com/v1/invoices/${invoiceId}?expand[]=payment_intent`,
        { headers: { Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}` } }
      );
      const invoiceData = await piRes.json();
      const piClientSecret = invoiceData.payment_intent?.client_secret;

      if (!piClientSecret) {
        throw new Error('Payment setup failed — please try again');
      }

      clientSecret = piClientSecret;
      intentType = 'subscription';
      customerId = customer.id;
      subscriptionId = subscription.id;
      paymentIntentId = invoiceData.payment_intent?.id;
    }

    // NOTE: HubSpot + confirmation email are NOT sent here — they're triggered
    // by /api/checkout/confirm after successful payment on the client.

    return NextResponse.json({
      clientSecret,
      type: intentType,
      customerId,
      subscriptionId,
      paymentIntentId,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[Checkout] Error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
