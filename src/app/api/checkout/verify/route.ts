import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const paymentIntentId = searchParams.get('payment_intent');
    const sessionId = searchParams.get('session_id');

    if (paymentIntentId) {
      const pi = await stripe.paymentIntents.retrieve(paymentIntentId);
      return NextResponse.json({
        status: pi.status === 'succeeded' ? 'complete' : pi.status,
        paymentStatus: pi.status === 'succeeded' ? 'paid' : pi.status,
        customerEmail: pi.receipt_email,
      });
    }

    if (sessionId) {
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      return NextResponse.json({
        status: session.status,
        paymentStatus: session.payment_status,
        customerEmail: session.customer_email,
      });
    }

    return NextResponse.json({ error: 'Missing payment_intent or session_id' }, { status: 400 });
  } catch (err) {
    console.error('[Verify] Error:', err);
    return NextResponse.json(
      { error: 'Failed to verify payment' },
      { status: 500 }
    );
  }
}
