'use client';

import { useDroppable } from '@dnd-kit/core';
import { TransactionCard } from './transaction-card';
import { ZONE_CONFIG, type TrafficLightZone } from '@/constants/traffic-light';
import { formatCurrency } from '@/lib/utils';
import type { Transaction } from '@/types';

interface TrafficLightZoneProps {
  zone: TrafficLightZone;
  transactions: Transaction[];
  aiSuggestions?: Map<string, { zone: TrafficLightZone; confidence: number; reasoning: string }>;
}

export function TrafficLightZoneComponent({ zone, transactions, aiSuggestions }: TrafficLightZoneProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: zone,
    data: {
      type: 'zone',
      zone,
    },
  });

  const config = ZONE_CONFIG[zone];
  const totalAmount = transactions.reduce((sum, t) => sum + Number(t.amount), 0);

  // Zone-specific styling
  const zoneStyles: Record<TrafficLightZone, {
    borderColor: string;
    bgGlow: string;
    iconBg: string;
    headerBg: string;
  }> = {
    GREEN: {
      borderColor: 'border-[#22C55E]',
      bgGlow: 'shadow-[0_0_40px_rgba(34,197,94,0.15)]',
      iconBg: 'bg-[#22C55E]',
      headerBg: 'bg-[#22C55E]/10',
    },
    YELLOW: {
      borderColor: 'border-[#EAB308]',
      bgGlow: 'shadow-[0_0_40px_rgba(234,179,8,0.15)]',
      iconBg: 'bg-[#EAB308]',
      headerBg: 'bg-[#EAB308]/10',
    },
    RED: {
      borderColor: 'border-[#EF4444]',
      bgGlow: 'shadow-[0_0_40px_rgba(239,68,68,0.15)]',
      iconBg: 'bg-[#EF4444]',
      headerBg: 'bg-[#EF4444]/10',
    },
    UNCATEGORIZED: {
      borderColor: 'border-[#FFC700]',
      bgGlow: '',
      iconBg: 'bg-[#FFC700]',
      headerBg: 'bg-[#FFC700]/10',
    },
  };

  const styles = zoneStyles[zone];

  return (
    <div
      ref={setNodeRef}
      className={`
        flex flex-col h-full min-h-[400px] border border-dashed
        transition-all duration-300
        ${isOver ? `${styles.borderColor} ${styles.bgGlow} scale-[1.01]` : 'border-[#424242]'}
        ${isOver ? 'bg-[#111820]' : 'bg-[#0D1117]'}
      `}
    >
      {/* Zone Header */}
      <div className={`p-4 border-b border-[#424242] ${styles.headerBg}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Traffic light bulb */}
            <div
              className={`w-6 h-6 rounded-full ${styles.iconBg}`}
              style={{
                boxShadow: zone !== 'UNCATEGORIZED'
                  ? `0 0 20px ${config.color}60`
                  : 'none'
              }}
            />
            <div>
              <h3 className="text-base font-semibold text-white">{config.label}</h3>
              <p className="text-sm text-[#6B7280]">{config.description}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xl font-bold text-white">{formatCurrency(totalAmount)}</p>
            <p className="text-sm text-[#6B7280]">{transactions.length} items</p>
          </div>
        </div>
      </div>

      {/* Drop zone content */}
      <div className="flex-1 p-3 overflow-y-auto">
        <div className="space-y-2">
          {transactions.map((transaction) => (
            <TransactionCard
              key={transaction.id}
              transaction={transaction}
              aiSuggestion={aiSuggestions?.get(transaction.id)}
            />
          ))}

          {/* Empty state */}
          {transactions.length === 0 && (
            <div className={`
              flex flex-col items-center justify-center py-12 px-4
              border border-dashed
              ${isOver ? styles.borderColor : 'border-[#424242]'}
              transition-colors duration-200
            `}>
              <div className={`w-12 h-12 ${styles.iconBg}/10 flex items-center justify-center mb-3`}>
                <svg className="w-6 h-6 text-[#6B7280]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <p className="text-base text-[#6B7280] text-center">
                {isOver ? 'Drop here!' : `Drag transactions here`}
              </p>
              <p className="text-sm text-[#6B7280]/60 mt-1">
                {config.examples[0]}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Zone footer with quick tip */}
      {transactions.length > 0 && (
        <div className="px-4 py-3 border-t border-[#424242]">
          <p className="text-sm text-[#9BA4B0] italic">
            {getZoneTip(zone, transactions.length, totalAmount)}
          </p>
        </div>
      )}
    </div>
  );
}

// Get contextual tips based on zone and content
function getZoneTip(zone: TrafficLightZone, count: number, total: number): string {
  switch (zone) {
    case 'GREEN':
      if (total > 3000) return 'Essentials are covered. Your foundation is solid.';
      return 'These keep life running. Non-negotiable.';
    case 'YELLOW':
      if (count > 10) return 'Lots of "maybes". Which ones truly add value?';
      if (total > 500) return 'Discretionary adding up. Worth reviewing.';
      return 'Think twice about each of these.';
    case 'RED':
      if (count > 5) return `${count} impulse purchases. See a pattern?`;
      if (total > 200) return `$${Math.round(total)} you could invest instead.`;
      return 'Future you would thank you for skipping these.';
    default:
      return 'Waiting for your honest assessment.';
  }
}

export { TrafficLightZoneComponent as default };
