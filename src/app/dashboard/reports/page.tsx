'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useDemoTransactions } from '@/hooks/use-demo-transactions';
import { useDemoCategorization } from '@/hooks/use-categorization';
import { useIncome } from '@/hooks/use-income';
import { formatCurrency } from '@/lib/utils';
import type { TrafficLightZone } from '@/constants/traffic-light';

const ZONE_COLORS: Record<TrafficLightZone, string> = {
  GREEN: '#22C55E',
  YELLOW: '#EAB308',
  RED: '#EF4444',
  UNCATEGORIZED: '#3B82F6',
};

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export default function ReportsPage() {
  const { transactions, isLoading } = useDemoTransactions('demo-user', 30);
  const { categorizations } = useDemoCategorization('demo-user');
  const { calculations: incomeCalc, hasActiveIncome } = useIncome('demo-user');

  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth());
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());

  // Create categorization map
  const categorizationMap = useMemo(() => {
    const map = new Map<string, TrafficLightZone>();
    categorizations.forEach((c) => map.set(c.transactionId, c.zone));
    return map;
  }, [categorizations]);

  // Generate report data
  const reportData = useMemo(() => {
    const zones = {
      GREEN: { amount: 0, count: 0, transactions: [] as typeof transactions },
      YELLOW: { amount: 0, count: 0, transactions: [] as typeof transactions },
      RED: { amount: 0, count: 0, transactions: [] as typeof transactions },
    };

    let totalSpending = 0;
    let categorizedCount = 0;

    transactions.forEach((t) => {
      const zone = categorizationMap.get(t.id);
      const amount = Math.abs(Number(t.amount));

      if (zone && zone !== 'UNCATEGORIZED') {
        zones[zone].amount += amount;
        zones[zone].count++;
        zones[zone].transactions.push(t);
        totalSpending += amount;
        categorizedCount++;
      }
    });

    // Calculate percentages
    const greenPercent = totalSpending > 0 ? (zones.GREEN.amount / totalSpending) * 100 : 0;
    const yellowPercent = totalSpending > 0 ? (zones.YELLOW.amount / totalSpending) * 100 : 0;
    const redPercent = totalSpending > 0 ? (zones.RED.amount / totalSpending) * 100 : 0;

    // Health score
    const healthScore = Math.max(0, Math.min(100, greenPercent + (yellowPercent * 0.5) - (redPercent * 0.5)));

    // Top merchants by zone
    const merchantsByZone: Record<string, Map<string, number>> = {
      GREEN: new Map(),
      YELLOW: new Map(),
      RED: new Map(),
    };

    (['GREEN', 'YELLOW', 'RED'] as const).forEach((zone) => {
      zones[zone].transactions.forEach((t) => {
        const merchant = t.merchantName || 'Unknown';
        const current = merchantsByZone[zone].get(merchant) || 0;
        merchantsByZone[zone].set(merchant, current + Math.abs(Number(t.amount)));
      });
    });

    const topMerchants = (['GREEN', 'YELLOW', 'RED'] as const).map((zone) => ({
      zone,
      merchants: Array.from(merchantsByZone[zone].entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name, amount]) => ({ name, amount })),
    }));

    // Savings calculation
    const monthlySavings = hasActiveIncome ? incomeCalc.monthlyIncome - totalSpending : 0;
    const savingsRate = hasActiveIncome && incomeCalc.monthlyIncome > 0
      ? (monthlySavings / incomeCalc.monthlyIncome) * 100
      : 0;

    return {
      zones,
      totalSpending,
      categorizedCount,
      uncategorizedCount: transactions.length - categorizedCount,
      greenPercent,
      yellowPercent,
      redPercent,
      healthScore,
      topMerchants,
      monthlyIncome: hasActiveIncome ? incomeCalc.monthlyIncome : null,
      monthlySavings,
      savingsRate,
    };
  }, [transactions, categorizationMap, hasActiveIncome, incomeCalc]);

  // Generate insights
  const insights = useMemo(() => {
    const list: string[] = [];

    if (reportData.redPercent > 20) {
      list.push(`Red zone spending is ${Math.round(reportData.redPercent)}% of total. Target under 15%.`);
    } else if (reportData.redPercent < 10) {
      list.push(`Excellent control on red zone spending at ${Math.round(reportData.redPercent)}%.`);
    }

    if (reportData.greenPercent > 70) {
      list.push(`${Math.round(reportData.greenPercent)}% on essentials shows strong prioritization.`);
    } else if (reportData.greenPercent < 50) {
      list.push(`Only ${Math.round(reportData.greenPercent)}% on essentials. Review your priorities.`);
    }

    if (reportData.uncategorizedCount > 0) {
      list.push(`${reportData.uncategorizedCount} transactions still uncategorized. Complete your review.`);
    }

    if (reportData.savingsRate >= 20) {
      list.push(`${Math.round(reportData.savingsRate)}% savings rate is excellent. Keep it up.`);
    } else if (reportData.savingsRate < 10 && reportData.monthlyIncome) {
      list.push(`Savings rate of ${Math.round(reportData.savingsRate)}% is below recommended 20%.`);
    }

    if (reportData.zones.RED.amount > 0) {
      list.push(`Potential savings of ${formatCurrency(reportData.zones.RED.amount)} by eliminating red zone.`);
    }

    return list;
  }, [reportData]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 rounded-full border-2 border-[#22C55E] border-t-transparent animate-spin" />
          <p className="text-[#9BA4B0]">Generating report...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="p-2 -ml-2  text-[#9BA4B0] hover:text-[white] hover:bg-[white/5] transition-colors lg:hidden"
            aria-label="Back to Dashboard"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-[white]">Monthly Report</h1>
            <p className="text-sm text-[#9BA4B0] mt-1">
              Your spending breakdown and insights
            </p>
          </div>
        </div>

        {/* Month selector */}
        <div className="flex items-center gap-2">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
            className="px-4 py-2  bg-[#111820] border border-[#424242] text-[white] text-sm focus:border-[#FFC700] focus:outline-none"
          >
            {MONTHS.map((month, i) => (
              <option key={month} value={i}>{month}</option>
            ))}
          </select>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="px-4 py-2  bg-[#111820] border border-[#424242] text-[white] text-sm focus:border-[#FFC700] focus:outline-none"
          >
            {[2024, 2025, 2026].map((year) => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
          <button className="px-4 py-2  bg-[#22C55E] text-[white] text-sm font-medium hover:bg-[#16A34A] transition-colors flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export PDF
          </button>
        </div>
      </div>

      {/* Report Header Card */}
      <div className="p-6  bg-[#111820] border border-[#424242]">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-[white]">
              {MONTHS[selectedMonth]} {selectedYear}
            </h2>
            <p className="text-sm text-[#6B7280]">Monthly Spending Report</p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-[white]">{formatCurrency(reportData.totalSpending)}</p>
            <p className="text-sm text-[#6B7280]">Total Spending</p>
          </div>
        </div>

        {/* Zone breakdown bar */}
        <div className="space-y-3">
          <div className="h-4 rounded-full overflow-hidden flex bg-[#424242]">
            <div
              className="h-full transition-all duration-500"
              style={{ width: `${reportData.greenPercent}%`, backgroundColor: ZONE_COLORS.GREEN }}
            />
            <div
              className="h-full transition-all duration-500"
              style={{ width: `${reportData.yellowPercent}%`, backgroundColor: ZONE_COLORS.YELLOW }}
            />
            <div
              className="h-full transition-all duration-500"
              style={{ width: `${reportData.redPercent}%`, backgroundColor: ZONE_COLORS.RED }}
            />
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-[#22C55E]">{Math.round(reportData.greenPercent)}% Green</span>
            <span className="text-[#EAB308]">{Math.round(reportData.yellowPercent)}% Yellow</span>
            <span className="text-[#EF4444]">{Math.round(reportData.redPercent)}% Red</span>
          </div>
        </div>
      </div>

      {/* Main stats grid */}
      <div className="grid md:grid-cols-3 gap-4">
        {/* Health Score */}
        <div className="p-6  bg-[#111820] border border-[#424242]">
          <h3 className="text-sm font-medium text-[#6B7280] mb-4">Health Score</h3>
          <div className="relative w-32 h-32 mx-auto">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="40" fill="none" className="stroke-[#424242]" strokeWidth="10" />
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke={reportData.healthScore >= 70 ? '#22C55E' : reportData.healthScore >= 40 ? '#EAB308' : '#EF4444'}
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={`${(reportData.healthScore / 100) * 251} 251`}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span
                className="text-3xl font-bold"
                style={{ color: reportData.healthScore >= 70 ? '#22C55E' : reportData.healthScore >= 40 ? '#EAB308' : '#EF4444' }}
              >
                {Math.round(reportData.healthScore)}
              </span>
              <span className="text-xs text-[#6B7280]">/100</span>
            </div>
          </div>
        </div>

        {/* Zone Amounts */}
        <div className="p-6  bg-[#111820] border border-[#424242]">
          <h3 className="text-sm font-medium text-[#6B7280] mb-4">By Zone</h3>
          <div className="space-y-4">
            {(['GREEN', 'YELLOW', 'RED'] as const).map((zone) => (
              <div key={zone} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: ZONE_COLORS[zone] }} />
                  <span className="text-sm text-[#9BA4B0]">
                    {zone === 'GREEN' ? 'Essentials' : zone === 'YELLOW' ? 'Discretionary' : 'Avoidable'}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-[white]">{formatCurrency(reportData.zones[zone].amount)}</p>
                  <p className="text-xs text-[#6B7280]">{reportData.zones[zone].count} txns</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Savings Summary */}
        <div className="p-6  bg-[#111820] border border-[#424242]">
          <h3 className="text-sm font-medium text-[#6B7280] mb-4">Savings</h3>
          {reportData.monthlyIncome ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#9BA4B0]">Income</span>
                <span className="text-sm font-semibold text-[#22C55E]">{formatCurrency(reportData.monthlyIncome)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#9BA4B0]">Spending</span>
                <span className="text-sm font-semibold text-[white]">{formatCurrency(reportData.totalSpending)}</span>
              </div>
              <div className="pt-3 border-t border-[#424242]">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#9BA4B0]">Saved</span>
                  <span className={`text-lg font-bold ${reportData.monthlySavings >= 0 ? 'text-[#22C55E]' : 'text-[#EF4444]'}`}>
                    {reportData.monthlySavings >= 0 ? formatCurrency(reportData.monthlySavings) : `-${formatCurrency(Math.abs(reportData.monthlySavings))}`}
                  </span>
                </div>
                <p className="text-xs text-[#6B7280] mt-1">
                  {Math.round(reportData.savingsRate)}% savings rate
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-sm text-[#6B7280]">Add your income to see savings</p>
            </div>
          )}
        </div>
      </div>

      {/* Top Merchants by Zone */}
      <div className="grid md:grid-cols-3 gap-4">
        {reportData.topMerchants.map(({ zone, merchants }) => (
          <div key={zone} className="p-5  bg-[#111820] border border-[#424242]">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: ZONE_COLORS[zone] }} />
              <h3 className="text-sm font-medium text-[white]">
                Top {zone === 'GREEN' ? 'Essential' : zone === 'YELLOW' ? 'Discretionary' : 'Avoidable'} Merchants
              </h3>
            </div>
            {merchants.length > 0 ? (
              <div className="space-y-3">
                {merchants.map((m, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className="text-sm text-[#9BA4B0] truncate flex-1 mr-2">{m.name}</span>
                    <span className="text-sm font-medium text-[white]">{formatCurrency(m.amount)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-[#6B7280]">No transactions</p>
            )}
          </div>
        ))}
      </div>

      {/* Insights */}
      <div className="p-6  bg-gradient-to-br from-[#3B82F6]/10 to-[#111820] border border-[#FFC700]/20">
        <h3 className="text-lg font-semibold text-[white] mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-[#FFC700]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          Insights & Recommendations
        </h3>
        <div className="space-y-3">
          {insights.map((insight, i) => (
            <div key={i} className="flex items-start gap-3 p-3  bg-[#111820]/50">
              <div className="w-6 h-6 rounded-full bg-[#FFC700]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-medium text-[#FFC700]">{i + 1}</span>
              </div>
              <p className="text-sm text-[#9BA4B0]">{insight}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Premium badge */}
      <div className="flex items-center justify-center gap-2 text-sm text-[#6B7280]">
        <svg className="w-4 h-4 text-[#EAB308]" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
        <span>Premium Feature - PDF export available with subscription</span>
      </div>
    </div>
  );
}
