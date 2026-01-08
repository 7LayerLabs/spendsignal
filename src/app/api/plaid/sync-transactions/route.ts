// Plaid Sync Transactions API
// Syncs transactions from Plaid using the Sync endpoint

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { prisma } from '@/lib/db/prisma';
import { plaidClient, isPlaidConfigured } from '@/lib/plaid/client';
import { RemovedTransaction, Transaction as PlaidTransaction } from 'plaid';

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
    const { connectionId } = body as { connectionId?: string };

    // Get connection(s) to sync
    const whereClause = connectionId
      ? { id: connectionId, userId: session.user.id, isActive: true }
      : { userId: session.user.id, isActive: true };

    const connections = await prisma.plaidConnection.findMany({
      where: whereClause,
    });

    if (connections.length === 0) {
      return NextResponse.json(
        { error: 'No active connections found' },
        { status: 404 }
      );
    }

    let totalAdded = 0;
    let totalModified = 0;
    let totalRemoved = 0;

    for (const connection of connections) {
      try {
        let cursor = connection.cursor || undefined;
        let hasMore = true;

        // Update sync status
        await prisma.plaidConnection.update({
          where: { id: connection.id },
          data: { syncStatus: 'syncing' },
        });

        while (hasMore) {
          const response = await plaidClient.transactionsSync({
            access_token: connection.accessToken,
            cursor,
            count: 500,
          });

          const { added, modified, removed, next_cursor, has_more } = response.data;

          // Process added transactions
          if (added.length > 0) {
            await processTransactions(added, session.user.id, connection.id);
            totalAdded += added.length;
          }

          // Process modified transactions
          if (modified.length > 0) {
            await processTransactions(modified, session.user.id, connection.id);
            totalModified += modified.length;
          }

          // Process removed transactions
          if (removed.length > 0) {
            await removeTransactions(removed, session.user.id);
            totalRemoved += removed.length;
          }

          cursor = next_cursor;
          hasMore = has_more;
        }

        // Update connection with new cursor and last synced time
        await prisma.plaidConnection.update({
          where: { id: connection.id },
          data: {
            cursor,
            lastSyncedAt: new Date(),
            syncStatus: 'synced',
            errorCode: null,
          },
        });
      } catch (error) {
        console.error(`Error syncing connection ${connection.id}:`, error);

        // Update connection with error status
        await prisma.plaidConnection.update({
          where: { id: connection.id },
          data: {
            syncStatus: 'error',
            errorCode: error instanceof Error ? error.message : 'Unknown error',
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      added: totalAdded,
      modified: totalModified,
      removed: totalRemoved,
    });
  } catch (error) {
    console.error('Sync transactions error:', error);
    return NextResponse.json(
      { error: 'Failed to sync transactions' },
      { status: 500 }
    );
  }
}

async function processTransactions(
  transactions: PlaidTransaction[],
  userId: string,
  connectionId: string
) {
  for (const txn of transactions) {
    // Skip pending transactions for now (can be enabled if needed)
    if (txn.pending) continue;

    await prisma.transaction.upsert({
      where: {
        externalId_userId: {
          externalId: txn.transaction_id,
          userId,
        },
      },
      create: {
        userId,
        plaidConnectionId: connectionId,
        externalId: txn.transaction_id,
        amount: Math.abs(txn.amount), // Plaid uses negative for debits
        description: txn.name,
        merchantName: txn.merchant_name || txn.name,
        date: new Date(txn.date),
        source: 'PLAID',
        defaultCategory: txn.personal_finance_category?.primary || txn.category?.[0] || null,
        pending: txn.pending,
        isRecurring: txn.personal_finance_category?.detailed?.includes('SUBSCRIPTION') || false,
      },
      update: {
        amount: Math.abs(txn.amount),
        description: txn.name,
        merchantName: txn.merchant_name || txn.name,
        date: new Date(txn.date),
        defaultCategory: txn.personal_finance_category?.primary || txn.category?.[0] || null,
        pending: txn.pending,
        isRecurring: txn.personal_finance_category?.detailed?.includes('SUBSCRIPTION') || false,
      },
    });
  }
}

async function removeTransactions(
  removed: RemovedTransaction[],
  userId: string
) {
  const transactionIds = removed.map((r) => r.transaction_id);

  await prisma.transaction.deleteMany({
    where: {
      userId,
      externalId: { in: transactionIds },
    },
  });
}
