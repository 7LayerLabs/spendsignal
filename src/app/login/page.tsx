'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn, useSession } from 'next-auth/react';

function TrafficLightDots() {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="w-2.5 h-2.5 rounded-full bg-[#22C55E]" />
      <div className="w-2.5 h-2.5 rounded-full bg-[#EAB308]" />
      <div className="w-2.5 h-2.5 rounded-full bg-[#EF4444]" />
    </div>
  );
}

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'authenticated' && session) {
      router.push('/dashboard');
    }
  }, [session, status, router]);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await signIn('google', { callbackUrl: '/dashboard' });
    } catch {
      setError('Failed to sign in. Please try again.');
      setIsLoading(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-[#000000] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#22C55E] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (status === 'authenticated') {
    return (
      <div className="min-h-screen bg-[#000000] flex items-center justify-center">
        <div className="text-white">Redirecting to dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#000000] flex items-center justify-center px-4">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-[#FFC700]/5 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3">
            <TrafficLightDots />
            <span className="font-mono-bold text-sm uppercase text-white">SpendSignal</span>
          </Link>
        </div>

        <div className="border border-[#424242] bg-[#111820] p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-white mb-2">Welcome back</h1>
            <p className="text-[#9BA4B0]">Sign in to continue your journey</p>
          </div>

          {error && (
            <div className="mb-6 p-4 border border-[#EF4444]/30 bg-[#EF4444]/10 text-[#EF4444] text-sm">
              {error}
            </div>
          )}

          <button
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white text-gray-900 font-medium hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
            )}
            Continue with Google
          </button>

          <div className="mt-6 pt-6 border-t border-[#424242]">
            <Link
              href="/dashboard"
              className="block w-full text-center px-4 py-3 border border-[#424242] text-white font-medium hover:bg-white/5 transition-colors"
            >
              Try Demo Mode
            </Link>
            <p className="text-xs text-[#6B7280] text-center mt-2">
              No account needed. Explore with sample data.
            </p>
          </div>
        </div>

        <p className="text-center text-[#9BA4B0] mt-6">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="text-[#FFC700] hover:underline">
            Sign up
          </Link>
        </p>

        <p className="text-center mt-4">
          <Link href="/" className="text-sm text-[#6B7280] hover:text-white transition-colors">
            &larr; Back to home
          </Link>
        </p>
      </div>
    </div>
  );
}
