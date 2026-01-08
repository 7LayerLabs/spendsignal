import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'SpendSignal Privacy Policy - How we handle your data.',
};

function TrafficLightDots() {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="w-2.5 h-2.5 rounded-full bg-[#22C55E]" />
      <div className="w-2.5 h-2.5 rounded-full bg-[#EAB308]" />
      <div className="w-2.5 h-2.5 rounded-full bg-[#EF4444]" />
    </div>
  );
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#000000] text-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-[#000000] border-b border-[#424242]">
        <div className="container-app">
          <div className="flex items-center justify-between h-16 md:h-20">
            <Link href="/" className="flex items-center gap-3">
              <TrafficLightDots />
              <span className="font-mono-bold text-xs md:text-sm uppercase">SpendSignal</span>
            </Link>
            <Link href="/dashboard" className="btn-primary text-xs py-2 px-4">
              Open App
            </Link>
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-sm text-[#6B7280] mb-12">Last updated: January 2026</p>

        <div className="space-y-8">
          <section>
            <h2 className="text-xl font-semibold mb-4">Overview</h2>
            <p className="text-[#9BA4B0] leading-relaxed">
              SpendSignal takes your privacy seriously. This policy explains what data we collect,
              how we use it, and your rights regarding your personal information. We believe in
              transparency — no fine print tricks.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">Information We Collect</h2>
            <div className="space-y-4">
              <div className="p-4 bg-[#111820] border border-[#424242]">
                <h3 className="font-medium mb-2">Account Information</h3>
                <p className="text-sm text-[#9BA4B0]">Email address and name (from Google/Apple OAuth). We never see or store your passwords.</p>
              </div>
              <div className="p-4 bg-[#111820] border border-[#424242]">
                <h3 className="font-medium mb-2">Financial Data</h3>
                <p className="text-sm text-[#9BA4B0]">Transaction data from connected bank accounts via Plaid. This includes merchant names, amounts, and dates. We have read-only access — we cannot move your money.</p>
              </div>
              <div className="p-4 bg-[#111820] border border-[#424242]">
                <h3 className="font-medium mb-2">Usage Data</h3>
                <p className="text-sm text-[#9BA4B0]">How you interact with the app (categories you create, goals you set). This helps us improve the product.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">How We Use Your Data</h2>
            <ul className="list-disc list-inside space-y-2 text-[#9BA4B0]">
              <li>To provide the SpendSignal service and categorize your transactions</li>
              <li>To generate insights, reports, and spending analysis</li>
              <li>To send you alerts about your spending goals (if enabled)</li>
              <li>To improve our product and fix bugs</li>
              <li>To process payments (via Stripe) if you upgrade to Premium</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">What We Don&apos;t Do</h2>
            <ul className="list-disc list-inside space-y-2 text-[#9BA4B0]">
              <li>We never sell your data to third parties</li>
              <li>We never share your financial data with advertisers</li>
              <li>We never store your bank login credentials</li>
              <li>We never access your accounts without your explicit connection via Plaid</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">Data Security</h2>
            <p className="text-[#9BA4B0] leading-relaxed">
              All data is encrypted in transit (TLS 1.3) and at rest (AES-256). We use Plaid for
              bank connections, which is trusted by thousands of financial apps. Your credentials
              go directly to Plaid — we never see them.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">Your Rights</h2>
            <div className="space-y-2 text-[#9BA4B0]">
              <p><strong className="text-white">Access:</strong> Request a copy of your data anytime.</p>
              <p><strong className="text-white">Delete:</strong> Request complete deletion of your account and data.</p>
              <p><strong className="text-white">Disconnect:</strong> Revoke bank access with one click in Settings.</p>
              <p><strong className="text-white">Export:</strong> Download your data in a portable format.</p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">Third-Party Services</h2>
            <ul className="list-disc list-inside space-y-2 text-[#9BA4B0]">
              <li><strong>Plaid</strong> — Bank account connections</li>
              <li><strong>Stripe</strong> — Payment processing</li>
              <li><strong>Supabase</strong> — Database and authentication</li>
              <li><strong>Vercel</strong> — Hosting</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">Contact</h2>
            <p className="text-[#9BA4B0]">
              Questions about privacy? Email us at{' '}
              <a href="mailto:privacy@spendsignal.app" className="text-[#FFC700] hover:underline">
                privacy@spendsignal.app
              </a>
            </p>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 md:py-8 border-t border-[#424242]">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 md:gap-4">
            <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4 text-center md:text-left">
              <div className="flex items-center gap-2">
                <TrafficLightDots />
                <span className="text-sm">SpendSignal</span>
              </div>
              <span className="hidden md:block text-[#424242]">|</span>
              <span className="text-xs text-[#6B7280]">Inspired by Clark Howard&apos;s Traffic Light System</span>
            </div>
            <div className="flex items-center gap-4 md:gap-6 flex-wrap justify-center">
              <Link href="/about" className="text-xs text-[#6B7280] hover:text-white transition-colors">About</Link>
              <Link href="/privacy" className="text-xs text-[#6B7280] hover:text-white transition-colors">Privacy</Link>
              <Link href="/terms" className="text-xs text-[#6B7280] hover:text-white transition-colors">Terms</Link>
              <span className="text-xs text-[#6B7280]">&copy; {new Date().getFullYear()}</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
