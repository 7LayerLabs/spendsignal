'use client';

import { useCallback, useEffect, useState } from 'react';
import { usePlaidLink, PlaidLinkOptions, PlaidLinkOnSuccess } from 'react-plaid-link';

interface PlaidLinkButtonProps {
  onSuccess?: () => void;
  onExit?: () => void;
  className?: string;
  children?: React.ReactNode;
  disabled?: boolean;
}

export function PlaidLinkButton({
  onSuccess,
  onExit,
  className,
  children,
  disabled,
}: PlaidLinkButtonProps) {
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch link token on mount
  useEffect(() => {
    const fetchLinkToken = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch('/api/plaid/create-link-token', {
          method: 'POST',
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to create link token');
        }

        const data = await response.json();
        setLinkToken(data.linkToken);
      } catch (err) {
        console.error('Failed to fetch link token:', err);
        setError(err instanceof Error ? err.message : 'Failed to initialize');
      } finally {
        setIsLoading(false);
      }
    };

    fetchLinkToken();
  }, []);

  // Handle successful link
  const handleSuccess = useCallback<PlaidLinkOnSuccess>(
    async (publicToken, metadata) => {
      try {
        setIsLoading(true);

        const response = await fetch('/api/plaid/exchange-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            publicToken,
            institutionId: metadata.institution?.institution_id,
            institutionName: metadata.institution?.name,
            accounts: metadata.accounts?.map((acc) => ({
              id: acc.id,
              name: acc.name,
              mask: acc.mask,
              type: acc.type,
              subtype: acc.subtype,
            })),
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to connect bank');
        }

        // Trigger initial sync
        await fetch('/api/plaid/sync-transactions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({}),
        });

        onSuccess?.();
      } catch (err) {
        console.error('Failed to exchange token:', err);
        setError('Failed to connect bank. Please try again.');
      } finally {
        setIsLoading(false);
      }
    },
    [onSuccess]
  );

  // Handle exit
  const handleExit = useCallback(() => {
    onExit?.();
  }, [onExit]);

  const config: PlaidLinkOptions = {
    token: linkToken,
    onSuccess: handleSuccess,
    onExit: handleExit,
  };

  const { open, ready } = usePlaidLink(config);

  const handleClick = () => {
    if (ready && linkToken) {
      open();
    }
  };

  const isDisabled = disabled || isLoading || !ready || !linkToken;

  if (error) {
    return (
      <div className="text-center">
        <p className="text-sm text-[#EF4444] mb-2">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="text-sm text-[#3B82F6] hover:underline"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleClick}
      disabled={isDisabled}
      className={className}
    >
      {isLoading ? (
        <span className="flex items-center gap-2">
          <svg
            className="animate-spin h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          Connecting...
        </span>
      ) : (
        children || 'Connect Bank'
      )}
    </button>
  );
}
