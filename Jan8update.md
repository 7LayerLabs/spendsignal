# SpendSignal - January 8, 2026 Update

---

## Infrastructure Status (Verified by Reading Actual Code)

### Auth (Google OAuth) - DONE
- NextAuth v5 + Google provider + PrismaAdapter
- Login at `/login`, signup at `/signup`
- Auto-creates FREE subscription + UserPreferences on new user
- Demo mode fallback for unauthenticated users
- **Files:** `src/lib/auth/auth.ts`, `src/app/login/page.tsx`

### Database (Supabase PostgreSQL via Prisma) - DONE
- Full schema: User, Subscription, Transaction, UserCategorization, PlaidConnection, Goal, Alert, Debt, SavingsGoal, UserPreferences, MonthlyReport
- `DATABASE_URL` + `DIRECT_URL` pattern (Supabase connection pooling)
- **Files:** `prisma/schema.prisma`, `src/lib/db/prisma.ts`

### Stripe (Sandbox) - DONE
- Checkout + billing portal routes
- Webhook handles: `checkout.session.completed`, `subscription.updated`, `subscription.deleted`, `payment_failed`
- Tier mapping: FREE → PREMIUM/PREMIUM_ANNUAL → ADVISOR/ADVISOR_ANNUAL
- **Files:** `src/lib/stripe/*`, `src/app/api/stripe/*`

### Plaid - API DONE, UI IN PROGRESS
- See detailed section below

### Demo vs Real Mode
| Mode | Data Source | When |
|------|-------------|------|
| Demo | localStorage hooks | Unauthenticated or `user.isDemoMode = true` |
| Real | Prisma → Supabase | Authenticated + Plaid connected or subscribed |

---

## Completed Today

### 1. Branding - Slogans Added
- **Primary slogan:** "Green means grow."
  - Added to landing page hero section (below main headline)
  - Added to CLAUDE.md for reference
- **Secondary tagline:** "From red to ready."
  - Added to signup page (default subheadline)

### 2. Bank Logos - Settings Page
Updated `/dashboard/settings/connections` with real bank logos from Brandfetch CDN:

| Bank | Logo Source |
|------|-------------|
| Chase | `cdn.brandfetch.io` symbol |
| Bank of America | `cdn.brandfetch.io` icon |
| Wells Fargo | `cdn.brandfetch.io` icon |
| Capital One | `cdn.brandfetch.io` icon |
| Citi | `cdn.brandfetch.io` icon |
| US Bank | `cdn.brandfetch.io` symbol |
| PNC | `cdn.brandfetch.io` icon |
| TD Bank | `cdn.brandfetch.io` icon |

### 3. Plaid Integration - COMPLETE
Full Plaid integration implemented for connecting real bank accounts.

#### Files Created

| File | Purpose |
|------|---------|
| `src/lib/plaid/client.ts` | Plaid SDK configuration & client |
| `src/app/api/plaid/create-link-token/route.ts` | Creates link token for Plaid Link UI |
| `src/app/api/plaid/exchange-token/route.ts` | Exchanges public token, saves connection to DB |
| `src/app/api/plaid/sync-transactions/route.ts` | Syncs transactions using Plaid Sync API |
| `src/app/api/plaid/connections/route.ts` | Fetches user's Plaid connections |
| `src/components/plaid/plaid-link-button.tsx` | React component wrapping Plaid Link |

#### Files Updated
- `src/app/dashboard/settings/connections/page.tsx` - Now uses real Plaid integration
- `package.json` - Added `plaid` and `react-plaid-link` packages

#### Features Implemented
- Connect bank accounts via Plaid Link
- Store access tokens securely in database
- Sync transactions from connected accounts
- Display connected accounts with status
- Manual sync button for each connection
- Error handling and status indicators

---

## TODO - Required to Enable Plaid

### 1. Get Plaid Credentials
1. Go to [plaid.com](https://plaid.com) and sign up/login
2. Go to Dashboard → Keys
3. Copy your credentials

### 2. Add to `.env.local`
```bash
# Plaid Configuration
PLAID_CLIENT_ID=your_client_id_here
PLAID_SECRET=your_secret_here
PLAID_ENV=sandbox
```

### 3. Plaid Environments
| Environment | Use Case | Cost |
|-------------|----------|------|
| `sandbox` | Testing with fake banks | Free |
| `development` | Testing with real banks (100 items) | Free |
| `production` | Live users | Paid |

### 4. Testing in Sandbox Mode
Use these test credentials when Plaid Link opens:
- **Institution:** First Platypus Bank
- **Username:** `user_good`
- **Password:** any non-empty string (e.g., `pass_good`)

---

## Database Schema (Already Exists)
The Prisma schema already has `PlaidConnection` model - no migrations needed.

---

## How Plaid Flow Works

```
1. User clicks "Add Bank"
   ↓
2. Frontend calls POST /api/plaid/create-link-token
   ↓
3. Backend creates link token via Plaid API
   ↓
4. Frontend opens Plaid Link with token
   ↓
5. User selects bank & enters credentials (in Plaid UI)
   ↓
6. Plaid returns public_token to frontend
   ↓
7. Frontend calls POST /api/plaid/exchange-token
   ↓
8. Backend exchanges public_token for access_token
   ↓
9. Backend saves PlaidConnection to database
   ↓
10. Backend calls POST /api/plaid/sync-transactions
    ↓
11. Transactions synced to database with source='PLAID'
```

---

## Next Steps (Future Work)

- [ ] Add webhook endpoint for real-time transaction updates
- [ ] Add ability to disconnect/remove bank connections
- [ ] Add re-authentication flow for expired connections
- [ ] Implement premium tier check before allowing Plaid
- [ ] Add Plaid identity verification (optional)
- [ ] Background job for periodic transaction syncing

---

## Dev Server
Running at: **http://localhost:3000**

Test connections page: **http://localhost:3000/dashboard/settings/connections**

---

## All Environment Variables

```bash
# Auth (Google OAuth)
AUTH_GOOGLE_ID=
AUTH_GOOGLE_SECRET=
AUTH_SECRET=

# Database (Supabase)
DATABASE_URL=
DIRECT_URL=

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PREMIUM_MONTHLY_PRICE_ID=
STRIPE_PREMIUM_ANNUAL_PRICE_ID=
STRIPE_ADVISOR_MONTHLY_PRICE_ID=
STRIPE_ADVISOR_ANNUAL_PRICE_ID=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=

# Plaid
PLAID_CLIENT_ID=
PLAID_SECRET=
PLAID_ENV=sandbox
PLAID_REDIRECT_URI=

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## What's Left To Do

### Immediate
- [ ] Test Plaid Link end-to-end in sandbox
- [ ] Verify transactions sync after bank link
- [ ] Wire dashboard to show real (non-demo) transactions

### Short-term
- [ ] Loading states for all API calls
- [ ] Empty states when no data
- [ ] Error handling UI for Plaid failures

### Later
- [ ] Email notifications
- [ ] AI categorization (mock exists, needs real LLM)
- [ ] Tests (none exist yet)
