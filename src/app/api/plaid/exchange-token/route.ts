// Plaid Exchange Token API
// Exchanges public token for access token and stores connection

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { prisma } from '@/lib/db/prisma';
import { plaidClient, isPlaidConfigured } from '@/lib/plaid/client';

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { publicToken, institutionId, institutionName, accounts } = body as {
      publicToken: string;
      institutionId?: string;
      institutionName?: string;
      accounts?: Array<{
        id: string;
        name: string;
        mask: string;
        type: string;
        subtype: string;
      }>;
    };

    if (!publicToken) {
      return NextResponse.json(
        { error: 'Public token is required' },
        { status: 400 }
      );
    }

    // Exchange public token for access token
    const exchangeResponse = await plaidClient.itemPublicTokenExchange({
      public_token: publicToken,
    });

    const accessToken = exchangeResponse.data.access_token;
    const itemId = exchangeResponse.data.item_id;

    // Check if this item already exists for this user
    const existingConnection = await prisma.plaidConnection.findUnique({
      where: { itemId },
    });

    if (existingConnection) {
      // Update existing connection
      await prisma.plaidConnection.update({
        where: { itemId },
        data: {
          accessToken,
          institutionId,
          institutionName,
          accounts: accounts ? JSON.parse(JSON.stringify(accounts)) : null,
          isActive: true,
          errorCode: null,
          syncStatus: 'pending',
        },
      });

      return NextResponse.json({
        success: true,
        connectionId: existingConnection.id,
        message: 'Connection updated',
      });
    }

    // Create new connection
    const connection = await prisma.plaidConnection.create({
      data: {
        userId: session.user.id,
        accessToken,
        itemId,
        institutionId,
        institutionName,
        accounts: accounts ? JSON.parse(JSON.stringify(accounts)) : null,
        syncStatus: 'pending',
      },
    });

    // Update user to not be in demo mode
    await prisma.user.update({
      where: { id: session.user.id },
      data: { isDemoMode: false },
    });

    return NextResponse.json({
      success: true,
      connectionId: connection.id,
      message: 'Bank connected successfully',
    });
  } catch (error) {
    console.error('Exchange token error:', error);
    return NextResponse.json(
      { error: 'Failed to connect bank' },
      { status: 500 }
    );
  }
}
