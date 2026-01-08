// AI Advisor Chat Component
// Conversational interface for thorough financial guidance

'use client';

import { useState, useRef, useEffect } from 'react';
import type { Debt, DebtPayoffStrategy, DebtComparison } from '@/types';
import { formatCurrency } from '@/lib/services/debt-calculator';

interface Message {
  id: string;
  role: 'user' | 'advisor';
  content: string;
  timestamp: Date;
}

interface AIAdvisorChatProps {
  isOpen: boolean;
  onClose: () => void;
  context: {
    debts: Debt[];
    totalDebt: number;
    strategy: DebtPayoffStrategy;
    extraPayment: number;
    comparison: DebtComparison;
    debtFreeDate: string;
  };
  onStrategyChange?: (strategy: DebtPayoffStrategy) => void;
  onExtraPaymentChange?: (amount: number) => void;
}

// Calculate detailed debt metrics
function calculateDebtMetrics(debts: Debt[]) {
  const activeDebts = debts.filter(d => !d.isPaidOff);

  if (activeDebts.length === 0) {
    return null;
  }

  const totalBalance = activeDebts.reduce((sum, d) => sum + d.balance, 0);
  const totalMinPayments = activeDebts.reduce((sum, d) => sum + d.minimumPayment, 0);
  const weightedAvgRate = activeDebts.reduce((sum, d) => sum + (d.interestRate * d.balance), 0) / totalBalance;
  const monthlyInterestCost = activeDebts.reduce((sum, d) => sum + (d.balance * d.interestRate / 12), 0);
  const yearlyInterestCost = monthlyInterestCost * 12;

  const sortedByRate = [...activeDebts].sort((a, b) => b.interestRate - a.interestRate);
  const sortedByBalance = [...activeDebts].sort((a, b) => a.balance - b.balance);

  const highestRateDebt = sortedByRate[0];
  const lowestBalanceDebt = sortedByBalance[0];
  const largestDebt = [...activeDebts].sort((a, b) => b.balance - a.balance)[0];

  // Categorize debts by rate
  const highRateDebts = activeDebts.filter(d => d.interestRate >= 0.20);
  const mediumRateDebts = activeDebts.filter(d => d.interestRate >= 0.10 && d.interestRate < 0.20);
  const lowRateDebts = activeDebts.filter(d => d.interestRate < 0.10);

  // Calculate time to payoff with minimum payments only (rough estimate)
  const avgRate = weightedAvgRate;
  const monthlyRate = avgRate / 12;
  const minPaymentMonths = monthlyRate > 0
    ? Math.ceil(-Math.log(1 - (totalBalance * monthlyRate / totalMinPayments)) / Math.log(1 + monthlyRate))
    : Math.ceil(totalBalance / totalMinPayments);

  return {
    totalBalance,
    totalMinPayments,
    weightedAvgRate,
    monthlyInterestCost,
    yearlyInterestCost,
    highestRateDebt,
    lowestBalanceDebt,
    largestDebt,
    highRateDebts,
    mediumRateDebts,
    lowRateDebts,
    minPaymentMonths: Math.min(minPaymentMonths, 600),
    debtCount: activeDebts.length,
  };
}

