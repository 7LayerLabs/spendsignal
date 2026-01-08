'use client';

import { useState } from 'react';
import { useIncome } from '@/hooks/use-income';
import { formatCurrency } from '@/lib/utils';
import type { IncomeFrequency } from '@/types';

interface IncomeSettingsModalProps {
  userId: string;
  isOpen: boolean;
  onClose: () => void;
}

const FREQUENCY_LABELS: Record<IncomeFrequency, string> = {
  weekly: 'Weekly',
  'bi-weekly': 'Bi-weekly',
  monthly: 'Monthly',
  annual: 'Annual',
};

const FREQUENCY_HINTS: Record<IncomeFrequency, string> = {
  weekly: '52 times/year',
  'bi-weekly': '26 times/year',
  monthly: '12 times/year',
  annual: '1 time/year',
};

export function IncomeSettingsModal({ userId, isOpen, onClose }: IncomeSettingsModalProps) {
  const { incomeSettings, calculations, addSource, updateSource, removeSource } = useIncome(userId);

  // Form state for adding new source
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [newFrequency, setNewFrequency] = useState<IncomeFrequency>('monthly');
  const [editingId, setEditingId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAddSource = () => {
    if (!newName.trim() || !newAmount) return;

    addSource({
      name: newName.trim(),
      amount: parseFloat(newAmount),
      frequency: newFrequency,
      isActive: true,
    });

    setNewName('');
    setNewAmount('');
    setNewFrequency('monthly');
    setShowAddForm(false);
  };

  const handleUpdateSource = (id: string, updates: { name?: string; amount?: number; frequency?: IncomeFrequency }) => {
    updateSource(id, updates);
    setEditingId(null);
  };

  const handleToggleActive = (id: string, currentlyActive: boolean) => {
    updateSource(id, { isActive: !currentlyActive });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg mx-4 bg-[#0F1419] border border-[#2A3441] rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-[#2A3441] bg-gradient-to-r from-[#111820] to-transparent">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">Income Settings</h2>
              <p className="text-sm text-[#6B7280] mt-1">
                Set your income to understand the full picture
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-[#6B7280] hover:text-white hover:bg-[#2A3441] transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {/* Income Sources List */}
          {incomeSettings.sources.length > 0 && (
            <div className="space-y-3 mb-6">
              {incomeSettings.sources.map((source) => (
                <div
                  key={source.id}
                  className={`p-4 rounded-xl border ${
                    source.isActive
                      ? 'bg-[#111820] border-[#2A3441]'
                      : 'bg-[#111820]/50 border-[#2A3441]/50 opacity-60'
                  }`}
                >
                  {editingId === source.id ? (
                    <EditSourceForm
                      source={source}
                      onSave={(updates) => handleUpdateSource(source.id, updates)}
                      onCancel={() => setEditingId(null)}
                    />
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleToggleActive(source.id, source.isActive)}
                          className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                            source.isActive
                              ? 'bg-[#22C55E] border-[#22C55E]'
                              : 'border-[#6B7280] hover:border-[#22C55E]'
                          }`}
                        >
                          {source.isActive && (
                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </button>
                        <div>
                          <p className="text-sm font-medium text-white">{source.name}</p>
                          <p className="text-xs text-[#6B7280]">
                            {formatCurrency(source.amount)} {FREQUENCY_LABELS[source.frequency].toLowerCase()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setEditingId(source.id)}
                          className="p-1.5 rounded-lg text-[#6B7280] hover:text-white hover:bg-[#2A3441] transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => removeSource(source.id)}
                          className="p-1.5 rounded-lg text-[#6B7280] hover:text-[#EF4444] hover:bg-[#EF4444]/10 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Add New Source Form */}
          {showAddForm ? (
            <div className="p-4 rounded-xl border border-[#3B82F6]/50 bg-[#3B82F6]/5">
              <h3 className="text-sm font-medium text-white mb-4">Add Income Source</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs text-[#6B7280] mb-1.5">Source Name</label>
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g., Primary Salary, Side Gig"
                    className="w-full px-3 py-2 rounded-lg bg-[#111820] border border-[#2A3441] text-white text-sm placeholder:text-[#6B7280] focus:border-[#3B82F6] focus:outline-none transition-colors"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-[#6B7280] mb-1.5">Amount ($)</label>
                    <input
                      type="number"
                      value={newAmount}
                      onChange={(e) => setNewAmount(e.target.value)}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      className="w-full px-3 py-2 rounded-lg bg-[#111820] border border-[#2A3441] text-white text-sm placeholder:text-[#6B7280] focus:border-[#3B82F6] focus:outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-[#6B7280] mb-1.5">Frequency</label>
                    <select
                      value={newFrequency}
                      onChange={(e) => setNewFrequency(e.target.value as IncomeFrequency)}
                      className="w-full px-3 py-2 rounded-lg bg-[#111820] border border-[#2A3441] text-white text-sm focus:border-[#3B82F6] focus:outline-none transition-colors"
                    >
                      {(Object.keys(FREQUENCY_LABELS) as IncomeFrequency[]).map((freq) => (
                        <option key={freq} value={freq}>
                          {FREQUENCY_LABELS[freq]}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-[#6B7280] mt-1">{FREQUENCY_HINTS[newFrequency]}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleAddSource}
                    disabled={!newName.trim() || !newAmount}
                    className="flex-1 px-4 py-2 rounded-lg bg-[#22C55E] text-white text-sm font-medium hover:bg-[#16A34A] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Add Source
                  </button>
                  <button
                    onClick={() => {
                      setShowAddForm(false);
                      setNewName('');
                      setNewAmount('');
                    }}
                    className="px-4 py-2 rounded-lg bg-[#2A3441] text-[#9BA4B0] text-sm font-medium hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowAddForm(true)}
              className="w-full p-4 rounded-xl border border-dashed border-[#2A3441] text-[#6B7280] hover:border-[#3B82F6] hover:text-[#3B82F6] transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Income Source
            </button>
          )}

          {/* Empty state */}
          {incomeSettings.sources.length === 0 && !showAddForm && (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#22C55E]/10 flex items-center justify-center">
                <svg className="w-8 h-8 text-[#22C55E]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-[#9BA4B0] text-sm">
                No income sources configured yet.
              </p>
              <p className="text-[#6B7280] text-xs mt-1">
                Add your income to see savings rate and budget insights.
              </p>
            </div>
          )}
        </div>

        {/* Footer with summary */}
        {calculations.monthlyIncome > 0 && (
          <div className="p-6 border-t border-[#2A3441] bg-gradient-to-r from-[#22C55E]/5 to-transparent">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-[#6B7280]">Monthly Income</p>
                <p className="text-xl font-bold text-[#22C55E]">{formatCurrency(calculations.monthlyIncome)}</p>
              </div>
              <div>
                <p className="text-xs text-[#6B7280]">Annual Income</p>
                <p className="text-xl font-bold text-white">{formatCurrency(calculations.annualIncome)}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Edit source inline form
function EditSourceForm({
  source,
  onSave,
  onCancel,
}: {
  source: { name: string; amount: number; frequency: IncomeFrequency };
  onSave: (updates: { name?: string; amount?: number; frequency?: IncomeFrequency }) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(source.name);
  const [amount, setAmount] = useState(source.amount.toString());
  const [frequency, setFrequency] = useState(source.frequency);

  const handleSave = () => {
    if (!name.trim() || !amount) return;
    onSave({
      name: name.trim(),
      amount: parseFloat(amount),
      frequency,
    });
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-3">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="col-span-1 px-3 py-1.5 rounded-lg bg-[#0F1419] border border-[#2A3441] text-white text-sm focus:border-[#3B82F6] focus:outline-none"
        />
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          min="0"
          step="0.01"
          className="col-span-1 px-3 py-1.5 rounded-lg bg-[#0F1419] border border-[#2A3441] text-white text-sm focus:border-[#3B82F6] focus:outline-none"
        />
        <select
          value={frequency}
          onChange={(e) => setFrequency(e.target.value as IncomeFrequency)}
          className="col-span-1 px-3 py-1.5 rounded-lg bg-[#0F1419] border border-[#2A3441] text-white text-sm focus:border-[#3B82F6] focus:outline-none"
        >
          {(Object.keys(FREQUENCY_LABELS) as IncomeFrequency[]).map((freq) => (
            <option key={freq} value={freq}>
              {FREQUENCY_LABELS[freq]}
            </option>
          ))}
        </select>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={handleSave}
          className="px-3 py-1 rounded-lg bg-[#22C55E] text-white text-xs font-medium hover:bg-[#16A34A] transition-colors"
        >
          Save
        </button>
        <button
          onClick={onCancel}
          className="px-3 py-1 rounded-lg text-[#6B7280] text-xs font-medium hover:text-white transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

export { IncomeSettingsModal as default };
