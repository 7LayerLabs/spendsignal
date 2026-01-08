// Debt Payoff Calculator Service
// Implements Snowball and Avalanche debt payoff strategies

import type {
  Debt,
  DebtPayoffStrategy,
  DebtPayoffPlan,
  DebtPayoffSchedule,
  DebtMonthlyPayment,
  DebtComparison,
} from '@/types';

interface DebtInput {
  id: string;
  name: string;
  balance: number;
  interestRate: number; // Annual rate as decimal (0.1999 = 19.99%)
  minimumPayment: number;
  priority?: number;
}

/**
 * Calculate monthly interest for a debt
 */
function calculateMonthlyInterest(balance: number, annualRate: number): number {
  const monthlyRate = annualRate / 12;
  return balance * monthlyRate;
}

/**
 * Sort debts by strategy
 * - SNOWBALL: Smallest balance first (psychological wins)
 * - AVALANCHE: Highest interest rate first (mathematically optimal)
 * - CUSTOM: User-defined priority order
 */
function sortDebtsByStrategy(debts: DebtInput[], strategy: DebtPayoffStrategy): DebtInput[] {
  const sorted = [...debts];

  switch (strategy) {
    case 'SNOWBALL':
      return sorted.sort((a, b) => a.balance - b.balance);
    case 'AVALANCHE':
      return sorted.sort((a, b) => b.interestRate - a.interestRate);
    case 'CUSTOM':
      return sorted.sort((a, b) => (a.priority ?? 0) - (b.priority ?? 0));
    default:
      return sorted;
  }
}

/**
 * Calculate payoff schedule for a single debt
 */
function calculateDebtSchedule(
  debt: DebtInput,
  monthlyPayment: number,
  startMonth: number = 0,
  startDate: Date = new Date()
): DebtPayoffSchedule {
  const payments: DebtMonthlyPayment[] = [];
  let remainingBalance = debt.balance;
  let totalInterestPaid = 0;
  let totalAmountPaid = 0;
  let month = startMonth;

  // Safety limit to prevent infinite loops
  const maxMonths = 600; // 50 years max

  while (remainingBalance > 0.01 && month - startMonth < maxMonths) {
    const monthlyInterest = calculateMonthlyInterest(remainingBalance, debt.interestRate);
    const actualPayment = Math.min(monthlyPayment, remainingBalance + monthlyInterest);
    const principal = actualPayment - monthlyInterest;

    remainingBalance = Math.max(0, remainingBalance - principal);
    totalInterestPaid += monthlyInterest;
    totalAmountPaid += actualPayment;

    const paymentDate = new Date(startDate);
    paymentDate.setMonth(paymentDate.getMonth() + month);

    payments.push({
      month,
      date: paymentDate,
      payment: Math.round(actualPayment * 100) / 100,
      principal: Math.round(principal * 100) / 100,
      interest: Math.round(monthlyInterest * 100) / 100,
      remainingBalance: Math.round(remainingBalance * 100) / 100,
    });

    month++;
  }

  const payoffDate = new Date(startDate);
  payoffDate.setMonth(payoffDate.getMonth() + month - 1);

  return {
    debtId: debt.id,
    debtName: debt.name,
    payoffDate,
    monthsToPayoff: month - startMonth,
    totalInterestPaid: Math.round(totalInterestPaid * 100) / 100,
    totalAmountPaid: Math.round(totalAmountPaid * 100) / 100,
    monthlyPayments: payments,
  };
}

/**
 * Calculate complete debt payoff plan using debt cascade method
 * When one debt is paid off, its payment rolls into the next debt
 */
