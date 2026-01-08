'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useGoals, type GoalWithProgress } from '@/hooks/use-goals';
import { useDemoTransactions } from '@/hooks/use-demo-transactions';
import { useDemoCategorization } from '@/hooks/use-categorization';
import { formatCurrency } from '@/lib/utils';
import type { GoalType, GoalStatus, GoalTargetConfig } from '@/types';
import type { TrafficLightZone } from '@/constants/traffic-light';

const GOAL_TYPE_CONFIG: Record<GoalType, {
  label: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}> = {
  SPENDING_LIMIT: {
    label: 'Spending Limit',
    description: 'Set a maximum spending amount for a zone',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    color: '#3B82F6',
  },
  ZONE_RATIO: {
    label: 'Zone Ratio',
    description: 'Keep spending in a zone above/below a percentage',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
      </svg>
    ),
    color: '#EAB308',
  },
  STREAK: {
    label: 'Streak',
    description: 'Maintain days without RED zone spending',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
      </svg>
    ),
    color: '#EF4444',
  },
  SAVINGS_TARGET: {
    label: 'Savings Target',
    description: 'Set a savings goal to reach',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    ),
    color: '#22C55E',
  },
};

const ZONE_LABELS: Record<TrafficLightZone, string> = {
  GREEN: 'Green (Essentials)',
  YELLOW: 'Yellow (Discretionary)',
  RED: 'Red (Avoidable)',
  UNCATEGORIZED: 'Uncategorized',
};

const ZONE_COLORS: Record<TrafficLightZone, string> = {
  GREEN: '#22C55E',
  YELLOW: '#EAB308',
  RED: '#EF4444',
  UNCATEGORIZED: '#3B82F6',
};

