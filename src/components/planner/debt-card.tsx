// Debt Card Component
// Displays a single debt with progress and payoff info

'use client';

import { useState } from 'react';
import type { Debt, DebtPayoffSchedule } from '@/types';
import { formatCurrency, formatPercent, formatPayoffDate } from '@/lib/services/debt-calculator';

interface DebtCardProps {
  debt: Debt;
  schedule?: DebtPayoffSchedule;
  onEdit?: (debt: Debt) => void;
  onDelete?: (id: string) => void;
  onMarkPaidOff?: (id: string) => void;
  isFirst?: boolean;
}

export function DebtCard({
  debt,
  schedule,
  onEdit,
  onDelete,
  onMarkPaidOff,
  isFirst = false,
}: DebtCardProps) {
  const [showDetails, setShowDetails] = useState(false);

  // Calculate progress
  const originalBalance = debt.originalBalance ?? debt.balance;
  const paidOff = originalBalance - debt.balance;
  const progressPercent = originalBalance > 0
    ? Math.round((paidOff / originalBalance) * 100)
    : 0;

  // Get interest rate color based on severity
  const getInterestColor = (rate: number) => {
    if (rate >= 0.20) return 'text-[#EF4444]'; // 20%+ = red
    if (rate >= 0.15) return 'text-[#EAB308]'; // 15-20% = yellow
    return 'text-[#22C55E]'; // Under 15% = green
  };

  return (
    <div className={`
      p-4 rounded-xl border transition-all
      ${isFirst
        ? 'bg-gradient-to-br from-[#22C55E]/10 to-[#22C55E]/5 border-[#22C55E]/30'
        : 'bg-[var(--card)] border-[var(--border)]'
      }
    `}>
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            {isFirst && (
              <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full bg-[#22C55E] text-white">
                Pay First
              </span>
            )}
            <h3 className="font-semibold text-[var(--foreground)]">{debt.name}</h3>
          </div>
          <div className="flex items-center gap-4 mt-1">
            <span className="text-2xl font-bold text-[var(--foreground)]">
              {formatCurrency(debt.balance)}
            </span>
            <span className={`text-sm font-medium ${getInterestColor(debt.interestRate)}`}>
              {formatPercent(debt.interestRate)} APR
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          {onEdit && (
            <button
              onClick={() => onEdit(debt)}
              className="p-2 rounded-lg text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-[var(--background)] transition-colors"
              aria-label="Edit debt"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(debt.id)}
              className="p-2 rounded-lg text-[var(--foreground-muted)] hover:text-[#EF4444] hover:bg-[#EF4444]/10 transition-colors"
              aria-label="Delete debt"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-3">
        <div className="flex items-center justify-between text-xs text-[var(--foreground-muted)] mb-1">
          <span>{formatCurrency(paidOff)} paid</span>
          <span>{progressPercent}% complete</span>
        </div>
        <div className="h-2 bg-[var(--background)] rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#22C55E] to-[#16A34A] rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Payment Info */}
      <div className="flex items-center justify-between text-sm">
        <div>
          <span className="text-[var(--foreground-muted)]">Min payment: </span>
          <span className="font-medium text-[var(--foreground)]">
            {formatCurrency(debt.minimumPayment)}/mo
          </span>
        </div>
        {schedule && (
          <div className="text-right">
            <span className="text-[var(--foreground-muted)]">Payoff: </span>
            <span className="font-medium text-[var(--foreground)]">
              {formatPayoffDate(schedule.payoffDate)}
            </span>
          </div>
        )}
      </div>

      {/* Expandable Details */}
      {schedule && (
        <>
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="w-full mt-3 pt-3 border-t border-[var(--border)] flex items-center justify-center gap-2 text-xs text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors"
          >
            <span>{showDetails ? 'Hide' : 'Show'} payment details</span>
            <svg
              className={`w-4 h-4 transition-transform ${showDetails ? 'rotate-180' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showDetails && (
            <div className="mt-3 space-y-2">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-[var(--foreground-muted)]">Total Interest</p>
                  <p className="font-semibold text-[#EF4444]">
                    {formatCurrency(schedule.totalInterestPaid)}
                  </p>
                </div>
                <div>
                  <p className="text-[var(--foreground-muted)]">Total Payments</p>
                  <p className="font-semibold text-[var(--foreground)]">
                    {formatCurrency(schedule.totalAmountPaid)}
                  </p>
                </div>
                <div>
                  <p className="text-[var(--foreground-muted)]">Months to Payoff</p>
                  <p className="font-semibold text-[var(--foreground)]">
                    {schedule.monthsToPayoff} months
                  </p>
                </div>
                {debt.dueDate && (
                  <div>
                    <p className="text-[var(--foreground-muted)]">Due Date</p>
                    <p className="font-semibold text-[var(--foreground)]">
                      {debt.dueDate}th of month
                    </p>
                  </div>
                )}
              </div>

              {onMarkPaidOff && (
                <button
                  onClick={() => onMarkPaidOff(debt.id)}
                  className="w-full mt-2 py-2 px-4 rounded-lg text-sm font-medium bg-[#22C55E]/10 text-[#22C55E] hover:bg-[#22C55E]/20 transition-colors"
                >
                  Mark as Paid Off
                </button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
