'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

function TrafficLightDots({ className = '' }: { className?: string }) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <div className="w-2.5 h-2.5 rounded-full bg-[#22C55E]" />
      <div className="w-2.5 h-2.5 rounded-full bg-[#EAB308]" />
      <div className="w-2.5 h-2.5 rounded-full bg-[#EF4444]" />
    </div>
  );
}

function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all ${scrolled || mobileMenuOpen ? 'bg-[#000000] border-b border-[#424242]' : ''}`}>
      <div className="container-app">
        <div className="flex items-center justify-between h-16 md:h-20">
          <Link href="/" className="flex items-center gap-3">
            <TrafficLightDots className="scale-75" />
            <span className="font-mono-bold text-xs md:text-sm uppercase text-white">SpendSignal</span>
          </Link>
          <div className="hidden lg:flex items-center gap-12">
            <a href="#how" className="font-mono text-xs uppercase text-[#9BA4B0] hover:text-[#FFC700]">How It Works</a>
            <a href="#features" className="font-mono text-xs uppercase text-[#9BA4B0] hover:text-[#FFC700]">Features</a>
            <a href="#pricing" className="font-mono text-xs uppercase text-[#9BA4B0] hover:text-[#FFC700]">Pricing</a>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="hidden sm:block font-mono text-xs text-[#9BA4B0]">Log In</Link>
            <button className="btn-primary text-xs py-2 px-4 hidden sm:block">Start Free</button>
            {/* Hamburger Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-white"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div
          className={`lg:hidden overflow-hidden transition-all duration-300 ease-in-out ${
            mobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="pb-6 border-t border-[#424242]">
            <div className="flex flex-col gap-4 pt-4">
              <a
                href="#how"
                onClick={() => setMobileMenuOpen(false)}
                className="font-mono text-sm uppercase text-[#9BA4B0] hover:text-[#FFC700] py-2 transition-colors"
              >
                How It Works
              </a>
              <a
                href="#features"
                onClick={() => setMobileMenuOpen(false)}
                className="font-mono text-sm uppercase text-[#9BA4B0] hover:text-[#FFC700] py-2 transition-colors"
              >
                Features
              </a>
              <a
                href="#pricing"
                onClick={() => setMobileMenuOpen(false)}
                className="font-mono text-sm uppercase text-[#9BA4B0] hover:text-[#FFC700] py-2 transition-colors"
              >
                Pricing
              </a>
              <div className="flex flex-col gap-3 pt-4 border-t border-[#424242]">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="font-mono text-sm text-[#9BA4B0] py-2 transition-colors hover:text-white"
                >
                  Log In
                </Link>
                <button className="btn-primary text-sm py-3 w-full">Start Free</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

function HeroSection() {
  return (
    <section className="relative flex items-start justify-center pt-24 md:pt-28 pb-12">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-gradient-radial from-[#FFC700]/10 blur-3xl opacity-40" />
      </div>

      <div className="container-app relative z-10 max-w-5xl text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-6">
          <span className="text-xs font-medium text-[#22C55E]">NEW</span>
          <span className="text-sm text-[#9BA4B0]">Based on Clark Howard&apos;s Traffic Light System</span>
        </div>

        <h1 className="text-5xl sm:text-7xl lg:text-8xl font-bold mb-6">
          <span className="block text-white">Your Money Needs</span>
          <span className="gradient-text-traffic">Tough Love</span>
        </h1>

        <p className="text-lg md:text-2xl font-mono-bold mb-4"><span className="text-[#22C55E]">Green</span> <span className="text-white">means</span> <span className="text-[#22C55E]">grow.</span></p>

        <p className="text-base md:text-lg text-[#9BA4B0] mb-4 max-w-2xl mx-auto">
          The spending coach that tells you what you need to hear, not what you want to hear. Categorize every transaction. Build real discipline.
        </p>

        <p className="text-sm text-[#6B7280] mb-8">
          Built on a method trusted by millions for over 30 years
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button className="btn-primary">Start Your Reality Check</button>
          <button className="btn-secondary">See How It Works</button>
        </div>
      </div>
    </section>
  );
}

function TrafficLightDemo() {
  return (
    <section className="py-10 md:py-12">
      <div className="container-app">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {/* Green Zone */}
          <div className="bg-[#111820] border border-[#22C55E]/30 rounded overflow-hidden">
            <img
              src="/images/zones/green-zone.png"
              alt="Green zone example - making coffee at home"
              className="w-full h-48 md:h-56 object-cover"
            />
            <div className="p-4 md:p-6 flex items-center gap-4">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-[#22C55E] shadow-[0_0_20px_rgba(34,197,94,0.4)] flex-shrink-0" />
              <div>
                <p className="text-[#22C55E] font-bold uppercase tracking-wide text-sm">Green Light</p>
                <p className="text-[#9BA4B0] text-xs">Must-pay essentials</p>
              </div>
            </div>
          </div>

          {/* Yellow Zone */}
          <div className="bg-[#111820] border border-[#EAB308]/30 rounded overflow-hidden">
            <img
              src="/images/zones/yellow-zone.png"
              alt="Yellow zone example - evaluating purchase"
              className="w-full h-48 md:h-56 object-cover"
            />
            <div className="p-4 md:p-6 flex items-center gap-4">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-[#EAB308] shadow-[0_0_20px_rgba(234,179,8,0.4)] flex-shrink-0" />
              <div>
                <p className="text-[#EAB308] font-bold uppercase tracking-wide text-sm">Yellow Light</p>
                <p className="text-[#9BA4B0] text-xs">Think twice, evaluate</p>
              </div>
            </div>
          </div>

          {/* Red Zone */}
          <div className="bg-[#111820] border border-[#EF4444]/30 rounded overflow-hidden">
            <img
              src="/images/zones/red-zone.png"
              alt="Red zone example - late night online shopping"
              className="w-full h-48 md:h-56 object-cover"
            />
            <div className="p-4 md:p-6 flex items-center gap-4">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-[#EF4444] shadow-[0_0_20px_rgba(239,68,68,0.4)] flex-shrink-0" />
              <div>
                <p className="text-[#EF4444] font-bold uppercase tracking-wide text-sm">Red Light</p>
                <p className="text-[#9BA4B0] text-xs">Avoid - wants as needs</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function HowSection() {
  return (
    <section id="how" className="py-10 md:py-12 scroll-mt-20">
      <div className="container-app">
        <h2 className="text-4xl md:text-6xl font-bold text-white mb-4 text-center">Three Steps to Financial Clarity</h2>
        <p className="text-[#9BA4B0] text-center mb-6 max-w-xl mx-auto">No complex budgets. No spreadsheets. Just honest categorization and brutal feedback.</p>
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="p-8 border border-[#424242] bg-[#111820]">
            <span className="text-4xl font-bold text-[#22C55E]/40 mb-4 block">01</span>
            <h3 className="text-xl font-bold text-white mb-3">Connect or Demo</h3>
            <p className="text-[#9BA4B0]">Link your bank accounts securely with Plaid, or start with demo mode to see how it works.</p>
          </div>
          <div className="p-8 border border-[#424242] bg-[#111820]">
            <span className="text-4xl font-bold text-[#EAB308]/40 mb-4 block">02</span>
            <h3 className="text-xl font-bold text-white mb-3">Categorize Everything</h3>
            <p className="text-[#9BA4B0]">Drag each transaction into Green, Yellow, or Red. Your gut knows the truth. Trust it.</p>
          </div>
          <div className="p-8 border border-[#424242] bg-[#111820]">
            <span className="text-4xl font-bold text-[#EF4444]/40 mb-4 block">03</span>
            <h3 className="text-xl font-bold text-white mb-3">Face the Numbers</h3>
            <p className="text-[#9BA4B0]">Your dashboard shows the truth. Health score, spending patterns, areas to improve. No sugarcoating.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function FeaturesSection() {
  return (
    <section id="features" className="py-10 md:py-12 scroll-mt-20">
      <div className="container-app">
        <h2 className="text-4xl md:text-6xl font-bold text-white mb-4 text-center">Tools for Financial Discipline</h2>
        <p className="text-[#9BA4B0] text-center mb-6 max-w-xl mx-auto">Everything you need to understand your spending and build better habits.</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          <div className="p-8 border border-[#22C55E]/30 bg-[#111820]">
            <h3 className="text-xl font-bold text-white mb-3">Interactive Canvas</h3>
            <p className="text-[#9BA4B0]">Drag and drop transactions like flash cards. Quick, instinctive, no overthinking.</p>
          </div>
          <div className="p-8 border border-[#EAB308]/30 bg-[#111820]">
            <h3 className="text-xl font-bold text-white mb-3">Health Score</h3>
            <p className="text-[#9BA4B0]">A single number showing your financial discipline. Watch it climb as you improve.</p>
          </div>
          <div className="p-8 border border-[#EF4444]/30 bg-[#111820]">
            <h3 className="text-xl font-bold text-white mb-3">AI Suggestions</h3>
            <p className="text-[#9BA4B0]">Smart categorization hints with tough-love reasoning. You make the final call.</p>
          </div>
          <div className="p-8 border border-[#22C55E]/30 bg-[#111820]">
            <h3 className="text-xl font-bold text-white mb-3">Spending Goals</h3>
            <p className="text-[#9BA4B0]">Set limits by zone or category. Get notified when you drift. Stay accountable.</p>
          </div>
          <div className="p-8 border border-[#EAB308]/30 bg-[#111820]">
            <h3 className="text-xl font-bold text-white mb-3">Trend Analysis</h3>
            <p className="text-[#9BA4B0]">See where your money really goes over time. Patterns don&apos;t lie.</p>
          </div>
          <div className="p-8 border border-[#EF4444]/30 bg-[#111820]">
            <h3 className="text-xl font-bold text-white mb-3">Monthly Reports</h3>
            <p className="text-[#9BA4B0]">Downloadable summaries with honest assessments. Share with your accountability partner.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function PricingSection() {
  return (
    <section id="pricing" className="py-10 md:py-12 scroll-mt-20">
      <div className="container-app">
        <h2 className="text-3xl md:text-6xl font-bold text-white mb-4 text-center">Simple, Honest Pricing</h2>
        <p className="text-[#9BA4B0] text-center mb-6 max-w-xl mx-auto text-sm md:text-base">Start free. Upgrade when you&apos;re ready for real accountability.</p>
        <div className="grid md:grid-cols-3 gap-4 md:gap-6 max-w-4xl mx-auto">
          {/* Premium - First on mobile */}
          <div className="p-6 md:p-8 border-2 border-[#FFC700] bg-[#111820] md:scale-105 order-first md:order-none md:col-start-2">
            <span className="text-xs font-bold text-[#FFC700] mb-2 block">MOST POPULAR</span>
            <h3 className="text-xl font-bold mb-2">Premium</h3>
            <p className="text-2xl font-bold mb-1">$9.99<span className="text-sm font-normal">/mo</span></p>
            <p className="text-xs text-[#9BA4B0] mb-2">$99/year (save 17%)</p>
            <p className="text-sm text-[#9BA4B0] mb-4 md:mb-6">Connect real accounts, get full insights</p>
            <ul className="text-sm text-[#9BA4B0] space-y-2 mb-4 md:mb-6">
              <li>Connect real bank accounts</li>
              <li>Unlimited transaction history</li>
              <li>Unlimited AI suggestions</li>
              <li>Custom spending alerts</li>
              <li>Trend analysis & charts</li>
              <li>Monthly PDF reports</li>
            </ul>
            <button className="w-full btn-primary">Go Premium</button>
          </div>
          {/* Free */}
          <div className="p-6 md:p-8 border border-[#424242] md:col-start-1 md:row-start-1">
            <h3 className="text-xl font-bold mb-2">Free</h3>
            <p className="text-2xl font-bold mb-2">$0</p>
            <p className="text-sm text-[#9BA4B0] mb-4 md:mb-6">Start building discipline with demo mode</p>
            <ul className="text-sm text-[#9BA4B0] space-y-2 mb-4 md:mb-6">
              <li>Demo mode with mock transactions</li>
              <li>Full canvas categorization</li>
              <li>Basic health score</li>
              <li>3 spending goals</li>
              <li>50 AI suggestions/month</li>
            </ul>
            <button className="w-full btn-secondary">Start Free</button>
          </div>
          {/* Advisor */}
          <div className="p-6 md:p-8 border border-[#424242]">
            <h3 className="text-xl font-bold mb-2">Advisor</h3>
            <p className="text-2xl font-bold mb-1">$14.99<span className="text-sm font-normal">/mo</span></p>
            <p className="text-xs text-[#9BA4B0] mb-2">$149/year (save 17%)</p>
            <p className="text-sm text-[#9BA4B0] mb-4 md:mb-6">Complete financial planning suite</p>
            <ul className="text-sm text-[#9BA4B0] space-y-2 mb-4 md:mb-6">
              <li>Everything in Premium</li>
              <li>Debt Payoff Planner</li>
              <li>Savings Goal Tracker</li>
              <li>Smart AI Recommendations</li>
              <li>&quot;What If&quot; Scenarios</li>
            </ul>
            <button className="w-full btn-secondary">Get Advisor</button>
          </div>
        </div>
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section className="py-10 md:py-12">
      <div className="container-app max-w-3xl text-center px-4">
        <h2 className="text-3xl md:text-6xl font-bold text-white mb-4 md:mb-6">Ready for Some Tough Love?</h2>
        <p className="text-base md:text-lg text-[#9BA4B0] mb-6 md:mb-8">Your spending habits won&apos;t change on their own. Start categorizing today and build the discipline your future self will thank you for.</p>
        <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center">
          <button className="btn-primary">Start Your Reality Check</button>
          <Link href="/login" className="btn-secondary">Already have an account?</Link>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="py-6 md:py-8 border-t border-[#424242]">
      <div className="container-app">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 md:gap-4">
          {/* Logo & Brand */}
          <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4 text-center md:text-left">
            <div className="flex items-center gap-2">
              <TrafficLightDots className="scale-50" />
              <span className="text-sm text-white">SpendSignal</span>
            </div>
            <span className="hidden md:block text-[#424242]">|</span>
            <span className="text-xs text-[#6B7280]">Inspired by Clark Howard&apos;s Traffic Light System</span>
          </div>
          {/* Links */}
          <div className="flex items-center gap-4 md:gap-6 flex-wrap justify-center">
            <Link href="/about" className="text-xs text-[#6B7280] hover:text-white transition-colors">About</Link>
            <Link href="/privacy" className="text-xs text-[#6B7280] hover:text-white transition-colors">Privacy</Link>
            <Link href="/terms" className="text-xs text-[#6B7280] hover:text-white transition-colors">Terms</Link>
            <span className="text-xs text-[#6B7280]">&copy; {new Date().getFullYear()}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default function Home() {
  return (
    <div className="bg-[#000000] text-white">
      <Navigation />
      <HeroSection />
      <TrafficLightDemo />
      <HowSection />
      <FeaturesSection />
      <PricingSection />
      <CTA />
      <Footer />
    </div>
  );
}