export function calculateDebtPayoffPlan(
  debts: DebtInput[],
  extraMonthlyPayment: number = 0,
  strategy: DebtPayoffStrategy = 'AVALANCHE'
): DebtPayoffPlan {
  if (debts.length === 0) {
    return {
      strategy,
      debts: [],
      totalDebt: 0,
      totalInterest: 0,
      debtFreeDate: new Date(),
      monthsToDebtFree: 0,
      extraMonthlyPayment,
    };
  }

  const sortedDebts = sortDebtsByStrategy(debts, strategy);
  const startDate = new Date();
  const debtSchedules: DebtPayoffSchedule[] = [];

  // Track remaining balances and available extra payment
  const balances = new Map<string, number>();
  sortedDebts.forEach(d => balances.set(d.id, d.balance));

  let currentExtraPayment = extraMonthlyPayment;
  let totalInterest = 0;
  let maxMonth = 0;

  // Process each debt in order
  for (const debt of sortedDebts) {
    // Calculate total payment for this debt (minimum + any cascaded extra)
    const totalPayment = debt.minimumPayment + currentExtraPayment;

    // Calculate schedule for this debt
    const schedule = calculateDebtSchedule(debt, totalPayment, 0, startDate);
    debtSchedules.push(schedule);

    totalInterest += schedule.totalInterestPaid;
    maxMonth = Math.max(maxMonth, schedule.monthsToPayoff);

    // When this debt is paid off, add its minimum payment to extra for next debt
    currentExtraPayment += debt.minimumPayment;
  }

  // Find the actual debt-free date (when all debts are paid)
  const debtFreeDate = new Date(startDate);
  debtFreeDate.setMonth(debtFreeDate.getMonth() + maxMonth);

  const totalDebt = debts.reduce((sum, d) => sum + d.balance, 0);

  return {
    strategy,
    debts: debtSchedules,
    totalDebt: Math.round(totalDebt * 100) / 100,
    totalInterest: Math.round(totalInterest * 100) / 100,
    debtFreeDate,
    monthsToDebtFree: maxMonth,
    extraMonthlyPayment,
  };
}

/**
 * Compare snowball vs avalanche strategies
 */
export function compareStrategies(
  debts: DebtInput[],
  extraMonthlyPayment: number = 0
): DebtComparison {
  const snowball = calculateDebtPayoffPlan(debts, extraMonthlyPayment, 'SNOWBALL');
  const avalanche = calculateDebtPayoffPlan(debts, extraMonthlyPayment, 'AVALANCHE');

  return {
    snowball,
    avalanche,
    interestSaved: Math.round((snowball.totalInterest - avalanche.totalInterest) * 100) / 100,
    timeDifference: snowball.monthsToDebtFree - avalanche.monthsToDebtFree,
  };
}

/**
 * Calculate "what if" scenario - impact of adding extra payment
 */
export function calculateExtraPaymentImpact(
  debts: DebtInput[],
  currentExtraPayment: number,
  newExtraPayment: number,
  strategy: DebtPayoffStrategy = 'AVALANCHE'
): {
  currentPlan: DebtPayoffPlan;
  newPlan: DebtPayoffPlan;
  monthsSaved: number;
  interestSaved: number;
} {
  const currentPlan = calculateDebtPayoffPlan(debts, currentExtraPayment, strategy);
  const newPlan = calculateDebtPayoffPlan(debts, newExtraPayment, strategy);

  return {
    currentPlan,
    newPlan,
    monthsSaved: currentPlan.monthsToDebtFree - newPlan.monthsToDebtFree,
    interestSaved: Math.round((currentPlan.totalInterest - newPlan.totalInterest) * 100) / 100,
  };
}

/**
 * Calculate minimum monthly payment needed to pay off all debts
 * (sum of all minimum payments)
 */
export function calculateMinimumMonthlyTotal(debts: DebtInput[]): number {
  return debts.reduce((sum, d) => sum + d.minimumPayment, 0);
}

/**
 * Calculate how long until a specific debt is paid off
 * Given a fixed monthly payment
 */
export function calculateMonthsToPayoff(
  balance: number,
  interestRate: number,
  monthlyPayment: number
): number {
  if (monthlyPayment <= 0) return Infinity;

  const monthlyRate = interestRate / 12;

  // If payment doesn't cover interest, debt will never be paid
  const monthlyInterest = balance * monthlyRate;
  if (monthlyPayment <= monthlyInterest) return Infinity;

  // Use logarithmic formula for exact months
  // n = -log(1 - (r * P) / M) / log(1 + r)
  // where P = principal, r = monthly rate, M = monthly payment
  if (monthlyRate === 0) {
    return Math.ceil(balance / monthlyPayment);
  }

  const months = -Math.log(1 - (monthlyRate * balance) / monthlyPayment) / Math.log(1 + monthlyRate);
  return Math.ceil(months);
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
 * Format percentage for display
 */
export function formatPercent(rate: number): string {
  return `${(rate * 100).toFixed(2)}%`;
}

/**
 * Convert Debt model to DebtInput for calculations
 */
export function debtToInput(debt: Debt): DebtInput {
  return {
    id: debt.id,
    name: debt.name,
    balance: debt.balance,
    interestRate: debt.interestRate,
    minimumPayment: debt.minimumPayment,
    priority: debt.priority,
  };
}

/**
 * Get month name and year from date
 */
export function formatPayoffDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });
}
