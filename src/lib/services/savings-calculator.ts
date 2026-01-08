// Savings Goal Calculator Service
// Calculates projections and tracks progress toward savings goals

import type {
  SavingsGoal,
  SavingsGoalType,
  SavingsProjection,
  SavingsContribution,
} from '@/types';

interface SavingsInput {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  monthlyContribution: number;
  targetDate: Date | null;
}

/**
 * Calculate projected completion date based on current savings rate
 */
export function calculateProjectedCompletionDate(
  currentAmount: number,
  targetAmount: number,
  monthlyContribution: number
): Date {
  if (monthlyContribution <= 0) {
    // If no monthly contribution, return far future date
    const farFuture = new Date();
    farFuture.setFullYear(farFuture.getFullYear() + 100);
    return farFuture;
  }

  const remaining = targetAmount - currentAmount;
  if (remaining <= 0) {
    return new Date(); // Already reached goal
  }

  const monthsToGoal = Math.ceil(remaining / monthlyContribution);
  const completionDate = new Date();
  completionDate.setMonth(completionDate.getMonth() + monthsToGoal);

  return completionDate;
}

/**
 * Calculate months needed to reach goal
 */
export function calculateMonthsToGoal(
  currentAmount: number,
  targetAmount: number,
  monthlyContribution: number
): number {
  if (monthlyContribution <= 0) return Infinity;

  const remaining = targetAmount - currentAmount;
  if (remaining <= 0) return 0;

  return Math.ceil(remaining / monthlyContribution);
}

/**
 * Calculate monthly contribution needed to reach goal by target date
 */
export function calculateMonthlyNeeded(
  currentAmount: number,
  targetAmount: number,
  targetDate: Date
): number {
  const remaining = targetAmount - currentAmount;
  if (remaining <= 0) return 0;

  const now = new Date();
  const monthsRemaining = Math.max(
    1,
    (targetDate.getFullYear() - now.getFullYear()) * 12 +
      (targetDate.getMonth() - now.getMonth())
  );

  return Math.ceil(remaining / monthsRemaining);
}

/**
 * Check if user is on track to meet their target date
 */
export function isOnTrack(
  currentAmount: number,
  targetAmount: number,
  monthlyContribution: number,
  targetDate: Date
): boolean {
  const projectedDate = calculateProjectedCompletionDate(
    currentAmount,
    targetAmount,
    monthlyContribution
  );

  return projectedDate <= targetDate;
}

/**
 * Calculate full projection for a savings goal
 */
export function calculateSavingsProjection(goal: SavingsInput): SavingsProjection {
  const { id, name, targetAmount, currentAmount, monthlyContribution, targetDate } = goal;

  const projectedCompletionDate = calculateProjectedCompletionDate(
    currentAmount,
    targetAmount,
    monthlyContribution
  );

  const monthsToGoal = calculateMonthsToGoal(currentAmount, targetAmount, monthlyContribution);

  const progressPercent = targetAmount > 0
    ? Math.min(100, Math.round((currentAmount / targetAmount) * 100 * 10) / 10)
    : 0;

  let onTrack = true;
  let monthlyNeededForTarget: number | null = null;

  if (targetDate) {
    onTrack = isOnTrack(currentAmount, targetAmount, monthlyContribution, targetDate);
    monthlyNeededForTarget = calculateMonthlyNeeded(currentAmount, targetAmount, targetDate);
  }

  return {
    goalId: id,
    goalName: name,
    targetAmount,
    currentAmount,
    monthlyContribution,
    targetDate,
    projectedCompletionDate,
    monthsToGoal,
    onTrack,
    monthlyNeededForTarget,
    progressPercent,
  };
}

/**
 * Calculate "what if" scenario - impact of increasing monthly contribution
 */
export function calculateContributionImpact(
  goal: SavingsInput,
  newMonthlyContribution: number
): {
  currentProjection: SavingsProjection;
  newProjection: SavingsProjection;
  monthsSaved: number;
} {
  const currentProjection = calculateSavingsProjection(goal);
  const newProjection = calculateSavingsProjection({
    ...goal,
    monthlyContribution: newMonthlyContribution,
  });

  return {
    currentProjection,
    newProjection,
    monthsSaved: currentProjection.monthsToGoal - newProjection.monthsToGoal,
  };
}

/**
 * Calculate emergency fund target based on monthly expenses
 */
export function calculateEmergencyFundTarget(
  monthlyExpenses: number,
  months: number = 6
): number {
  return monthlyExpenses * months;
}

/**
 * Calculate house down payment based on home price and percentage
 */
export function calculateDownPaymentTarget(
  homePrice: number,
  downPaymentPercent: number = 0.2
): number {
  return homePrice * downPaymentPercent;
}

/**
 * Get goal type icon
 */
