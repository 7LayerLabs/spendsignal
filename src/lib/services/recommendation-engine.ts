// Smart Recommendation Engine
// Generates actionable recommendations based on spending, debts, and savings

import type {
  SmartRecommendation,
  RecommendationType,
  Debt,
  SavingsGoal,
  DebtPayoffPlan,
  SavingsProjection,
} from '@/types';
import { calculateDebtPayoffPlan, compareStrategies, debtToInput } from './debt-calculator';
import { calculateSavingsProjection, savingsGoalToInput } from './savings-calculator';

interface SpendingByZone {
  GREEN: number;
  YELLOW: number;
  RED: number;
}

interface RecommendationContext {
  monthlyIncome: number;
  monthlySpending: SpendingByZone;
  debts: Debt[];
  savingsGoals: SavingsGoal[];
  debtPayoffPlan?: DebtPayoffPlan;
  savingsProjections?: SavingsProjection[];
}

/**
 * Generate all smart recommendations based on user's financial data
 */
export function generateRecommendations(context: RecommendationContext): SmartRecommendation[] {
  const recommendations: SmartRecommendation[] = [];

  // Generate each type of recommendation
  recommendations.push(...generateRedirectRecommendations(context));
  recommendations.push(...generateStrategyRecommendations(context));
  recommendations.push(...generateMilestoneRecommendations(context));
  recommendations.push(...generatePaceRecommendations(context));
  recommendations.push(...generateCelebrationRecommendations(context));

  // Sort by priority
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  recommendations.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  return recommendations;
}

/**
 * Generate redirect spending recommendations
 * "Move $X from RED to debt/savings"
 */
function generateRedirectRecommendations(context: RecommendationContext): SmartRecommendation[] {
  const { monthlySpending, debts, savingsGoals } = context;
  const recommendations: SmartRecommendation[] = [];

  const redSpending = monthlySpending.RED;
  if (redSpending <= 0) return recommendations;

  // If there are debts, recommend redirecting RED to debt payoff
  if (debts.length > 0) {
    const activeDebts = debts.filter(d => !d.isPaidOff);
    if (activeDebts.length > 0) {
      const debtInputs = activeDebts.map(debtToInput);
      const halfRed = Math.round(redSpending * 0.5);

      // Calculate impact of redirecting half of RED spending
      const currentPlan = calculateDebtPayoffPlan(debtInputs, 0, 'AVALANCHE');
      const newPlan = calculateDebtPayoffPlan(debtInputs, halfRed, 'AVALANCHE');
      const monthsSaved = currentPlan.monthsToDebtFree - newPlan.monthsToDebtFree;

      if (monthsSaved > 0) {
        recommendations.push({
          id: `redirect-debt-${Date.now()}`,
          type: 'REDIRECT_SPENDING',
          title: 'Redirect RED to Debt',
          message: `You spent $${redSpending.toFixed(0)} on RED purchases this month. Redirecting half ($${halfRed}) to debt would make you debt-free ${monthsSaved} months sooner.`,
          impact: {
            description: `${monthsSaved} months faster payoff`,
            value: monthsSaved,
            unit: 'months',
          },
          action: {
            label: 'Adjust Extra Payment',
            href: '/dashboard/planner/debts',
          },
          priority: 'high',
          createdAt: new Date(),
        });
      }
    }
  }

  // If there are savings goals not on track
  if (savingsGoals.length > 0) {
    const goalsNotOnTrack = savingsGoals.filter(g => {
      if (!g.targetDate || g.isCompleted) return false;
      const projection = calculateSavingsProjection(savingsGoalToInput(g));
      return !projection.onTrack;
    });

    if (goalsNotOnTrack.length > 0) {
      const goal = goalsNotOnTrack[0]; // Focus on first goal
      const projection = calculateSavingsProjection(savingsGoalToInput(goal));

      if (projection.monthlyNeededForTarget) {
        const extraNeeded = projection.monthlyNeededForTarget - (goal.monthlyContribution ?? 0);

        if (extraNeeded > 0 && extraNeeded <= redSpending) {
          recommendations.push({
            id: `redirect-savings-${Date.now()}`,
            type: 'REDIRECT_SPENDING',
            title: 'Get Back on Track',
            message: `Your "${goal.name}" goal is behind pace. Redirecting $${extraNeeded.toFixed(0)} from RED spending would get you back on track.`,
            impact: {
              description: `$${extraNeeded.toFixed(0)}/month needed`,
              value: extraNeeded,
              unit: 'dollars',
            },
            action: {
              label: 'Adjust Contribution',
              href: '/dashboard/planner/savings',
            },
            priority: 'medium',
            createdAt: new Date(),
          });
        }
      }
    }
  }

  return recommendations;
}

