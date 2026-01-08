// Core type definitions for SpendSignal

import type { TrafficLightZone } from '@/constants/traffic-light';
import type { SubscriptionTier, SubscriptionStatus } from '@/constants/subscription-tiers';

// Re-export constants as types
export type { TrafficLightZone, SubscriptionTier, SubscriptionStatus };

// Transaction source
export type TransactionSource = 'DEMO' | 'PLAID' | 'MANUAL';

// User types
export interface User {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  isDemoMode: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserWithSubscription extends User {
  subscription: Subscription | null;
}

// Subscription types
export interface Subscription {
  id: string;
  userId: string;
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  stripePriceId: string | null;
  currentPeriodStart: Date | null;
  currentPeriodEnd: Date | null;
  cancelAtPeriodEnd: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Transaction types
export interface Transaction {
  id: string;
  userId: string;
  amount: number;
  description: string;
  merchantName: string | null;
  date: Date;
  source: TransactionSource;
  externalId: string | null;
  defaultCategory: string | null;
  pending: boolean;
  isRecurring: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface TransactionWithCategorization extends Transaction {
  categorization: UserCategorization | null;
}

// Categorization types
export interface UserCategorization {
  id: string;
  userId: string;
  transactionId: string;
  zone: TrafficLightZone;
  categoryId: string | null;
  aiSuggestedZone: TrafficLightZone | null;
  aiConfidence: number | null;
  aiReasoning: string | null;
  userOverrodeAI: boolean;
  note: string | null;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

// Goal types
export type GoalType = 'SPENDING_LIMIT' | 'ZONE_RATIO' | 'STREAK' | 'SAVINGS_TARGET';
export type GoalStatus = 'ACTIVE' | 'COMPLETED' | 'FAILED' | 'PAUSED';

export interface Goal {
  id: string;
  userId: string;
  type: GoalType;
  status: GoalStatus;
  name: string;
  description: string | null;
  targetConfig: GoalTargetConfig;
  currentValue: number | null;
  targetValue: number;
  startDate: Date;
  endDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface GoalTargetConfig {
  zone?: TrafficLightZone;
  amount?: number;
  period?: 'daily' | 'weekly' | 'monthly';
  minPercent?: number;
  maxPercent?: number;
  avoidDays?: number;
  targetDate?: string;
}

// Alert types
export type AlertType =
  | 'SPENDING_THRESHOLD'
  | 'UNUSUAL_ACTIVITY'
  | 'GOAL_PROGRESS'
  | 'RECURRING_CHARGE'
  | 'WEEKLY_SUMMARY';

export type AlertChannel = 'IN_APP' | 'EMAIL' | 'PUSH';

export interface Alert {
  id: string;
  userId: string;
  type: AlertType;
  name: string;
  isEnabled: boolean;
  config: AlertConfig;
  channels: AlertChannel[];
  lastTriggeredAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface AlertConfig {
  zone?: TrafficLightZone;
  amount?: number;
  period?: 'daily' | 'weekly' | 'monthly';
  threshold?: number;
}

export interface AlertNotification {
  id: string;
  alertId: string;
  title: string;
  message: string;
  data: Record<string, unknown> | null;
  isRead: boolean;
  readAt: Date | null;
  createdAt: Date;
}

// Plaid connection types
export interface PlaidConnection {
  id: string;
  userId: string;
  itemId: string;
  institutionId: string | null;
  institutionName: string | null;
  cursor: string | null;
  lastSyncedAt: Date | null;
  syncStatus: string;
  accounts: PlaidAccount[] | null;
  isActive: boolean;
  errorCode: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface PlaidAccount {
  accountId: string;
  name: string;
  officialName: string | null;
  type: string;
  subtype: string | null;
  mask: string | null;
}

// Monthly report types
export interface MonthlyReport {
  id: string;
  userId: string;
  year: number;
  month: number;
  summary: MonthlyReportSummary;
  generatedAt: Date;
}

export interface MonthlyReportSummary {
  totalSpending: number;
  byZone: {
    GREEN: number;
    YELLOW: number;
    RED: number;
  };
  topCategories: Array<{
    category: string;
    amount: number;
    zone: TrafficLightZone;
  }>;
  comparedToLastMonth: {
    totalChange: number;
    totalChangePercent: number;
    zoneChanges: {
      GREEN: number;
      YELLOW: number;
      RED: number;
    };
  };
  insights: string[];
  goalProgress: Array<{
    goalId: string;
    name: string;
    progress: number;
    status: GoalStatus;
  }>;
}

// AI suggestion types
export interface AISuggestion {
  zone: TrafficLightZone;
  confidence: number;
  reasoning: string;
}

// Dashboard stats
export interface DashboardStats {
  healthScore: number;
  totalSpending: number;
  uncategorizedCount: number;
  zoneBreakdown: {
    GREEN: { amount: number; count: number; percent: number };
    YELLOW: { amount: number; count: number; percent: number };
    RED: { amount: number; count: number; percent: number };
  };
  streaks: {
    categorization: number;
    underBudget: number;
    noRed: number;
  };
  comparedToLastMonth: {
    healthScoreChange: number;
    spendingChange: number;
  };
}

// Canvas state for drag-drop
export interface CanvasState {
  transactions: TransactionWithCategorization[];
  draggingId: string | null;
  selectedIds: string[];
  filter: {
    dateRange: [Date, Date] | null;
    search: string;
    showOnlyUncategorized: boolean;
  };
}

// Income types
export type IncomeFrequency = 'weekly' | 'bi-weekly' | 'monthly' | 'annual';

export interface IncomeSource {
  id: string;
  name: string;
  amount: number;
  frequency: IncomeFrequency;
  isActive: boolean;
}

export interface IncomeSettings {
  sources: IncomeSource[];
  updatedAt: Date;
}

// Calculated income values
export interface IncomeCalculations {
  monthlyIncome: number;
  annualIncome: number;
  weeklyIncome: number;
  dailyIncome: number;
}

// ============================================
// ADVISOR TIER - DEBT PAYOFF
// ============================================

export type DebtPayoffStrategy = 'SNOWBALL' | 'AVALANCHE' | 'CUSTOM';

export interface Debt {
  id: string;
  userId: string;
  name: string;
  balance: number;
  interestRate: number; // As decimal (0.1999 = 19.99%)
  minimumPayment: number;
  dueDate: number | null;
  priority: number;
  isPaidOff: boolean;
  paidOffDate: Date | null;
  originalBalance: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface DebtPayoffSchedule {
  debtId: string;
  debtName: string;
  payoffDate: Date;
  monthsToPayoff: number;
  totalInterestPaid: number;
  totalAmountPaid: number;
  monthlyPayments: DebtMonthlyPayment[];
}

export interface DebtMonthlyPayment {
  month: number;
  date: Date;
  payment: number;
  principal: number;
  interest: number;
  remainingBalance: number;
}

export interface DebtPayoffPlan {
  strategy: DebtPayoffStrategy;
  debts: DebtPayoffSchedule[];
  totalDebt: number;
  totalInterest: number;
  debtFreeDate: Date;
  monthsToDebtFree: number;
  extraMonthlyPayment: number;
}

export interface DebtComparison {
  snowball: DebtPayoffPlan;
  avalanche: DebtPayoffPlan;
  interestSaved: number; // How much avalanche saves vs snowball
  timeDifference: number; // Months difference (positive = snowball faster)
}

// ============================================
// ADVISOR TIER - SAVINGS GOALS
// ============================================

export type SavingsGoalType =
  | 'EMERGENCY'
  | 'HOUSE'
  | 'RETIREMENT'
  | 'VACATION'
  | 'CAR'
  | 'EDUCATION'
  | 'CUSTOM';

export interface SavingsGoal {
  id: string;
  userId: string;
  name: string;
  type: SavingsGoalType;
  icon: string | null;
  targetAmount: number;
  currentAmount: number;
  monthlyContribution: number | null;
  targetDate: Date | null;
  isCompleted: boolean;
  completedDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface SavingsContribution {
  id: string;
  savingsGoalId: string;
  amount: number;
  date: Date;
  note: string | null;
}

export interface SavingsGoalWithContributions extends SavingsGoal {
  contributions: SavingsContribution[];
}

export interface SavingsProjection {
  goalId: string;
  goalName: string;
  targetAmount: number;
  currentAmount: number;
  monthlyContribution: number;
  targetDate: Date | null;
  projectedCompletionDate: Date;
  monthsToGoal: number;
  onTrack: boolean; // If target date exists, are they on track?
  monthlyNeededForTarget: number | null; // If target date exists, how much/month needed?
  progressPercent: number;
}

// ============================================
// ADVISOR TIER - SMART RECOMMENDATIONS
// ============================================

export type RecommendationType =
  | 'REDIRECT_SPENDING'      // "Move $X from RED to debt/savings"
  | 'STRATEGY_OPTIMIZATION'  // "Avalanche saves $X vs Snowball"
  | 'MILESTONE_ALERT'        // "You're 3 months from paying off [debt]!"
  | 'PACE_WARNING'           // "At current rate, you'll miss target by X months"
  | 'CELEBRATION';           // "You've paid off $X in debt this year!"

export interface SmartRecommendation {
  id: string;
  type: RecommendationType;
  title: string;
  message: string;
  impact: {
    description: string;
    value: number; // Dollar amount or months
    unit: 'dollars' | 'months' | 'percent';
  };
  action?: {
    label: string;
    href?: string;
  };
  priority: 'high' | 'medium' | 'low';
  createdAt: Date;
}

export interface AdvisorDashboardStats {
  totalDebt: number;
  totalSavings: number;
  debtFreeDate: Date | null;
  monthlyDebtPayment: number;
  monthlySavingsContribution: number;
  netWorthTrend: number; // Change from last month
  savingsRate: number; // Percent of income going to savings
  recommendations: SmartRecommendation[];
}
