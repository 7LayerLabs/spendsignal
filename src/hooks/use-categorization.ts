'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import type { Transaction, UserCategorization } from '@/types';
import type { TrafficLightZone } from '@/constants/traffic-light';
import { generateId } from '@/lib/utils';

interface UseCategorization {
  categorizations: UserCategorization[];
  categorize: (transactionId: string, zone: TrafficLightZone, note?: string) => void;
  uncategorize: (transactionId: string) => void;
  getCategorization: (transactionId: string) => UserCategorization | undefined;
  getZoneTransactions: (zone: TrafficLightZone, transactions: Transaction[]) => Transaction[];
  getUncategorizedTransactions: (transactions: Transaction[]) => Transaction[];
  stats: {
    green: number;
    yellow: number;
    red: number;
    uncategorized: number;
    total: number;
  };
  clearAll: () => void;
}

export function useCategorization(
  initialCategorizations: UserCategorization[] = [],
  userId: string = 'demo-user'
): UseCategorization {
  const [categorizations, setCategorizations] = useState<UserCategorization[]>(initialCategorizations);

  // Categorize a transaction
  const categorize = useCallback((transactionId: string, zone: TrafficLightZone, note?: string) => {
    setCategorizations((prev) => {
      // Check if already categorized
      const existing = prev.find((c) => c.transactionId === transactionId);

      if (existing) {
        // Update existing categorization
        return prev.map((c) =>
          c.transactionId === transactionId
            ? {
                ...c,
                zone,
                note: note ?? c.note,
                updatedAt: new Date(),
                userOverrodeAI: c.aiSuggestedZone ? c.aiSuggestedZone !== zone : false,
              }
            : c
        );
      }

      // Create new categorization
      const newCategorization: UserCategorization = {
        id: generateId(),
        userId,
        transactionId,
        zone,
        categoryId: null,
        aiSuggestedZone: null,
        aiConfidence: null,
        aiReasoning: null,
        note: note ?? null,
        sortOrder: prev.length,
        userOverrodeAI: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      return [...prev, newCategorization];
    });
  }, [userId]);

  // Remove categorization
  const uncategorize = useCallback((transactionId: string) => {
    setCategorizations((prev) => prev.filter((c) => c.transactionId !== transactionId));
  }, []);

  // Get categorization for a transaction
  const getCategorization = useCallback(
    (transactionId: string): UserCategorization | undefined => {
      return categorizations.find((c) => c.transactionId === transactionId);
    },
    [categorizations]
  );

  // Get transactions in a specific zone
  const getZoneTransactions = useCallback(
    (zone: TrafficLightZone, transactions: Transaction[]): Transaction[] => {
      const zoneTransactionIds = new Set(
        categorizations.filter((c) => c.zone === zone).map((c) => c.transactionId)
      );
      return transactions.filter((t) => zoneTransactionIds.has(t.id));
    },
    [categorizations]
  );

  // Get uncategorized transactions
  const getUncategorizedTransactions = useCallback(
    (transactions: Transaction[]): Transaction[] => {
      const categorizedIds = new Set(categorizations.map((c) => c.transactionId));
      return transactions.filter((t) => !categorizedIds.has(t.id));
    },
    [categorizations]
  );

  // Calculate stats
  const stats = useMemo(() => {
    const zoneCounts = categorizations.reduce(
      (acc, c) => {
        acc[c.zone] = (acc[c.zone] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    return {
      green: zoneCounts['GREEN'] || 0,
      yellow: zoneCounts['YELLOW'] || 0,
      red: zoneCounts['RED'] || 0,
      uncategorized: 0, // Will be calculated by consumer
      total: categorizations.length,
    };
  }, [categorizations]);

  // Clear all categorizations
  const clearAll = useCallback(() => {
    setCategorizations([]);
  }, []);

  return {
    categorizations,
    categorize,
    uncategorize,
    getCategorization,
    getZoneTransactions,
    getUncategorizedTransactions,
    stats,
    clearAll,
  };
}

// Hook for persisting categorizations to localStorage (demo mode)
export function useDemoCategorization(userId: string = 'demo-user') {
  const storageKey = `spendsignal-categorizations-${userId}`;
  const [categorizations, setCategorizations] = useState<UserCategorization[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount (client-side only)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Convert date strings back to Date objects
        const loaded = parsed.map((c: UserCategorization) => ({
          ...c,
          createdAt: new Date(c.createdAt),
          updatedAt: new Date(c.updatedAt),
        }));
        setCategorizations(loaded);
      }
    } catch (e) {
      console.error('Failed to load categorizations:', e);
    }
    setIsLoaded(true);
  }, [storageKey]);

  // Save to localStorage whenever categorizations change
  const saveCategorizations = useCallback(
    (cats: UserCategorization[]) => {
      if (typeof window === 'undefined') return;

      try {
        localStorage.setItem(storageKey, JSON.stringify(cats));
      } catch (e) {
        console.error('Failed to save categorizations:', e);
      }
    },
    [storageKey]
  );

  // Categorize with persistence
  const categorize = useCallback(
    (transactionId: string, zone: TrafficLightZone, note?: string) => {
      console.log('categorize hook called:', transactionId, zone);
      setCategorizations((prev) => {
        console.log('Previous categorizations:', prev.length);
        const existing = prev.find((c) => c.transactionId === transactionId);

        let updated: UserCategorization[];

        if (existing) {
          updated = prev.map((c) =>
            c.transactionId === transactionId
              ? {
                  ...c,
                  zone,
                  note: note ?? c.note,
                  updatedAt: new Date(),
                  userOverrodeAI: c.aiSuggestedZone ? c.aiSuggestedZone !== zone : false,
                }
              : c
          );
        } else {
          const newCategorization: UserCategorization = {
            id: generateId(),
            userId,
            transactionId,
            zone,
            categoryId: null,
            aiSuggestedZone: null,
            aiConfidence: null,
            aiReasoning: null,
            note: note ?? null,
            sortOrder: prev.length,
            userOverrodeAI: false,
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          updated = [...prev, newCategorization];
        }

        console.log('New categorizations count:', updated.length);
        saveCategorizations(updated);
        return updated;
      });
    },
    [userId, saveCategorizations]
  );

  // Uncategorize with persistence
  const uncategorize = useCallback(
    (transactionId: string) => {
      setCategorizations((prev) => {
        const updated = prev.filter((c) => c.transactionId !== transactionId);
        saveCategorizations(updated);
        return updated;
      });
    },
    [saveCategorizations]
  );

  // Clear all with persistence
  const clearAll = useCallback(() => {
    setCategorizations([]);
    saveCategorizations([]);
  }, [saveCategorizations]);

  // Get categorization for a transaction
  const getCategorization = useCallback(
    (transactionId: string): UserCategorization | undefined => {
      return categorizations.find((c) => c.transactionId === transactionId);
    },
    [categorizations]
  );

  return {
    categorizations,
    categorize,
    uncategorize,
    getCategorization,
    clearAll,
  };
}

export { useCategorization as default };