export default function GoalsPage() {
  const { transactions, isLoading: txLoading } = useDemoTransactions('demo-user', 30);
  const { categorizations } = useDemoCategorization('demo-user');
  const {
    goals,
    activeGoals,
    completedGoals,
    isLoading: goalsLoading,
    addGoal,
    updateGoal,
    deleteGoal,
    updateStatus,
    zoneTotals,
  } = useGoals('demo-user', {
    transactions: transactions.map((t) => ({ id: t.id, amount: Number(t.amount), date: new Date(t.date) })),
    categorizations: categorizations.map((c) => ({ transactionId: c.transactionId, zone: c.zone })),
  });

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState<GoalWithProgress | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

  const isLoading = txLoading || goalsLoading;

  const filteredGoals = useMemo(() => {
    switch (filter) {
      case 'active':
        return activeGoals;
      case 'completed':
        return completedGoals;
      default:
        return goals;
    }
  }, [filter, goals, activeGoals, completedGoals]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 rounded-full border-2 border-[#22C55E] border-t-transparent animate-spin" />
          <p className="text-[#9BA4B0]">Loading goals...</p>
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
            <h1 className="text-2xl font-bold text-[white]">Spending Goals</h1>
            <p className="text-sm text-[#9BA4B0] mt-1">
              Set targets. Track progress. Build discipline.
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-[#16A34A] to-[#22C55E]  hover:shadow-[0_0_24px_rgba(34,197,94,0.4)] transition-all"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          New Goal
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4  bg-[#111820] border border-[#424242]">
          <p className="text-sm text-[#6B7280]">Active Goals</p>
          <p className="text-2xl font-bold text-[white] mt-1">{activeGoals.length}</p>
        </div>
        <div className="p-4  bg-[#111820] border border-[#424242]">
          <p className="text-sm text-[#6B7280]">Completed</p>
          <p className="text-2xl font-bold text-[#22C55E] mt-1">{completedGoals.length}</p>
        </div>
        <div className="p-4  bg-[#111820] border border-[#424242]">
          <p className="text-sm text-[#6B7280]">Red Zone Spending</p>
          <p className="text-2xl font-bold text-[#EF4444] mt-1">{formatCurrency(zoneTotals.RED)}</p>
        </div>
        <div className="p-4  bg-[#111820] border border-[#424242]">
          <p className="text-sm text-[#6B7280]">Total Spending</p>
          <p className="text-2xl font-bold text-[white] mt-1">{formatCurrency(zoneTotals.total)}</p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-1 p-1 bg-[#0D1117]  border border-[#424242] w-fit">
        {(['all', 'active', 'completed'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 text-sm font-medium  transition-colors ${
              filter === f
                ? 'bg-[#FFC700] text-black'
                : 'text-[#6B7280] hover:text-[white]'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
            {f === 'active' && activeGoals.length > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 text-xs rounded-full bg-white/20">
                {activeGoals.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Goals Grid */}
      {filteredGoals.length === 0 ? (
        <div className="p-12  bg-[#111820] border border-[#424242] text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#FFC700]/10 flex items-center justify-center">
            <svg className="w-8 h-8 text-[#FFC700]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-[white] mb-2">
            {filter === 'all' ? 'No goals yet' : `No ${filter} goals`}
          </h3>
          <p className="text-sm text-[#6B7280] mb-6">
            {filter === 'all'
              ? 'Set your first goal to start building better spending habits.'
              : filter === 'active'
              ? 'Create a new goal or check your completed goals.'
              : 'Complete some goals to see them here.'}
          </p>
          {filter === 'all' && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-[#22C55E]  hover:bg-[#16A34A] transition-colors"
            >
              Create your first goal
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filteredGoals.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              onEdit={() => setEditingGoal(goal)}
              onDelete={() => deleteGoal(goal.id)}
              onStatusChange={(status) => updateStatus(goal.id, status)}
            />
          ))}
        </div>
      )}

      {/* Suggested Goals */}
      {activeGoals.length === 0 && (
        <div className="p-6  bg-gradient-to-br from-[#3B82F6]/10 to-[#111820] border border-[#3B82F6]/20">
          <h3 className="text-lg font-semibold text-[white] mb-4">Suggested Goals</h3>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            <SuggestedGoalCard
              title="Keep RED under 15%"
              description="Limit avoidable spending to 15% of total"
              type="ZONE_RATIO"
              onClick={() => {
                addGoal({
                  type: 'ZONE_RATIO',
                  name: 'Keep RED zone under 15%',
                  description: 'Limit avoidable spending to 15% of total monthly spending',
                  targetConfig: { zone: 'RED', maxPercent: 15, period: 'monthly' },
                  targetValue: 15,
                });
              }}
            />
            <SuggestedGoalCard
              title="7-day RED-free streak"
              description="Go a full week without RED spending"
              type="STREAK"
              onClick={() => {
                addGoal({
                  type: 'STREAK',
                  name: '7-day RED-free streak',
                  description: 'Avoid all RED zone spending for 7 consecutive days',
                  targetConfig: { avoidDays: 7 },
                  targetValue: 7,
                });
              }}
            />
            <SuggestedGoalCard
              title="Cap RED at $200"
              description="Limit RED zone spending this month"
              type="SPENDING_LIMIT"
              onClick={() => {
                addGoal({
                  type: 'SPENDING_LIMIT',
                  name: 'Cap RED spending at $200',
                  description: 'Keep avoidable spending under $200 this month',
                  targetConfig: { zone: 'RED', amount: 200, period: 'monthly' },
                  targetValue: 200,
                });
              }}
            />
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      {(showCreateModal || editingGoal) && (
        <GoalModal
          goal={editingGoal}
          onClose={() => {
            setShowCreateModal(false);
            setEditingGoal(null);
          }}
          onSave={(data) => {
            if (editingGoal) {
              updateGoal(editingGoal.id, data);
            } else {
              addGoal(data);
            }
            setShowCreateModal(false);
            setEditingGoal(null);
          }}
        />
      )}
    </div>
  );
}

// Goal Card Component
function GoalCard({
  goal,
  onEdit,
  onDelete,
  onStatusChange,
}: {
  goal: GoalWithProgress;
  onEdit: () => void;
  onDelete: () => void;
  onStatusChange: (status: GoalStatus) => void;
}) {
  const config = GOAL_TYPE_CONFIG[goal.type];
  const isCompleted = goal.status === 'COMPLETED';
  const isPaused = goal.status === 'PAUSED';

  // Determine progress color
  const getProgressColor = () => {
    if (isCompleted) return '#22C55E';
    if (goal.progress >= 80) return '#22C55E';
    if (goal.progress >= 50) return '#EAB308';
    return '#EF4444';
  };

  // Format display value based on goal type
  const formatValue = (value: number) => {
    switch (goal.type) {
      case 'SPENDING_LIMIT':
      case 'SAVINGS_TARGET':
        return formatCurrency(value);
      case 'ZONE_RATIO':
        return `${Math.round(value)}%`;
      case 'STREAK':
        return `${Math.round(value)} days`;
      default:
        return value.toString();
    }
  };

  return (
    <div
      className={`p-5  border transition-all ${
        isCompleted
          ? 'bg-[#22C55E]/5 border-[#22C55E]/30'
          : isPaused
          ? 'bg-[#111820]/50 border-[#424242]/50 opacity-60'
          : 'bg-[#111820] border-[#424242] hover:border-[#FFC700]/50'
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10  flex items-center justify-center"
            style={{ backgroundColor: `${config.color}20`, color: config.color }}
          >
            {config.icon}
          </div>
          <div>
            <h3 className="text-base font-semibold text-[white]">{goal.name}</h3>
            <p className="text-xs text-[#6B7280]">{config.label}</p>
          </div>
        </div>

        {/* Actions menu */}
        <div className="flex items-center gap-1">
          {!isCompleted && (
            <button
              onClick={() => onStatusChange('COMPLETED')}
              className="p-1.5  text-[#6B7280] hover:text-[#22C55E] hover:bg-[#22C55E]/10 transition-colors"
              title="Mark complete"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </button>
          )}
          <button
            onClick={onEdit}
            className="p-1.5  text-[#6B7280] hover:text-[white] hover:bg-[white/5] transition-colors"
            title="Edit"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </button>
          <button
            onClick={onDelete}
            className="p-1.5  text-[#6B7280] hover:text-[#EF4444] hover:bg-[#EF4444]/10 transition-colors"
            title="Delete"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Description */}
      {goal.description && (
        <p className="text-sm text-[#9BA4B0] mb-4">{goal.description}</p>
      )}

      {/* Progress */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-[#6B7280]">Progress</span>
          <span className="font-medium" style={{ color: getProgressColor() }}>
            {Math.round(goal.progress)}%
          </span>
        </div>
        <div className="h-2 rounded-full bg-[#424242] overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${Math.min(goal.progress, 100)}%`,
              backgroundColor: getProgressColor(),
            }}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="mt-4 pt-4 border-t border-[#424242] flex items-center justify-between">
        <div>
          <p className="text-xs text-[#6B7280]">Current</p>
          <p className="text-sm font-semibold text-[white]">
            {formatValue(goal.currentValue || 0)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-[#6B7280]">Target</p>
          <p className="text-sm font-semibold text-[white]">
            {formatValue(goal.targetValue)}
          </p>
        </div>
      </div>

      {/* Status badge */}
      {isCompleted && (
        <div className="mt-3 flex items-center gap-2 text-xs text-[#22C55E]">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Completed
        </div>
      )}
    </div>
  );
}

// Suggested Goal Card
function SuggestedGoalCard({
  title,
  description,
  type,
  onClick,
}: {
  title: string;
  description: string;
  type: GoalType;
  onClick: () => void;
}) {
  const config = GOAL_TYPE_CONFIG[type];

  return (
    <button
      onClick={onClick}
      className="p-4  bg-[#111820] border border-[#424242] hover:border-[#FFC700]/50 transition-all text-left group"
    >
      <div className="flex items-center gap-3 mb-2">
        <div
          className="w-8 h-8  flex items-center justify-center"
          style={{ backgroundColor: `${config.color}20`, color: config.color }}
        >
          {config.icon}
        </div>
        <span className="text-sm font-medium text-[white] group-hover:text-[#FFC700] transition-colors">
          {title}
        </span>
      </div>
      <p className="text-xs text-[#6B7280]">{description}</p>
    </button>
  );
}

// Goal Modal Component
function GoalModal({
  goal,
  onClose,
  onSave,
}: {
  goal: GoalWithProgress | null;
  onClose: () => void;
  onSave: (data: {
    type: GoalType;
    name: string;
    description?: string;
    targetConfig: GoalTargetConfig;
    targetValue: number;
    endDate?: Date;
  }) => void;
}) {
  const [type, setType] = useState<GoalType>(goal?.type || 'SPENDING_LIMIT');
  const [name, setName] = useState(goal?.name || '');
  const [description, setDescription] = useState(goal?.description || '');
  const [zone, setZone] = useState<TrafficLightZone>(goal?.targetConfig.zone || 'RED');
  const [targetValue, setTargetValue] = useState(goal?.targetValue?.toString() || '');
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly'>(goal?.targetConfig.period || 'monthly');

  const handleSave = () => {
    if (!name.trim() || !targetValue) return;

    const config: GoalTargetConfig = { period };

    switch (type) {
      case 'SPENDING_LIMIT':
        config.zone = zone;
        config.amount = parseFloat(targetValue);
        break;
      case 'ZONE_RATIO':
        config.zone = zone;
        if (zone === 'GREEN') {
          config.minPercent = parseFloat(targetValue);
        } else {
          config.maxPercent = parseFloat(targetValue);
        }
        break;
      case 'STREAK':
        config.avoidDays = parseInt(targetValue);
        break;
      case 'SAVINGS_TARGET':
        config.amount = parseFloat(targetValue);
        break;
    }

    onSave({
      type,
      name: name.trim(),
      description: description.trim() || undefined,
      targetConfig: config,
      targetValue: parseFloat(targetValue),
    });
  };

  const typeConfig = GOAL_TYPE_CONFIG[type];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-lg mx-4 bg-[#000000] border border-[#424242]  shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-[#424242] bg-gradient-to-r from-[#111820] to-transparent">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-[white]">
              {goal ? 'Edit Goal' : 'Create New Goal'}
            </h2>
            <button
              onClick={onClose}
              className="p-2  text-[#6B7280] hover:text-[white] hover:bg-[white/5] transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 max-h-[60vh] overflow-y-auto">
          {/* Goal Type Selector */}
          {!goal && (
            <div>
              <label className="block text-sm font-medium text-[#9BA4B0] mb-3">Goal Type</label>
              <div className="grid grid-cols-2 gap-2">
                {(Object.entries(GOAL_TYPE_CONFIG) as [GoalType, typeof GOAL_TYPE_CONFIG[GoalType]][]).map(
                  ([key, config]) => (
                    <button
                      key={key}
                      onClick={() => setType(key)}
                      className={`p-3  border text-left transition-all ${
                        type === key
                          ? 'border-[#FFC700] bg-[#FFC700]/10'
                          : 'border-[#424242] hover:border-[#FFC700]/50'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span style={{ color: config.color }}>{config.icon}</span>
                        <span className="text-sm font-medium text-[white]">{config.label}</span>
                      </div>
                      <p className="text-xs text-[#6B7280]">{config.description}</p>
                    </button>
                  )
                )}
              </div>
            </div>
          )}

          {/* Goal Name */}
          <div>
            <label className="block text-sm font-medium text-[#9BA4B0] mb-2">Goal Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={`e.g., ${type === 'SPENDING_LIMIT' ? 'Keep RED under $200' : type === 'ZONE_RATIO' ? 'Maintain 70% GREEN' : type === 'STREAK' ? '30-day RED-free streak' : 'Save $500 this month'}`}
              className="w-full px-4 py-2.5  bg-[#111820] border border-[#424242] text-[white] placeholder:text-[#6B7280] focus:border-[#FFC700] focus:outline-none transition-colors"
            />
          </div>

          {/* Zone Selector (for SPENDING_LIMIT and ZONE_RATIO) */}
          {(type === 'SPENDING_LIMIT' || type === 'ZONE_RATIO') && (
            <div>
              <label className="block text-sm font-medium text-[#9BA4B0] mb-2">Target Zone</label>
              <div className="flex gap-2">
                {(['GREEN', 'YELLOW', 'RED'] as TrafficLightZone[]).map((z) => (
                  <button
                    key={z}
                    onClick={() => setZone(z)}
                    className={`flex-1 px-4 py-2.5  border text-sm font-medium transition-all ${
                      zone === z
                        ? 'border-current'
                        : 'border-[#424242] hover:border-current'
                    }`}
                    style={{ color: ZONE_COLORS[z], borderColor: zone === z ? ZONE_COLORS[z] : undefined }}
                  >
                    {z}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Target Value */}
          <div>
            <label className="block text-sm font-medium text-[#9BA4B0] mb-2">
              {type === 'SPENDING_LIMIT' && 'Maximum Amount ($)'}
              {type === 'ZONE_RATIO' && (zone === 'GREEN' ? 'Minimum Percentage (%)' : 'Maximum Percentage (%)')}
              {type === 'STREAK' && 'Target Days'}
              {type === 'SAVINGS_TARGET' && 'Savings Goal ($)'}
            </label>
            <input
              type="number"
              value={targetValue}
              onChange={(e) => setTargetValue(e.target.value)}
              placeholder={type === 'SPENDING_LIMIT' ? '200' : type === 'ZONE_RATIO' ? '15' : type === 'STREAK' ? '7' : '500'}
              min="0"
              step={type === 'ZONE_RATIO' ? '1' : '0.01'}
              className="w-full px-4 py-2.5  bg-[#111820] border border-[#424242] text-[white] placeholder:text-[#6B7280] focus:border-[#FFC700] focus:outline-none transition-colors"
            />
          </div>

          {/* Period (for SPENDING_LIMIT) */}
          {type === 'SPENDING_LIMIT' && (
            <div>
              <label className="block text-sm font-medium text-[#9BA4B0] mb-2">Time Period</label>
              <div className="flex gap-2">
                {(['daily', 'weekly', 'monthly'] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPeriod(p)}
                    className={`flex-1 px-4 py-2.5  border text-sm font-medium transition-all ${
                      period === p
                        ? 'border-[#FFC700] bg-[#FFC700]/10 text-[white]'
                        : 'border-[#424242] text-[#6B7280] hover:text-[white]'
                    }`}
                  >
                    {p.charAt(0).toUpperCase() + p.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Description (optional) */}
          <div>
            <label className="block text-sm font-medium text-[#9BA4B0] mb-2">
              Description <span className="text-[#6B7280]">(optional)</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Why is this goal important to you?"
              rows={2}
              className="w-full px-4 py-2.5  bg-[#111820] border border-[#424242] text-[white] placeholder:text-[#6B7280] focus:border-[#FFC700] focus:outline-none transition-colors resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-[#424242] flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5  text-sm font-medium text-[#9BA4B0] hover:text-[white] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!name.trim() || !targetValue}
            className="px-5 py-2.5  text-sm font-medium text-white bg-[#22C55E] hover:bg-[#16A34A] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {goal ? 'Save Changes' : 'Create Goal'}
          </button>
        </div>
      </div>
    </div>
  );
}
