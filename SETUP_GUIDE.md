# SpendSignal - External Services Setup Guide

This guide walks you through setting up all external services required for SpendSignal to work in production.

**Note:** The app works in demo mode without any of these services. Set them up when you're ready to go live.

---

## Table of Contents
1. [Supabase (Database)](#1-supabase-database)
2. [Google OAuth](#2-google-oauth)
3. [Apple OAuth](#3-apple-oauth-optional)
4. [Stripe (Payments)](#4-stripe-payments)
5. [OpenAI (AI Suggestions)](#5-openai-ai-suggestions)
6. [Posthog (Analytics)](#6-posthog-analytics)
7. [Vercel (Deployment)](#7-vercel-deployment)
8. [Plaid (Bank Connections)](#8-plaid-bank-connections---premium-feature)

---

## 1. Supabase (Database)

Supabase provides PostgreSQL database with real-time subscriptions.

### Steps:
1. Go to [supabase.com](https://supabase.com) and create an account
2. Click "New Project"
3. Choose your organization (or create one)
4. Enter project details:
   - **Name:** `spendsignal`
   - **Database Password:** Generate a strong password (SAVE THIS!)
   - **Region:** Choose closest to your users
5. Wait for project to be created (~2 minutes)

### Get Your Credentials:
1. Go to **Project Settings** → **API**
2. Copy these values to your `.env.local`:

```bash
# From "Project URL"
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co

# From "anon public" key
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# From "service_role" key (keep secret!)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

3. Go to **Project Settings** → **Database**
4. Copy the connection strings:

```bash
# From "Connection string" → URI
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres

# From "Connection string" → URI (Direct)
DIRECT_URL=postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres
```

### Run Migrations:
After setting up, run Prisma migrations:
```bash
npx prisma migrate dev
```

---

## 2. Google OAuth

Allows users to sign in with their Google account.

### Steps:
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Navigate to **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth client ID**
5. If prompted, configure the OAuth consent screen:
   - **User Type:** External
   - **App name:** SpendSignal
   - **User support email:** your email
   - **Developer contact:** your email
   - Add scopes: `email`, `profile`, `openid`
6. Back to Credentials, create OAuth client ID:
   - **Application type:** Web application
   - **Name:** SpendSignal Web
   - **Authorized redirect URIs:**
     - `http://localhost:3000/api/auth/callback/google` (development)
     - `https://spendsignal.app/api/auth/callback/google` (production)

### Get Your Credentials:
Copy to `.env.local`:
```bash
AUTH_GOOGLE_ID=xxxxx.apps.googleusercontent.com
AUTH_GOOGLE_SECRET=GOCSPX-xxxxx
```

---

## 3. Apple OAuth (Optional)

Allows users to sign in with Apple ID.

### Prerequisites:
- Apple Developer Account ($99/year)
- Enrolled in Apple Developer Program

### Steps:
1. Go to [Apple Developer Portal](https://developer.apple.com)
2. Navigate to **Certificates, Identifiers & Profiles**
3. Create an **App ID**:
   - Description: SpendSignal
   - Bundle ID: `com.spendsignal.app`
   - Enable "Sign in with Apple"
4. Create a **Services ID**:
   - Description: SpendSignal Web
   - Identifier: `com.spendsignal.web`
   - Enable "Sign in with Apple"
   - Configure Web Domain: `spendsignal.app`
   - Return URLs: `https://spendsignal.app/api/auth/callback/apple`
5. Create a **Key**:
   - Enable "Sign in with Apple"
   - Download the `.p8` file (only available once!)

### Get Your Credentials:
```bash
AUTH_APPLE_ID=com.spendsignal.web
AUTH_APPLE_SECRET=<generate from .p8 file - see Auth.js docs>
```

---

## 4. Stripe (Payments)

Handles subscription billing for Premium tier.

### Steps:
1. Go to [stripe.com](https://stripe.com) and create an account
2. Complete business verification (can use test mode before)
3. Go to **Developers** → **API keys**

### Get API Keys:
```bash
# Publishable key (starts with pk_)
STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx

# Secret key (starts with sk_)
STRIPE_SECRET_KEY=sk_test_xxxxx
```

### Create Products:
1. Go to **Products** → **Add Product**
2. Create "Premium Monthly":
   - Name: SpendSignal Premium (Monthly)
   - Price: $9.99/month, recurring
   - Copy the Price ID: `price_xxxxx`
3. Create "Premium Annual":
   - Name: SpendSignal Premium (Annual)
   - Price: $99.00/year, recurring
   - Copy the Price ID: `price_xxxxx`

```bash
STRIPE_PREMIUM_MONTHLY_PRICE_ID=price_xxxxx
STRIPE_PREMIUM_ANNUAL_PRICE_ID=price_xxxxx
```

### Set Up Webhook:
1. Go to **Developers** → **Webhooks**
2. Click **Add endpoint**
3. URL: `https://spendsignal.app/api/stripe/webhook`
4. Select events:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`
5. Copy the signing secret:

```bash
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
```

**For local testing:**
```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks to localhost
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

---

## 5. OpenAI (AI Suggestions)

Powers the AI categorization suggestions with tough-love reasoning.

### Steps:
1. Go to [platform.openai.com](https://platform.openai.com)
2. Create an account or sign in
3. Go to **API Keys** → **Create new secret key**
4. Name it "SpendSignal"
5. Copy the key immediately (only shown once!)

```bash
OPENAI_API_KEY=sk-xxxxx
```

### Usage Notes:
- We use `gpt-4o-mini` for cost efficiency
- ~$0.15 per 1M input tokens, ~$0.60 per 1M output tokens
- Set up usage limits in OpenAI dashboard to prevent surprises

---

## 6. Posthog (Analytics)

Privacy-focused product analytics.

### Steps:
1. Go to [posthog.com](https://posthog.com) and create an account
2. Create a new project "SpendSignal"
3. Choose "Cloud US" or "Cloud EU" based on user location
4. Go to **Project Settings**

### Get Your Credentials:
```bash
NEXT_PUBLIC_POSTHOG_KEY=phc_xxxxx
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
```

### Free Tier Limits:
- 1 million events/month
- 5,000 session recordings/month
- Plenty for getting started!

---

## 7. Vercel (Deployment)

Hosts the Next.js application.

### Steps:
1. Go to [vercel.com](https://vercel.com) and sign up with GitHub
2. Click **Add New** → **Project**
3. Import your `spendsignal` repository
4. Configure:
   - Framework Preset: Next.js (auto-detected)
   - Root Directory: `./`
   - Build Command: `npm run build`
5. Add environment variables (all from above)
6. Deploy!

### Custom Domain:
1. Go to **Project Settings** → **Domains**
2. Add `spendsignal.app`
3. Purchase domain via Vercel Domains or configure DNS:
   - A record: `76.76.21.21`
   - CNAME for www: `cname.vercel-dns.com`

### Environment Variables:
Add all `.env.local` variables to Vercel:
- Go to **Project Settings** → **Environment Variables**
- Add each variable
- Select environments (Production, Preview, Development)

---

## 8. Plaid (Bank Connections) - Premium Feature

Connects to real bank accounts for transaction data.

### Steps:
1. Go to [plaid.com](https://plaid.com) and apply for access
2. Complete the application (may take a few days)
3. Once approved, go to **Dashboard** → **Keys**

### Get Your Credentials:
```bash
PLAID_CLIENT_ID=xxxxx
PLAID_SECRET=xxxxx
PLAID_ENV=sandbox  # Use 'development' or 'production' when ready
```

### Environments:
- **Sandbox:** Free, uses test institutions (First Platypus Bank)
- **Development:** Free, 100 live Items for testing
- **Production:** Paid, full access (requires approval)

### Testing in Sandbox:
Use these test credentials:
- Institution: First Platypus Bank
- Username: `user_good`
- Password: any non-empty string

---

## Complete `.env.local` Template

```bash
# App
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Auth (generate with: openssl rand -base64 32)
AUTH_SECRET=your-generated-secret-here

# Database (Supabase)
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...

# Google OAuth
AUTH_GOOGLE_ID=xxxxx.apps.googleusercontent.com
AUTH_GOOGLE_SECRET=GOCSPX-xxxxx

# Apple OAuth (optional)
AUTH_APPLE_ID=com.spendsignal.web
AUTH_APPLE_SECRET=xxxxx

# Stripe
STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
STRIPE_PREMIUM_MONTHLY_PRICE_ID=price_xxxxx
STRIPE_PREMIUM_ANNUAL_PRICE_ID=price_xxxxx

# OpenAI
OPENAI_API_KEY=sk-xxxxx

# Posthog
NEXT_PUBLIC_POSTHOG_KEY=phc_xxxxx
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com

# Plaid (Premium feature)
PLAID_CLIENT_ID=xxxxx
PLAID_SECRET=xxxxx
PLAID_ENV=sandbox
```

---

## Checklist

- [ ] Supabase project created
- [ ] Database migrations run
- [ ] Google OAuth configured
- [ ] Apple OAuth configured (optional)
- [ ] Stripe account and products set up
- [ ] Stripe webhook configured
- [ ] OpenAI API key obtained
- [ ] Posthog project created
- [ ] Vercel project deployed
- [ ] Custom domain configured
- [ ] Plaid access approved (when ready for Premium)

---

## Need Help?

- Supabase: [supabase.com/docs](https://supabase.com/docs)
- Auth.js: [authjs.dev](https://authjs.dev)
- Stripe: [stripe.com/docs](https://stripe.com/docs)
- Plaid: [plaid.com/docs](https://plaid.com/docs)
- Vercel: [vercel.com/docs](https://vercel.com/docs)