// Generate thorough, data-driven advisor responses
function generateAdvisorResponse(
  userMessage: string,
  context: AIAdvisorChatProps['context'],
  conversationHistory: Message[]
): string {
  const msg = userMessage.toLowerCase();
  const { debts, totalDebt, strategy, extraPayment, comparison, debtFreeDate } = context;
  const metrics = calculateDebtMetrics(debts);

  if (!metrics) {
    return `You're debt-free! No active debts to discuss. That's the dream.\n\nWant to talk about savings goals instead? Or how to stay out of debt?`;
  }

  const {
    totalBalance,
    totalMinPayments,
    weightedAvgRate,
    monthlyInterestCost,
    yearlyInterestCost,
    highestRateDebt,
    lowestBalanceDebt,
    largestDebt,
    highRateDebts,
    mediumRateDebts,
    lowRateDebts,
    minPaymentMonths,
    debtCount,
  } = metrics;

  // ============================================
  // GREETING / INTRODUCTION
  // ============================================
  if (msg.includes('hello') || msg.includes('hi') || msg.includes('hey') || conversationHistory.length === 0) {
    let greeting = `I'm your SpendSignal Advisor. Let me give you a quick snapshot of where you stand:\n\n`;
    greeting += `**Your Debt Profile:**\n`;
    greeting += `• Total debt: ${formatCurrency(totalBalance)} across ${debtCount} account${debtCount > 1 ? 's' : ''}\n`;
    greeting += `• Monthly minimum payments: ${formatCurrency(totalMinPayments)}\n`;
    greeting += `• Average interest rate: ${(weightedAvgRate * 100).toFixed(1)}%\n`;
    greeting += `• Interest costing you: ${formatCurrency(monthlyInterestCost)}/month (${formatCurrency(yearlyInterestCost)}/year)\n\n`;

    if (highRateDebts.length > 0) {
      greeting += `⚠️ **Alert:** You have ${highRateDebts.length} high-interest debt${highRateDebts.length > 1 ? 's' : ''} (20%+ APR). That's expensive money.\n\n`;
    }

    greeting += `**Current Strategy:** ${strategy}\n`;
    greeting += `**Extra Payment:** ${formatCurrency(extraPayment)}/month\n`;
    greeting += `**Debt-Free Date:** ${debtFreeDate}\n\n`;

    greeting += `What would you like to dive into?\n`;
    greeting += `• "Tell me about my debts" - detailed breakdown\n`;
    greeting += `• "Which strategy is best?" - Avalanche vs Snowball analysis\n`;
    greeting += `• "How much should I pay extra?" - payment optimization\n`;
    greeting += `• "What's costing me the most?" - interest analysis`;

    return greeting;
  }

  // ============================================
  // DETAILED DEBT BREAKDOWN
  // ============================================
  if (msg.includes('tell me about') || msg.includes('breakdown') || msg.includes('my debts') || msg.includes('list') || msg.includes('show me')) {
    let response = `**Complete Debt Breakdown:**\n\n`;

    const activeDebts = debts.filter(d => !d.isPaidOff);
    activeDebts.forEach((debt, i) => {
      const monthlyInterest = debt.balance * debt.interestRate / 12;
      const rateCategory = debt.interestRate >= 0.20 ? '🔴 HIGH' : debt.interestRate >= 0.10 ? '🟡 MEDIUM' : '🟢 LOW';

      response += `**${i + 1}. ${debt.name}**\n`;
      response += `   Balance: ${formatCurrency(debt.balance)}\n`;
      response += `   Rate: ${(debt.interestRate * 100).toFixed(2)}% APR ${rateCategory}\n`;
      response += `   Minimum: ${formatCurrency(debt.minimumPayment)}/mo\n`;
      response += `   Monthly interest: ${formatCurrency(monthlyInterest)}\n`;
      response += `   ${debt.balance > 5000 ? '📊 Large balance' : debt.balance < 1000 ? '✅ Quick win potential' : ''}\n\n`;
    });

    response += `**Summary:**\n`;
    response += `• Highest rate: ${highestRateDebt.name} at ${(highestRateDebt.interestRate * 100).toFixed(1)}%\n`;
    response += `• Smallest balance: ${lowestBalanceDebt.name} at ${formatCurrency(lowestBalanceDebt.balance)}\n`;
    response += `• Largest balance: ${largestDebt.name} at ${formatCurrency(largestDebt.balance)}\n\n`;

    response += `Which debt would you like to discuss in more detail?`;

    return response;
  }

  // ============================================
  // STRATEGY COMPARISON (DETAILED)
  // ============================================
  if (msg.includes('avalanche') || msg.includes('snowball') || msg.includes('strategy') || msg.includes('which method') || msg.includes('which approach') || msg.includes('compare')) {
    const avalancheTotal = comparison.avalanche.totalInterest;
    const snowballTotal = comparison.snowball.totalInterest;
    const savings = comparison.interestSaved;
    const avalancheMonths = comparison.avalanche.monthsToDebtFree;
    const snowballMonths = comparison.snowball.monthsToDebtFree;

    let response = `**Strategy Deep Dive: Avalanche vs Snowball**\n\n`;

    response += `📊 **THE NUMBERS:**\n\n`;
    response += `**Avalanche:**\n`;
    response += `• Total interest: ${formatCurrency(avalancheTotal)}\n`;
    response += `• Time to freedom: ${avalancheMonths} months\n\n`;
    response += `**Snowball:**\n`;
    response += `• Total interest: ${formatCurrency(snowballTotal)}\n`;
    response += `• Time to freedom: ${snowballMonths} months\n\n`;
    if (savings > 0) {
      response += `💰 **Avalanche saves ${formatCurrency(savings)}**\n\n`;
    } else if (savings < 0) {
      response += `💰 **Snowball saves ${formatCurrency(Math.abs(savings))}**\n\n`;
    }

    response += `🏔️ **AVALANCHE** (Highest Interest First)\n`;
    response += `• Target: ${highestRateDebt.name} (${(highestRateDebt.interestRate * 100).toFixed(1)}% APR)\n`;
    response += `• Advantage: Minimizes total interest paid\n`;
    response += `• Best for: Disciplined people motivated by math\n`;
    response += `• Challenge: Biggest debts often take longest\n\n`;

    response += `⛄ **SNOWBALL** (Smallest Balance First)\n`;
    response += `• Target: ${lowestBalanceDebt.name} (${formatCurrency(lowestBalanceDebt.balance)})\n`;
    response += `• Advantage: Quick wins build momentum\n`;
    response += `• Best for: People who need motivation boosts\n`;
    response += `• Challenge: May pay more interest overall\n\n`;

    response += `**MY RECOMMENDATION:**\n`;
    if (savings > 500) {
      response += `Go with **Avalanche**. You'll save ${formatCurrency(savings)} - that's real money. Your ${highestRateDebt.name} at ${(highestRateDebt.interestRate * 100).toFixed(1)}% is bleeding you dry at ${formatCurrency(highestRateDebt.balance * highestRateDebt.interestRate / 12)}/month in interest alone.\n\n`;
      response += `However, if you've tried and failed with Avalanche before, Snowball is better than giving up. The best strategy is the one you'll stick with.`;
    } else if (savings > 100) {
      response += `**Avalanche** saves you ${formatCurrency(savings)}, but it's not a huge difference. If quick wins motivate you, Snowball is totally valid. The psychological benefit might be worth more than the ${formatCurrency(savings)}.`;
    } else {
      response += `They're nearly identical for your situation (only ${formatCurrency(Math.abs(savings))} difference). Go with **Snowball** - the quick wins from paying off ${lowestBalanceDebt.name} first will feel great and keep you motivated.`;
    }

    return response;
  }

  // ============================================
  // EXTRA PAYMENT OPTIMIZATION
  // ============================================
  if (msg.includes('extra') || msg.includes('more') || msg.includes('how much') || msg.includes('afford') || msg.includes('pay more') || msg.includes('optimize') || msg.includes('increase')) {
    const currentExtra = extraPayment;
    const totalMonthly = totalMinPayments + currentExtra;

    let response = `**Payment Optimization Analysis**\n\n`;
    response += `**Current Setup:**\n`;
    response += `• Minimum payments: ${formatCurrency(totalMinPayments)}/month\n`;
    response += `• Extra payment: ${formatCurrency(currentExtra)}/month\n`;
    response += `• Total monthly: ${formatCurrency(totalMonthly)}/month\n`;
    response += `• Debt-free date: ${debtFreeDate}\n\n`;

    response += `**Impact of Different Extra Payments:**\n\n`;

    // Show key scenarios
    const scenarios = [
      { extra: 0, label: 'Minimum only' },
      { extra: 100, label: '+$100/mo' },
      { extra: 200, label: '+$200/mo' },
      { extra: 500, label: '+$500/mo' },
    ];

    scenarios.forEach(s => {
      const isYou = s.extra === currentExtra;
      const indicator = isYou ? ' ← **You are here**' : '';
      const impact = s.extra > currentExtra ? '(faster)' : s.extra < currentExtra ? '(slower)' : '';
      response += `• ${formatCurrency(s.extra)} extra → ${formatCurrency(totalMinPayments + s.extra)}/mo total ${impact}${indicator}\n`;
    });

    if (!scenarios.find(s => s.extra === currentExtra)) {
      response += `• ${formatCurrency(currentExtra)} extra → ${formatCurrency(totalMinPayments + currentExtra)}/mo total ← **You are here**\n`;
    }

    response += `\n**The Math:**\n`;
    response += `• With only minimums: ~${minPaymentMonths} months to payoff\n`;
    response += `• Every extra $100/month can shave 6-12 months off your timeline\n`;
    response += `• Extra payments go 100% to principal (after current month's interest)\n\n`;

    response += `**Where to Find Extra Money:**\n`;
    response += `1. 🔴 RED zone spending - impulse purchases, regret buys\n`;
    response += `2. 🟡 Subscriptions - audit and cut unused ones\n`;
    response += `3. 🟡 Dining out - cook 2 more meals/week = $100-200/month\n`;
    response += `4. 💰 Side income - even $200/month accelerates freedom\n\n`;

    response += `What's your budget look like? I can help identify redirect opportunities.`;

    return response;
  }

  // ============================================
  // INTEREST COST ANALYSIS
  // ============================================
  if (msg.includes('interest') || msg.includes('cost') || msg.includes('expensive') || msg.includes('rate') || msg.includes('worst') || msg.includes('bleeding')) {
    let response = `**Interest Cost Analysis**\n\n`;
    response += `**What Interest is Costing You:**\n`;
    response += `• Monthly interest expense: ${formatCurrency(monthlyInterestCost)}\n`;
    response += `• Yearly interest expense: ${formatCurrency(yearlyInterestCost)}\n`;
    response += `• That's ${formatCurrency(yearlyInterestCost / 52)}/week just in interest\n\n`;

    response += `**Breakdown by Debt:**\n\n`;

    const activeDebts = debts.filter(d => !d.isPaidOff).sort((a, b) =>
      (b.balance * b.interestRate) - (a.balance * a.interestRate)
    );

    activeDebts.forEach((debt, i) => {
      const monthlyInt = debt.balance * debt.interestRate / 12;
      const yearlyInt = monthlyInt * 12;
      const pctOfTotal = (monthlyInt / monthlyInterestCost * 100).toFixed(0);

      response += `**${debt.name}**\n`;
      response += `   ${formatCurrency(monthlyInt)}/month • ${formatCurrency(yearlyInt)}/year\n`;
      response += `   ${pctOfTotal}% of your total interest cost\n`;
      response += `   Rate: ${(debt.interestRate * 100).toFixed(2)}% on ${formatCurrency(debt.balance)}\n\n`;
    });

    response += `**The Takeaway:**\n`;
    if (highRateDebts.length > 0) {
      const highRateInterest = highRateDebts.reduce((sum, d) => sum + (d.balance * d.interestRate / 12), 0);
      response += `Your high-rate debts (20%+) are costing you ${formatCurrency(highRateInterest)}/month. That's ${(highRateInterest / monthlyInterestCost * 100).toFixed(0)}% of your interest expense.\n\n`;
      response += `Eliminating these first (Avalanche) stops the bleeding fastest.`;
    } else {
      response += `Your rates are relatively reasonable (all under 20%). Focus on consistent payments and adding extra when possible.`;
    }

    return response;
  }

  // ============================================
  // SPECIFIC DEBT QUESTIONS
  // ============================================
  if (msg.includes('credit card') || msg.includes('student loan') || msg.includes('car loan') || msg.includes('mortgage') || msg.includes('personal loan')) {
    const activeDebts = debts.filter(d => !d.isPaidOff);
    const matchingDebt = activeDebts.find(d =>
      d.name.toLowerCase().includes(msg.split(' ').find(w =>
        ['credit', 'card', 'student', 'loan', 'car', 'mortgage', 'personal'].includes(w)
      ) || '')
    );

    if (matchingDebt) {
      const monthlyInterest = matchingDebt.balance * matchingDebt.interestRate / 12;
      let response = `**Let's talk about ${matchingDebt.name}:**\n\n`;
      response += `• Balance: ${formatCurrency(matchingDebt.balance)}\n`;
      response += `• Rate: ${(matchingDebt.interestRate * 100).toFixed(2)}% APR\n`;
      response += `• Minimum: ${formatCurrency(matchingDebt.minimumPayment)}/month\n`;
      response += `• Monthly interest: ${formatCurrency(monthlyInterest)}\n`;
      response += `• Yearly interest: ${formatCurrency(monthlyInterest * 12)}\n\n`;

      if (matchingDebt.interestRate >= 0.20) {
        response += `⚠️ This is a HIGH-RATE debt. At ${(matchingDebt.interestRate * 100).toFixed(1)}%, you're paying ${formatCurrency(monthlyInterest)} in interest every month before touching the principal.\n\n`;
        response += `**Options to consider:**\n`;
        response += `1. Balance transfer to 0% intro APR card\n`;
        response += `2. Personal loan at lower rate (if credit allows)\n`;
        response += `3. Throw every extra dollar at this one\n`;
      } else if (matchingDebt.interestRate <= 0.07) {
        response += `✅ This is a LOW-RATE debt. At ${(matchingDebt.interestRate * 100).toFixed(1)}%, mathematically you could argue for investing extra money instead of paying this down faster.\n\n`;
        response += `However, there's psychological value in being debt-free. Your call.`;
      }

      return response;
    }
  }

  // ============================================
  // TIMELINE & MILESTONES
  // ============================================
  if (msg.includes('when') || msg.includes('how long') || msg.includes('timeline') || msg.includes('debt free') || msg.includes('debt-free') || msg.includes('milestone')) {
    let response = `**Your Debt Freedom Timeline**\n\n`;
    response += `**Target Date:** ${debtFreeDate}\n\n`;

    response += `**Payoff Order (${strategy} Strategy):**\n`;
    const activeDebts = debts.filter(d => !d.isPaidOff);

    // Sort by strategy
    let sortedDebts: Debt[];
    if (strategy === 'AVALANCHE') {
      sortedDebts = [...activeDebts].sort((a, b) => b.interestRate - a.interestRate);
    } else if (strategy === 'SNOWBALL') {
      sortedDebts = [...activeDebts].sort((a, b) => a.balance - b.balance);
    } else {
      sortedDebts = [...activeDebts].sort((a, b) => (a.priority ?? 0) - (b.priority ?? 0));
    }

    sortedDebts.forEach((debt, i) => {
      const emoji = i === 0 ? '🎯' : i === sortedDebts.length - 1 ? '🏁' : '📍';
      response += `${emoji} ${i + 1}. ${debt.name} (${formatCurrency(debt.balance)})\n`;
    });

    response += `\n**Milestones to Celebrate:**\n`;
    response += `✓ First debt paid off - ${sortedDebts[0]?.name}\n`;
    response += `✓ Halfway point - after debt #${Math.ceil(sortedDebts.length / 2)}\n`;
    response += `✓ Under ${formatCurrency(totalBalance / 2)} remaining\n`;
    response += `✓ Final payment - FREEDOM 🎉\n\n`;

    response += `**Reality Check:**\n`;
    response += `• Current pace: ${debtFreeDate}\n`;
    response += `• With +$100/month: Potentially 3-6 months sooner\n`;
    response += `• With +$300/month: Potentially 8-12 months sooner\n\n`;

    response += `Every month you stay committed is a month closer. The timeline gets easier, not harder - as you pay off each debt, you have more money to throw at the next one.`;

    return response;
  }

  // ============================================
  // MOTIVATION / PSYCHOLOGICAL SUPPORT
  // ============================================
  if (msg.includes('hard') || msg.includes('stuck') || msg.includes('motivat') || msg.includes('discouraged') || msg.includes('give up') || msg.includes('frustrated') || msg.includes('stressed') || msg.includes('overwhelm')) {
    let response = `**Let's Get Perspective**\n\n`;
    response += `I hear you. ${formatCurrency(totalBalance)} is real weight to carry. But let me show you something:\n\n`;

    response += `**What You've Already Proven:**\n`;
    response += `• You're tracking your debt (most people avoid looking)\n`;
    response += `• You have a strategy (${strategy})\n`;
    response += `• You're paying ${formatCurrency(extraPayment)} extra each month\n`;
    response += `• You're asking for help (that takes courage)\n\n`;

    response += `**The Math in Your Favor:**\n`;
    const monthlyProgress = totalMinPayments + extraPayment - monthlyInterestCost;
    response += `• Each month, ${formatCurrency(monthlyProgress)} goes to principal\n`;
    response += `• In 6 months: ~${formatCurrency(monthlyProgress * 6)} less debt\n`;
    response += `• In 1 year: ~${formatCurrency(monthlyProgress * 12)} less debt\n\n`;

    response += `**Quick Win Available:**\n`;
    if (lowestBalanceDebt.balance < 1500) {
      response += `Your ${lowestBalanceDebt.name} at ${formatCurrency(lowestBalanceDebt.balance)} could be gone in ${Math.ceil(lowestBalanceDebt.balance / (lowestBalanceDebt.minimumPayment + extraPayment))} months. That's a WIN you can see.\n\n`;
    }

    response += `**What Helps:**\n`;
    response += `1. Focus on ONE debt at a time (not the total)\n`;
    response += `2. Celebrate every payment, not just payoffs\n`;
    response += `3. Track your progress monthly (the line goes down!)\n`;
    response += `4. Remember: temporary sacrifice, permanent freedom\n\n`;

    response += `What's the ONE thing weighing on you most right now?`;

    return response;
  }

  // ============================================
  // BUDGET & FINDING MONEY
  // ============================================
  if (msg.includes('budget') || msg.includes('spend') || msg.includes('cut') || msg.includes('save') || msg.includes('redirect') || msg.includes('find money') || msg.includes('more money')) {
    let response = `**Finding Money to Accelerate Debt Payoff**\n\n`;
    response += `Let's be real - the fastest way out is to throw more money at it. Here's where to look:\n\n`;

    response += `**🔴 RED Zone Spending (Cut First)**\n`;
    response += `These are the "wants masquerading as needs":\n`;
    response += `• Impulse Amazon purchases\n`;
    response += `• Premium when basic works\n`;
    response += `• Things you bought and didn't use\n`;
    response += `• FOMO purchases\n`;
    response += `→ Potential savings: $100-300/month\n\n`;

    response += `**🟡 YELLOW Zone (Reduce)**\n`;
    response += `Discretionary but negotiable:\n`;
    response += `• Dining out: 2 less meals/week = $80-160/month\n`;
    response += `• Subscriptions: Audit all, keep top 2-3\n`;
    response += `• Entertainment: Free alternatives exist\n`;
    response += `• Convenience fees: Cook, don't DoorDash\n`;
    response += `→ Potential savings: $150-400/month\n\n`;

    response += `**💰 Income Side**\n`;
    response += `• Sell stuff you don't use (one-time boost)\n`;
    response += `• Side gig: Even $200/month helps\n`;
    response += `• Negotiate raise (if due)\n`;
    response += `• Tax refund → straight to debt\n\n`;

    response += `**The ${formatCurrency(200)} Challenge:**\n`;
    response += `If you found ${formatCurrency(200)} more per month, you'd be paying ${formatCurrency(totalMinPayments + extraPayment + 200)} total. That could shave 6-12 months off your timeline.\n\n`;

    response += `What category do you think has the most "fat" to trim?`;

    return response;
  }

  // ============================================
  // CUSTOM STRATEGY
  // ============================================
  if (msg.includes('custom') || msg.includes('my own order') || msg.includes('reorder') || msg.includes('prioritize') || msg.includes('order')) {
    let response = `**Custom Payoff Strategy**\n\n`;
    response += `Custom lets you override the math for personal reasons. Valid scenarios:\n\n`;

    response += `**When Custom Makes Sense:**\n`;
    response += `1. 😤 **Emotional debt** - Something that stresses you out regardless of rate\n`;
    response += `2. 👨‍👩‍👧 **Family debt** - Money owed to relatives (relationship > math)\n`;
    response += `3. ⏰ **Promotional rate ending** - 0% APR about to become 25%\n`;
    response += `4. 🎯 **Specific goal** - Need to free up a payment for something\n\n`;

    response += `**How to Set Custom Order:**\n`;
    response += `1. Select "Custom" in the strategy selector\n`;
    response += `2. Use the ↑↓ arrows to reorder your debts\n`;
    response += `3. First debt gets all extra payments\n`;
    response += `4. Math updates automatically\n\n`;

    response += `**Your Current Debts:**\n`;
    const activeDebts = debts.filter(d => !d.isPaidOff);
    activeDebts.forEach((d, i) => {
      response += `${i + 1}. ${d.name} - ${formatCurrency(d.balance)} @ ${(d.interestRate * 100).toFixed(1)}%\n`;
    });

    response += `\nIs there a specific reason you want custom ordering? I can help you decide.`;

    return response;
  }

  // ============================================
  // BALANCE TRANSFER / REFINANCING
  // ============================================
  if (msg.includes('balance transfer') || msg.includes('refinance') || msg.includes('consolidat') || msg.includes('lower rate') || msg.includes('0%')) {
    let response = `**Debt Optimization Strategies**\n\n`;

    if (highRateDebts.length > 0) {
      const highRateTotal = highRateDebts.reduce((sum, d) => sum + d.balance, 0);
      response += `You have ${formatCurrency(highRateTotal)} in high-rate debt (20%+). Options:\n\n`;
    }

    response += `**💳 Balance Transfer Cards**\n`;
    response += `• Many offer 0% APR for 15-21 months\n`;
    response += `• Transfer fee: Usually 3-5% of balance\n`;
    response += `• Best for: Credit card debt you can pay off in promo period\n`;
    response += `• ⚠️ Danger: Rate jumps to 20%+ after promo ends\n\n`;

    response += `**🏦 Personal Loan Consolidation**\n`;
    response += `• Fixed rate, fixed term (typically 3-5 years)\n`;
    response += `• Rates: 7-15% for good credit, 15-25% for fair\n`;
    response += `• Best for: Multiple credit cards, want one payment\n`;
    response += `• Simplifies: One bill instead of many\n\n`;

    response += `**Should You Do It?**\n`;
    response += `✅ Yes if: New rate is significantly lower AND you won't rack up new debt\n`;
    response += `❌ No if: You'll just fill up the freed credit cards again\n`;
    response += `⚠️ Maybe: Run the numbers including fees\n\n`;

    response += `**Your Highest Rate Debt:**\n`;
    response += `${highestRateDebt.name} at ${(highestRateDebt.interestRate * 100).toFixed(1)}% with ${formatCurrency(highestRateDebt.balance)} balance.\n`;
    response += `Monthly interest: ${formatCurrency(highestRateDebt.balance * highestRateDebt.interestRate / 12)}\n\n`;

    response += `If you transferred this to 0% for 18 months, you'd save ~${formatCurrency(highestRateDebt.balance * highestRateDebt.interestRate * 1.5)} in interest (minus transfer fee).`;

    return response;
  }

  // ============================================
  // EMERGENCY FUND VS DEBT
  // ============================================
  if (msg.includes('emergency') || msg.includes('savings') || msg.includes('save first') || msg.includes('both')) {
    let response = `**The Emergency Fund vs Debt Question**\n\n`;
    response += `This is THE classic personal finance debate. Here's my take:\n\n`;

    response += `**The Risk Without Emergency Fund:**\n`;
    response += `• Unexpected expense → credit card → more debt\n`;
    response += `• Job loss → missed payments → credit damage\n`;
    response += `• You're one emergency away from going backwards\n\n`;

    response += `**My Recommended Approach:**\n\n`;
    response += `**Phase 1: Starter Emergency Fund**\n`;
    response += `• Save $1,000-2,000 FIRST (pause extra debt payments)\n`;
    response += `• This is your buffer against emergencies\n`;
    response += `• Should take 1-3 months\n\n`;

    response += `**Phase 2: Attack Debt**\n`;
    response += `• All extra money goes to debt (${strategy} strategy)\n`;
    response += `• Keep paying minimums on everything\n`;
    response += `• Don't touch emergency fund unless true emergency\n\n`;

    response += `**Phase 3: Full Emergency Fund**\n`;
    response += `• After debt-free, build 3-6 months expenses\n`;
    response += `• This is your real safety net\n\n`;

    response += `**The Math:**\n`;
    response += `Your weighted average debt rate: ${(weightedAvgRate * 100).toFixed(1)}%\n`;
    response += `Savings accounts earn: ~4-5%\n`;
    response += `→ You're "losing" ${((weightedAvgRate - 0.045) * 100).toFixed(1)}% by holding cash vs paying debt\n\n`;

    response += `BUT that safety net is worth the cost. ${formatCurrency(1500)} in savings could prevent ${formatCurrency(5000)}+ in credit card charges during an emergency.`;

    return response;
  }

  // ============================================
  // DEFAULT / CATCH-ALL
  // ============================================
  let response = `Let me give you a data-driven answer based on your situation:\n\n`;
  response += `**Your Profile:**\n`;
  response += `• ${formatCurrency(totalBalance)} total debt\n`;
  response += `• ${(weightedAvgRate * 100).toFixed(1)}% average rate\n`;
  response += `• ${formatCurrency(monthlyInterestCost)}/month in interest\n`;
  response += `• ${strategy} strategy, ${formatCurrency(extraPayment)} extra/month\n`;
  response += `• Debt-free by: ${debtFreeDate}\n\n`;

  response += `**I can help you with:**\n`;
  response += `• "Compare strategies" - Avalanche vs Snowball analysis\n`;
  response += `• "Tell me about my debts" - detailed breakdown\n`;
  response += `• "What's costing me the most?" - interest analysis\n`;
  response += `• "How do I find more money?" - budget optimization\n`;
  response += `• "Should I consolidate?" - refinancing options\n`;
  response += `• "Emergency fund vs debt?" - prioritization\n\n`;

  response += `What would you like to explore?`;

  return response;
}

