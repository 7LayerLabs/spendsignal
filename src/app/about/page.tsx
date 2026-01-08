import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'About',
  description: 'Learn about SpendSignal and the Traffic Light Spending System inspired by consumer advocate Clark Howard.',
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

export default function AboutPage() {
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

      {/* Hero */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">About SpendSignal</h1>
          <p className="text-xl text-[#9BA4B0] max-w-2xl mx-auto">
            A personal finance app that gives you honest feedback about your spending. No sugar-coating. No excuses. Just clarity.
          </p>
        </div>
      </section>

      {/* What is SpendSignal */}
      <section className="py-12 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="p-8 border border-[#424242] bg-[#111820]">
            <h2 className="text-2xl font-bold mb-6">What is SpendSignal?</h2>
            <div className="space-y-4 text-[#9BA4B0]">
              <p>
                SpendSignal is a personal finance application built on a simple but powerful idea:
                <strong className="text-white"> you should categorize every purchase by how essential it truly is</strong>,
                not by what category the bank assigns it.
              </p>
              <p>Using an interactive drag-and-drop canvas, you manually sort each transaction into one of three zones:</p>
              <div className="grid md:grid-cols-3 gap-4 my-6">
                <div className="p-4 border border-[#22C55E]/30 bg-[#22C55E]/10">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-4 h-4 rounded-full bg-[#22C55E]" />
                    <span className="font-semibold text-[#22C55E]">Green Zone</span>
                  </div>
                  <p className="text-sm">Essentials. Non-negotiable expenses like rent, utilities, groceries, insurance, and transportation to work.</p>
                </div>
                <div className="p-4 border border-[#EAB308]/30 bg-[#EAB308]/10">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-4 h-4 rounded-full bg-[#EAB308]" />
                    <span className="font-semibold text-[#EAB308]">Yellow Zone</span>
                  </div>
                  <p className="text-sm">Discretionary. Things that improve quality of life but you could survive without. Think twice before spending.</p>
                </div>
                <div className="p-4 border border-[#EF4444]/30 bg-[#EF4444]/10">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-4 h-4 rounded-full bg-[#EF4444]" />
                    <span className="font-semibold text-[#EF4444]">Red Zone</span>
                  </div>
                  <p className="text-sm">Avoidable. Impulse purchases, luxury items you don&apos;t need, and wants masquerading as needs.</p>
                </div>
              </div>
              <p>
                The act of manually categorizing forces you to confront each purchase honestly.
                <strong className="text-white"> You decide what&apos;s essential, and you own that decision.</strong>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Clark Howard */}
      <section className="py-12 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="p-8 border border-[#424242] bg-[#111820]">
            <h2 className="text-2xl font-bold mb-6">The Inspiration: Clark Howard</h2>
            <div className="space-y-4 text-[#9BA4B0]">
              <p>
                The Traffic Light Spending System was created by <strong className="text-white">Clark Howard</strong>,
                one of America&apos;s most trusted consumer advocates. For over 35 years, Clark has been helping people
                save more money, avoid scams, and make smarter financial decisions.
              </p>
              <p>
                Clark hosts <em>The Clark Howard Podcast</em>, has authored multiple bestselling books on personal finance,
                and runs Clark.com — a resource dedicated to helping consumers keep more of their hard-earned money.
              </p>
              <div className="my-6 p-4 border border-[#424242] bg-[#000000]">
                <p className="text-sm">
                  <strong className="text-white">The core idea:</strong> Before every purchase,
                  ask yourself which light it falls under. Is this a green light essential, a yellow light
                  discretionary expense, or a red light purchase you should avoid?
                </p>
                <p className="text-xs text-[#6B7280] mt-2">
                  Learn more at <a href="https://clark.com/personal-finance-credit/clark-howard-traffic-light-guide-to-spending/" target="_blank" rel="noopener noreferrer" className="text-[#FFC700] hover:underline">clark.com</a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quotes */}
      <section className="py-12 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="p-8 border border-[#424242] bg-[#111820]">
            <h2 className="text-2xl font-bold mb-6">In Clark&apos;s Words</h2>
            <div className="space-y-6">
              <blockquote className="pl-6 border-l-4 border-[#22C55E]">
                <p className="text-lg italic mb-2">
                  &quot;The key to having financial security in your life is living on less than what you make.&quot;
                </p>
                <cite className="text-sm text-[#6B7280] not-italic">— Clark Howard</cite>
              </blockquote>
              <blockquote className="pl-6 border-l-4 border-[#EAB308]">
                <p className="text-lg italic mb-2">
                  &quot;Until you learn to live below your means, and be OK with it, you&apos;ll never get ahead financially!&quot;
                </p>
                <cite className="text-sm text-[#6B7280] not-italic">— Clark Howard</cite>
              </blockquote>
              <blockquote className="pl-6 border-l-4 border-[#EF4444]">
                <p className="text-lg italic mb-2">
                  &quot;Every dollar you spend on a red light item is a dollar that could be going toward paying down debt or saving for your Roth IRA.&quot;
                </p>
                <cite className="text-sm text-[#6B7280] not-italic">— Clark Howard, on the Traffic Light System</cite>
              </blockquote>
            </div>
          </div>
        </div>
      </section>

      {/* Philosophy */}
      <section className="py-12 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="p-8 border border-[#424242] bg-[#111820]">
            <h2 className="text-2xl font-bold mb-6">Clark&apos;s Financial Philosophy</h2>
            <div className="grid gap-4">
              <div className="p-4 border border-[#424242]">
                <h3 className="font-semibold mb-2"><span className="text-[#22C55E]">1.</span> Live Below Your Means</h3>
                <p className="text-sm text-[#9BA4B0]">The foundation of wealth isn&apos;t a high income — it&apos;s spending less than you earn, consistently.</p>
              </div>
              <div className="p-4 border border-[#424242]">
                <h3 className="font-semibold mb-2"><span className="text-[#22C55E]">2.</span> Save Aggressively</h3>
                <p className="text-sm text-[#9BA4B0]">Aim to save at least 20% of your income. Every dollar saved is a dollar working for your future.</p>
              </div>
              <div className="p-4 border border-[#424242]">
                <h3 className="font-semibold mb-2"><span className="text-[#EAB308]">3.</span> Question Every Purchase</h3>
                <p className="text-sm text-[#9BA4B0]">Before buying anything, ask: Do I need this? Can I find it cheaper? Can I wait?</p>
              </div>
              <div className="p-4 border border-[#424242]">
                <h3 className="font-semibold mb-2"><span className="text-[#EAB308]">4.</span> Beware of Recurring Charges</h3>
                <p className="text-sm text-[#9BA4B0]">Subscriptions drain wealth silently. Cancel anything you haven&apos;t used in the last 30 days.</p>
              </div>
              <div className="p-4 border border-[#424242]">
                <h3 className="font-semibold mb-2"><span className="text-[#EF4444]">5.</span> Avoid Debt Like the Plague</h3>
                <p className="text-sm text-[#9BA4B0]">Consumer debt is the enemy of freedom. If you can&apos;t pay cash, you can&apos;t afford it.</p>
              </div>
              <div className="p-4 border border-[#424242]">
                <h3 className="font-semibold mb-2"><span className="text-[#EF4444]">6.</span> Ignore Lifestyle Inflation</h3>
                <p className="text-sm text-[#9BA4B0]">When your income rises, resist the urge to upgrade everything.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why We Built */}
      <section className="py-12 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="p-8 border border-[#424242] bg-[#111820]">
            <h2 className="text-2xl font-bold mb-6">Why We Built SpendSignal</h2>
            <div className="space-y-4 text-[#9BA4B0]">
              <p>Most budgeting apps focus on automatic categorization and passive tracking. They make it easy to <em>see</em> where your money went, but they don&apos;t make you <em>think</em> about it.</p>
              <p>SpendSignal is different. We believe that <strong className="text-white">financial awareness requires active engagement</strong>. When you drag each transaction to its zone, you&apos;re building a habit of intentional spending.</p>
              <p>The app takes a &quot;tough love&quot; approach. We won&apos;t tell you &quot;Great job!&quot; for routine spending. Instead, we&apos;ll ask hard questions.</p>
              <p className="text-white font-medium">SpendSignal is for people who want honest feedback, not empty praise. If that sounds like you, welcome home.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to see where your money really goes?</h2>
          <p className="text-[#9BA4B0] mb-8">Start categorizing your spending with the Traffic Light System. No credit card required for demo mode.</p>
          <Link href="/dashboard" className="btn-primary inline-block">
            Start Your Reality Check
          </Link>
        </div>
      </section>

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
