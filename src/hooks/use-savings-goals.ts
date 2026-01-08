// Savings Goals Hook
// Manages savings goal state and calculations for the Advisor tier

'use client';

import { useState, useCallback, useMemo } from 'react';
import type {
  SavingsGoal,
  SavingsGoalType,
  SavingsProjection,
  SavingsContribution,
  SavingsGoalWithContributions,
} from '@/types';
import {
  calculateSavingsProjection,
  calculateContributionImpact,
  calculateTotalSavings,
  calculateTotalMonthlyContributions,
  calculateSavingsRate,
  getGoalTypeIcon,
  getGoalTypeLabel,
  savingsGoalToInput,
  formatCurrency,
  formatTargetDate,
  getAmountToNextMilestone,
} from '@/lib/services/savings-calculator';

// Demo savings goals for testing
const DEMO_GOALS: SavingsGoalWithContributions[] = [
  {
    id: 'demo-goal-1',
    userId: 'demo-user',
    name: 'House Down Payment',
    type: 'HOUSE',
    icon: '🏠',
    targetAmount: 60000,
    currentAmount: 12400,
    monthlyContribution: 500,
    targetDate: new Date('2028-12-01'),
    isCompleted: false,
    completedDate: null,
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date(),
    contributions: [
      { id: 'c1', savingsGoalId: 'demo-goal-1', amount: 500, date: new Date('2025-12-01'), note: null },
      { id: 'c2', savingsGoalId: 'demo-goal-1', amount: 500, date: new Date('2025-11-01'), note: null },
      { id: 'c3', savingsGoalId: 'demo-goal-1', amount: 600, date: new Date('2025-10-01'), note: 'Bonus' },
    ],
  },
  {
    id: 'demo-goal-2',
    userId: 'demo-user',
    name: 'Emergency Fund',
    type: 'EMERGENCY',
    icon: '🛡️',
    targetAmount: 15000,
    currentAmount: 8200,
    monthlyContribution: 300,
    targetDate: new Date('2026-10-01'),
    isCompleted: false,
    completedDate: null,
    createdAt: new Date('2024-06-01'),
    updatedAt: new Date(),
    contributions: [
      { id: 'c4', savingsGoalId: 'demo-goal-2', amount: 300, date: new Date('2025-12-01'), note: null },
      { id: 'c5', savingsGoalId: 'demo-goal-2', amount: 300, date: new Date('2025-11-01'), note: null },
    ],
  },
  {
    id: 'demo-goal-3',
    userId: 'demo-user',
    name: 'Japan Trip',
    type: 'VACATION',
    icon: '✈️',
    targetAmount: 5000,
    currentAmount: 1800,
    monthlyContribution: 200,
    targetDate: new Date('2027-03-01'),
    isCompleted: false,
    completedDate: null,
    createdAt: new Date('2025-08-01'),
    updatedAt: new Date(),
    contributions: [
      { id: 'c6', savingsGoalId: 'demo-goal-3', amount: 200, date: new Date('2025-12-01'), note: null },
    ],
  },
];

interface UseSavingsGoalsOptions {
  isDemoMode?: boolean;
  monthlyIncome?: number;
}

interface UseSavingsGoalsReturn {
  // State
  goals: SavingsGoalWithContributions[];
  isLoading: boolean;
  error: string | null;

  // Calculated values
  projections: SavingsProjection[];
  totalSavings: number;
  totalMonthlyContributions: number;
  savingsRate: number;

