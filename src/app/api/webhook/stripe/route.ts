import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const body = await request.text();
  const sig = request.headers.get('stripe-signature');

  if (!sig) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error('[Webhook] Missing STRIPE_WEBHOOK_SECRET');
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 });
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    console.error('[Webhook] Signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  // Handle events
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object;
      const metadata = session.metadata ?? {};

      console.log(`[Webhook] checkout.session.completed — ${session.id}`);
      console.log(`  Tier: ${metadata.tier}, AutoRenewal: ${metadata.autoRenewal}`);

      // If this is a subscription with auto-renewal OFF, cancel at period end
      if (
        session.subscription &&
        metadata.autoRenewal === 'false' &&
        metadata.paymentFrequency === 'annual'
      ) {
        try {
          const subId = typeof session.subscription === 'string'
            ? session.subscription
            : session.subscription.id;

          await stripe.subscriptions.update(subId, {
            cancel_at_period_end: true,
          });
          console.log(`  Set cancel_at_period_end=true for subscription ${subId}`);
        } catch (err) {
          console.error('  Failed to set cancel_at_period_end:', err);
        }
      }

      break;
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object;
      console.warn(`[Webhook] invoice.payment_failed — ${invoice.id}`);
      // Future: update HubSpot record, send notification
      break;
    }

    default:
      console.log(`[Webhook] Unhandled event: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
