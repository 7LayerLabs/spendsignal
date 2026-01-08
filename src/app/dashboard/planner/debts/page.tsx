// Debt Payoff Planner Page - Advisor Tier
// Manage debts, choose strategy, calculate payoff timeline

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useDebts } from '@/hooks/use-debts';
import { DebtCard } from '@/components/planner/debt-card';
import { StrategySelector } from '@/components/planner/strategy-selector';
import { ExtraPaymentSlider } from '@/components/planner/extra-payment-slider';
import { AIAdvisorChat, AIAdvisorButton } from '@/components/planner/ai-advisor-chat';
import { formatCurrency, formatPayoffDate } from '@/lib/services/debt-calculator';
import type { Debt } from '@/types';

export default function DebtsPage() {
  const {
    debts,
    strategy,
    setStrategy,
    extraPayment,
    setExtraPayment,
    payoffPlan,
    comparison,
    totalDebt,
    totalMinimumPayment,
    debtFreeDate,
    addDebt,
    updateDebt,
    removeDebt,
    markPaidOff,
    reorderDebts,
    calculateWhatIf,
  } = useDebts();

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingDebt, setEditingDebt] = useState<Debt | null>(null);
  const [showAdvisor, setShowAdvisor] = useState(false);

  // Get active debts sorted by strategy
  const activeDebts = debts.filter(d => !d.isPaidOff);
  const paidOffDebts = debts.filter(d => d.isPaidOff);

  // Get schedule for each debt
  const getScheduleForDebt = (debtId: string) => {
    return payoffPlan.debts.find(s => s.debtId === debtId);
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header with Back Link */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link
              href="/dashboard/planner"
              className="text-[#9BA4B0] hover:text-[white] transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <h1 className="text-2xl font-bold text-[white]">Debt Payoff Planner</h1>
          </div>
          <p className="text-[#9BA4B0]">
            Add your debts, pick a strategy, and get a clear path to $0.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 rounded text-sm font-medium text-white bg-gradient-to-r from-[#EF4444] to-[#F97316] hover:opacity-90 transition-opacity"
        >
          + Add Debt
        </button>
      </div>

      {/* How It Works - Educational Section */}
      <div className="p-5 rounded bg-gradient-to-br from-[#111820] to-[#000000] border border-[#424242]">
        <h3 className="font-semibold text-[white] mb-3">How This Works</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="flex gap-3">
            <div className="shrink-0 w-8 h-8 rounded-full bg-[#EF4444]/10 flex items-center justify-center text-[#EF4444] font-bold">1</div>
            <div>
              <p className="font-medium text-[white]">Add Your Debts</p>
              <p className="text-xs text-[#9BA4B0]">Enter each debt with its balance, interest rate, and minimum payment. Be honest.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="shrink-0 w-8 h-8 rounded-full bg-[#EAB308]/10 flex items-center justify-center text-[#EAB308] font-bold">2</div>
            <div>
              <p className="font-medium text-[white]">Pick Your Strategy</p>
              <p className="text-xs text-[#9BA4B0]">Avalanche saves money. Snowball builds momentum. Both work if you stick with it.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="shrink-0 w-8 h-8 rounded-full bg-[#22C55E]/10 flex items-center justify-center text-[#22C55E] font-bold">3</div>
            <div>
              <p className="font-medium text-[white]">Add Extra When You Can</p>
              <p className="text-xs text-[#9BA4B0]">Every extra dollar accelerates your freedom. The slider shows you exactly how much.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded bg-[#111820] border border-[#424242]">
          <p className="text-xs text-[#9BA4B0] mb-1">Total Debt</p>
          <p className="text-xl font-bold text-[#EF4444]">{formatCurrency(totalDebt)}</p>
        </div>
        <div className="p-4 rounded bg-[#111820] border border-[#424242]">
          <p className="text-xs text-[#9BA4B0] mb-1">Monthly Payment</p>
          <p className="text-xl font-bold text-[white]">
            {formatCurrency(totalMinimumPayment + extraPayment)}
          </p>
        </div>
        <div className="p-4 rounded bg-[#111820] border border-[#424242]">
          <p className="text-xs text-[#9BA4B0] mb-1">Total Interest</p>
          <p className="text-xl font-bold text-[#EAB308]">
            {formatCurrency(payoffPlan.totalInterest)}
          </p>
        </div>
        <div className="p-4 rounded bg-[#111820] border border-[#424242]">
          <p className="text-xs text-[#9BA4B0] mb-1">Debt-Free Date</p>
          <p className="text-xl font-bold text-[#22C55E]">{debtFreeDate}</p>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Settings */}
        <div className="lg:col-span-1 space-y-6">
          {/* Extra Payment Slider */}
          <ExtraPaymentSlider
            currentExtra={extraPayment}
            onExtraChange={setExtraPayment}
            calculateImpact={calculateWhatIf}
          />

          {/* Strategy Selector */}
          <div>
            <h3 className="font-semibold text-[white] mb-4">Payoff Strategy</h3>
            <StrategySelector
              currentStrategy={strategy}
              onStrategyChange={setStrategy}
              comparison={comparison}
            />
          </div>
        </div>

        {/* Right Column - Debt List */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Debts */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-[white]">
                Active Debts ({activeDebts.length})
              </h3>
              <span className="text-sm text-[#9BA4B0]">
                {strategy === 'CUSTOM' ? 'Your custom order' : `Sorted by ${strategy.toLowerCase()}`}
              </span>
            </div>

            {/* Custom Strategy Instructions */}
            {strategy === 'CUSTOM' && activeDebts.length > 1 && (
              <div className="mb-4 p-3 rounded bg-[#FFC700]/10 border border-[#FFC700]/30">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🎯</span>
                  <p className="text-sm text-[white]">
                    Use the <span className="font-medium">↑↓ arrows</span> to set your payoff order.
                    First debt gets all extra payments.
                  </p>
                </div>
              </div>
            )}

            {activeDebts.length === 0 ? (
              <div className="p-8 text-center rounded bg-[#111820] border border-[#424242]">
                <div className="text-4xl mb-3">🎉</div>
                <h3 className="font-semibold text-[white] mb-1">
                  No Active Debts
                </h3>
                <p className="text-sm text-[#9BA4B0]">
                  You&apos;re debt-free! Add debts to start tracking.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {activeDebts.map((debt, index) => (
                  <div key={debt.id} className="flex gap-2">
                    {/* Reorder Controls (Custom Strategy Only) */}
                    {strategy === 'CUSTOM' && activeDebts.length > 1 && (
                      <div className="flex flex-col justify-center gap-1">
                        <button
                          onClick={() => {
                            if (index > 0) {
                              reorderDebts(debt.id, index - 1);
                            }
                          }}
                          disabled={index === 0}
                          className={`p-1.5 rounded transition-colors ${
                            index === 0
                              ? 'text-[#6B7280] cursor-not-allowed'
                              : 'text-[#9BA4B0] hover:text-[white] hover:bg-[#000000]'
                          }`}
                          aria-label="Move up"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                          </svg>
                        </button>
                        <span className="text-xs text-[#9BA4B0] text-center font-medium">
                          {index + 1}
                        </span>
                        <button
                          onClick={() => {
                            if (index < activeDebts.length - 1) {
                              reorderDebts(debt.id, index + 1);
                            }
                          }}
                          disabled={index === activeDebts.length - 1}
                          className={`p-1.5 rounded transition-colors ${
                            index === activeDebts.length - 1
                              ? 'text-[#6B7280] cursor-not-allowed'
                              : 'text-[#9BA4B0] hover:text-[white] hover:bg-[#000000]'
                          }`}
                          aria-label="Move down"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                      </div>
                    )}

                    {/* Debt Card */}
                    <div className="flex-1">
                      <DebtCard
                        debt={debt}
                        schedule={getScheduleForDebt(debt.id)}
                        onEdit={(d) => setEditingDebt(d)}
                        onDelete={removeDebt}
                        onMarkPaidOff={markPaidOff}
                        isFirst={index === 0}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Paid Off Debts */}
          {paidOffDebts.length > 0 && (
            <div>
              <h3 className="font-semibold text-[white] mb-4">
                Paid Off ({paidOffDebts.length})
              </h3>
              <div className="space-y-3">
                {paidOffDebts.map(debt => (
                  <div
                    key={debt.id}
                    className="flex items-center justify-between p-4 rounded bg-[#22C55E]/10 border border-[#22C55E]/30"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#22C55E] flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium text-[white]">{debt.name}</p>
                        <p className="text-xs text-[#9BA4B0]">
                          Paid off {debt.paidOffDate?.toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm font-medium text-[#22C55E]">
                      {formatCurrency(debt.originalBalance ?? 0)} paid
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Payoff Timeline Visual */}
      {activeDebts.length > 0 && (
        <div className="p-6 rounded bg-[#111820] border border-[#424242]">
          <h3 className="font-semibold text-[white] mb-4">Payoff Timeline</h3>
          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute top-4 left-0 right-0 h-1 bg-[#424242] rounded-full" />

            {/* Milestones */}
            <div className="relative flex justify-between">
              {/* Start */}
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-[#000000] border-2 border-[#424242] flex items-center justify-center z-10">
                  <div className="w-3 h-3 rounded-full bg-[#FFC700]" />
                </div>
                <p className="text-xs text-[#9BA4B0] mt-2">Today</p>
              </div>

              {/* Debt Payoffs */}
              {payoffPlan.debts.slice(0, 3).map((schedule, index) => {
                const debt = activeDebts.find(d => d.id === schedule.debtId);
                const position = ((index + 1) / (payoffPlan.debts.length + 1)) * 100;
                return (
                  <div
                    key={schedule.debtId}
                    className="flex flex-col items-center"
                    style={{ position: 'absolute', left: `${position}%`, transform: 'translateX(-50%)' }}
                  >
                    <div className="w-8 h-8 rounded-full bg-[#22C55E] flex items-center justify-center z-10">
                      <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div className="text-center mt-2">
                      <p className="text-xs font-medium text-[white] truncate max-w-20">
                        {debt?.name}
                      </p>
                      <p className="text-[10px] text-[#9BA4B0]">
                        {formatPayoffDate(schedule.payoffDate)}
                      </p>
                    </div>
                  </div>
                );
              })}

              {/* End */}
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#22C55E] to-[#16A34A] flex items-center justify-center z-10">
                  <span className="text-sm">🎉</span>
                </div>
                <p className="text-xs text-[#22C55E] font-medium mt-2">Debt-Free!</p>
                <p className="text-[10px] text-[#9BA4B0]">{debtFreeDate}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Debt Modal */}
      {showAddModal && (
        <AddDebtModal
          onClose={() => setShowAddModal(false)}
          onAdd={(debt) => {
            addDebt(debt);
            setShowAddModal(false);
          }}
        />
      )}

      {/* Edit Debt Modal */}
      {editingDebt && (
        <EditDebtModal
          debt={editingDebt}
          onClose={() => setEditingDebt(null)}
          onSave={(updates) => {
            updateDebt(editingDebt.id, updates);
            setEditingDebt(null);
          }}
        />
      )}

      {/* AI Advisor */}
      <AIAdvisorButton onClick={() => setShowAdvisor(true)} />
      <AIAdvisorChat
        isOpen={showAdvisor}
        onClose={() => setShowAdvisor(false)}
        context={{
          debts,
          totalDebt,
          strategy,
          extraPayment,
          comparison,
          debtFreeDate,
        }}
        onStrategyChange={setStrategy}
        onExtraPaymentChange={setExtraPayment}
      />
    </div>
  );
}

// Simple Add Debt Modal
function AddDebtModal({
  onClose,
  onAdd,
}: {
  onClose: () => void;
  onAdd: (debt: Omit<Debt, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => void;
}) {
  const [name, setName] = useState('');
  const [balance, setBalance] = useState('');
  const [rate, setRate] = useState('');
  const [minPayment, setMinPayment] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({
      name,
      balance: Number(balance),
      interestRate: Number(rate) / 100,
      minimumPayment: Number(minPayment),
      dueDate: null,
      priority: 0,
      isPaidOff: false,
      paidOffDate: null,
      originalBalance: Number(balance),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md p-6 rounded bg-[#111820] border border-[#424242]">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-[white]">Add Debt</h2>
          <button
            onClick={onClose}
            className="p-2 rounded text-[#9BA4B0] hover:bg-[#000000]"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-[#9BA4B0] mb-1">Debt Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Chase Credit Card"
              className="w-full px-4 py-2 rounded bg-[#000000] border border-[#424242] text-[white] focus:outline-none focus:ring-2 focus:ring-[#EF4444]/50"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-[#9BA4B0] mb-1">Balance</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9BA4B0]">$</span>
                <input
                  type="number"
                  value={balance}
                  onChange={(e) => setBalance(e.target.value)}
                  placeholder="5,000"
                  className="w-full pl-8 pr-4 py-2 rounded bg-[#000000] border border-[#424242] text-[white] focus:outline-none focus:ring-2 focus:ring-[#EF4444]/50"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm text-[#9BA4B0] mb-1">Interest Rate (APR)</label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  value={rate}
                  onChange={(e) => setRate(e.target.value)}
                  placeholder="19.99"
                  className="w-full pr-8 pl-4 py-2 rounded bg-[#000000] border border-[#424242] text-[white] focus:outline-none focus:ring-2 focus:ring-[#EF4444]/50"
                  required
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9BA4B0]">%</span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm text-[#9BA4B0] mb-1">Minimum Payment</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9BA4B0]">$</span>
              <input
                type="number"
                value={minPayment}
                onChange={(e) => setMinPayment(e.target.value)}
                placeholder="100"
                className="w-full pl-8 pr-4 py-2 rounded bg-[#000000] border border-[#424242] text-[white] focus:outline-none focus:ring-2 focus:ring-[#EF4444]/50"
                required
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9BA4B0]">/mo</span>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 rounded text-sm font-medium text-[#9BA4B0] border border-[#424242] hover:bg-[#000000]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 rounded text-sm font-medium text-white bg-gradient-to-r from-[#EF4444] to-[#F97316] hover:opacity-90"
            >
              Add Debt
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Edit Debt Modal
function EditDebtModal({
  debt,
  onClose,
  onSave,
}: {
  debt: Debt;
  onClose: () => void;
  onSave: (updates: Partial<Debt>) => void;
}) {
  const [name, setName] = useState(debt.name);
  const [balance, setBalance] = useState(debt.balance.toString());
  const [rate, setRate] = useState((debt.interestRate * 100).toString());
  const [minPayment, setMinPayment] = useState(debt.minimumPayment.toString());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name,
      balance: Number(balance),
      interestRate: Number(rate) / 100,
      minimumPayment: Number(minPayment),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md p-6 rounded bg-[#111820] border border-[#424242]">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-[white]">Edit Debt</h2>
          <button
            onClick={onClose}
            className="p-2 rounded text-[#9BA4B0] hover:bg-[#000000]"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-[#9BA4B0] mb-1">Debt Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Chase Credit Card"
              className="w-full px-4 py-2 rounded bg-[#000000] border border-[#424242] text-[white] focus:outline-none focus:ring-2 focus:ring-[#EF4444]/50"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-[#9BA4B0] mb-1">Current Balance</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9BA4B0]">$</span>
                <input
                  type="number"
                  value={balance}
                  onChange={(e) => setBalance(e.target.value)}
                  placeholder="5,000"
                  className="w-full pl-8 pr-4 py-2 rounded bg-[#000000] border border-[#424242] text-[white] focus:outline-none focus:ring-2 focus:ring-[#EF4444]/50"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm text-[#9BA4B0] mb-1">Interest Rate (APR)</label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  value={rate}
                  onChange={(e) => setRate(e.target.value)}
                  placeholder="19.99"
                  className="w-full pr-8 pl-4 py-2 rounded bg-[#000000] border border-[#424242] text-[white] focus:outline-none focus:ring-2 focus:ring-[#EF4444]/50"
                  required
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9BA4B0]">%</span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm text-[#9BA4B0] mb-1">Minimum Payment</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9BA4B0]">$</span>
              <input
                type="number"
                value={minPayment}
                onChange={(e) => setMinPayment(e.target.value)}
                placeholder="100"
                className="w-full pl-8 pr-4 py-2 rounded bg-[#000000] border border-[#424242] text-[white] focus:outline-none focus:ring-2 focus:ring-[#EF4444]/50"
                required
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9BA4B0]">/mo</span>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 rounded text-sm font-medium text-[#9BA4B0] border border-[#424242] hover:bg-[#000000]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 rounded text-sm font-medium text-white bg-gradient-to-r from-[#EF4444] to-[#F97316] hover:opacity-90"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
