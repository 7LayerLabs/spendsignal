// Stripe Checkout Session API
// Creates a checkout session for subscription purchases

import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe/server';
import { getPriceId, PlanType } from '@/lib/stripe/config';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { plan, userId, email } = body as {
      plan: PlanType;
      userId?: string;
      email?: string;
    };

    if (!plan) {
      return NextResponse.json(
        { error: 'Plan is required' },
        { status: 400 }
      );
    }

    const priceId = getPriceId(plan);
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001';

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${appUrl}/dashboard?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/#pricing`,
      customer_email: email || undefined,
      metadata: {
        userId: userId || 'anonymous',
        plan,
      },
      subscription_data: {
        metadata: {
          userId: userId || 'anonymous',
          plan,
        },
      },
      // Allow promotion codes
      allow_promotion_codes: true,
    });

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
