// Debt Management Hook
// Manages debt state and calculations for the Advisor tier

'use client';

import { useState, useCallback, useMemo } from 'react';
import type {
  Debt,
  DebtPayoffStrategy,
  DebtPayoffPlan,
  DebtComparison,
} from '@/types';
import {
  calculateDebtPayoffPlan,
  compareStrategies,
  calculateExtraPaymentImpact,
  debtToInput,
  formatCurrency,
  formatPayoffDate,
} from '@/lib/services/debt-calculator';

// Demo debts for testing
const DEMO_DEBTS: Debt[] = [
  {
    id: 'demo-1',
    userId: 'demo-user',
    name: 'Store Credit Card',
    balance: 1200,
    interestRate: 0.2499, // 24.99%
    minimumPayment: 35,
    dueDate: 15,
    priority: 1,
    isPaidOff: false,
    paidOffDate: null,
    originalBalance: 1500,
    createdAt: new Date('2025-06-01'),
    updatedAt: new Date(),
  },
  {
    id: 'demo-2',
    userId: 'demo-user',
    name: 'Chase Visa',
    balance: 5800,
    interestRate: 0.1999, // 19.99%
    minimumPayment: 120,
    dueDate: 20,
    priority: 2,
    isPaidOff: false,
    paidOffDate: null,
    originalBalance: 7200,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date(),
  },
  {
    id: 'demo-3',
    userId: 'demo-user',
    name: 'Student Loan',
    balance: 17500,
    interestRate: 0.055, // 5.50%
    minimumPayment: 185,
    dueDate: 1,
    priority: 3,
    isPaidOff: false,
    paidOffDate: null,
    originalBalance: 24000,
    createdAt: new Date('2020-08-01'),
    updatedAt: new Date(),
  },
];

interface UseDebtsOptions {
  isDemoMode?: boolean;
}

interface UseDebtsReturn {
  // State
  debts: Debt[];
  isLoading: boolean;
  error: string | null;
  strategy: DebtPayoffStrategy;
  extraPayment: number;

  // Calculated values
  payoffPlan: DebtPayoffPlan;
  comparison: DebtComparison;
  totalDebt: number;
  totalMinimumPayment: number;
  debtFreeDate: string;

  // Actions
  addDebt: (debt: Omit<Debt, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => void;
  updateDebt: (id: string, updates: Partial<Debt>) => void;
  removeDebt: (id: string) => void;
  markPaidOff: (id: string) => void;
  setStrategy: (strategy: DebtPayoffStrategy) => void;
  setExtraPayment: (amount: number) => void;
  reorderDebts: (debtId: string, newPriority: number) => void;

  // What-if scenarios
  calculateWhatIf: (newExtraPayment: number) => {
    monthsSaved: number;
    interestSaved: number;
  };
}

export function useDebts(options: UseDebtsOptions = {}): UseDebtsReturn {
  const { isDemoMode = true } = options;

  // State
  const [debts, setDebts] = useState<Debt[]>(isDemoMode ? DEMO_DEBTS : []);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [strategy, setStrategy] = useState<DebtPayoffStrategy>('AVALANCHE');
  const [extraPayment, setExtraPayment] = useState(200);

  // Filter to only active debts
  const activeDebts = useMemo(
    () => debts.filter(d => !d.isPaidOff),
    [debts]
  );

  // Convert to input format for calculations
  const debtInputs = useMemo(
    () => activeDebts.map(debtToInput),
    [activeDebts]
  );

  // Calculate payoff plan
  const payoffPlan = useMemo(
    () => calculateDebtPayoffPlan(debtInputs, extraPayment, strategy),
    [debtInputs, extraPayment, strategy]
  );

  // Compare strategies
  const comparison = useMemo(
    () => compareStrategies(debtInputs, extraPayment),
    [debtInputs, extraPayment]
  );

  // Total debt
  const totalDebt = useMemo(
    () => activeDebts.reduce((sum, d) => sum + d.balance, 0),
    [activeDebts]
  );

  // Total minimum payment
  const totalMinimumPayment = useMemo(
    () => activeDebts.reduce((sum, d) => sum + d.minimumPayment, 0),
    [activeDebts]
  );

  // Formatted debt-free date
  const debtFreeDate = useMemo(
    () => formatPayoffDate(payoffPlan.debtFreeDate),
    [payoffPlan.debtFreeDate]
  );

  // Add debt
  const addDebt = useCallback((debt: Omit<Debt, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    const newDebt: Debt = {
      ...debt,
      id: `debt-${Date.now()}`,
      userId: 'demo-user',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setDebts(prev => [...prev, newDebt]);
  }, []);

  // Update debt
  const updateDebt = useCallback((id: string, updates: Partial<Debt>) => {
    setDebts(prev => prev.map(d =>
      d.id === id
        ? { ...d, ...updates, updatedAt: new Date() }
        : d
    ));
  }, []);

  // Remove debt
  const removeDebt = useCallback((id: string) => {
    setDebts(prev => prev.filter(d => d.id !== id));
  }, []);

  // Mark debt as paid off
  const markPaidOff = useCallback((id: string) => {
    setDebts(prev => prev.map(d =>
      d.id === id
        ? { ...d, isPaidOff: true, paidOffDate: new Date(), balance: 0, updatedAt: new Date() }
        : d
    ));
  }, []);

  // Reorder debts (for custom strategy) - swap positions
  const reorderDebts = useCallback((debtId: string, newIndex: number) => {
    setDebts(prev => {
      const activeDebts = prev.filter(d => !d.isPaidOff);
      const paidOffDebts = prev.filter(d => d.isPaidOff);

      const currentIndex = activeDebts.findIndex(d => d.id === debtId);
      if (currentIndex === -1 || newIndex < 0 || newIndex >= activeDebts.length) return prev;

      // Swap the two debts
      const reordered = [...activeDebts];
      const [removed] = reordered.splice(currentIndex, 1);
      reordered.splice(newIndex, 0, removed);

      // Update priorities based on new order
      const withPriorities = reordered.map((d, i) => ({
        ...d,
        priority: i,
        updatedAt: new Date(),
      }));

      return [...withPriorities, ...paidOffDebts];
    });
  }, []);

  // What-if calculation
  const calculateWhatIf = useCallback((newExtraPayment: number) => {
    const impact = calculateExtraPaymentImpact(
      debtInputs,
      extraPayment,
      newExtraPayment,
      strategy
    );
    return {
      monthsSaved: impact.monthsSaved,
      interestSaved: impact.interestSaved,
    };
  }, [debtInputs, extraPayment, strategy]);

  return {
    // State
    debts,
    isLoading,
    error,
    strategy,
    extraPayment,

    // Calculated values
    payoffPlan,
    comparison,
    totalDebt,
    totalMinimumPayment,
    debtFreeDate,

    // Actions
    addDebt,
    updateDebt,
    removeDebt,
    markPaidOff,
    setStrategy,
    setExtraPayment,
    reorderDebts,

    // What-if
    calculateWhatIf,
  };
}
