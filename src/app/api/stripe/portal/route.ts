// Stripe Customer Portal API
// Redirects users to manage their subscription

import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customerId } = body as { customerId: string };

    if (!customerId) {
      return NextResponse.json(
        { error: 'Customer ID is required' },
        { status: 400 }
      );
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001';

    // Create portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${appUrl}/dashboard/settings/billing`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Portal error:', error);
    return NextResponse.json(
      { error: 'Failed to create portal session' },
      { status: 500 }
    );
  }
}
