// Subscription tier definitions

export const SUBSCRIPTION_TIERS = {
  FREE: 'FREE',
  PREMIUM: 'PREMIUM',
  PREMIUM_ANNUAL: 'PREMIUM_ANNUAL',
  ADVISOR: 'ADVISOR',
  ADVISOR_ANNUAL: 'ADVISOR_ANNUAL',
} as const;

export type SubscriptionTier = keyof typeof SUBSCRIPTION_TIERS;

export const SUBSCRIPTION_STATUS = {
  ACTIVE: 'ACTIVE',
  CANCELED: 'CANCELED',
  PAST_DUE: 'PAST_DUE',
  TRIALING: 'TRIALING',
  INCOMPLETE: 'INCOMPLETE',
} as const;

export type SubscriptionStatus = keyof typeof SUBSCRIPTION_STATUS;

export const TIER_CONFIG = {
  FREE: {
    name: 'Free',
    price: 0,
    priceDisplay: '$0',
    period: null,
    description: 'Try SpendSignal with demo data',
    features: [
      'Demo mode with mock transactions',
      'Traffic light categorization',
      '3 spending goals',
      '3-month history',
      '50 AI suggestions/month',
    ],
    limits: {
      maxGoals: 3,
      maxAlerts: 0,
      historyMonths: 3,
      aiSuggestionsPerMonth: 50,
      bankConnections: 0,
      canExportReports: false,
      hasAdvancedTrends: false,
      hasDarkMode: false,
      hasDebtPlanner: false,
      hasSavingsGoals: false,
      hasSmartRecommendations: false,
    },
  },
  PREMIUM: {
    name: 'Premium',
    price: 999, // $9.99 in cents
    priceDisplay: '$9.99',
    period: 'month',
    description: 'Full access to your real financial data',
    popular: true,
    features: [
      'Connect real bank accounts',
      'Unlimited goals',
      'Custom spending alerts',
      'Full history & trends',
      'Unlimited AI suggestions',
      'Monthly PDF reports',
      'Dark mode',
      'Priority support',
    ],
    limits: {
      maxGoals: Infinity,
      maxAlerts: Infinity,
      historyMonths: Infinity,
      aiSuggestionsPerMonth: Infinity,
      bankConnections: 5,
      canExportReports: true,
      hasAdvancedTrends: true,
      hasDarkMode: true,
      hasDebtPlanner: false,
      hasSavingsGoals: false,
      hasSmartRecommendations: false,
    },
  },
  PREMIUM_ANNUAL: {
    name: 'Premium Annual',
    price: 9900, // $99 in cents
    priceDisplay: '$99',
    period: 'year',
    description: 'Best value - 2 months free',
    savings: '17%',
    features: [
      'Everything in Premium',
      '2 months free',
      'Early access to features',
      'Extended support hours',
    ],
    limits: {
      maxGoals: Infinity,
      maxAlerts: Infinity,
      historyMonths: Infinity,
      aiSuggestionsPerMonth: Infinity,
      bankConnections: 10,
      canExportReports: true,
      hasAdvancedTrends: true,
      hasDarkMode: true,
      hasDebtPlanner: false,
      hasSavingsGoals: false,
      hasSmartRecommendations: false,
    },
  },
  ADVISOR: {
    name: 'Advisor',
    price: 1499, // $14.99 in cents
    priceDisplay: '$14.99',
    period: 'month',
    description: 'Complete financial planning suite',
    features: [
      'Everything in Premium',
      'Debt Payoff Planner',
      'Savings Goal Tracker',
      'Smart AI Recommendations',
      '"What If" Scenarios',
      'Priority Support',
    ],
    limits: {
      maxGoals: Infinity,
      maxAlerts: Infinity,
      historyMonths: Infinity,
      aiSuggestionsPerMonth: Infinity,
      bankConnections: 10,
      canExportReports: true,
      hasAdvancedTrends: true,
      hasDarkMode: true,
      hasDebtPlanner: true,
      hasSavingsGoals: true,
      hasSmartRecommendations: true,
    },
  },
  ADVISOR_ANNUAL: {
    name: 'Advisor Annual',
    price: 14900, // $149 in cents
    priceDisplay: '$149',
    period: 'year',
    description: 'Best value - 2 months free',
    savings: '17%',
    features: [
      'Everything in Advisor',
      '2 months free',
      'Early access to features',
      'Extended support hours',
    ],
    limits: {
      maxGoals: Infinity,
      maxAlerts: Infinity,
      historyMonths: Infinity,
      aiSuggestionsPerMonth: Infinity,
      bankConnections: 10,
      canExportReports: true,
      hasAdvancedTrends: true,
      hasDarkMode: true,
      hasDebtPlanner: true,
      hasSavingsGoals: true,
      hasSmartRecommendations: true,
    },
  },
} as const;

// Feature gate helper
export function canAccessFeature(
  tier: SubscriptionTier,
  feature: keyof typeof TIER_CONFIG.FREE.limits,
  currentUsage?: number
): boolean {
  const limits = TIER_CONFIG[tier].limits;
  const limit = limits[feature];

  if (typeof limit === 'boolean') {
    return limit;
  }

  if (limit === Infinity) return true;
  if (limit === 0) return false;
  if (currentUsage !== undefined) {
    return currentUsage < limit;
  }
  return true;
}

// Check if user needs upgrade prompt
export function needsUpgrade(
  tier: SubscriptionTier,
  feature: keyof typeof TIER_CONFIG.FREE.limits
): boolean {
  return tier === 'FREE' && !canAccessFeature(tier, feature);
}

// Get tier by Stripe price ID
export function getTierByPriceId(priceId: string): SubscriptionTier {
  if (priceId === process.env.STRIPE_ADVISOR_ANNUAL_PRICE_ID) {
    return 'ADVISOR_ANNUAL';
  }
  if (priceId === process.env.STRIPE_ADVISOR_MONTHLY_PRICE_ID) {
    return 'ADVISOR';
  }
  if (priceId === process.env.STRIPE_PREMIUM_ANNUAL_PRICE_ID) {
    return 'PREMIUM_ANNUAL';
  }
  if (priceId === process.env.STRIPE_PREMIUM_MONTHLY_PRICE_ID) {
    return 'PREMIUM';
  }
  return 'FREE';
}

// Check if tier includes Advisor features
export function isAdvisorTier(tier: SubscriptionTier): boolean {
  return tier === 'ADVISOR' || tier === 'ADVISOR_ANNUAL';
}

// Check if tier includes Premium features (includes Advisor)
export function isPremiumOrHigher(tier: SubscriptionTier): boolean {
  return tier !== 'FREE';
}

// Get display tier (for showing in UI - groups annual with monthly)
export function getDisplayTier(tier: SubscriptionTier): 'FREE' | 'PREMIUM' | 'ADVISOR' {
  if (tier === 'ADVISOR' || tier === 'ADVISOR_ANNUAL') {
    return 'ADVISOR';
  }
  if (tier === 'PREMIUM' || tier === 'PREMIUM_ANNUAL') {
    return 'PREMIUM';
  }
  return 'FREE';
}
