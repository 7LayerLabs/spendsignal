'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { PlaidLinkButton } from '@/components/plaid/plaid-link-button';

interface PlaidAccount {
  id: string;
  name: string;
  mask: string;
  type: string;
  subtype: string;
}

interface PlaidConnectionData {
  id: string;
  institutionName: string | null;
  institutionId: string | null;
  accounts: PlaidAccount[] | null;
  lastSyncedAt: string | null;
  syncStatus: string;
  isActive: boolean;
  errorCode: string | null;
}

// Bank brand data with logos from Brandfetch CDN
const SUPPORTED_BANKS = [
  {
    name: 'Chase',
    logo: 'https://cdn.brandfetch.io/idudVYts5w/w/400/h/400/theme/dark/symbol.png?c=1bxid64Mup7aczewSAYMX&t=1668074267699',
  },
  {
    name: 'Bank of America',
    logo: 'https://cdn.brandfetch.io/ide4lTCz-B/w/400/h/400/theme/dark/icon.jpeg?c=1bxid64Mup7aczewSAYMX',
  },
  {
    name: 'Wells Fargo',
    logo: 'https://cdn.brandfetch.io/idVCed0KqE/w/400/h/400/theme/dark/icon.png?c=1bxid64Mup7aczewSAYMX&t=1679401840901',
  },
  {
    name: 'Capital One',
    logo: 'https://cdn.brandfetch.io/idYFfMZte4/w/400/h/400/theme/dark/icon.jpeg?c=1bxid64Mup7aczewSAYMX&t=1684919440637',
  },
  {
    name: 'Citi',
    logo: 'https://cdn.brandfetch.io/idr8xpMOko/w/400/h/400/theme/dark/icon.jpeg?c=1bxid64Mup7aczewSAYMX&t=1761814355509',
  },
  {
    name: 'US Bank',
    logo: 'https://cdn.brandfetch.io/id6EVneWal/w/400/h/400/theme/dark/symbol.png?c=1bxid64Mup7aczewSAYMX&t=1668074386583',
  },
  {
    name: 'PNC',
    logo: 'https://cdn.brandfetch.io/idKyi1joER/w/400/h/400/theme/dark/icon.jpeg?c=1bxid64Mup7aczewSAYMX&t=1703699442120',
  },
  {
    name: 'TD Bank',
    logo: 'https://cdn.brandfetch.io/id6wH4wcFV/w/400/h/400/theme/dark/icon.jpeg?c=1bxid64Mup7aczewSAYMX',
  },
];

