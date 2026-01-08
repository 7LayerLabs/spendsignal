// Strategy Selector Component
// Allows users to choose between debt payoff strategies

'use client';

import type { DebtPayoffStrategy, DebtComparison } from '@/types';
import { formatCurrency } from '@/lib/services/debt-calculator';

interface StrategySelectorProps {
  currentStrategy: DebtPayoffStrategy;
  onStrategyChange: (strategy: DebtPayoffStrategy) => void;
  comparison: DebtComparison;
}

const STRATEGY_INFO: Record<DebtPayoffStrategy, {
  name: string;
  shortDesc: string;
  icon: string;
  benefit: string;
}> = {
  AVALANCHE: {
    name: 'Avalanche',
    shortDesc: 'Highest interest first',
    icon: '🏔️',
    benefit: 'Saves the most money',
  },
  SNOWBALL: {
    name: 'Snowball',
    shortDesc: 'Smallest balance first',
    icon: '⛄',
    benefit: 'Quick wins for motivation',
  },
  CUSTOM: {
    name: 'Custom',
    shortDesc: 'Your priority order',
    icon: '🎯',
    benefit: 'Total control',
  },
};

export function StrategySelector({
  currentStrategy,
  onStrategyChange,
  comparison,
}: StrategySelectorProps) {
  const strategies: DebtPayoffStrategy[] = ['AVALANCHE', 'SNOWBALL', 'CUSTOM'];
  const avalancheIsBetter = comparison.interestSaved > 0;

  return (
    <div className="space-y-4">
      {/* Strategy Options - Simple Radio Style */}
      <div className="space-y-2">
        {strategies.map(strategy => {
          const info = STRATEGY_INFO[strategy];
          const isSelected = currentStrategy === strategy;
          const isRecommended = strategy === 'AVALANCHE' && avalancheIsBetter;

          return (
            <button
              key={strategy}
              onClick={() => onStrategyChange(strategy)}
              className={`
                w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all
                ${isSelected
                  ? 'border-[#22C55E] bg-[#22C55E]/5'
                  : 'border-[var(--border)] bg-[var(--card)] hover:border-[var(--foreground-muted)]/50'
                }
              `}
            >
              {/* Radio Circle */}
              <div className={`
                shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center
                ${isSelected ? 'border-[#22C55E] bg-[#22C55E]' : 'border-[var(--foreground-muted)]'}
              `}>
                {isSelected && (
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>

              {/* Icon */}
              <span className="text-2xl shrink-0">{info.icon}</span>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-[var(--foreground)]">{info.name}</span>
                  {isRecommended && (
                    <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full bg-[#22C55E] text-white">
                      Best
                    </span>
                  )}
                </div>
                <p className="text-sm text-[var(--foreground-muted)]">{info.shortDesc}</p>
              </div>

              {/* Stats (for non-custom) */}
              {strategy !== 'CUSTOM' && (
                <div className="text-right shrink-0">
                  <p className={`text-lg font-bold ${strategy === 'AVALANCHE' ? 'text-[#22C55E]' : 'text-[var(--foreground)]'}`}>
                    {formatCurrency(
                      strategy === 'AVALANCHE'
                        ? comparison.avalanche.totalInterest
                        : comparison.snowball.totalInterest
                    )}
                  </p>
                  <p className="text-xs text-[var(--foreground-muted)]">total interest</p>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Comparison Tip */}
      {comparison.interestSaved > 0 && currentStrategy === 'SNOWBALL' && (
        <div className="flex items-center gap-3 p-3 rounded-lg bg-[#3B82F6]/10 border border-[#3B82F6]/20">
          <span className="text-lg">💡</span>
          <p className="text-sm text-[var(--foreground-muted)]">
            Avalanche saves <span className="font-semibold text-[#22C55E]">{formatCurrency(comparison.interestSaved)}</span> more
          </p>
        </div>
      )}
    </div>
  );
}
