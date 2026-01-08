// Advisor Upgrade Prompt Component
// Displays when non-Advisor users try to access Advisor features

'use client';

import Link from 'next/link';

interface UpgradePromptProps {
  feature: 'debt-planner' | 'savings-goals' | 'smart-recommendations' | 'planner';
  currentTier?: 'FREE' | 'PREMIUM';
}

const FEATURE_INFO = {
  'debt-planner': {
    title: 'Debt Payoff Planner',
    description: 'Calculate your path to debt-free with snowball and avalanche strategies.',
    icon: '📉',
    benefits: [
      'Snowball & Avalanche strategies',
      'Interactive payoff timeline',
      '"What If" scenarios',
      'Track multiple debts',
    ],
  },
  'savings-goals': {
    title: 'Savings Goal Tracker',
    description: 'Set goals, track progress, and hit your targets.',
    icon: '🎯',
    benefits: [
      'Multiple goal types',
      'Progress tracking',
      'Contribution history',
      'Projected completion dates',
    ],
  },
  'smart-recommendations': {
    title: 'Smart Recommendations',
    description: 'AI-powered suggestions based on your spending patterns.',
    icon: '💡',
    benefits: [
      'Redirect spending suggestions',
      'Strategy optimization tips',
      'Milestone alerts',
      'Pace warnings',
    ],
  },
  'planner': {
    title: 'Financial Planner Suite',
    description: 'Complete financial planning tools to reach your goals faster.',
    icon: '📊',
    benefits: [
      'Debt Payoff Planner',
      'Savings Goal Tracker',
      'Smart AI Recommendations',
      '"What If" Scenarios',
    ],
  },
};

export function UpgradePrompt({ feature, currentTier = 'FREE' }: UpgradePromptProps) {
  const info = FEATURE_INFO[feature];
  const isPremium = currentTier === 'PREMIUM';

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-8">
      <div className="max-w-lg w-full">
        {/* Card */}
        <div className="relative p-8 rounded-2xl bg-gradient-to-b from-[#8B5CF6]/10 to-[var(--card)] border border-[#8B5CF6]/30 overflow-hidden">
          {/* Background glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-[#8B5CF6]/20 blur-3xl rounded-full" />

          {/* Content */}
          <div className="relative">
            {/* Icon */}
            <div className="text-6xl mb-4 text-center">{info.icon}</div>

            {/* Title */}
            <h2 className="text-2xl font-bold text-[var(--foreground)] text-center mb-2">
              {info.title}
            </h2>

            {/* Description */}
            <p className="text-sm text-[var(--foreground-muted)] text-center mb-6">
              {info.description}
            </p>

            {/* Benefits */}
            <div className="bg-[var(--background)] rounded-xl p-4 mb-6">
              <p className="text-xs text-[#8B5CF6] uppercase tracking-wider mb-3">
                Advisor Features Include:
              </p>
              <ul className="space-y-2">
                {info.benefits.map((benefit) => (
                  <li key={benefit} className="flex items-center gap-2 text-sm text-[var(--foreground-muted)]">
                    <svg className="w-4 h-4 text-[#8B5CF6]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>

            {/* Pricing */}
            <div className="text-center mb-6">
              <p className="text-sm text-[var(--foreground-muted)]">
                {isPremium ? 'Upgrade to Advisor' : 'Available on Advisor'}
              </p>
              <div className="flex items-baseline justify-center gap-1 mt-1">
                <span className="text-3xl font-bold text-[var(--foreground)]">$14.99</span>
                <span className="text-[var(--foreground-muted)]">/month</span>
              </div>
              <p className="text-xs text-[#8B5CF6] mt-1">or $149/year (save 17%)</p>
            </div>

            {/* CTA */}
            <Link
              href="/dashboard/settings/billing"
              className="block w-full py-3 text-center text-sm font-semibold text-white bg-[#8B5CF6] rounded-xl hover:shadow-[0_0_24px_rgba(139,92,246,0.4)] transition-all"
            >
              {isPremium ? 'Upgrade to Advisor' : 'Get Advisor'}
            </Link>

            {/* Current tier note */}
            <p className="text-xs text-[var(--foreground-subtle)] text-center mt-4">
              You&apos;re on the {currentTier.charAt(0) + currentTier.slice(1).toLowerCase()} plan.
              {isPremium && ' All your Premium features will remain active.'}
            </p>
          </div>
        </div>

        {/* Back link */}
        <div className="text-center mt-6">
          <Link
            href="/dashboard"
            className="text-sm text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}

// Inline upgrade banner for showing in other pages
export function UpgradeBanner({ feature, onDismiss }: { feature: keyof typeof FEATURE_INFO; onDismiss?: () => void }) {
  const info = FEATURE_INFO[feature];

  return (
    <div className="p-4 rounded-xl bg-gradient-to-r from-[#8B5CF6]/10 to-[#8B5CF6]/5 border border-[#8B5CF6]/30">
      <div className="flex items-start gap-4">
        <span className="text-2xl">{info.icon}</span>
        <div className="flex-1">
          <h3 className="font-semibold text-[var(--foreground)] mb-1">
            Unlock {info.title}
          </h3>
          <p className="text-sm text-[var(--foreground-muted)] mb-3">
            {info.description}
          </p>
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/settings/billing"
              className="px-4 py-1.5 text-sm font-medium text-white bg-[#8B5CF6] rounded-lg hover:opacity-90 transition-opacity"
            >
              Upgrade to Advisor
            </Link>
            {onDismiss && (
              <button
                onClick={onDismiss}
                className="text-sm text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
              >
                Maybe later
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Small badge for showing in navigation
export function AdvisorBadge() {
  return (
    <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full bg-[#8B5CF6]/20 text-[#8B5CF6]">
      Advisor
    </span>
  );
}