// Quick suggestion buttons
const QUICK_SUGGESTIONS = [
  'Tell me about my debts',
  'Which strategy is best?',
  'What\'s costing me the most?',
  'How do I find extra money?',
  'When will I be debt-free?',
  'Should I consolidate?',
];

export function AIAdvisorChat({
  isOpen,
  onClose,
  context,
  onStrategyChange,
  onExtraPaymentChange,
}: AIAdvisorChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  // Send initial greeting on first open
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const greeting: Message = {
        id: 'greeting',
        role: 'advisor',
        content: generateAdvisorResponse('hello', context, []),
        timestamp: new Date(),
      };
      setMessages([greeting]);
    }
  }, [isOpen, context, messages.length]);

  const handleSend = async (messageText?: string) => {
    const text = messageText || input.trim();
    if (!text) return;

    // Add user message
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Simulate AI thinking delay (varies by response complexity)
    await new Promise(resolve => setTimeout(resolve, 600 + Math.random() * 800));

    // Generate response
    const response = generateAdvisorResponse(text, context, [...messages, userMessage]);
    const advisorMessage: Message = {
      id: `advisor-${Date.now()}`,
      role: 'advisor',
      content: response,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, advisorMessage]);
    setIsTyping(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const clearChat = () => {
    setMessages([]);
    // Trigger new greeting
    setTimeout(() => {
      const greeting: Message = {
        id: 'greeting-new',
        role: 'advisor',
        content: generateAdvisorResponse('hello', context, []),
        timestamp: new Date(),
      };
      setMessages([greeting]);
    }, 100);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-[480px] z-50 flex flex-col bg-[var(--card)] border-l border-[var(--border)] shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[var(--border)] bg-gradient-to-r from-[#8B5CF6]/10 to-[#3B82F6]/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#8B5CF6] to-[#3B82F6] flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <div>
            <h2 className="font-semibold text-[var(--foreground)]">AI Financial Advisor</h2>
            <p className="text-xs text-[var(--foreground-muted)]">Data-driven debt guidance</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={clearChat}
            className="p-2 rounded-lg text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-[var(--background)] transition-colors"
            title="New conversation"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-[var(--background)] transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Context Summary Bar */}
      <div className="px-4 py-2 bg-[var(--background)] border-b border-[var(--border)] flex items-center gap-4 text-xs">
        <div>
          <span className="text-[var(--foreground-muted)]">Total: </span>
          <span className="font-medium text-[#EF4444]">{formatCurrency(context.totalDebt)}</span>
        </div>
        <div>
          <span className="text-[var(--foreground-muted)]">Strategy: </span>
          <span className="font-medium text-[var(--foreground)]">{context.strategy}</span>
        </div>
        <div>
          <span className="text-[var(--foreground-muted)]">Extra: </span>
          <span className="font-medium text-[#22C55E]">{formatCurrency(context.extraPayment)}/mo</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map(message => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[90%] p-3 rounded-2xl ${
                message.role === 'user'
                  ? 'bg-[#8B5CF6] text-white rounded-br-md'
                  : 'bg-[var(--background)] text-[var(--foreground)] rounded-bl-md border border-[var(--border)]'
              }`}
            >
              <div className="text-sm whitespace-pre-wrap prose prose-sm dark:prose-invert max-w-none">
                {message.content.split('\n').map((line, i) => {
                  // Handle markdown-style bold
                  const parts = line.split(/(\*\*[^*]+\*\*)/g);
                  return (
                    <p key={i} className={`${i > 0 ? 'mt-1' : ''} ${line === '' ? 'h-2' : ''}`}>
                      {parts.map((part, j) => {
                        if (part.startsWith('**') && part.endsWith('**')) {
                          return <strong key={j}>{part.slice(2, -2)}</strong>;
                        }
                        return <span key={j}>{part}</span>;
                      })}
                    </p>
                  );
                })}
              </div>
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-[var(--background)] border border-[var(--border)] rounded-2xl rounded-bl-md p-3">
              <div className="flex gap-1">
                <div className="w-2 h-2 rounded-full bg-[var(--foreground-muted)] animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 rounded-full bg-[var(--foreground-muted)] animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 rounded-full bg-[var(--foreground-muted)] animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick suggestions */}
      {messages.length <= 2 && (
        <div className="px-4 pb-2">
          <p className="text-xs text-[var(--foreground-muted)] mb-2">Ask me about:</p>
          <div className="flex flex-wrap gap-2">
            {QUICK_SUGGESTIONS.map(suggestion => (
              <button
                key={suggestion}
                onClick={() => handleSend(suggestion)}
                className="px-3 py-1.5 text-xs rounded-full bg-[var(--background)] border border-[var(--border)] text-[var(--foreground-muted)] hover:border-[#8B5CF6] hover:text-[#8B5CF6] transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t border-[var(--border)]">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about strategies, payments, timeline..."
            className="flex-1 px-4 py-2.5 rounded-xl bg-[var(--background)] border border-[var(--border)] text-[var(--foreground)] placeholder:text-[var(--foreground-muted)] focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/50 text-sm"
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || isTyping}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
        <p className="text-[10px] text-[var(--foreground-subtle)] text-center mt-2">
          AI guidance based on your data. Not a substitute for professional financial advice.
        </p>
      </div>
    </div>
  );
}

// Floating button to open advisor
export function AIAdvisorButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-gradient-to-br from-[#8B5CF6] to-[#3B82F6] text-white shadow-lg shadow-[#8B5CF6]/30 hover:shadow-xl hover:shadow-[#8B5CF6]/40 hover:scale-105 transition-all flex items-center justify-center z-40 group"
      aria-label="Open AI Advisor"
    >
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>

      {/* Tooltip */}
      <span className="absolute right-full mr-3 px-3 py-1.5 rounded-lg bg-[var(--card)] border border-[var(--border)] text-sm text-[var(--foreground)] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
        Ask AI Advisor
      </span>
    </button>
  );
}
