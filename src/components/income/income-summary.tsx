'use client';

import { useState } from 'react';
import { useIncome } from '@/hooks/use-income';
import { formatCurrency } from '@/lib/utils';
import { IncomeSettingsModal } from './income-settings-modal';

interface IncomeSummaryProps {
  userId: string;
  monthlySpending?: number;
  compact?: boolean;
}

export function IncomeSummary({ userId, monthlySpending = 0, compact = false }: IncomeSummaryProps) {
  const { calculations, hasActiveIncome, isLoading } = useIncome(userId);
  const [showModal, setShowModal] = useState(false);

  if (isLoading) {
    return null;
  }

  // Calculate savings and spending ratios
  const monthlySavings = calculations.monthlyIncome - monthlySpending;
  const savingsRate = calculations.monthlyIncome > 0
    ? (monthlySavings / calculations.monthlyIncome) * 100
    : 0;
  const spendingRate = calculations.monthlyIncome > 0
    ? (monthlySpending / calculations.monthlyIncome) * 100
    : 0;

  // Determine status
  const getSavingsStatus = () => {
    if (savingsRate >= 20) return { label: 'Excellent', color: 'text-[#22C55E]', bg: 'bg-[#22C55E]/10' };
    if (savingsRate >= 10) return { label: 'Good', color: 'text-[#3B82F6]', bg: 'bg-[#3B82F6]/10' };
    if (savingsRate >= 0) return { label: 'Thin', color: 'text-[#EAB308]', bg: 'bg-[#EAB308]/10' };
    return { label: 'Deficit', color: 'text-[#EF4444]', bg: 'bg-[#EF4444]/10' };
  };

  const status = getSavingsStatus();

  if (compact) {
    return (
      <>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-3 p-3 rounded-xl bg-[#111820] border border-[#2A3441] hover:border-[#3B82F6]/50 transition-all w-full"
        >
          <div className="w-8 h-8 rounded-lg bg-[#22C55E]/10 flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-[#22C55E]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="flex-1 text-left">
            {hasActiveIncome ? (
              <>
                <p className="text-sm font-medium text-white">
                  {formatCurrency(calculations.monthlyIncome)}/mo
                </p>
                <p className="text-xs text-[#6B7280]">
                  {savingsRate >= 0 ? `${Math.round(savingsRate)}% savings rate` : 'Over budget'}
                </p>
              </>
            ) : (
              <>
                <p className="text-sm font-medium text-[#6B7280]">Set your income</p>
                <p className="text-xs text-[#6B7280]">For better insights</p>
              </>
            )}
          </div>
          <svg className="w-4 h-4 text-[#6B7280]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
        <IncomeSettingsModal userId={userId} isOpen={showModal} onClose={() => setShowModal(false)} />
      </>
    );
  }

  // Full version with detailed breakdown
  return (
    <>
      <div className="rounded-2xl border border-[#2A3441] bg-[#0F1419] overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-[#2A3441] bg-gradient-to-r from-[#111820] to-transparent">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Income vs Spending</h3>
            <button
              onClick={() => setShowModal(true)}
              className="p-1.5 rounded-lg text-[#6B7280] hover:text-white hover:bg-[#2A3441] transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-4">
          {!hasActiveIncome ? (
            // No income set up - prompt to add
            <button
              onClick={() => setShowModal(true)}
              className="w-full p-6 rounded-xl border border-dashed border-[#2A3441] hover:border-[#22C55E] transition-colors group"
            >
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-[#22C55E]/10 flex items-center justify-center group-hover:bg-[#22C55E]/20 transition-colors">
                <svg className="w-6 h-6 text-[#22C55E]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <p className="text-sm font-medium text-white mb-1">Add your income</p>
              <p className="text-xs text-[#6B7280]">
                See your savings rate and get better budget insights
              </p>
            </button>
          ) : (
            <>
              {/* Visual income/spending bar */}
              <div className="space-y-3 mb-4">
                {/* Income bar */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#9BA4B0]">Monthly Income</span>
                    <span className="text-[#22C55E] font-medium">{formatCurrency(calculations.monthlyIncome)}</span>
                  </div>
                  <div className="h-3 bg-[#1F2937] rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-[#22C55E] to-[#16A34A] w-full" />
                  </div>
                </div>

                {/* Spending bar */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#9BA4B0]">Monthly Spending</span>
                    <span className="text-white font-medium">{formatCurrency(monthlySpending)}</span>
                  </div>
                  <div className="h-3 bg-[#1F2937] rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        spendingRate > 100
                          ? 'bg-gradient-to-r from-[#EF4444] to-[#DC2626]'
                          : spendingRate > 80
                          ? 'bg-gradient-to-r from-[#EAB308] to-[#CA8A04]'
                          : 'bg-gradient-to-r from-[#3B82F6] to-[#2563EB]'
                      }`}
                      style={{ width: `${Math.min(spendingRate, 100)}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Stats grid */}
              <div className="grid grid-cols-2 gap-3">
                {/* Savings/Deficit */}
                <div className={`p-3 rounded-xl ${status.bg} border border-[#2A3441]`}>
                  <p className="text-xs text-[#6B7280] mb-1">
                    {monthlySavings >= 0 ? 'Monthly Savings' : 'Monthly Deficit'}
                  </p>
                  <p className={`text-xl font-bold ${status.color}`}>
                    {monthlySavings >= 0 ? formatCurrency(monthlySavings) : `-${formatCurrency(Math.abs(monthlySavings))}`}
                  </p>
                </div>

                {/* Savings Rate */}
                <div className={`p-3 rounded-xl ${status.bg} border border-[#2A3441]`}>
                  <p className="text-xs text-[#6B7280] mb-1">Savings Rate</p>
                  <div className="flex items-baseline gap-1">
                    <p className={`text-xl font-bold ${status.color}`}>
                      {Math.round(savingsRate)}%
                    </p>
                    <span className={`text-xs ${status.color}`}>{status.label}</span>
                  </div>
                </div>
              </div>

              {/* Tough love message */}
              <div className="mt-4 p-3 rounded-xl bg-[#111820] border border-[#2A3441]">
                <p className="text-sm text-[#9BA4B0]">
                  {getSavingsMessage(savingsRate, spendingRate, monthlySavings)}
                </p>
              </div>
            </>
          )}
        </div>
      </div>
      <IncomeSettingsModal userId={userId} isOpen={showModal} onClose={() => setShowModal(false)} />
    </>
  );
}

function getSavingsMessage(savingsRate: number, spendingRate: number, monthlySavings: number): string {
  if (savingsRate >= 30) {
    return "Impressive discipline. You're building real wealth. Keep it up.";
  }
  if (savingsRate >= 20) {
    return "Solid savings rate. You're doing better than most. Stay consistent.";
  }
  if (savingsRate >= 10) {
    return "Decent start, but there's room to grow. Review your Yellow and Red zones.";
  }
  if (savingsRate >= 0) {
    return "Barely breaking even. Time to get serious about cutting the unnecessary.";
  }
  return `You're spending ${formatCurrency(Math.abs(monthlySavings))} more than you make. Red alert.`;
}

export { IncomeSummary as default };