export default function ConnectionsPage() {
  const [connections, setConnections] = useState<PlaidConnectionData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState<string | null>(null);

  const fetchConnections = useCallback(async () => {
    try {
      const response = await fetch('/api/plaid/connections');
      if (response.ok) {
        const data = await response.json();
        setConnections(data.connections || []);
      }
    } catch (error) {
      console.error('Failed to fetch connections:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConnections();
  }, [fetchConnections]);

  const handlePlaidSuccess = () => {
    fetchConnections();
  };

  const handleSync = async (connectionId: string) => {
    setIsSyncing(connectionId);
    try {
      await fetch('/api/plaid/sync-transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ connectionId }),
      });
      await fetchConnections();
    } catch (error) {
      console.error('Failed to sync:', error);
    } finally {
      setIsSyncing(null);
    }
  };

  const getStatusBadge = (connection: PlaidConnectionData) => {
    if (connection.errorCode) {
      return (
        <span className="flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium bg-[#EF4444]/20 text-[#EF4444]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#EF4444]" />
          Error
        </span>
      );
    }
    if (connection.syncStatus === 'syncing') {
      return (
        <span className="flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium bg-[#FFC700]/20 text-[#FFC700]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#FFC700] animate-pulse" />
          Syncing
        </span>
      );
    }
    if (connection.isActive) {
      return (
        <span className="flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium bg-[#22C55E]/20 text-[#22C55E]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" />
          Connected
        </span>
      );
    }
    return (
      <span className="flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium bg-[#EAB308]/20 text-[#EAB308]">
        <span className="w-1.5 h-1.5 rounded-full bg-[#EAB308]" />
        Inactive
      </span>
    );
  };

  const getAccountTypeIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'depository':
      case 'checking':
      case 'savings':
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
        );
      case 'credit':
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
        );
      case 'investment':
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        );
    }
  };

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
          <span className="text-[white]">Connections</span>
        </div>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[white]">Bank Connections</h1>
          <p className="text-sm text-[#9BA4B0] mt-1">
            Connect your bank accounts to sync real transactions
          </p>
        </div>
        <PlaidLinkButton
          onSuccess={handlePlaidSuccess}
          className="px-5 py-2.5 rounded text-sm font-semibold text-white bg-[#FFC700] hover:bg-[#E6B800] transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Bank
        </PlaidLinkButton>
      </div>

      {/* Connected Accounts */}
      <div className="p-6 rounded bg-[#111820] border border-[#424242]">
        <h2 className="text-lg font-semibold text-[white] mb-6">Connected Accounts</h2>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 mx-auto border-2 border-[#6B7280] border-t-[white] rounded-full animate-spin" />
            <p className="text-sm text-[#9BA4B0] mt-4">Loading connections...</p>
          </div>
        ) : connections.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-[#0D1117] flex items-center justify-center">
              <svg className="w-10 h-10 text-[#6B7280]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-[white] mb-2">No banks connected</h3>
            <p className="text-sm text-[#9BA4B0] max-w-md mx-auto mb-6">
              You&apos;re currently in demo mode with mock transactions. Connect your real bank accounts to start tracking actual spending.
            </p>
            <PlaidLinkButton
              onSuccess={handlePlaidSuccess}
              className="px-5 py-2.5 rounded text-sm font-semibold text-white bg-[#FFC700] hover:bg-[#E6B800] transition-colors"
            >
              Connect Your First Bank
            </PlaidLinkButton>
          </div>
        ) : (
          <div className="space-y-4">
            {connections.map((connection) => (
              <div
                key={connection.id}
                className="p-4 rounded bg-[#0D1117] border border-[#424242]"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded bg-[#0D1117] flex items-center justify-center text-[#9BA4B0]">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-semibold text-[white]">
                        {connection.institutionName || 'Unknown Bank'}
                      </p>
                      <p className="text-xs text-[#9BA4B0]">
                        {connection.lastSyncedAt
                          ? `Last synced ${new Date(connection.lastSyncedAt).toLocaleDateString()}`
                          : 'Never synced'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {getStatusBadge(connection)}
                    <button
                      onClick={() => handleSync(connection.id)}
                      disabled={isSyncing === connection.id}
                      className="p-2 rounded text-[#9BA4B0] hover:bg-[#0D1117] hover:text-[white] transition-colors disabled:opacity-50"
                      title="Sync transactions"
                    >
                      <svg
                        className={`w-5 h-5 ${isSyncing === connection.id ? 'animate-spin' : ''}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Linked Accounts */}
                {connection.accounts && connection.accounts.length > 0 && (
                  <div className="space-y-2 pt-3 border-t border-[#424242]">
                    {connection.accounts.map((account) => (
                      <div
                        key={account.id}
                        className="flex items-center gap-3 p-2 rounded"
                      >
                        <div className="w-8 h-8 rounded-md bg-[#0D1117] flex items-center justify-center text-[#6B7280]">
                          {getAccountTypeIcon(account.type)}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-[white]">
                            {account.name}
                          </p>
                          <p className="text-xs text-[#9BA4B0]">
                            ••••{account.mask} · {account.subtype || account.type}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Supported Banks */}
      <div className="p-6 rounded bg-[#111820] border border-[#424242]">
        <h2 className="text-lg font-semibold text-[white] mb-4">Supported Banks</h2>
        <p className="text-sm text-[#9BA4B0] mb-6">
          We use Plaid to securely connect to over 12,000 financial institutions.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {SUPPORTED_BANKS.map((bank) => (
            <div
              key={bank.name}
              className="p-4 rounded bg-[#0D1117] border border-[#424242] text-center hover:border-[#6B7280] transition-colors"
            >
              <div className="w-12 h-12 mx-auto mb-3 rounded overflow-hidden bg-white flex items-center justify-center">
                <img
                  src={bank.logo}
                  alt={`${bank.name} logo`}
                  className="w-10 h-10 object-contain"
                />
              </div>
              <p className="text-sm font-medium text-[white]">{bank.name}</p>
            </div>
          ))}
        </div>

        <p className="text-xs text-[#6B7280] mt-4 text-center">
          + thousands more including credit unions, investment accounts, and international banks
        </p>
      </div>

      {/* Security Info */}
      <div className="p-6 rounded bg-[#111820] border border-[#424242]">
        <h2 className="text-lg font-semibold text-[white] mb-6">Security & Privacy</h2>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="flex gap-3">
            <div className="w-10 h-10 rounded bg-[#22C55E]/10 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-[#22C55E]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-medium text-[white]">Bank-Level Security</h3>
              <p className="text-xs text-[#9BA4B0] mt-1">
                256-bit encryption protects your data in transit and at rest.
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="w-10 h-10 rounded bg-[#FFC700]/10 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-[#FFC700]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-medium text-[white]">Read-Only Access</h3>
              <p className="text-xs text-[#9BA4B0] mt-1">
                We can only view your transactions. No transfers or changes.
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="w-10 h-10 rounded bg-[#FFC700]/10 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-[#FFC700]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-medium text-[white]">No Stored Credentials</h3>
              <p className="text-xs text-[#9BA4B0] mt-1">
                Your login info goes directly to your bank via Plaid.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-[#424242] flex items-center justify-center gap-2">
          <span className="text-xs text-[#6B7280]">Powered by</span>
          <span className="text-sm font-semibold text-[white]">Plaid</span>
        </div>
      </div>
    </div>
  );
}