/**
 * Generate strategy optimization recommendations
 * "Avalanche saves $X vs Snowball"
 */
function generateStrategyRecommendations(context: RecommendationContext): SmartRecommendation[] {
  const { debts } = context;
  const recommendations: SmartRecommendation[] = [];

  const activeDebts = debts.filter(d => !d.isPaidOff);
  if (activeDebts.length < 2) return recommendations;

  const debtInputs = activeDebts.map(debtToInput);
  const comparison = compareStrategies(debtInputs, 200); // Assume $200 extra

  if (comparison.interestSaved > 50) {
    recommendations.push({
      id: `strategy-${Date.now()}`,
      type: 'STRATEGY_OPTIMIZATION',
      title: 'Optimize Your Strategy',
      message: `Switching to Avalanche from Snowball would save you $${comparison.interestSaved.toFixed(0)} in interest over the life of your debt.`,
      impact: {
        description: `$${comparison.interestSaved.toFixed(0)} saved`,
        value: comparison.interestSaved,
        unit: 'dollars',
      },
      action: {
        label: 'Change Strategy',
        href: '/dashboard/planner/debts',
      },
      priority: 'medium',
      createdAt: new Date(),
    });
  }

  return recommendations;
}

/**
 * Generate milestone alert recommendations
 * "You're 3 months from paying off [debt]!"
 */
function generateMilestoneRecommendations(context: RecommendationContext): SmartRecommendation[] {
  const { debts, savingsGoals } = context;
  const recommendations: SmartRecommendation[] = [];

  // Check for debts close to payoff
  const activeDebts = debts.filter(d => !d.isPaidOff);
  if (activeDebts.length > 0) {
    const debtInputs = activeDebts.map(debtToInput);
    const plan = calculateDebtPayoffPlan(debtInputs, 0, 'AVALANCHE');

    plan.debts.forEach(schedule => {
      if (schedule.monthsToPayoff <= 3 && schedule.monthsToPayoff > 0) {
        const debt = activeDebts.find(d => d.id === schedule.debtId);
        if (debt) {
          recommendations.push({
            id: `milestone-debt-${debt.id}`,
            type: 'MILESTONE_ALERT',
            title: 'Almost There!',
            message: `You're ${schedule.monthsToPayoff} months away from paying off "${debt.name}". Keep it up!`,
            impact: {
              description: `${schedule.monthsToPayoff} months remaining`,
              value: schedule.monthsToPayoff,
              unit: 'months',
            },
            priority: 'low',
            createdAt: new Date(),
          });
        }
      }
    });
  }

  // Check for savings goals close to completion
  savingsGoals.forEach(goal => {
    if (goal.isCompleted) return;
    const projection = calculateSavingsProjection(savingsGoalToInput(goal));

    if (projection.progressPercent >= 75 && projection.progressPercent < 100) {
      recommendations.push({
        id: `milestone-savings-${goal.id}`,
        type: 'MILESTONE_ALERT',
        title: 'Final Stretch!',
        message: `Your "${goal.name}" goal is ${projection.progressPercent.toFixed(0)}% complete. Just ${projection.monthsToGoal} more months!`,
        impact: {
          description: `${projection.progressPercent.toFixed(0)}% complete`,
          value: projection.progressPercent,
          unit: 'percent',
        },
        priority: 'low',
        createdAt: new Date(),
      });
    }
  });

  return recommendations;
}

/**
 * Generate pace warning recommendations
 * "At current rate, you'll miss your target by X months"
 */
