import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'SpendSignal Terms of Service - Rules of the road.',
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

export default function TermsPage() {
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
        <h1 className="text-3xl font-bold mb-2">Terms of Service</h1>
        <p className="text-sm text-[#6B7280] mb-12">Last updated: January 2026</p>

        <div className="space-y-8">
          <section>
            <h2 className="text-xl font-semibold mb-4">Agreement</h2>
            <p className="text-[#9BA4B0] leading-relaxed">
              By using SpendSignal, you agree to these terms. If you don&apos;t agree, don&apos;t use the service.
              Simple as that. We may update these terms occasionally — continued use means you accept the changes.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">What SpendSignal Is</h2>
            <p className="text-[#9BA4B0] leading-relaxed">
              SpendSignal is a personal finance tool that helps you categorize and understand your spending
              using Clark Howard&apos;s Traffic Light System. We provide insights and tough-love feedback to
              help you build better financial habits.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">What SpendSignal Is NOT</h2>
            <div className="p-4 bg-[#EF4444]/10 border border-[#EF4444]/30">
              <ul className="list-disc list-inside space-y-2 text-[#9BA4B0]">
                <li>We are NOT financial advisors. Our categorizations are educational, not investment advice.</li>
                <li>We are NOT affiliated with your bank. We use Plaid for read-only data access.</li>
                <li>We are NOT responsible for financial decisions you make based on our insights.</li>
                <li>We do NOT guarantee any specific financial outcomes.</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">Your Account</h2>
            <ul className="list-disc list-inside space-y-2 text-[#9BA4B0]">
              <li>You must be 18 or older to use SpendSignal</li>
              <li>You&apos;re responsible for keeping your account secure</li>
              <li>One account per person — no sharing credentials</li>
              <li>You must provide accurate information</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">Acceptable Use</h2>
            <p className="text-[#9BA4B0] mb-4">Don&apos;t use SpendSignal to:</p>
            <ul className="list-disc list-inside space-y-2 text-[#9BA4B0]">
              <li>Break the law or help others break the law</li>
              <li>Attempt to hack, exploit, or compromise our systems</li>
              <li>Scrape data or create derivative products</li>
              <li>Harass our team or other users</li>
              <li>Misrepresent your identity or data</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">Subscriptions &amp; Payments</h2>
            <div className="space-y-4 text-[#9BA4B0]">
              <p>
                <strong className="text-white">Free Tier:</strong> Basic features with demo data.
                No credit card required.
              </p>
              <p>
                <strong className="text-white">Premium:</strong> $9.99/month or $99/year.
                Includes bank connections, unlimited features, and priority support.
              </p>
              <p>
                <strong className="text-white">Cancellation:</strong> Cancel anytime from Settings.
                You&apos;ll keep Premium access until the end of your billing period.
              </p>
              <p>
                <strong className="text-white">Refunds:</strong> We offer refunds within 7 days
                of purchase if you&apos;re not satisfied. Contact support.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">Data &amp; Privacy</h2>
            <p className="text-[#9BA4B0] leading-relaxed">
              Your data is yours. See our{' '}
              <Link href="/privacy" className="text-[#FFC700] hover:underline">
                Privacy Policy
              </Link>
              {' '}for details on how we collect, use, and protect your information.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">Intellectual Property</h2>
            <p className="text-[#9BA4B0] leading-relaxed">
              SpendSignal&apos;s code, design, and content are our property. The Traffic Light System concept
              is inspired by Clark Howard and is used with attribution for educational purposes.
              You may not copy, modify, or redistribute our software without permission.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">Limitation of Liability</h2>
            <p className="text-[#9BA4B0] leading-relaxed">
              SpendSignal is provided &quot;as is&quot; without warranties. We&apos;re not liable for:
              financial losses, data inaccuracies, service interruptions, or decisions you make
              based on our insights. Use your own judgment. Maximum liability is limited to
              fees you&apos;ve paid us in the last 12 months.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">Termination</h2>
            <p className="text-[#9BA4B0] leading-relaxed">
              You can delete your account anytime. We may suspend or terminate accounts that
              violate these terms. Upon termination, we&apos;ll delete your data within 30 days
              (unless legally required to retain it).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">Governing Law</h2>
            <p className="text-[#9BA4B0] leading-relaxed">
              These terms are governed by the laws of the State of Delaware, USA.
              Any disputes will be resolved through binding arbitration.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">Contact</h2>
            <p className="text-[#9BA4B0]">
              Questions about these terms? Email us at{' '}
              <a href="mailto:legal@spendsignal.app" className="text-[#FFC700] hover:underline">
                legal@spendsignal.app
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
