'use client';

import { useState } from 'react';
import Link from 'next/link';

const PLANS = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    period: 'forever',
    description: 'Get started with basic features',
    features: [
      'Demo mode with mock data',
      'Basic canvas categorization',
      '3 goals maximum',
      '30-day transaction history',
      '50 AI suggestions/month',
    ],
    limitations: [
      'No bank connections',
      'No email/push alerts',
      'No PDF reports',
    ],
    current: true,
  },
  {
    id: 'premium-monthly',
    name: 'Premium',
    price: 9.99,
    period: 'month',
    description: 'Full access to all features',
    features: [
      'Connect real bank accounts',
      'Unlimited goals & history',
      'Unlimited AI suggestions',
      'Custom spending alerts',
      'Monthly PDF reports',
      'Trends & analytics',
      'Email & push notifications',
      'Priority support',
    ],
    limitations: [],
    popular: true,
  },
  {
    id: 'premium-annual',
    name: 'Premium Annual',
    price: 99,
    period: 'year',
    description: 'Best value - save $20/year',
    features: [
      'Everything in Premium',
      '2 months free',
      'Early access to new features',
    ],
    limitations: [],
    savings: 20,
  },
];

export default function BillingPage() {
  const [selectedPlan, setSelectedPlan] = useState('free');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Back Button & Breadcrumb */}
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard/settings"
          className="p-2 -ml-2 rounded text-[#9BA4B0] hover:text-[white] hover:bg-[white/5] transition-colors"
          aria-label="Back to Settings"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div className="flex items-center gap-2 text-sm">
          <Link href="/dashboard/settings" className="text-[#6B7280] hover:text-[white] transition-colors">
            Settings
          </Link>
          <span className="text-[#6B7280]">/</span>
          <span className="text-[white]">Billing</span>
        </div>
      </div>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[white]">Billing & Subscription</h1>
        <p className="text-sm text-[#9BA4B0] mt-1">
          Manage your subscription and payment methods
        </p>
      </div>

      {/* Current Plan */}
      <div className="p-6 rounded bg-[#111820] border border-[#424242]">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-[white]">Current Plan</h2>
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-[#FFC700]/20 text-[#FFC700]">
            Free Tier
          </span>
        </div>

        <div className="p-4 rounded bg-[#0D1117] border border-[#424242]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xl font-bold text-[white]">Free</p>
              <p className="text-sm text-[#6B7280]">Demo mode - Limited features</p>
            </div>
            <p className="text-3xl font-bold text-[white]">$0</p>
          </div>
        </div>

        <div className="mt-4 p-4 rounded bg-gradient-to-r from-[#22C55E]/10 to-[#FFC700]/10 border border-[#22C55E]/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#22C55E]/20 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-[#22C55E]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-[white]">Upgrade to Premium</p>
              <p className="text-xs text-[#9BA4B0]">Connect your bank accounts and unlock all features</p>
            </div>
          </div>
        </div>
      </div>

      {/* Billing Cycle Toggle */}
      <div className="flex items-center justify-center gap-4 p-2 bg-[#111820] rounded border border-[#424242] w-fit mx-auto">
        <button
          onClick={() => setBillingCycle('monthly')}
          className={`px-6 py-2 rounded text-sm font-medium transition-all ${
            billingCycle === 'monthly'
              ? 'bg-[#FFC700] text-white'
              : 'text-[#6B7280] hover:text-[white]'
          }`}
        >
          Monthly
        </button>
        <button
          onClick={() => setBillingCycle('annual')}
          className={`px-6 py-2 rounded text-sm font-medium transition-all flex items-center gap-2 ${
            billingCycle === 'annual'
              ? 'bg-[#FFC700] text-white'
              : 'text-[#6B7280] hover:text-[white]'
          }`}
        >
          Annual
          <span className="px-2 py-0.5 rounded-full text-xs bg-[#22C55E] text-white">
            Save $20
          </span>
        </button>
      </div>

      {/* Plans Grid */}
      <div className="grid md:grid-cols-3 gap-4">
        {PLANS.map((plan) => {
          const isCurrentPlan = plan.id === 'free';
          const showPlan = plan.id === 'free' ||
            (billingCycle === 'monthly' && plan.id === 'premium-monthly') ||
            (billingCycle === 'annual' && plan.id === 'premium-annual');

          if (!showPlan && plan.id !== 'free') return null;

          return (
            <div
              key={plan.id}
              className={`relative p-6 rounded border transition-all ${
                plan.popular
                  ? 'bg-gradient-to-br from-[#FFC700]/10 to-[#111820] border-[#FFC700]/50'
                  : isCurrentPlan
                  ? 'bg-[#111820] border-[#22C55E]/50'
                  : 'bg-[#111820] border-[#424242] hover:border-[#FFC700]/50'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-[#FFC700] text-white">
                    Most Popular
                  </span>
                </div>
              )}

              {plan.savings && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-[#22C55E] text-white">
                    Save ${plan.savings}
                  </span>
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="text-lg font-semibold text-[white]">{plan.name}</h3>
                <p className="text-sm text-[#6B7280] mt-1">{plan.description}</p>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-[white]">${plan.price}</span>
                  {plan.period !== 'forever' && (
                    <span className="text-[#6B7280]">/{plan.period}</span>
                  )}
                </div>
              </div>

              <div className="space-y-3 mb-6">
                {plan.features.map((feature, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-[#22C55E] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-sm text-[#9BA4B0]">{feature}</span>
                  </div>
                ))}
                {plan.limitations.map((limitation, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-[#6B7280] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <span className="text-sm text-[#6B7280]">{limitation}</span>
                  </div>
                ))}
              </div>

              <button
                className={`w-full py-3 rounded text-sm font-semibold transition-all ${
                  isCurrentPlan
                    ? 'bg-[#22C55E]/20 text-[#22C55E] cursor-default'
                    : 'bg-[#FFC700] text-white hover:bg-[#E6B800]'
                }`}
                disabled={isCurrentPlan}
              >
                {isCurrentPlan ? 'Current Plan' : 'Upgrade Now'}
              </button>
            </div>
          );
        })}
      </div>

      {/* Payment Methods */}
      <div className="p-6 rounded bg-[#111820] border border-[#424242]">
        <h2 className="text-lg font-semibold text-[white] mb-6">Payment Methods</h2>

        <div className="text-center py-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#0D1117] flex items-center justify-center">
            <svg className="w-8 h-8 text-[#6B7280]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          </div>
          <p className="text-sm text-[#6B7280] mb-4">No payment methods on file</p>
          <button className="px-5 py-2.5 rounded text-sm font-medium text-white bg-[#FFC700] hover:bg-[#E6B800] transition-colors">
            Add Payment Method
          </button>
        </div>
      </div>

      {/* Billing History */}
      <div className="p-6 rounded bg-[#111820] border border-[#424242]">
        <h2 className="text-lg font-semibold text-[white] mb-6">Billing History</h2>

        <div className="text-center py-8">
          <p className="text-sm text-[#6B7280]">No billing history yet</p>
        </div>
      </div>

      {/* FAQ */}
      <div className="p-6 rounded bg-[#111820] border border-[#424242]">
        <h2 className="text-lg font-semibold text-[white] mb-6">Frequently Asked Questions</h2>

        <div className="space-y-4">
          <FAQItem
            question="Can I cancel anytime?"
            answer="Yes, you can cancel your subscription at any time. You'll continue to have access to Premium features until the end of your billing period."
          />
          <FAQItem
            question="What happens to my data if I downgrade?"
            answer="Your data is always yours. If you downgrade, you'll still have access to view your historical data, but some features like bank connections will be paused."
          />
          <FAQItem
            question="Is my payment information secure?"
            answer="Absolutely. We use Stripe for payment processing, which is PCI-DSS compliant. We never store your card details on our servers."
          />
          <FAQItem
            question="Do you offer refunds?"
            answer="We offer a 7-day money-back guarantee for new Premium subscribers. Contact support if you're not satisfied."
          />
        </div>
      </div>
    </div>
  );
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-[#424242] last:border-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between py-4 text-left"
      >
        <span className="text-sm font-medium text-[white]">{question}</span>
        <svg
          className={`w-5 h-5 text-[#6B7280] transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && (
        <p className="pb-4 text-sm text-[#9BA4B0]">{answer}</p>
      )}
    </div>
  );
}
