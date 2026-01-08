// Savings Goals Page - Advisor Tier
// Manage savings goals and track progress

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSavingsGoals } from '@/hooks/use-savings-goals';
import { SavingsGoalCard } from '@/components/planner/savings-goal-card';
import {
  formatCurrency,
  formatTargetDate,
  getGoalTypeIcon,
  getGoalTypeLabel,
} from '@/lib/services/savings-calculator';
import type { SavingsGoal, SavingsGoalType } from '@/types';

const GOAL_TYPES: SavingsGoalType[] = [
  'EMERGENCY',
  'HOUSE',
  'RETIREMENT',
  'VACATION',
  'CAR',
  'EDUCATION',
  'CUSTOM',
];

export default function SavingsPage() {
  const {
    goals,
    projections,
    totalSavings,
    totalMonthlyContributions,
    savingsRate,
    addGoal,
    updateGoal,
    removeGoal,
    markCompleted,
    addContribution,
    getGoalIcon,
    getGoalLabel,
  } = useSavingsGoals();

  const [showAddModal, setShowAddModal] = useState(false);
  const [showContributionModal, setShowContributionModal] = useState<string | null>(null);

  // Get active and completed goals
  const activeGoals = goals.filter(g => !g.isCompleted);
  const completedGoals = goals.filter(g => g.isCompleted);

  // Get projection for a goal
  const getProjectionForGoal = (goalId: string) => {
    return projections.find(p => p.goalId === goalId);
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header with Back Link */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link
              href="/dashboard/planner"
              className="text-[#9BA4B0] hover:text-[white] transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <h1 className="text-2xl font-bold text-[white]">Savings Goals</h1>
          </div>
          <p className="text-[#9BA4B0]">
            Set specific targets, track progress, and actually reach your goals.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 rounded text-sm font-medium text-white bg-gradient-to-r from-[#22C55E] to-[#16A34A] hover:opacity-90 transition-opacity"
        >
          + Add Goal
        </button>
      </div>

      {/* Goal Types Guide */}
      <div className="p-5 rounded bg-gradient-to-br from-[#111820] to-[#000000] border border-[#424242]">
        <h3 className="font-semibold text-[white] mb-3">Start With The Essentials</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="p-3 rounded bg-[#000000]">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">🛡️</span>
              <span className="font-medium text-[white]">Emergency Fund</span>
            </div>
            <p className="text-xs text-[#9BA4B0]">
              3-6 months of expenses. Non-negotiable. This protects everything else.
            </p>
            <p className="text-[10px] text-[#22C55E] mt-2">Recommended: $10,000-$25,000</p>
          </div>
          <div className="p-3 rounded bg-[#000000]">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">🏠</span>
              <span className="font-medium text-[white]">House Down Payment</span>
            </div>
            <p className="text-xs text-[#9BA4B0]">
              20% down avoids PMI. Even 10% gets you in the door with better rates.
            </p>
            <p className="text-[10px] text-[#FFC700] mt-2">Typical: $30,000-$100,000</p>
          </div>
          <div className="p-3 rounded bg-[#000000]">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">📈</span>
              <span className="font-medium text-[white]">Retirement Boost</span>
            </div>
            <p className="text-xs text-[#9BA4B0]">
              Max out employer match first. Then IRA. Then extra brokerage savings.
            </p>
            <p className="text-[10px] text-[#FFC700] mt-2">Goal: 15% of income annually</p>
          </div>
        </div>
        <p className="text-xs text-[#9BA4B0] mt-4 pt-3 border-t border-[#424242]">
          💡 Pro tip: Save for fun stuff too. Vacations and cars aren&apos;t frivolous if you planned and saved for them.
        </p>
      </div>

      {/* Summary Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded bg-[#111820] border border-[#424242]">
          <p className="text-xs text-[#9BA4B0] mb-1">Total Saved</p>
          <p className="text-xl font-bold text-[#22C55E]">{formatCurrency(totalSavings)}</p>
        </div>
        <div className="p-4 rounded bg-[#111820] border border-[#424242]">
          <p className="text-xs text-[#9BA4B0] mb-1">Monthly</p>
          <p className="text-xl font-bold text-[white]">
            {formatCurrency(totalMonthlyContributions)}
          </p>
        </div>
        <div className="p-4 rounded bg-[#111820] border border-[#424242]">
          <p className="text-xs text-[#9BA4B0] mb-1">Savings Rate</p>
          <p className="text-xl font-bold text-[#FFC700]">{savingsRate}%</p>
        </div>
        <div className="p-4 rounded bg-[#111820] border border-[#424242]">
          <p className="text-xs text-[#9BA4B0] mb-1">Active Goals</p>
          <p className="text-xl font-bold text-[white]">{activeGoals.length}</p>
        </div>
      </div>

      {/* On Track / Behind Overview */}
      {activeGoals.length > 0 && (
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded bg-[#22C55E]/10 border border-[#22C55E]/30">
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-5 h-5 text-[#22C55E]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="font-medium text-[#22C55E]">On Track</span>
            </div>
            <p className="text-2xl font-bold text-[white]">
              {projections.filter(p => p.onTrack || !goals.find(g => g.id === p.goalId)?.targetDate).length}
            </p>
            <p className="text-xs text-[#9BA4B0]">goals on schedule</p>
          </div>
          <div className="p-4 rounded bg-[#EAB308]/10 border border-[#EAB308]/30">
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-5 h-5 text-[#EAB308]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span className="font-medium text-[#EAB308]">Behind Pace</span>
            </div>
            <p className="text-2xl font-bold text-[white]">
              {projections.filter(p => !p.onTrack && goals.find(g => g.id === p.goalId)?.targetDate).length}
            </p>
            <p className="text-xs text-[#9BA4B0]">need attention</p>
          </div>
        </div>
      )}

      {/* Goals Grid */}
      {activeGoals.length === 0 ? (
        <div className="p-12 text-center rounded bg-[#111820] border border-[#424242]">
          <div className="text-5xl mb-4">🎯</div>
          <h3 className="text-lg font-semibold text-[white] mb-2">
            No Savings Goals Yet
          </h3>
          <p className="text-sm text-[#9BA4B0] mb-6">
            Set your first goal and start building toward your future.
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-6 py-2 rounded text-sm font-medium text-white bg-gradient-to-r from-[#22C55E] to-[#16A34A] hover:opacity-90"
          >
            Create First Goal
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {activeGoals.map(goal => {
            const projection = getProjectionForGoal(goal.id);
            if (!projection) return null;

            return (
              <SavingsGoalCard
                key={goal.id}
                goal={goal}
                projection={projection}
                onEdit={(g) => console.log('Edit', g)}
                onDelete={removeGoal}
                onAddContribution={(id) => setShowContributionModal(id)}
              />
            );
          })}
        </div>
      )}

      {/* Completed Goals */}
      {completedGoals.length > 0 && (
        <div>
          <h3 className="font-semibold text-[white] mb-4">
            Completed ({completedGoals.length})
          </h3>
          <div className="space-y-3">
            {completedGoals.map(goal => (
              <div
                key={goal.id}
                className="flex items-center justify-between p-4 rounded bg-[#22C55E]/10 border border-[#22C55E]/30"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#22C55E] flex items-center justify-center">
                    <span className="text-lg">{goal.icon ?? getGoalIcon(goal.type)}</span>
                  </div>
                  <div>
                    <p className="font-medium text-[white]">{goal.name}</p>
                    <p className="text-xs text-[#9BA4B0]">
                      Completed {goal.completedDate?.toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <p className="text-lg font-semibold text-[#22C55E]">
                  {formatCurrency(goal.targetAmount)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Savings Tips */}
      <div className="p-6 rounded bg-[#111820] border border-[#424242]">
        <h3 className="font-semibold text-[white] mb-4">Savings Tips</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded bg-[#000000]">
            <div className="text-2xl mb-2">🎯</div>
            <h4 className="font-medium text-[white] mb-1">Automate It</h4>
            <p className="text-xs text-[#9BA4B0]">
              Set up automatic transfers right after payday. Out of sight, out of mind.
            </p>
          </div>
          <div className="p-4 rounded bg-[#000000]">
            <div className="text-2xl mb-2">📊</div>
            <h4 className="font-medium text-[white] mb-1">Track Progress</h4>
            <p className="text-xs text-[#9BA4B0]">
              Seeing your progress builds momentum. Small wins lead to big results.
            </p>
          </div>
          <div className="p-4 rounded bg-[#000000]">
            <div className="text-2xl mb-2">🔴</div>
            <h4 className="font-medium text-[white] mb-1">Redirect RED</h4>
            <p className="text-xs text-[#9BA4B0]">
              Every dollar you don&apos;t spend on RED can go straight to your goals.
            </p>
          </div>
        </div>
      </div>

      {/* Add Goal Modal */}
      {showAddModal && (
        <AddGoalModal
          onClose={() => setShowAddModal(false)}
          onAdd={(goal) => {
            addGoal(goal);
            setShowAddModal(false);
          }}
        />
      )}

      {/* Add Contribution Modal */}
      {showContributionModal && (
        <AddContributionModal
          goalId={showContributionModal}
          goalName={goals.find(g => g.id === showContributionModal)?.name ?? ''}
          onClose={() => setShowContributionModal(null)}
          onAdd={(amount, note) => {
            addContribution(showContributionModal, amount, note);
            setShowContributionModal(null);
          }}
        />
      )}
    </div>
  );
}

// Add Goal Modal
function AddGoalModal({
  onClose,
  onAdd,
}: {
  onClose: () => void;
  onAdd: (goal: Omit<SavingsGoal, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => void;
}) {
  const [name, setName] = useState('');
  const [type, setType] = useState<SavingsGoalType>('CUSTOM');
  const [targetAmount, setTargetAmount] = useState('');
  const [monthlyContribution, setMonthlyContribution] = useState('');
  const [targetDate, setTargetDate] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({
      name: name || getGoalTypeLabel(type),
      type,
      icon: getGoalTypeIcon(type),
      targetAmount: Number(targetAmount),
      currentAmount: 0,
      monthlyContribution: monthlyContribution ? Number(monthlyContribution) : null,
      targetDate: targetDate ? new Date(targetDate) : null,
      isCompleted: false,
      completedDate: null,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md p-6 rounded bg-[#111820] border border-[#424242]">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-[white]">Add Savings Goal</h2>
          <button
            onClick={onClose}
            className="p-2 rounded text-[#9BA4B0] hover:bg-[#000000]"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Goal Type */}
          <div>
            <label className="block text-sm text-[#9BA4B0] mb-2">Goal Type</label>
            <div className="grid grid-cols-4 gap-2">
              {GOAL_TYPES.map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className={`
                    p-2 rounded border text-center transition-all
                    ${type === t
                      ? 'border-[#22C55E] bg-[#22C55E]/10'
                      : 'border-[#424242] hover:border-[#9BA4B0]'
                    }
                  `}
                >
                  <span className="text-xl">{getGoalTypeIcon(t)}</span>
                  <p className="text-[10px] text-[#9BA4B0] mt-1 truncate">
                    {getGoalTypeLabel(t).split(' ')[0]}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Goal Name */}
          <div>
            <label className="block text-sm text-[#9BA4B0] mb-1">Goal Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={getGoalTypeLabel(type)}
              className="w-full px-4 py-2 rounded bg-[#000000] border border-[#424242] text-[white] focus:outline-none focus:ring-2 focus:ring-[#22C55E]/50"
            />
          </div>

          {/* Target Amount */}
          <div>
            <label className="block text-sm text-[#9BA4B0] mb-1">Target Amount</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9BA4B0]">$</span>
              <input
                type="number"
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
                placeholder="10,000"
                className="w-full pl-8 pr-4 py-2 rounded bg-[#000000] border border-[#424242] text-[white] focus:outline-none focus:ring-2 focus:ring-[#22C55E]/50"
                required
              />
            </div>
          </div>

          {/* Monthly Contribution */}
          <div>
            <label className="block text-sm text-[#9BA4B0] mb-1">
              Monthly Contribution (optional)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9BA4B0]">$</span>
              <input
                type="number"
                value={monthlyContribution}
                onChange={(e) => setMonthlyContribution(e.target.value)}
                placeholder="500"
                className="w-full pl-8 pr-12 py-2 rounded bg-[#000000] border border-[#424242] text-[white] focus:outline-none focus:ring-2 focus:ring-[#22C55E]/50"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9BA4B0]">/mo</span>
            </div>
          </div>

          {/* Target Date */}
          <div>
            <label className="block text-sm text-[#9BA4B0] mb-1">
              Target Date (optional)
            </label>
            <input
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className="w-full px-4 py-2 rounded bg-[#000000] border border-[#424242] text-[white] focus:outline-none focus:ring-2 focus:ring-[#22C55E]/50"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 rounded text-sm font-medium text-[#9BA4B0] border border-[#424242] hover:bg-[#000000]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 rounded text-sm font-medium text-white bg-gradient-to-r from-[#22C55E] to-[#16A34A] hover:opacity-90"
            >
              Add Goal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Add Contribution Modal
function AddContributionModal({
  goalId,
  goalName,
  onClose,
  onAdd,
}: {
  goalId: string;
  goalName: string;
  onClose: () => void;
  onAdd: (amount: number, note?: string) => void;
}) {
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd(Number(amount), note || undefined);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-sm p-6 rounded bg-[#111820] border border-[#424242]">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-[white]">Add Contribution</h2>
          <button
            onClick={onClose}
            className="p-2 rounded text-[#9BA4B0] hover:bg-[#000000]"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <p className="text-sm text-[#9BA4B0] mb-4">
          Adding to: <span className="font-medium text-[white]">{goalName}</span>
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-[#9BA4B0] mb-1">Amount</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9BA4B0]">$</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="100"
                className="w-full pl-8 pr-4 py-2 rounded bg-[#000000] border border-[#424242] text-[white] focus:outline-none focus:ring-2 focus:ring-[#22C55E]/50"
                required
                autoFocus
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-[#9BA4B0] mb-1">
              Note (optional)
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g., Tax refund"
              className="w-full px-4 py-2 rounded bg-[#000000] border border-[#424242] text-[white] focus:outline-none focus:ring-2 focus:ring-[#22C55E]/50"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 rounded text-sm font-medium text-[#9BA4B0] border border-[#424242] hover:bg-[#000000]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 rounded text-sm font-medium text-white bg-gradient-to-r from-[#22C55E] to-[#16A34A] hover:opacity-90"
            >
              Add
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
