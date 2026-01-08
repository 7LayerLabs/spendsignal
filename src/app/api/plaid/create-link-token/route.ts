// Plaid Link Token API
// Creates a link token to initialize Plaid Link

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { plaidClient, PLAID_PRODUCTS, PLAID_COUNTRY_CODES, isPlaidConfigured } from '@/lib/plaid/client';

export async function POST() {
  try {
    // Check if Plaid is configured
    if (!isPlaidConfigured()) {
      return NextResponse.json(
        { error: 'Plaid is not configured' },
        { status: 503 }
      );
    }

    // Get authenticated user
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    // Create link token
    const response = await plaidClient.linkTokenCreate({
      user: {
        client_user_id: session.user.id,
      },
      client_name: 'SpendSignal',
      products: PLAID_PRODUCTS,
      country_codes: PLAID_COUNTRY_CODES,
      language: 'en',
      redirect_uri: process.env.PLAID_REDIRECT_URI || `${appUrl}/dashboard/settings/connections`,
    });

    return NextResponse.json({
      linkToken: response.data.link_token,
      expiration: response.data.expiration,
    });
  } catch (error) {
    console.error('Create link token error:', error);
    return NextResponse.json(
      { error: 'Failed to create link token' },
      { status: 500 }
    );
  }
}
