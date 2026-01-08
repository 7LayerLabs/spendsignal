'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import type { IncomeSource, IncomeSettings, IncomeFrequency, IncomeCalculations } from '@/types';

const INCOME_STORAGE_KEY = 'spendsignal_income';

// Convert any frequency to monthly amount
function toMonthly(amount: number, frequency: IncomeFrequency): number {
  switch (frequency) {
    case 'weekly':
      return amount * 52 / 12; // ~4.33 weeks per month
    case 'bi-weekly':
      return amount * 26 / 12; // ~2.17 bi-weekly periods per month
    case 'monthly':
      return amount;
    case 'annual':
      return amount / 12;
    default:
      return amount;
  }
}

// Generate unique ID
function generateId(): string {
  return `income_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function useIncome(userId: string) {
  const [incomeSettings, setIncomeSettings] = useState<IncomeSettings>({
    sources: [],
    updatedAt: new Date(),
  });
  const [isLoading, setIsLoading] = useState(true);

  // Load from localStorage
  useEffect(() => {
    const storageKey = `${INCOME_STORAGE_KEY}_${userId}`;
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        setIncomeSettings({
          ...parsed,
          updatedAt: new Date(parsed.updatedAt),
        });
      }
    } catch (error) {
      console.error('Error loading income settings:', error);
    }
    setIsLoading(false);
  }, [userId]);

  // Save to localStorage
  const saveSettings = useCallback((settings: IncomeSettings) => {
    const storageKey = `${INCOME_STORAGE_KEY}_${userId}`;
    try {
      localStorage.setItem(storageKey, JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving income settings:', error);
    }
  }, [userId]);

  // Add income source
  const addSource = useCallback((source: Omit<IncomeSource, 'id'>) => {
    const newSource: IncomeSource = {
      ...source,
      id: generateId(),
    };

    setIncomeSettings((prev) => {
      const updated = {
        sources: [...prev.sources, newSource],
        updatedAt: new Date(),
      };
      saveSettings(updated);
      return updated;
    });

    return newSource.id;
  }, [saveSettings]);

  // Update income source
  const updateSource = useCallback((id: string, updates: Partial<Omit<IncomeSource, 'id'>>) => {
    setIncomeSettings((prev) => {
      const updated = {
        sources: prev.sources.map((s) =>
          s.id === id ? { ...s, ...updates } : s
        ),
        updatedAt: new Date(),
      };
      saveSettings(updated);
      return updated;
    });
  }, [saveSettings]);

  // Remove income source
  const removeSource = useCallback((id: string) => {
    setIncomeSettings((prev) => {
      const updated = {
        sources: prev.sources.filter((s) => s.id !== id),
        updatedAt: new Date(),
      };
      saveSettings(updated);
      return updated;
    });
  }, [saveSettings]);

  // Calculate totals
  const calculations: IncomeCalculations = useMemo(() => {
    const activeSources = incomeSettings.sources.filter((s) => s.isActive);

    const monthlyIncome = activeSources.reduce((sum, source) => {
      return sum + toMonthly(source.amount, source.frequency);
    }, 0);

    return {
      monthlyIncome,
      annualIncome: monthlyIncome * 12,
      weeklyIncome: monthlyIncome * 12 / 52,
      dailyIncome: monthlyIncome * 12 / 365,
    };
  }, [incomeSettings.sources]);

  // Check if user has set up income
  const hasIncome = incomeSettings.sources.length > 0;
  const hasActiveIncome = incomeSettings.sources.some((s) => s.isActive);

  return {
    incomeSettings,
    calculations,
    isLoading,
    hasIncome,
    hasActiveIncome,
    addSource,
    updateSource,
    removeSource,
  };
}

// Helper hook for quick income display
export function useIncomeDisplay(userId: string) {
  const { calculations, hasActiveIncome, isLoading } = useIncome(userId);

  return {
    monthlyIncome: calculations.monthlyIncome,
    annualIncome: calculations.annualIncome,
    hasIncome: hasActiveIncome,
    isLoading,
  };
}