export function getGoalTypeIcon(type: SavingsGoalType): string {
  const icons: Record<SavingsGoalType, string> = {
    EMERGENCY: '🛡️',
    HOUSE: '🏠',
    RETIREMENT: '🏖️',
    VACATION: '✈️',
    CAR: '🚗',
    EDUCATION: '🎓',
    CUSTOM: '🎯',
  };
  return icons[type];
}

/**
 * Get goal type label
 */
export function getGoalTypeLabel(type: SavingsGoalType): string {
  const labels: Record<SavingsGoalType, string> = {
    EMERGENCY: 'Emergency Fund',
    HOUSE: 'House Down Payment',
    RETIREMENT: 'Retirement',
    VACATION: 'Vacation',
    CAR: 'Car Purchase',
    EDUCATION: 'Education',
    CUSTOM: 'Custom Goal',
  };
  return labels[type];
}

/**
 * Calculate total savings across all goals
 */
export function calculateTotalSavings(goals: SavingsInput[]): number {
  return goals.reduce((sum, g) => sum + g.currentAmount, 0);
}

/**
 * Calculate total monthly contributions across all goals
 */
export function calculateTotalMonthlyContributions(goals: SavingsInput[]): number {
  return goals.reduce((sum, g) => sum + g.monthlyContribution, 0);
}

/**
 * Calculate savings rate as percentage of income
 */
export function calculateSavingsRate(monthlyIncome: number, monthlyContributions: number): number {
  if (monthlyIncome <= 0) return 0;
  return Math.round((monthlyContributions / monthlyIncome) * 100 * 10) / 10;
}

/**
 * Get next milestone for a goal
 */
export function getNextMilestone(currentAmount: number, targetAmount: number): number {
  const milestones = [0.25, 0.5, 0.75, 1.0]; // 25%, 50%, 75%, 100%
  const currentPercent = currentAmount / targetAmount;

  for (const milestone of milestones) {
    if (currentPercent < milestone) {
      return milestone;
    }
  }

  return 1.0;
}

/**
 * Calculate amount needed to reach next milestone
 */
export function getAmountToNextMilestone(currentAmount: number, targetAmount: number): number {
  const nextMilestone = getNextMilestone(currentAmount, targetAmount);
  const milestoneAmount = targetAmount * nextMilestone;
  return Math.max(0, milestoneAmount - currentAmount);
}

/**
 * Format currency for display
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format date for display
 */
export function formatTargetDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });
}

/**
 * Convert SavingsGoal model to SavingsInput for calculations
 */
export function savingsGoalToInput(goal: SavingsGoal): SavingsInput {
  return {
    id: goal.id,
    name: goal.name,
    targetAmount: goal.targetAmount,
    currentAmount: goal.currentAmount,
    monthlyContribution: goal.monthlyContribution ?? 0,
    targetDate: goal.targetDate,
  };
}

/**
 * Calculate contribution trends from history
 */
export function analyzeContributionTrend(
  contributions: SavingsContribution[],
  monthsToAnalyze: number = 3
): {
  averageMonthly: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  lastContributionDate: Date | null;
} {
  if (contributions.length === 0) {
    return {
      averageMonthly: 0,
      trend: 'stable',
      lastContributionDate: null,
    };
  }

  const now = new Date();
  const cutoffDate = new Date();
  cutoffDate.setMonth(cutoffDate.getMonth() - monthsToAnalyze);

  const recentContributions = contributions.filter(c => new Date(c.date) >= cutoffDate);
  const averageMonthly = recentContributions.length > 0
    ? recentContributions.reduce((sum, c) => sum + c.amount, 0) / monthsToAnalyze
    : 0;

  // Compare first half to second half of period for trend
  const midpoint = new Date(cutoffDate.getTime() + (now.getTime() - cutoffDate.getTime()) / 2);
  const firstHalf = recentContributions.filter(c => new Date(c.date) < midpoint);
  const secondHalf = recentContributions.filter(c => new Date(c.date) >= midpoint);

  const firstHalfTotal = firstHalf.reduce((sum, c) => sum + c.amount, 0);
  const secondHalfTotal = secondHalf.reduce((sum, c) => sum + c.amount, 0);

  let trend: 'increasing' | 'decreasing' | 'stable' = 'stable';
  const threshold = 0.1; // 10% change threshold

  if (firstHalfTotal > 0) {
    const change = (secondHalfTotal - firstHalfTotal) / firstHalfTotal;
    if (change > threshold) trend = 'increasing';
    else if (change < -threshold) trend = 'decreasing';
  }

  const sortedByDate = [...contributions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return {
    averageMonthly: Math.round(averageMonthly * 100) / 100,
    trend,
    lastContributionDate: sortedByDate.length > 0 ? new Date(sortedByDate[0].date) : null,
  };
}
