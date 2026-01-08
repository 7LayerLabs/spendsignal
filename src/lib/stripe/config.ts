// Stripe Configuration
// Maps subscription tiers to Stripe price IDs

export const STRIPE_PRICE_IDS = {
  PREMIUM_MONTHLY: process.env.STRIPE_PREMIUM_MONTHLY_PRICE_ID!,
  PREMIUM_ANNUAL: process.env.STRIPE_PREMIUM_ANNUAL_PRICE_ID!,
  ADVISOR_MONTHLY: process.env.STRIPE_ADVISOR_MONTHLY_PRICE_ID!,
  ADVISOR_ANNUAL: process.env.STRIPE_ADVISOR_ANNUAL_PRICE_ID!,
} as const;

export const PRICE_TO_TIER: Record<string, { tier: string; billing: string }> = {
  [process.env.STRIPE_PREMIUM_MONTHLY_PRICE_ID!]: { tier: 'PREMIUM', billing: 'monthly' },
  [process.env.STRIPE_PREMIUM_ANNUAL_PRICE_ID!]: { tier: 'PREMIUM', billing: 'annual' },
  [process.env.STRIPE_ADVISOR_MONTHLY_PRICE_ID!]: { tier: 'ADVISOR', billing: 'monthly' },
  [process.env.STRIPE_ADVISOR_ANNUAL_PRICE_ID!]: { tier: 'ADVISOR', billing: 'annual' },
};

export type PlanType = 'premium-monthly' | 'premium-annual' | 'advisor-monthly' | 'advisor-annual';

export function getPriceId(plan: PlanType): string {
  switch (plan) {
    case 'premium-monthly':
      return STRIPE_PRICE_IDS.PREMIUM_MONTHLY;
    case 'premium-annual':
      return STRIPE_PRICE_IDS.PREMIUM_ANNUAL;
    case 'advisor-monthly':
      return STRIPE_PRICE_IDS.ADVISOR_MONTHLY;
    case 'advisor-annual':
      return STRIPE_PRICE_IDS.ADVISOR_ANNUAL;
    default:
      throw new Error(`Invalid plan: ${plan}`);
  }
}
