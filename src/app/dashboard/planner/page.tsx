// Financial Planner Dashboard - Advisor Tier
// Overview of debt payoff and savings goals with smart recommendations

'use client';

import Link from 'next/link';
import { useDebts } from '@/hooks/use-debts';
import { useSavingsGoals } from '@/hooks/use-savings-goals';
import { SmartRecommendationList } from '@/components/planner/smart-recommendation';
import { generateRecommendations } from '@/lib/services/recommendation-engine';
import { formatCurrency } from '@/lib/services/debt-calculator';
import { useMemo } from 'react';

export default function PlannerPage() {
  const {
    debts,
    totalDebt,
    debtFreeDate,
    totalMinimumPayment,
    extraPayment,
    payoffPlan,
  } = useDebts();

  const {
    goals,
    totalSavings,
    totalMonthlyContributions,
    savingsRate,
    projections,
  } = useSavingsGoals();

  // Generate recommendations
  const recommendations = useMemo(() => {
    return generateRecommendations({
      monthlyIncome: 5000, // Demo value
      monthlySpending: {
        GREEN: 2500,
        YELLOW: 800,
        RED: 340,
      },
      debts,
      savingsGoals: goals,
      debtPayoffPlan: payoffPlan,
      savingsProjections: projections,
    });
  }, [debts, goals, payoffPlan, projections]);

  // Calculate net worth trend (demo)
  const netWorthTrend = totalSavings - totalDebt;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[white]">Financial Planner</h1>
        <p className="text-[#9BA4B0]">
          Your command center for debt payoff and savings goals.
        </p>
      </div>

      {/* Philosophy Banner */}
      <div className="p-5 rounded bg-gradient-to-r from-[#FFC700]/10 via-[#111820] to-[#FFC700]/10 border border-[#424242]">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded bg-[#000000]">
            <svg className="w-6 h-6 text-[#FFC700]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-[white] mb-1">The Simple Math of Financial Freedom</h3>
            <p className="text-sm text-[#9BA4B0]">
              <span className="text-[#EF4444] font-medium">Debt costs you money</span> in interest.
              <span className="text-[#22C55E] font-medium"> Savings makes you money</span> through growth.
              Every dollar you move from debt to savings flips from working against you to working for you.
            </p>
            <div className="flex gap-4 mt-3 text-xs">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-[#EF4444]" />
                <span className="text-[#9BA4B0]">Focus here first</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-[#22C55E]" />
                <span className="text-[#9BA4B0]">Build this simultaneously</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Debt Card */}
        <div className="p-5 rounded bg-[#111820] border border-[#424242]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-[#9BA4B0]">Total Debt</span>
            <div className="p-2 rounded bg-[#EF4444]/10">
              <svg className="w-4 h-4 text-[#EF4444]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </div>
          </div>
          <p className="text-2xl font-bold text-[#EF4444]">{formatCurrency(totalDebt)}</p>
          <p className="text-xs text-[#6B7280] mt-1">
            Debt-free: {debtFreeDate}
          </p>
        </div>

        {/* Total Savings Card */}
        <div className="p-5 rounded bg-[#111820] border border-[#424242]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-[#9BA4B0]">Total Savings</span>
            <div className="p-2 rounded bg-[#22C55E]/10">
              <svg className="w-4 h-4 text-[#22C55E]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
            </div>
          </div>
          <p className="text-2xl font-bold text-[#22C55E]">{formatCurrency(totalSavings)}</p>
          <p className="text-xs text-[#6B7280] mt-1">
            {savingsRate}% savings rate
          </p>
        </div>

        {/* Monthly Debt Payment */}
        <div className="p-5 rounded bg-[#111820] border border-[#424242]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-[#9BA4B0]">Monthly to Debt</span>
            <div className="p-2 rounded bg-[#EAB308]/10">
              <svg className="w-4 h-4 text-[#EAB308]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p className="text-2xl font-bold text-[white]">
            {formatCurrency(totalMinimumPayment + extraPayment)}
          </p>
          <p className="text-xs text-[#6B7280] mt-1">
            {formatCurrency(extraPayment)} extra
          </p>
        </div>

        {/* Monthly to Savings */}
        <div className="p-5 rounded bg-[#111820] border border-[#424242]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-[#9BA4B0]">Monthly to Savings</span>
            <div className="p-2 rounded bg-[#FFC700]/10">
              <svg className="w-4 h-4 text-[#FFC700]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
          <p className="text-2xl font-bold text-[white]">
            {formatCurrency(totalMonthlyContributions)}
          </p>
          <p className="text-xs text-[#6B7280] mt-1">
            Across {goals.filter(g => !g.isCompleted).length} goals
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Debt Payoff Section */}
        <Link
          href="/dashboard/planner/debts"
          className="group p-6 rounded bg-gradient-to-br from-[#EF4444]/10 to-[#EF4444]/5 border border-[#EF4444]/20 hover:border-[#EF4444]/40 transition-all"
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-[white] mb-1">Debt Payoff Planner</h2>
              <p className="text-sm text-[#9BA4B0]">
                Snowball or Avalanche strategies • {debts.filter(d => !d.isPaidOff).length} active debts
              </p>
            </div>
            <div className="p-3 rounded bg-[#EF4444]/10 group-hover:bg-[#EF4444]/20 transition-colors">
              <svg className="w-6 h-6 text-[#EF4444]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-xs text-[#9BA4B0]">Total Balance</p>
              <p className="text-lg font-semibold text-[#EF4444]">{formatCurrency(totalDebt)}</p>
            </div>
            <div>
              <p className="text-xs text-[#9BA4B0]">Debt-Free Date</p>
              <p className="text-lg font-semibold text-[white]">{debtFreeDate}</p>
            </div>
          </div>

          {/* Progress Bar */}
          {payoffPlan.debts.length > 0 && (
            <div>
              <div className="flex justify-between text-xs text-[#9BA4B0] mb-1">
                <span>First debt payoff</span>
                <span>{payoffPlan.debts[0]?.monthsToPayoff} months</span>
              </div>
              <div className="h-2 bg-[#000000] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#EF4444] to-[#F97316] rounded-full"
                  style={{ width: '30%' }}
                />
              </div>
            </div>
          )}

          <div className="flex items-center justify-end mt-4 text-sm font-medium text-[#EF4444] group-hover:translate-x-1 transition-transform">
            Manage Debts
            <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </Link>

        {/* Savings Goals Section */}
        <Link
          href="/dashboard/planner/savings"
          className="group p-6 rounded bg-gradient-to-br from-[#22C55E]/10 to-[#22C55E]/5 border border-[#22C55E]/20 hover:border-[#22C55E]/40 transition-all"
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-[white] mb-1">Savings Goals</h2>
              <p className="text-sm text-[#9BA4B0]">
                Track progress toward any target • {goals.filter(g => !g.isCompleted).length} active goals
              </p>
            </div>
            <div className="p-3 rounded bg-[#22C55E]/10 group-hover:bg-[#22C55E]/20 transition-colors">
              <svg className="w-6 h-6 text-[#22C55E]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-xs text-[#9BA4B0]">Total Saved</p>
              <p className="text-lg font-semibold text-[#22C55E]">{formatCurrency(totalSavings)}</p>
            </div>
            <div>
              <p className="text-xs text-[#9BA4B0]">Monthly</p>
              <p className="text-lg font-semibold text-[white]">
                {formatCurrency(totalMonthlyContributions)}
              </p>
            </div>
          </div>

          {/* Goals Preview */}
          <div className="space-y-2">
            {goals.filter(g => !g.isCompleted).slice(0, 2).map(goal => (
              <div key={goal.id} className="flex items-center gap-2">
                <span className="text-sm">{goal.icon}</span>
                <span className="text-xs text-[#9BA4B0] flex-1 truncate">{goal.name}</span>
                <span className="text-xs font-medium text-[white]">
                  {((goal.currentAmount / goal.targetAmount) * 100).toFixed(0)}%
                </span>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-end mt-4 text-sm font-medium text-[#22C55E] group-hover:translate-x-1 transition-transform">
            Manage Goals
            <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </Link>
      </div>

      {/* Smart Recommendations */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-[white]">Smart Recommendations</h2>
          <span className="text-sm text-[#9BA4B0]">
            {recommendations.length} suggestions
          </span>
        </div>
        <SmartRecommendationList recommendations={recommendations} maxDisplay={4} />
      </div>

      {/* Net Worth Summary */}
      <div className="p-6 rounded bg-[#111820] border border-[#424242]">
        <h2 className="text-lg font-semibold text-[white] mb-4">Net Position</h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-[#9BA4B0] mb-1">Assets - Liabilities</p>
            <p className={`text-3xl font-bold ${netWorthTrend >= 0 ? 'text-[#22C55E]' : 'text-[#EF4444]'}`}>
              {formatCurrency(Math.abs(netWorthTrend))}
              {netWorthTrend < 0 && ' (in debt)'}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-[#9BA4B0]">Total Savings</p>
            <p className="text-lg font-semibold text-[#22C55E]">{formatCurrency(totalSavings)}</p>
            <p className="text-xs text-[#9BA4B0] mt-2">Total Debt</p>
            <p className="text-lg font-semibold text-[#EF4444]">{formatCurrency(totalDebt)}</p>
          </div>
        </div>

        {netWorthTrend < 0 && (
          <div className="mt-4 p-3 rounded bg-[#EAB308]/10 border border-[#EAB308]/30">
            <p className="text-sm text-[white]">
              <span className="font-medium">You&apos;re in the debt zone.</span> Focus on high-interest debt first.
              Every dollar to debt is a step toward financial freedom.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
