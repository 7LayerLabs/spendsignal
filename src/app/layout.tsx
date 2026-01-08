import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import { SessionProvider } from '@/components/providers/session-provider';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
  display: 'swap',
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'SpendSignal - Your Money Needs Tough Love',
    template: '%s | SpendSignal',
  },
  description:
    'The spending coach that tells you what you need to hear. Categorize transactions with the Traffic Light System. Green for essentials, Yellow for discretionary, Red for avoid.',
  keywords: [
    'personal finance',
    'budgeting app',
    'spending tracker',
    'money management',
    'traffic light system',
    'Clark Howard',
    'financial coach',
  ],
  authors: [{ name: 'SpendSignal' }],
  creator: 'SpendSignal',
  publisher: 'SpendSignal',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://spendsignal.app',
    siteName: 'SpendSignal',
    title: 'SpendSignal - Your Money Needs Tough Love',
    description:
      'The spending coach that tells you what you need to hear. Built on Clark Howard\'s Traffic Light System.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'SpendSignal - Traffic Light Spending System',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SpendSignal - Your Money Needs Tough Love',
    description:
      'The spending coach that tells you what you need to hear. Built on Clark Howard\'s Traffic Light System.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
};

export const viewport: Viewport = {
  themeColor: '#0A0E14',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Prevent flash of wrong theme */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('spendsignal_theme') || 'dark';
                  if (theme === 'system') {
                    theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                  }
                  document.documentElement.classList.add(theme);
                } catch (e) {
                  document.documentElement.classList.add('dark');
                }
              })();
            `,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SessionProvider>
          <ThemeProvider>{children}</ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