function generatePaceRecommendations(context: RecommendationContext): SmartRecommendation[] {
  const { savingsGoals } = context;
  const recommendations: SmartRecommendation[] = [];

  savingsGoals.forEach(goal => {
    if (!goal.targetDate || goal.isCompleted) return;

    const projection = calculateSavingsProjection(savingsGoalToInput(goal));

    if (!projection.onTrack && projection.monthlyNeededForTarget) {
      const targetDate = new Date(goal.targetDate);
      const projectedDate = projection.projectedCompletionDate;

      const monthsBehind = Math.round(
        (projectedDate.getTime() - targetDate.getTime()) / (1000 * 60 * 60 * 24 * 30)
      );

      if (monthsBehind > 0) {
        recommendations.push({
          id: `pace-${goal.id}`,
          type: 'PACE_WARNING',
          title: 'Behind Schedule',
          message: `At current rate, you'll miss your "${goal.name}" target by ${monthsBehind} months. Need $${projection.monthlyNeededForTarget.toFixed(0)}/month to stay on track.`,
          impact: {
            description: `${monthsBehind} months behind`,
            value: monthsBehind,
            unit: 'months',
          },
          action: {
            label: 'Increase Contribution',
            href: '/dashboard/planner/savings',
          },
          priority: 'high',
          createdAt: new Date(),
        });
      }
    }
  });

  return recommendations;
}

/**
 * Generate celebration recommendations
 * "You've paid off $X in debt this year!"
 */
function generateCelebrationRecommendations(context: RecommendationContext): SmartRecommendation[] {
  const { debts, savingsGoals } = context;
  const recommendations: SmartRecommendation[] = [];

  // Calculate total debt paid off
  const paidOffDebts = debts.filter(d => d.isPaidOff);
  if (paidOffDebts.length > 0) {
    const totalPaidOff = paidOffDebts.reduce(
      (sum, d) => sum + (d.originalBalance ?? d.balance),
      0
    );

    recommendations.push({
      id: `celebration-debt-${Date.now()}`,
      type: 'CELEBRATION',
      title: 'Discipline Looks Good',
      message: `You've paid off ${paidOffDebts.length} debt${paidOffDebts.length > 1 ? 's' : ''} totaling $${totalPaidOff.toFixed(0)}. The numbers don't lie.`,
      impact: {
        description: `$${totalPaidOff.toFixed(0)} paid off`,
        value: totalPaidOff,
        unit: 'dollars',
      },
      priority: 'low',
      createdAt: new Date(),
    });
  }

  // Check for completed savings goals
  const completedGoals = savingsGoals.filter(g => g.isCompleted);
  if (completedGoals.length > 0) {
    const totalSaved = completedGoals.reduce((sum, g) => sum + g.targetAmount, 0);

    recommendations.push({
      id: `celebration-savings-${Date.now()}`,
      type: 'CELEBRATION',
      title: 'Goals Crushed',
      message: `You've hit ${completedGoals.length} savings goal${completedGoals.length > 1 ? 's' : ''} for $${totalSaved.toFixed(0)}. Your future self thanks you.`,
      impact: {
        description: `$${totalSaved.toFixed(0)} saved`,
        value: totalSaved,
        unit: 'dollars',
      },
      priority: 'low',
      createdAt: new Date(),
    });
  }

  return recommendations;
}

/**
 * Get recommendation icon based on type
 */
export function getRecommendationIcon(type: RecommendationType): string {
  const icons: Record<RecommendationType, string> = {
    REDIRECT_SPENDING: '↗️',
    STRATEGY_OPTIMIZATION: '⚡',
    MILESTONE_ALERT: '🎯',
    PACE_WARNING: '⚠️',
    CELEBRATION: '🎉',
  };
  return icons[type];
}

/**
 * Get recommendation color based on type
 */
export function getRecommendationColor(type: RecommendationType): string {
  const colors: Record<RecommendationType, string> = {
    REDIRECT_SPENDING: '#3B82F6',  // Blue
    STRATEGY_OPTIMIZATION: '#8B5CF6', // Purple
    MILESTONE_ALERT: '#22C55E',    // Green
    PACE_WARNING: '#EAB308',        // Yellow
    CELEBRATION: '#22C55E',         // Green
  };
  return colors[type];
}

/**
 * Get recommendation priority color
 */
export function getPriorityColor(priority: SmartRecommendation['priority']): string {
  const colors = {
    high: '#EF4444',
    medium: '#EAB308',
    low: '#6B7280',
  };
  return colors[priority];
}
