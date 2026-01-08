// Plaid Connections API
// Fetches user's Plaid connections

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { prisma } from '@/lib/db/prisma';

export async function GET() {
  try {
    // Get authenticated user
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Fetch user's connections
    const connections = await prisma.plaidConnection.findMany({
      where: {
        userId: session.user.id,
      },
      select: {
        id: true,
        institutionId: true,
        institutionName: true,
        accounts: true,
        lastSyncedAt: true,
        syncStatus: true,
        isActive: true,
        errorCode: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ connections });
  } catch (error) {
    console.error('Fetch connections error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch connections' },
      { status: 500 }
    );
  }
}