  // Actions
  addGoal: (goal: Omit<SavingsGoal, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => void;
  updateGoal: (id: string, updates: Partial<SavingsGoal>) => void;
  removeGoal: (id: string) => void;
  markCompleted: (id: string) => void;
  addContribution: (goalId: string, amount: number, note?: string) => void;

  // What-if scenarios
  calculateWhatIf: (goalId: string, newMonthlyContribution: number) => {
    monthsSaved: number;
    currentProjection: SavingsProjection;
    newProjection: SavingsProjection;
  };

  // Helpers
  getGoalIcon: (type: SavingsGoalType) => string;
  getGoalLabel: (type: SavingsGoalType) => string;
}

export function useSavingsGoals(options: UseSavingsGoalsOptions = {}): UseSavingsGoalsReturn {
  const { isDemoMode = true, monthlyIncome = 5000 } = options;

  // State
  const [goals, setGoals] = useState<SavingsGoalWithContributions[]>(
    isDemoMode ? DEMO_GOALS : []
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filter to only active goals
  const activeGoals = useMemo(
    () => goals.filter(g => !g.isCompleted),
    [goals]
  );

  // Calculate projections for all goals
  const projections = useMemo(
    () => activeGoals.map(g => calculateSavingsProjection(savingsGoalToInput(g))),
    [activeGoals]
  );

  // Total savings
  const totalSavings = useMemo(
    () => calculateTotalSavings(activeGoals.map(savingsGoalToInput)),
    [activeGoals]
  );

  // Total monthly contributions
  const totalMonthlyContributions = useMemo(
    () => calculateTotalMonthlyContributions(activeGoals.map(savingsGoalToInput)),
    [activeGoals]
  );

  // Savings rate
  const savingsRate = useMemo(
    () => calculateSavingsRate(monthlyIncome, totalMonthlyContributions),
    [monthlyIncome, totalMonthlyContributions]
  );

  // Add goal
  const addGoal = useCallback((goal: Omit<SavingsGoal, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    const newGoal: SavingsGoalWithContributions = {
      ...goal,
      id: `goal-${Date.now()}`,
      userId: 'demo-user',
      createdAt: new Date(),
      updatedAt: new Date(),
      contributions: [],
    };
    setGoals(prev => [...prev, newGoal]);
  }, []);

  // Update goal
  const updateGoal = useCallback((id: string, updates: Partial<SavingsGoal>) => {
    setGoals(prev => prev.map(g =>
      g.id === id
        ? { ...g, ...updates, updatedAt: new Date() }
        : g
    ));
  }, []);

  // Remove goal
  const removeGoal = useCallback((id: string) => {
    setGoals(prev => prev.filter(g => g.id !== id));
  }, []);

  // Mark goal as completed
  const markCompleted = useCallback((id: string) => {
    setGoals(prev => prev.map(g =>
      g.id === id
        ? { ...g, isCompleted: true, completedDate: new Date(), updatedAt: new Date() }
        : g
    ));
  }, []);

  // Add contribution
  const addContribution = useCallback((goalId: string, amount: number, note?: string) => {
    setGoals(prev => prev.map(g => {
      if (g.id !== goalId) return g;

      const newContribution: SavingsContribution = {
        id: `contrib-${Date.now()}`,
        savingsGoalId: goalId,
        amount,
        date: new Date(),
        note: note ?? null,
      };

      const newCurrentAmount = g.currentAmount + amount;
      const isNowCompleted = newCurrentAmount >= g.targetAmount;

      return {
        ...g,
        currentAmount: newCurrentAmount,
        isCompleted: isNowCompleted,
        completedDate: isNowCompleted ? new Date() : null,
        contributions: [...g.contributions, newContribution],
        updatedAt: new Date(),
      };
    }));
  }, []);

  // What-if calculation
  const calculateWhatIf = useCallback((goalId: string, newMonthlyContribution: number) => {
    const goal = goals.find(g => g.id === goalId);
    if (!goal) {
      throw new Error('Goal not found');
    }

    const impact = calculateContributionImpact(
      savingsGoalToInput(goal),
      newMonthlyContribution
    );

    return {
      monthsSaved: impact.monthsSaved,
      currentProjection: impact.currentProjection,
      newProjection: impact.newProjection,
    };
  }, [goals]);

  return {
    // State
    goals,
    isLoading,
    error,

    // Calculated values
    projections,
    totalSavings,
    totalMonthlyContributions,
    savingsRate,

    // Actions
    addGoal,
    updateGoal,
    removeGoal,
    markCompleted,
    addContribution,

    // What-if
    calculateWhatIf,

    // Helpers
    getGoalIcon: getGoalTypeIcon,
    getGoalLabel: getGoalTypeLabel,
  };
}
