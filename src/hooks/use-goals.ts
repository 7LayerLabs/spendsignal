'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import type { Goal, GoalType, GoalStatus, GoalTargetConfig } from '@/types';
import type { TrafficLightZone } from '@/constants/traffic-light';

const GOALS_STORAGE_KEY = 'spendsignal_goals';

function generateId(): string {
  return `goal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

interface UseGoalsOptions {
  transactions?: Array<{
    id: string;
    amount: number;
    date: Date;
  }>;
  categorizations?: Array<{
    transactionId: string;
    zone: TrafficLightZone;
  }>;
}

export function useGoals(userId: string, options: UseGoalsOptions = {}) {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { transactions = [], categorizations = [] } = options;

  // Load goals from localStorage
  useEffect(() => {
    const storageKey = `${GOALS_STORAGE_KEY}_${userId}`;
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Convert date strings back to Date objects
        const goalsWithDates = parsed.map((g: Goal) => ({
          ...g,
          startDate: new Date(g.startDate),
          endDate: g.endDate ? new Date(g.endDate) : null,
          createdAt: new Date(g.createdAt),
          updatedAt: new Date(g.updatedAt),
        }));
        setGoals(goalsWithDates);
      }
    } catch (error) {
      console.error('Error loading goals:', error);
    }
    setIsLoading(false);
  }, [userId]);

  // Save to localStorage
  const saveGoals = useCallback((updatedGoals: Goal[]) => {
    const storageKey = `${GOALS_STORAGE_KEY}_${userId}`;
    try {
      localStorage.setItem(storageKey, JSON.stringify(updatedGoals));
    } catch (error) {
      console.error('Error saving goals:', error);
    }
  }, [userId]);

  // Create categorization map for calculations
  const categorizationMap = useMemo(() => {
    const map = new Map<string, TrafficLightZone>();
    categorizations.forEach((c) => map.set(c.transactionId, c.zone));
    return map;
  }, [categorizations]);

  // Calculate zone totals
  const zoneTotals = useMemo(() => {
    const totals = {
      GREEN: 0,
      YELLOW: 0,
      RED: 0,
      total: 0,
    };

    transactions.forEach((t) => {
      const zone = categorizationMap.get(t.id);
      const amount = Math.abs(Number(t.amount));
      if (zone && zone !== 'UNCATEGORIZED') {
        totals[zone] += amount;
        totals.total += amount;
      }
    });

    return totals;
  }, [transactions, categorizationMap]);

  // Calculate current value for a goal
  const calculateCurrentValue = useCallback((goal: Goal): number => {
    const config = goal.targetConfig;

    switch (goal.type) {
      case 'SPENDING_LIMIT': {
        // Total spending in a zone for the period
        const zone = config.zone;
        if (zone && zone !== 'UNCATEGORIZED') {
          return zoneTotals[zone];
        }
        return zoneTotals.total;
      }

      case 'ZONE_RATIO': {
        // Percentage of spending in a zone
        const zone = config.zone;
        if (zone && zone !== 'UNCATEGORIZED' && zoneTotals.total > 0) {
          return (zoneTotals[zone] / zoneTotals.total) * 100;
        }
        return 0;
      }

      case 'STREAK': {
        // Count consecutive days without RED spending
        // Simplified: count transactions without RED zone
        const redCount = categorizations.filter((c) => c.zone === 'RED').length;
        const totalCategorized = categorizations.filter((c) => c.zone !== 'UNCATEGORIZED').length;
        // Return days since last RED (simplified as inverse of RED ratio)
        if (redCount === 0) return totalCategorized > 0 ? 30 : 0;
        return Math.max(0, 30 - redCount);
      }

      case 'SAVINGS_TARGET': {
        // Current savings (would need income data in real implementation)
        // For demo, use RED zone avoidance as proxy
        return zoneTotals.RED > 0 ? zoneTotals.total - zoneTotals.RED : zoneTotals.total;
      }

      default:
        return 0;
    }
  }, [zoneTotals, categorizations]);

  // Calculate progress percentage for a goal
  const calculateProgress = useCallback((goal: Goal): number => {
    const currentValue = calculateCurrentValue(goal);

    switch (goal.type) {
      case 'SPENDING_LIMIT': {
        // Progress is inverse - lower spending = more progress
        if (goal.targetValue === 0) return 100;
        const ratio = currentValue / goal.targetValue;
        // If under limit, show as % complete. If over, cap at 0
        return Math.max(0, Math.min(100, (1 - ratio) * 100 + 100));
      }

      case 'ZONE_RATIO': {
        // For min (GREEN): higher is better
        // For max (RED): lower is better
        if (goal.targetConfig.zone === 'GREEN') {
          return Math.min(100, (currentValue / goal.targetValue) * 100);
        } else {
          // RED ratio - want to be BELOW target
          if (currentValue <= goal.targetValue) return 100;
          return Math.max(0, 100 - ((currentValue - goal.targetValue) / goal.targetValue) * 100);
        }
      }

      case 'STREAK': {
        return Math.min(100, (currentValue / goal.targetValue) * 100);
      }

      case 'SAVINGS_TARGET': {
        return Math.min(100, (currentValue / goal.targetValue) * 100);
      }

      default:
        return 0;
    }
  }, [calculateCurrentValue]);

  // Add a new goal
  const addGoal = useCallback((goalData: {
    type: GoalType;
    name: string;
    description?: string;
    targetConfig: GoalTargetConfig;
    targetValue: number;
    endDate?: Date;
  }) => {
    const now = new Date();
    const newGoal: Goal = {
      id: generateId(),
      userId,
      type: goalData.type,
      status: 'ACTIVE',
      name: goalData.name,
      description: goalData.description || null,
      targetConfig: goalData.targetConfig,
      currentValue: null,
      targetValue: goalData.targetValue,
      startDate: now,
      endDate: goalData.endDate || null,
      createdAt: now,
      updatedAt: now,
    };

    setGoals((prev) => {
      const updated = [...prev, newGoal];
      saveGoals(updated);
      return updated;
    });

    return newGoal.id;
  }, [userId, saveGoals]);

  // Update a goal
  const updateGoal = useCallback((id: string, updates: Partial<Omit<Goal, 'id' | 'userId' | 'createdAt'>>) => {
    setGoals((prev) => {
      const updated = prev.map((g) =>
        g.id === id ? { ...g, ...updates, updatedAt: new Date() } : g
      );
      saveGoals(updated);
      return updated;
    });
  }, [saveGoals]);

  // Delete a goal
  const deleteGoal = useCallback((id: string) => {
    setGoals((prev) => {
      const updated = prev.filter((g) => g.id !== id);
      saveGoals(updated);
      return updated;
    });
  }, [saveGoals]);

  // Update goal status
  const updateStatus = useCallback((id: string, status: GoalStatus) => {
    updateGoal(id, { status });
  }, [updateGoal]);

  // Get goals with calculated progress
  const goalsWithProgress = useMemo(() => {
    return goals.map((goal) => ({
      ...goal,
      currentValue: calculateCurrentValue(goal),
      progress: calculateProgress(goal),
    }));
  }, [goals, calculateCurrentValue, calculateProgress]);

  // Filter goals by status
  const activeGoals = useMemo(() => goalsWithProgress.filter((g) => g.status === 'ACTIVE'), [goalsWithProgress]);
  const completedGoals = useMemo(() => goalsWithProgress.filter((g) => g.status === 'COMPLETED'), [goalsWithProgress]);

  return {
    goals: goalsWithProgress,
    activeGoals,
    completedGoals,
    isLoading,
    addGoal,
    updateGoal,
    deleteGoal,
    updateStatus,
    zoneTotals,
  };
}

export type GoalWithProgress = Goal & {
  progress: number;
};
