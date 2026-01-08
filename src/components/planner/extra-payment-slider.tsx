// Extra Payment Slider Component
// Allows users to adjust extra monthly debt payment and see impact

'use client';

import { useState, useEffect } from 'react';
import { formatCurrency } from '@/lib/services/debt-calculator';

interface ExtraPaymentSliderProps {
  currentExtra: number;
  onExtraChange: (amount: number) => void;
  calculateImpact: (newExtra: number) => {
    monthsSaved: number;
    interestSaved: number;
  };
  minPayment?: number;
  maxExtra?: number;
}

export function ExtraPaymentSlider({
  currentExtra,
  onExtraChange,
  calculateImpact,
  minPayment = 0,
  maxExtra = 1000,
}: ExtraPaymentSliderProps) {
  const [localValue, setLocalValue] = useState(currentExtra);
  const [impact, setImpact] = useState({ monthsSaved: 0, interestSaved: 0 });

  // Calculate impact when value changes
  useEffect(() => {
    const newImpact = calculateImpact(localValue);
    setImpact(newImpact);
  }, [localValue, calculateImpact]);

  // Debounce the actual update
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localValue !== currentExtra) {
        onExtraChange(localValue);
      }
    }, 150);
    return () => clearTimeout(timer);
  }, [localValue, currentExtra, onExtraChange]);

  // Preset amounts
  const presets = [50, 100, 200, 300, 500];

  return (
    <div className="p-5 rounded-xl bg-[var(--card)] border border-[var(--border)]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-[var(--foreground)]">Extra Monthly Payment</h3>
        <div className="text-right">
          <span className="text-2xl font-bold text-[#22C55E]">
            {formatCurrency(localValue)}
          </span>
          <span className="text-sm text-[var(--foreground-muted)]">/month</span>
        </div>
      </div>

      {/* Slider */}
      <div className="relative mb-4">
        <input
          type="range"
          min={0}
          max={maxExtra}
          step={10}
          value={localValue}
          onChange={(e) => setLocalValue(Number(e.target.value))}
          className="w-full h-2 rounded-full appearance-none cursor-pointer
            bg-[var(--background)]
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:w-5
            [&::-webkit-slider-thumb]:h-5
            [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:bg-[#22C55E]
            [&::-webkit-slider-thumb]:border-2
            [&::-webkit-slider-thumb]:border-white
            [&::-webkit-slider-thumb]:shadow-lg
            [&::-webkit-slider-thumb]:cursor-pointer
            [&::-webkit-slider-thumb]:transition-transform
            [&::-webkit-slider-thumb]:hover:scale-110
            [&::-moz-range-thumb]:w-5
            [&::-moz-range-thumb]:h-5
            [&::-moz-range-thumb]:rounded-full
            [&::-moz-range-thumb]:bg-[#22C55E]
            [&::-moz-range-thumb]:border-2
            [&::-moz-range-thumb]:border-white
            [&::-moz-range-thumb]:cursor-pointer"
        />
        <div className="flex justify-between text-xs text-[var(--foreground-muted)] mt-1">
          <span>$0</span>
          <span>{formatCurrency(maxExtra)}</span>
        </div>
      </div>

      {/* Preset Buttons */}
      <div className="flex flex-wrap gap-2 mb-4">
        {presets.map(amount => (
          <button
            key={amount}
            onClick={() => setLocalValue(amount)}
            className={`
              px-3 py-1.5 rounded-lg text-sm font-medium transition-all
              ${localValue === amount
                ? 'bg-[#22C55E] text-white'
                : 'bg-[var(--background)] text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-[var(--background-hover)]'
              }
            `}
          >
            +{formatCurrency(amount)}
          </button>
        ))}
      </div>

      {/* Impact Display */}
      {localValue > 0 && (
        <div className="p-4 rounded-lg bg-[#22C55E]/10 border border-[#22C55E]/30">
          <p className="text-sm text-[var(--foreground)]">
            Adding <span className="font-bold text-[#22C55E]">{formatCurrency(localValue)}</span>/month extra:
          </p>
          <div className="flex flex-wrap gap-4 mt-2">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-[#22C55E]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm">
                <span className="font-bold text-[var(--foreground)]">{impact.monthsSaved}</span>
                <span className="text-[var(--foreground-muted)]"> months saved</span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-[#22C55E]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm">
                <span className="font-bold text-[var(--foreground)]">{formatCurrency(impact.interestSaved)}</span>
                <span className="text-[var(--foreground-muted)]"> interest saved</span>
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Manual Input */}
      <div className="mt-4 pt-4 border-t border-[var(--border)]">
        <label className="block text-xs text-[var(--foreground-muted)] mb-2">
          Or enter a custom amount:
        </label>
        <div className="flex items-center gap-2">
          <span className="text-[var(--foreground-muted)]">$</span>
          <input
            type="number"
            min={0}
            max={maxExtra}
            value={localValue}
            onChange={(e) => setLocalValue(Math.min(maxExtra, Math.max(0, Number(e.target.value))))}
            className="flex-1 px-3 py-2 rounded-lg bg-[var(--background)] border border-[var(--border)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[#22C55E]/50"
          />
          <span className="text-sm text-[var(--foreground-muted)]">/month</span>
        </div>
      </div>
    </div>
  );
}
