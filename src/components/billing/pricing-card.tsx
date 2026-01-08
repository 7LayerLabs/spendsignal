'use client';

import { useState } from 'react';
import Link from 'next/link';

type PlanType = 'free' | 'premium' | 'advisor';
type BillingPeriod = 'monthly' | 'annual';

interface PricingCardProps {
  name: string;
  price: string;
  period: string;
  annualPrice?: string;
  description: string;
  features: string[];
  cta: string;
  tier: PlanType;
  highlighted?: boolean;
}

export function PricingCard({
  name,
  price,
  period,
  annualPrice,
  description,
  features,
  cta,
  tier,
  highlighted = false,
}: PricingCardProps) {
  const [loading, setLoading] = useState(false);
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>('monthly');

  const isAdvisor = tier === 'advisor';
  const isPremium = tier === 'premium';
  const isFree = tier === 'free';

  const handleCheckout = async () => {
    if (isFree) {
      window.location.href = '/signup';
      return;
    }

    setLoading(true);
    try {
      const plan = `${tier}-${billingPeriod}` as const;
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      });

      const data = await response.json();

      if (data.error) {
        console.error('Checkout error:', data.error);
        alert('Failed to start checkout. Please try again.');
        return;
      }

      if (data.url) {
        // Redirect to Stripe Checkout
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Failed to start checkout. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`relative p-8 rounded-2xl border transition-all duration-300 ${
        isPremium
          ? 'bg-gradient-to-b from-[#22C55E]/10 to-[#111820] border-[#22C55E]/30'
          : isAdvisor
          ? 'bg-gradient-to-b from-[#8B5CF6]/10 to-[#111820] border-[#8B5CF6]/30'
          : 'bg-[#111820] border-[#2A3441] hover:border-[#3B82F6]/30'
      }`}
    >
      {isPremium && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-[#22C55E] text-xs font-semibold text-black">
          MOST POPULAR
        </div>
      )}
      {isAdvisor && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-[#8B5CF6] text-xs font-semibold text-white">
          FULL SUITE
        </div>
      )}

      <div className="mb-6">
        <h3 className="text-xl font-semibold text-white mb-2">{name}</h3>
        <div className="flex items-baseline gap-1">
          <span className="text-4xl font-bold text-white">{price}</span>
          <span className="text-[#6B7280]">{period}</span>
        </div>
        {annualPrice && (
          <button
            onClick={() => setBillingPeriod(billingPeriod === 'monthly' ? 'annual' : 'monthly')}
            className={`text-sm mt-1 hover:underline cursor-pointer ${
              isAdvisor ? 'text-[#8B5CF6]' : 'text-[#22C55E]'
            }`}
          >
            {billingPeriod === 'monthly' ? annualPrice : 'Switch to monthly'}
          </button>
        )}
        <p className="text-sm text-[#9BA4B0] mt-2">{description}</p>
      </div>

      <ul className="space-y-3 mb-8">
        {features.map((feature) => (
          <li key={feature} className="flex items-start gap-3">
            <svg
              className={`w-5 h-5 mt-0.5 ${
                isPremium
                  ? 'text-[#22C55E]'
                  : isAdvisor
                  ? 'text-[#8B5CF6]'
                  : 'text-[#3B82F6]'
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            <span className="text-sm text-[#9BA4B0]">{feature}</span>
          </li>
        ))}
      </ul>

      {isFree ? (
        <Link
          href="/signup"
          className="block w-full py-3 text-center text-sm font-semibold rounded-xl transition-all duration-300 bg-white/5 text-white border border-white/10 hover:bg-white/10"
        >
          {cta}
        </Link>
      ) : (
        <button
          onClick={handleCheckout}
          disabled={loading}
          className={`block w-full py-3 text-center text-sm font-semibold rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${
            isPremium
              ? 'bg-[#22C55E] text-black hover:shadow-[0_0_24px_rgba(34,197,94,0.4)]'
              : 'bg-[#8B5CF6] text-white hover:shadow-[0_0_24px_rgba(139,92,246,0.4)]'
          }`}
        >
          {loading ? 'Loading...' : cta}
        </button>
      )}
    </div>
  );
}
