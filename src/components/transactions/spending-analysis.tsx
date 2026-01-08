'use client';

import { useMemo, useState } from 'react';
import { formatCurrency } from '@/lib/utils';
import { useIncome } from '@/hooks/use-income';
import { IncomeSettingsModal } from '@/components/income/income-settings-modal';
import type { Transaction, UserCategorization } from '@/types';
import type { TrafficLightZone } from '@/constants/traffic-light';

interface SpendingAnalysisProps {
  transactions: Transaction[];
  categorizations: UserCategorization[];
  userId?: string;
}

export function SpendingAnalysis({ transactions, categorizations, userId = 'demo-user' }: SpendingAnalysisProps) {
  const [showIncomeModal, setShowIncomeModal] = useState(false);
  const { calculations: incomeCalc, hasActiveIncome } = useIncome(userId);

  const analysis = useMemo(() => {
    // Create categorization map
    const catMap = new Map<string, TrafficLightZone>();
    categorizations.forEach((c) => catMap.set(c.transactionId, c.zone));

    // Calculate zone totals
    const zones = {
      GREEN: { count: 0, amount: 0, transactions: [] as Transaction[] },
      YELLOW: { count: 0, amount: 0, transactions: [] as Transaction[] },
      RED: { count: 0, amount: 0, transactions: [] as Transaction[] },
      UNCATEGORIZED: { count: 0, amount: 0, transactions: [] as Transaction[] },
    };

    transactions.forEach((t) => {
      const zone = catMap.get(t.id) || 'UNCATEGORIZED';
      const amount = Math.abs(Number(t.amount));
      zones[zone].count++;
      zones[zone].amount += amount;
      zones[zone].transactions.push(t);
    });

    const totalCategorized = zones.GREEN.amount + zones.YELLOW.amount + zones.RED.amount;
    const totalAll = totalCategorized + zones.UNCATEGORIZED.amount;

    // Calculate percentages (of categorized spending only)
    const greenPercent = totalCategorized > 0 ? (zones.GREEN.amount / totalCategorized) * 100 : 0;
    const yellowPercent = totalCategorized > 0 ? (zones.YELLOW.amount / totalCategorized) * 100 : 0;
    const redPercent = totalCategorized > 0 ? (zones.RED.amount / totalCategorized) * 100 : 0;

    // Calculate health score (0-100)
    // Green is good (full points), Yellow is okay (half points), Red is bad (negative)
    // Formula: (Green% * 1) + (Yellow% * 0.5) - (Red% * 0.5), normalized to 0-100
    let healthScore = 0;
    if (totalCategorized > 0) {
      const rawScore = greenPercent + (yellowPercent * 0.5) - (redPercent * 0.5);
      healthScore = Math.max(0, Math.min(100, rawScore));
    }

    // Potential savings (if eliminated all RED)
    const potentialSavings = zones.RED.amount;

    // Monthly projection (assuming 30 days of data represents a month)
    const avgDailyRed = zones.RED.amount / 30;
    const yearlyRedProjection = avgDailyRed * 365;

    return {
      zones,
      totalCategorized,
      totalAll,
      greenPercent,
      yellowPercent,
      redPercent,
      healthScore,
      potentialSavings,
      yearlyRedProjection,
      categorizedCount: zones.GREEN.count + zones.YELLOW.count + zones.RED.count,
      uncategorizedCount: zones.UNCATEGORIZED.count,
    };
  }, [transactions, categorizations]);

  // Generate tough-love message based on analysis
  const getMessage = () => {
    if (analysis.categorizedCount === 0) {
      return {
        title: "Nothing categorized yet",
        message: "Stop procrastinating. Drag those transactions.",
        tone: 'neutral' as const,
      };
    }

    if (analysis.redPercent > 30) {
      return {
        title: "Reality check needed",
        message: `${Math.round(analysis.redPercent)}% of your spending is avoidable. That's ${formatCurrency(analysis.potentialSavings)} you could invest instead.`,
        tone: 'critical' as const,
      };
    }

    if (analysis.redPercent > 15) {
      return {
        title: "Room for improvement",
        message: `${Math.round(analysis.redPercent)}% in the red zone. Not terrible, but not great. You know what to cut.`,
        tone: 'warning' as const,
      };
    }

    if (analysis.greenPercent > 70) {
      return {
        title: "Discipline showing",
        message: `${Math.round(analysis.greenPercent)}% essentials. You're focused on what matters.`,
        tone: 'good' as const,
      };
    }

    if (analysis.yellowPercent > 40) {
      return {
        title: "Lots of maybes",
        message: `${Math.round(analysis.yellowPercent)}% discretionary. Time to decide which ones actually add value.`,
        tone: 'warning' as const,
      };
    }

    return {
      title: "Balanced approach",
      message: "Decent mix. Keep the red zone in check.",
      tone: 'neutral' as const,
    };
  };

  const feedback = getMessage();

  const toneColors = {
    critical: 'border-[#EF4444]/50 bg-[#EF4444]/5',
    warning: 'border-[#EAB308]/50 bg-[#EAB308]/5',
    good: 'border-[#22C55E]/50 bg-[#22C55E]/5',
    neutral: 'border-[#3B82F6]/50 bg-[#3B82F6]/5',
  };

  const toneTextColors = {
    critical: 'text-[#EF4444]',
    warning: 'text-[#EAB308]',
    good: 'text-[#22C55E]',
    neutral: 'text-[#3B82F6]',
  };

  return (
    <div className="rounded-2xl border border-[#2A3441] bg-[#0F1419] overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-[#2A3441] bg-gradient-to-r from-[#111820] to-transparent">
        <h3 className="text-lg font-semibold text-white">Spending Analysis</h3>
        <p className="text-xs text-[#6B7280] mt-0.5">Based on your categorization decisions</p>
      </div>

      {/* Zone Breakdown */}
      <div className="p-4 space-y-4">
        {/* Visual bar breakdown */}
        <div className="space-y-3">
          {/* Green */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#22C55E]" />
                <span className="text-[#9BA4B0]">Essentials</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-white font-medium">{formatCurrency(analysis.zones.GREEN.amount)}</span>
                <span className="text-[#22C55E] text-xs font-medium w-12 text-right">
                  {Math.round(analysis.greenPercent)}%
                </span>
              </div>
            </div>
            <div className="h-2 bg-[#1F2937] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#22C55E] to-[#16A34A] transition-all duration-700 ease-out"
                style={{ width: `${analysis.greenPercent}%` }}
              />
            </div>
          </div>

          {/* Yellow */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#EAB308]" />
                <span className="text-[#9BA4B0]">Discretionary</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-white font-medium">{formatCurrency(analysis.zones.YELLOW.amount)}</span>
                <span className="text-[#EAB308] text-xs font-medium w-12 text-right">
                  {Math.round(analysis.yellowPercent)}%
                </span>
              </div>
            </div>
            <div className="h-2 bg-[#1F2937] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#EAB308] to-[#CA8A04] transition-all duration-700 ease-out"
                style={{ width: `${analysis.yellowPercent}%` }}
              />
            </div>
          </div>

          {/* Red */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#EF4444]" />
                <span className="text-[#9BA4B0]">Avoidable</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-white font-medium">{formatCurrency(analysis.zones.RED.amount)}</span>
                <span className="text-[#EF4444] text-xs font-medium w-12 text-right">
                  {Math.round(analysis.redPercent)}%
                </span>
              </div>
            </div>
            <div className="h-2 bg-[#1F2937] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#EF4444] to-[#DC2626] transition-all duration-700 ease-out"
                style={{ width: `${analysis.redPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-[#2A3441]" />

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          {/* Health Score */}
          <div className="p-3 rounded-xl bg-[#111820] border border-[#2A3441]">
            <p className="text-xs text-[#6B7280] mb-1">Health Score</p>
            <div className="flex items-end gap-1">
              <span className={`text-2xl font-bold ${
                analysis.healthScore >= 70 ? 'text-[#22C55E]' :
                analysis.healthScore >= 40 ? 'text-[#EAB308]' : 'text-[#EF4444]'
              }`}>
                {Math.round(analysis.healthScore)}
              </span>
              <span className="text-sm text-[#6B7280] mb-1">/100</span>
            </div>
          </div>

          {/* Potential Savings */}
          <div className="p-3 rounded-xl bg-[#111820] border border-[#2A3441]">
            <p className="text-xs text-[#6B7280] mb-1">Could Save</p>
            <p className="text-2xl font-bold text-[#22C55E]">
              {formatCurrency(analysis.potentialSavings)}
            </p>
          </div>

          {/* Categorized */}
          <div className="p-3 rounded-xl bg-[#111820] border border-[#2A3441]">
            <p className="text-xs text-[#6B7280] mb-1">Categorized</p>
            <p className="text-lg font-semibold text-white">
              {analysis.categorizedCount}
              <span className="text-sm text-[#6B7280] font-normal"> / {transactions.length}</span>
            </p>
          </div>

          {/* Yearly Projection */}
          <div className="p-3 rounded-xl bg-[#111820] border border-[#2A3441]">
            <p className="text-xs text-[#6B7280] mb-1">Red Zone /Year</p>
            <p className="text-lg font-semibold text-[#EF4444]">
              {formatCurrency(analysis.yearlyRedProjection)}
            </p>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-[#2A3441]" />

        {/* Feedback Message */}
        <div className={`p-4 rounded-xl border ${toneColors[feedback.tone]}`}>
          <h4 className={`text-sm font-semibold ${toneTextColors[feedback.tone]} mb-1`}>
            {feedback.title}
          </h4>
          <p className="text-sm text-[#9BA4B0] leading-relaxed">
            {feedback.message}
          </p>
        </div>

        {/* Investment Opportunity callout */}
        {analysis.potentialSavings > 100 && (
          <div className="p-4 rounded-xl bg-gradient-to-r from-[#22C55E]/10 to-[#3B82F6]/10 border border-[#22C55E]/20">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-[#22C55E]/20 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-[#22C55E]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-[#22C55E] mb-1">Investment Opportunity</h4>
                <p className="text-xs text-[#9BA4B0] leading-relaxed">
                  Redirect {formatCurrency(analysis.potentialSavings)} from red zone spending.
                  At 7% annual return, that&apos;s {formatCurrency(analysis.potentialSavings * 0.07)} in yearly gains.
                  In 10 years: {formatCurrency(analysis.potentialSavings * Math.pow(1.07, 10))}.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Divider */}
        <div className="border-t border-[#2A3441]" />

        {/* Income vs Spending Section */}
        {hasActiveIncome ? (
          <IncomeVsSpendingSection
            monthlyIncome={incomeCalc.monthlyIncome}
            monthlySpending={analysis.totalCategorized}
            onEditIncome={() => setShowIncomeModal(true)}
          />
        ) : (
          <button
            onClick={() => setShowIncomeModal(true)}
            className="w-full p-4 rounded-xl border border-dashed border-[#2A3441] hover:border-[#22C55E] transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#22C55E]/10 flex items-center justify-center group-hover:bg-[#22C55E]/20 transition-colors flex-shrink-0">
                <svg className="w-5 h-5 text-[#22C55E]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-white">Add your income</p>
                <p className="text-xs text-[#6B7280]">See your savings rate and budget insights</p>
              </div>
            </div>
          </button>
        )}
      </div>

      {/* Income Modal */}
      <IncomeSettingsModal
        userId={userId}
        isOpen={showIncomeModal}
        onClose={() => setShowIncomeModal(false)}
      />
    </div>
  );
}

// Income vs Spending sub-component
function IncomeVsSpendingSection({
  monthlyIncome,
  monthlySpending,
  onEditIncome,
}: {
  monthlyIncome: number;
  monthlySpending: number;
  onEditIncome: () => void;
}) {
  const monthlySavings = monthlyIncome - monthlySpending;
  const savingsRate = monthlyIncome > 0 ? (monthlySavings / monthlyIncome) * 100 : 0;
  const spendingRate = monthlyIncome > 0 ? (monthlySpending / monthlyIncome) * 100 : 0;

  const getStatus = () => {
    if (savingsRate >= 20) return { label: 'Excellent', color: 'text-[#22C55E]', bg: 'bg-[#22C55E]/10' };
    if (savingsRate >= 10) return { label: 'Good', color: 'text-[#3B82F6]', bg: 'bg-[#3B82F6]/10' };
    if (savingsRate >= 0) return { label: 'Thin', color: 'text-[#EAB308]', bg: 'bg-[#EAB308]/10' };
    return { label: 'Deficit', color: 'text-[#EF4444]', bg: 'bg-[#EF4444]/10' };
  };

  const status = getStatus();

  return (
    <div className="space-y-3">
      {/* Header with edit button */}
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-white">Income vs Spending</h4>
        <button
          onClick={onEditIncome}
          className="text-xs text-[#6B7280] hover:text-white transition-colors"
        >
          Edit income
        </button>
      </div>

      {/* Visual comparison bars */}
      <div className="space-y-2">
        {/* Income */}
        <div className="flex items-center gap-3">
          <span className="text-xs text-[#6B7280] w-16">Income</span>
          <div className="flex-1 h-2 bg-[#1F2937] rounded-full overflow-hidden">
            <div className="h-full bg-[#22C55E] w-full" />
          </div>
          <span className="text-xs text-[#22C55E] font-medium w-20 text-right">
            {formatCurrency(monthlyIncome)}
          </span>
        </div>

        {/* Spending */}
        <div className="flex items-center gap-3">
          <span className="text-xs text-[#6B7280] w-16">Spending</span>
          <div className="flex-1 h-2 bg-[#1F2937] rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                spendingRate > 100 ? 'bg-[#EF4444]' : spendingRate > 80 ? 'bg-[#EAB308]' : 'bg-[#3B82F6]'
              }`}
              style={{ width: `${Math.min(spendingRate, 100)}%` }}
            />
          </div>
          <span className="text-xs text-white font-medium w-20 text-right">
            {formatCurrency(monthlySpending)}
          </span>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-2">
        <div className={`p-2 rounded-lg ${status.bg}`}>
          <p className="text-[10px] text-[#6B7280]">
            {monthlySavings >= 0 ? 'Savings' : 'Deficit'}
          </p>
          <p className={`text-sm font-bold ${status.color}`}>
            {monthlySavings >= 0 ? formatCurrency(monthlySavings) : `-${formatCurrency(Math.abs(monthlySavings))}`}
          </p>
        </div>
        <div className={`p-2 rounded-lg ${status.bg}`}>
          <p className="text-[10px] text-[#6B7280]">Savings Rate</p>
          <p className={`text-sm font-bold ${status.color}`}>
            {Math.round(savingsRate)}%
            <span className="text-[10px] font-normal ml-1">{status.label}</span>
          </p>
        </div>
      </div>
    </div>
  );
}

export { SpendingAnalysis as default };
