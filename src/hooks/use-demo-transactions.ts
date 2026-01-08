'use client';

import { useState, useEffect, useCallback } from 'react';
import { generateDemoTransactions } from '@/lib/services/mock-transaction-service';
import type { Transaction } from '@/types';

interface UseDemoTransactions {
  transactions: Transaction[];
  isLoading: boolean;
  regenerate: () => void;
  addTransaction: (transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => void;
  importTransactions: (transactions: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>[]) => void;
}

export function useDemoTransactions(
  userId: string = 'demo-user',
  daysOfHistory: number = 30
): UseDemoTransactions {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const storageKey = `spendsignal-transactions-${userId}`;

  const clearedKey = `spendsignal-data-cleared-${userId}`;

  // Generate or load transactions
  const loadTransactions = useCallback(() => {
    setIsLoading(true);
    console.log('loadTransactions called');

    // Try to load from localStorage first
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(storageKey);
        console.log('localStorage key:', storageKey, 'has data:', !!stored);
        if (stored) {
          const parsed = JSON.parse(stored);
          console.log('Parsed', parsed.length, 'transactions from localStorage');
          // Convert date strings back to Date objects
          const txs = parsed.map((t: Transaction) => ({
            ...t,
            date: new Date(t.date),
            createdAt: new Date(t.createdAt),
            updatedAt: new Date(t.updatedAt),
          }));
          console.log('Sample loaded transaction:', txs[0]);
          setTransactions(txs);
          setIsLoading(false);
          return;
        }

        // Check if user explicitly cleared data - don't regenerate
        const wasCleared = localStorage.getItem(clearedKey);
        if (wasCleared) {
          setTransactions([]);
          setIsLoading(false);
          return;
        }
      } catch (e) {
        console.error('Failed to load transactions:', e);
      }
    }

    // Generate new transactions (only if not explicitly cleared)
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysOfHistory);

    const generated = generateDemoTransactions({
      userId,
      startDate,
      endDate,
      transactionsPerDay: { min: 2, max: 6 },
      includeRecurring: true,
    });

    // Add timestamps
    const txsWithTimestamps = generated.map((t) => ({
      ...t,
      createdAt: new Date(),
      updatedAt: new Date(),
    })) as Transaction[];

    setTransactions(txsWithTimestamps);

    // Save to localStorage
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(storageKey, JSON.stringify(txsWithTimestamps));
      } catch (e) {
        console.error('Failed to save transactions:', e);
      }
    }

    setIsLoading(false);
  }, [userId, daysOfHistory, storageKey, clearedKey]);

  // Load on mount
  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  // Regenerate transactions
  const regenerate = useCallback(() => {
    // Clear storage and regenerate
    if (typeof window !== 'undefined') {
      localStorage.removeItem(storageKey);
      // Also clear categorizations
      localStorage.removeItem(`spendsignal-categorizations-${userId}`);
    }
    loadTransactions();
  }, [storageKey, userId, loadTransactions]);

  // Add a new transaction
  const addTransaction = useCallback(
    (transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => {
      const newTx: Transaction = {
        ...transaction,
        id: `manual-${Date.now()}`,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as Transaction;

      setTransactions((prev) => {
        const updated = [newTx, ...prev];
        // Save to localStorage
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem(storageKey, JSON.stringify(updated));
          } catch (e) {
            console.error('Failed to save transactions:', e);
          }
        }
        return updated;
      });
    },
    [storageKey]
  );

  // Import multiple transactions (e.g., from CSV)
  const importTransactions = useCallback(
    (newTransactions: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>[]) => {
      console.log('importTransactions called with', newTransactions.length, 'transactions');
      const txsWithIds: Transaction[] = newTransactions.map((tx, idx) => ({
        ...tx,
        id: `import-${Date.now()}-${idx}`,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as Transaction));

      console.log('Processed transactions:', txsWithIds.slice(0, 2));

      setTransactions((prev) => {
        const updated = [...txsWithIds, ...prev];
        console.log('Total transactions after import:', updated.length);
        // Save to localStorage
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem(storageKey, JSON.stringify(updated));
            console.log('Saved to localStorage key:', storageKey);
            // Clear the "data cleared" flag since we now have real data
            localStorage.removeItem(clearedKey);
          } catch (e) {
            console.error('Failed to save transactions:', e);
          }
        }
        return updated;
      });
    },
    [storageKey, clearedKey]
  );

  return {
    transactions,
    isLoading,
    regenerate,
    addTransaction,
    importTransactions,
  };
}

export { useDemoTransactions as default };
