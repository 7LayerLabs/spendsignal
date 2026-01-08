// Savings Goal Card Component
// Displays a savings goal with progress and projections

'use client';

import { useState } from 'react';
import type { SavingsGoalWithContributions, SavingsProjection } from '@/types';
import {
  formatCurrency,
  formatTargetDate,
  getGoalTypeIcon,
  getAmountToNextMilestone,
} from '@/lib/services/savings-calculator';

interface SavingsGoalCardProps {
  goal: SavingsGoalWithContributions;
  projection: SavingsProjection;
  onEdit?: (goal: SavingsGoalWithContributions) => void;
  onDelete?: (id: string) => void;
  onAddContribution?: (goalId: string) => void;
}

export function SavingsGoalCard({
  goal,
  projection,
  onEdit,
  onDelete,
  onAddContribution,
}: SavingsGoalCardProps) {
  const [showDetails, setShowDetails] = useState(false);

  const icon = goal.icon ?? getGoalTypeIcon(goal.type);
  const amountToNextMilestone = getAmountToNextMilestone(goal.currentAmount, goal.targetAmount);

  // Get progress bar color based on whether on track
  const getProgressColor = () => {
    if (projection.progressPercent >= 100) return 'from-[#22C55E] to-[#16A34A]';
    if (!goal.targetDate) return 'from-[#3B82F6] to-[#2563EB]';
    if (projection.onTrack) return 'from-[#22C55E] to-[#16A34A]';
    return 'from-[#EAB308] to-[#CA8A04]';
  };

  // Format months to goal
  const formatMonthsToGoal = (months: number) => {
    if (months === Infinity) return 'Unknown';
    if (months <= 0) return 'Complete!';
    if (months < 12) return `${months} months`;
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    if (remainingMonths === 0) return `${years} year${years > 1 ? 's' : ''}`;
    return `${years}y ${remainingMonths}mo`;
  };

  return (
    <div className="p-4 rounded-xl bg-[var(--card)] border border-[var(--border)] transition-all hover:border-[var(--foreground-muted)]/50">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{icon}</span>
          <div>
            <h3 className="font-semibold text-[var(--foreground)]">{goal.name}</h3>
            <p className="text-sm text-[var(--foreground-muted)]">
              {formatCurrency(goal.monthlyContribution ?? 0)}/month
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          {onAddContribution && (
            <button
              onClick={() => onAddContribution(goal.id)}
              className="p-2 rounded-lg text-[#22C55E] hover:bg-[#22C55E]/10 transition-colors"
              aria-label="Add contribution"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </button>
          )}
          {onEdit && (
            <button
              onClick={() => onEdit(goal)}
              className="p-2 rounded-lg text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-[var(--background)] transition-colors"
              aria-label="Edit goal"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(goal.id)}
              className="p-2 rounded-lg text-[var(--foreground-muted)] hover:text-[#EF4444] hover:bg-[#EF4444]/10 transition-colors"
              aria-label="Delete goal"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Amount Display */}
      <div className="flex items-baseline gap-2 mb-3">
        <span className="text-2xl font-bold text-[var(--foreground)]">
          {formatCurrency(goal.currentAmount)}
        </span>
        <span className="text-sm text-[var(--foreground-muted)]">
          of {formatCurrency(goal.targetAmount)}
        </span>
        <span className="ml-auto text-lg font-semibold text-[#22C55E]">
          {projection.progressPercent.toFixed(1)}%
        </span>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="h-3 bg-[var(--background)] rounded-full overflow-hidden">
          <div
            className={`h-full bg-gradient-to-r ${getProgressColor()} rounded-full transition-all duration-500`}
            style={{ width: `${Math.min(100, projection.progressPercent)}%` }}
          />
        </div>
      </div>

      {/* Status Row */}
      <div className="flex items-center justify-between text-sm">
        {goal.targetDate ? (
          <>
            <div>
              <span className="text-[var(--foreground-muted)]">Target: </span>
              <span className="font-medium text-[var(--foreground)]">
                {formatTargetDate(goal.targetDate)}
              </span>
            </div>
            <div className={`
              px-2 py-0.5 rounded-full text-xs font-medium
              ${projection.onTrack
                ? 'bg-[#22C55E]/10 text-[#22C55E]'
                : 'bg-[#EAB308]/10 text-[#EAB308]'
              }
            `}>
              {projection.onTrack ? '✓ On Track' : '⚠ Behind Pace'}
            </div>
          </>
        ) : (
          <div>
            <span className="text-[var(--foreground-muted)]">Projected: </span>
            <span className="font-medium text-[var(--foreground)]">
              {formatTargetDate(projection.projectedCompletionDate)}
            </span>
          </div>
        )}
      </div>

      {/* Expandable Details */}
      <button
        onClick={() => setShowDetails(!showDetails)}
        className="w-full mt-3 pt-3 border-t border-[var(--border)] flex items-center justify-center gap-2 text-xs text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors"
      >
        <span>{showDetails ? 'Hide' : 'Show'} details</span>
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
        <div className="mt-3 space-y-3">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-lg bg-[var(--background)]">
              <p className="text-xs text-[var(--foreground-muted)]">Remaining</p>
              <p className="font-semibold text-[var(--foreground)]">
                {formatCurrency(goal.targetAmount - goal.currentAmount)}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-[var(--background)]">
              <p className="text-xs text-[var(--foreground-muted)]">Time to Goal</p>
              <p className="font-semibold text-[var(--foreground)]">
                {formatMonthsToGoal(projection.monthsToGoal)}
              </p>
            </div>
            {goal.targetDate && projection.monthlyNeededForTarget && (
              <div className="p-3 rounded-lg bg-[var(--background)] col-span-2">
                <p className="text-xs text-[var(--foreground-muted)]">Monthly needed for target</p>
                <p className={`font-semibold ${
                  projection.onTrack ? 'text-[#22C55E]' : 'text-[#EAB308]'
                }`}>
                  {formatCurrency(projection.monthlyNeededForTarget)}/month
                </p>
              </div>
            )}
          </div>

          {/* Next Milestone */}
          {amountToNextMilestone > 0 && (
            <div className="p-3 rounded-lg bg-[#3B82F6]/10 border border-[#3B82F6]/30">
              <p className="text-xs text-[#3B82F6] mb-1">Next Milestone</p>
              <p className="text-sm text-[var(--foreground)]">
                <span className="font-semibold">{formatCurrency(amountToNextMilestone)}</span>{' '}
                to reach{' '}
                <span className="font-semibold">
                  {Math.ceil(((goal.currentAmount + amountToNextMilestone) / goal.targetAmount) * 100)}%
                </span>
              </p>
            </div>
          )}

          {/* Recent Contributions */}
          {goal.contributions.length > 0 && (
            <div>
              <p className="text-xs text-[var(--foreground-muted)] mb-2">Recent Contributions</p>
              <div className="space-y-1">
                {goal.contributions.slice(-3).reverse().map(c => (
                  <div key={c.id} className="flex justify-between text-sm">
                    <span className="text-[var(--foreground-muted)]">
                      {new Date(c.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                    <span className="font-medium text-[#22C55E]">+{formatCurrency(c.amount)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
