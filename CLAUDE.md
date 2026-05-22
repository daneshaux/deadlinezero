# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Product Brief

DeadlineZero is a single-purpose web app that tracks deferred-interest and 0% promotional financing deals — the "no interest if paid in full" offers from Synchrony, CareCredit, Ashley Furniture, Best Buy, and similar retailers where missing the payoff deadline by one day triggers full retroactive interest (26–29% APR) on the original purchase amount. It tells users the exact monthly payment required to beat the deadline, fires alerts at 90/60/30 days out, and shows a "retroactive interest shock calculator" — the exact dollar amount they'll owe if they miss the deadline — which is the core viral sharing mechanic. Target users are the 40M+ Americans holding active deferred-interest deals who have no idea their minimum payment is designed to leave a balance after the promotional period.

## Tech Stack

- `Next.js 14 (App Router)` — full-stack React framework, server components for fast initial loads, server actions for form mutations, API routes for webhooks
- `TypeScript` — type safety across shared financial calculation logic is non-negotiable for a money app
- `PostgreSQL (Supabase)` — managed Postgres with row-level security for multi-tenant data isolation, real-time capabilities for future use
- `Prisma` — type-safe ORM, schema-as-source-of-truth for financial data models, excellent migration tooling
- `NextAuth.js v5` — auth with email magic links (no password friction for finance app), Google OAuth as fast onboarding option
- `Stripe` — subscription billing at $4/month or $29/year, customer portal for self-service cancellation
- `Plaid` — bank/card account connection for automatic balance sync (Sync API for transaction polling)
- `Resend` — transactional email for 90/60/30-day deadline alerts and payment reminders, excellent deliverability
- `Tailwind CSS` — utility-first styling, fast iteration
- `shadcn/ui` — accessible component primitives (dialogs, forms, alerts) pre-styled with Tailwind
- `Recharts` — payoff progress charts and interest shock visualizations — lightweight, React-native
- `Vercel` — zero-config deployment, cron jobs for daily alert checks via Vercel Cron
- `Zod` — runtime validation for all financial inputs (amounts, dates, APRs) — never trust user input in a money app
- `date-fns` — precise date arithmetic for deadline calculations, no moment.js bloat

## Development Commands

```bash
# Install dependencies
npm install

# Start development server (Next.js + Prisma client generation)
npm run dev

# Build for production
npm run build

# Lint and type-check
npm run lint
npx tsc --noEmit

# Database migrations
npx prisma migrate dev --name <migration-name>

# Apply migrations in production
npx prisma migrate deploy

# Seed database with demo promotional deals
npx prisma db seed

# Open Prisma Studio (database GUI)
npx prisma studio

# Generate Prisma client after schema changes
npx prisma generate

# Run the alert worker locally (simulates Vercel Cron)
npx ts-node scripts/run-alerts.ts

# Stripe CLI webhook forwarding for local testing
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

## Architecture

DeadlineZero is a Next.js App Router application with a clear separation between public marketing pages, authenticated dashboard, and background jobs. All financial calculation logic lives in `/lib/calculations/` — pure TypeScript functions that compute monthly payoff amounts, days remaining, retroactive interest exposure, and alert thresholds. These functions are unit-tested and shared between server components, API routes, and the alert worker. The core formula is: `monthlyPaymentRequired = currentBalance / monthsRemaining`, recalculated on each sync. Retroactive interest exposure is: `originalPurchaseAmount * (APR / 365) * daysSincePurchase`.

Data flows as follows: users add deals manually (v1) or connect via Plaid (premium). Deals are stored in the `PromoDeal` table with the original purchase amount, current balance, promotional APR, deadline date, and issuer metadata. A Vercel Cron job runs daily at 8 AM UTC, queries all deals where `deadline - today <= 90 days AND alertSent90 = false` (and same logic for 60/30), generates personalized alert emails via Resend with the exact payoff amount and retroactive interest exposure, and marks alerts as sent. The Plaid webhook handler updates balances in real time when transactions post, triggering recalculation of required monthly payments.

The subscription gate lives in a Next.js middleware that checks the user's `subscriptionTier` on every dashboard request. Free users can have 2 active deals; premium users get unlimited deals, Plaid bank connection, and calendar export. Stripe webhooks update the `User.subscriptionTier` field on checkout completion and subscription cancellation. All dollar amounts are stored as integers (cents) in the database — never floats — to avoid floating-point errors in financial calculations.

## Data Models

```prisma
// schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum SubscriptionTier {
  FREE
  PREMIUM
}

enum DealStatus {
  ACTIVE
  PAID_OFF
  EXPIRED_MISSED
  ARCHIVED
}

enum AlertType {
  DAYS_90
  DAYS_60
  DAYS_30
  DAYS_14
  DAYS_7
  MISSED_DEADLINE
}

enum IssuingBank {
  SYNCHRONY
  CARECREDIT
  COMENITY
  CITIBANK
  TD_RETAIL
  WELLS_FARGO_RETAIL
  OTHER
}

model User {
  id                    String           @id @default(cuid())
  email                 String           @unique
  name                  String?
  image                 String?
  subscriptionTier      SubscriptionTier @default(FREE)
  stripeCustomerId      String?          @unique
  stripeSubscriptionId  String?          @unique
  subscriptionExpiresAt DateTime?
  plaidAccessToken      String?          // encrypted, stored per-user
  plaidItemId           String?
  plaidLinkedAt         DateTime?
  emailAlerts           Boolean          @default(true)
  alertLeadDays         Int[]            @default([90, 60, 30, 14, 7])
  timezone              String           @default("America/New_York")
  createdAt             DateTime         @default(now())
  updatedAt             DateTime         @updatedAt

  deals                 PromoDeal[]
  alerts                Alert[]
  sessions              Session[]
  accounts              Account[]

  @@index([email])
  @@index([stripeCustomerId])
}

model PromoDeal {
  id                      String      @id @default(cuid())
  userId                  String
  
  // Core deal info
  merchantName            String      // "Ashley Furniture", "Best Buy", "CareCredit"
  description             String?     // "Living room set", "MacBook Pro", "Root canal"
  issuingBank             IssuingBank @default(OTHER)
  
  // Financial figures — all stored in cents (integer) to avoid float errors
  originalPurchaseAmountCents  Int     // The original financed amount
  currentBalanceCents          Int     // Updated on each sync or manual entry
  minimumPaymentCents          Int?    // The issuer's minimum — often the trap
  regularAprBps                Int     // APR in basis points, e.g. 2699 = 26.99%
  
  // Promotional period
  promoStartDate          DateTime
  promoDeadline           DateTime    // The EXACT date — this is the core data point
  promoDescription        String?     // "18 months no interest if paid in full"
  
  // Status
  status                  DealStatus  @default(ACTIVE)
  paidOffAt               DateTime?
  missedDeadlineAt        DateTime?
  
  // Plaid linkage (if connected automatically)
  plaidAccountId          String?
  plaidTransactionId      String?     // Original purchase transaction
  lastSyncedAt            DateTime?
  
  // Calculated fields cached for performance (recalculated on sync)
  cachedMonthlyPaymentNeededCents  Int?
  cachedDaysRemaining              Int?
  cachedRetroInterestExposureCents Int?
  cacheUpdatedAt                   DateTime?
  
  createdAt               DateTime    @default(now())
  updatedAt               DateTime    @updatedAt
  
  user                    User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  alerts                  Alert[]
  paymentHistory          PaymentRecord[]
  balanceHistory          BalanceSnapshot[]

  @@index([userId])
  @@index([promoDeadline])
  @@index([status])
  @@index([userId, status])
}

model Alert {
  id          String     @id @default(cuid())
  userId      String
  dealId      String
  alertType   AlertType
  
  // When it fired
  scheduledFor DateTime   // The date this alert was due
  sentAt       DateTime?  // Null if not yet sent
  
  // Snapshot of figures at time of alert
  balanceAtAlertCents          Int
  monthlyPaymentNeededCents    Int
  retroInterestExposureCents   Int
  daysRemainingAtAlert         Int
  
  emailMessageId  String?   // Resend message ID for tracking
  
  createdAt   DateTime   @default(now())
  
  user        User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  deal        PromoDeal  @relation(fields: [dealId], references: [id], onDelete: Cascade)

  @@unique([dealId, alertType])  // Only one of each type per deal
  @@index([userId])
  @@index([sentAt])
  @@index([scheduledFor])
}

model PaymentRecord {
  id            String    @id @default(cuid())
  dealId        String
  
  amountCents   Int
  paymentDate   DateTime
  note          String?
  isManual      Boolean   @default(true)  // false if detected via Plaid
  plaidTransactionId String?
  
  createdAt     DateTime  @default(now())
  
  deal          PromoDeal @relation(fields: [dealId], references: [id], onDelete: Cascade)

  @@index([dealId])
  @@index([paymentDate])
}

model BalanceSnapshot {
  id            String    @id @default(cuid())
  dealId        String
  
  balanceCents  Int
  snapshotDate  DateTime
  source        String    // "manual", "plaid_sync", "payment_recorded"
  
  createdAt     DateTime  @default(now())
  
  deal          PromoDeal @relation(fields: [dealId], references: [id], onDelete: Cascade)

  @@index([dealId])
  @@index([snapshotDate])
}

// NextAuth required models
model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String?
  access_token      String?
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String?
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}
```

## Pages & Routes

### Public Pages
- `/` — Marketing homepage: hero with retroactive interest shock explainer, how it works, pricing, social proof quotes from r/personalfinance. No auth required.
- `/calculator` — Free standalone retroactive interest shock calculator. Enter: original amount, APR, purchase date, deadline, current balance. Outputs: monthly payment needed, total retroactive interest if missed, days remaining. No auth required, highly shareable/SEO.
- `/pricing` — Pricing page: Free vs Premium comparison. Stripe checkout links. No auth required.
- `/blog/deferred-interest-trap` — SEO landing page targeting "deferred interest calculator", "Synchrony retroactive interest" keywords. No auth required.
- `/login` — Magic link + Google OAuth login. Redirects to `/dashboard` if already authenticated.

### Authenticated Dashboard
- `/dashboard` — Main dashboard. Shows all active deals as cards sorted by urgency (soonest deadline first). Aggregate stats: total retroactive interest exposure across all deals, next deadline countdown. Auth required.
- `/dashboard/deals/new` — Add new promotional deal form. Merchant name, original amount, current balance, deadline date, APR, issuing bank. Auth required.
- `/dashboard/deals/[id]` — Deal detail page. Payoff progress chart, payment history, balance history, retroactive interest shock visualization, payment schedule, calendar export button. Auth required.
- `/dashboard/deals/[id]/edit` — Edit deal details. Update balance, deadline, APR. Auth required.
- `/dashboard/deals/[id]/payment` — Log a manual payment against a deal. Auth required.
- `/dashboard/connect` — Plaid Link integration page (Premium only). Connect bank accounts to auto-sync balances. Auth required + Premium gated.
- `/dashboard/settings` — User settings: alert preferences (which lead days), email preferences, timezone, account details. Auth required.
- `/dashboard/billing` — Stripe customer portal link, current plan, upgrade/downgrade CTA. Auth required.

### API Routes
- `POST /api/auth/[...nextauth]` — NextAuth handler for magic link + Google OAuth
- `GET /api/deals` — Returns all active deals for authenticated user with calculated fields
- `POST /api/deals` — Creates new promo deal. Accepts: `{ merchantName, originalPurchaseAmountCents, currentBalanceCents, promoDeadline, regularAprBps, issuingBank, description }`. Returns created deal with calculated monthly payment. Auth required.
- `GET /api/deals/[id]` — Returns single deal with full calculation details, balance history, alert history. Auth required, ownership verified.
- `PATCH /api/deals/[id]` — Updates deal fields. Triggers recalculation of cached fields. Auth required, ownership verified.
- `DELETE /api/deals/[id]` — Soft-deletes deal (sets status to ARCHIVED). Auth required, ownership verified.
- `POST /api/deals/[id]/payments` — Logs a payment. Updates `currentBalanceCents`, creates `PaymentRecord` and `BalanceSnapshot`, recalculates cached fields. Auth required.
- `POST /api/deals/[id]/payoff` — Marks deal as PAID_OFF. Auth required.
- `GET /api/deals/[id]/schedule` — Returns month-by-month payoff schedule from today to deadline. Used by calendar export. Auth required.
- `GET /api/deals/[id]/export/ical` — Returns iCal file with monthly payment reminders. Auth required.
- `POST /api/plaid/create-link-token` — Creates Plaid Link token for front-end. Premium only. Auth required.
- `POST /api/plaid/exchange-token` — Exchanges Plaid public token for access token, stores encrypted. Premium only. Auth required.
- `POST /api/plaid/sync` — Manually trigger Plaid sync for connected accounts. Auth required.
- `POST /api/webhooks/plaid` — Plaid webhook handler for transaction updates. Updates balances, triggers recalculation.
- `POST /api/webhooks/stripe` — Stripe webhook handler. Updates `subscriptionTier`, `subscriptionExpiresAt` on checkout, renewal, cancellation events.
- `POST /api/stripe/create-checkout` — Creates Stripe Checkout session. Accepts `{ plan: 'monthly' | 'annual' }`. Returns `{ checkoutUrl }`. Auth required.
- `POST /api/stripe/portal` — Creates Stripe Customer Portal session. Returns `{ portalUrl }`. Auth required.
- `GET /api/cron/send-alerts` — Vercel Cron job endpoint (secured via `CRON_SECRET`). Queries deals approaching deadline, sends alert emails, marks alerts sent. Called daily at 8 AM UTC.
- `POST /api/calculate` — Public endpoint for the free calculator page. Accepts deal parameters, returns full calculation breakdown. No auth required. Rate limited.

## Core User Flows

### Flow 1: Onboarding — Adding First Deal and Seeing Your Exposure

1. User lands on `/` from r/personalfinance post or Google search for "Synchrony retroactive interest calculator"
2. User clicks "See what you owe if you miss your deadline" CTA on homepage
3. Lands on `/calculator` (no signup required) — enters: original financed amount ($1,200), current balance ($840), deadline date (8 months out), APR (26.99%)
4. Calculator instantly shows: **Monthly payment needed: $105/month**, **Retroactive interest if missed: $272.88**, **Days remaining: 243**
5. User is shocked by the retroactive interest number and clicks "Track this deal and get alerts"
6. Redirected to `/login` — enters email, receives magic link in under 30 seconds
7. After auth, redirected to `/dashboard/deals/new` with form pre-populated from calculator session (stored in sessionStorage)
8. User confirms deal details, clicks "Start Tracking"
9. Deal created, user lands on `/dashboard` showing their deal card with urgency indicator
10. Confirmation email sent via Resend with deal summary and first monthly payment amount

### Flow 2: Core Engagement — Monthly Alert and Payment Logging

1. Vercel Cron runs daily at 8 AM UTC, identifies deal entering 90-day window
2. Alert email sent via Resend with subject: "⚠️ 90 days left — pay $105/month to avoid $272 in retroactive interest on your Best Buy deal"
3. Email body shows: exact monthly payment needed, exact retroactive interest exposure, link to deal dashboard
4. User clicks email link, lands on `/dashboard/deals/[id]`
5. Sees payoff progress bar (30% paid off), month-by-month payment schedule, and large "retroactive interest exposure" number in red
6. User clicks "Log a Payment" — enters $200 (paying ahead to reduce risk)
7. Payment recorded, balance updates to $640, monthly payment needed recalculates to $80/month for remaining 8 months
8. Balance history chart updates showing downward trajectory toward $0 by deadline
9. User clicks "Add to Calendar" — downloads iCal file with monthly payment reminders, adds to Google Calendar
10. User feels in control — this is the key retention moment

### Flow 3: Upgrade to Premium — Connecting Bank Account

1. User adds a third deal (CareCredit for dental work) on the free tier
2. Upgrade prompt appears: "You've hit the 2-deal limit on the free plan. Upgrade to track unlimited deals + auto-sync balances."
3. User clicks "Upgrade to Premium — $29/year"
4. Redirected to Stripe Checkout (pre-filled with their email, annual plan)
5. Completes payment with card — Stripe sends `checkout.session.completed` webhook
6. Webhook handler updates `User.subscriptionTier` to `PREMIUM`, sets `subscriptionExpiresAt`
7. User redirected to `/dashboard/connect` with success toast
8. User clicks "Connect your accounts" — Plaid Link modal opens
9. User searches for "Synchrony Bank", enters credentials — Plaid returns public token
10. `/api/plaid/exchange-token` stores encrypted access token, immediately triggers first sync
11. Plaid sync identifies matching account balances, auto-populates `currentBalanceCents` on existing deals
12. Dashboard now shows "Auto-synced 2 hours ago" badge on connected deals
13. User sees their CareCredit deal also auto-detected and populated from Plaid transaction history

## Third-Party Services

**Supabase** — Managed PostgreSQL database with connection pooling via PgBouncer. `DATABASE_URL` and `DIRECT_URL` env vars.

**Plaid** — Bank account connection and transaction sync for automatic balance updates on premium tier. Uses Sync API for efficient incremental transaction polling. `PLAID_CLIENT_ID`, `PLAID_SECRET`, `PLAID_ENV` (sandbox/production).

**Stripe** — Subscription billing ($4/month or $29/year), customer portal for self-service management, webhooks for subscription lifecycle events. `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_MONTHLY_PRICE_ID`, `STRIPE_ANNUAL_PRICE_ID`.

**Resend** — Transactional email delivery for deadline alerts (90/60/30/14/7 day), payment confirmations, onboarding welcome. React Email for HTML templates. `RESEND_API_KEY`, `RESEND_FROM_EMAIL`.

**Vercel** — Hosting, Vercel Cron for daily alert processing at `0 8 * * *` UTC. `CRON_SECRET` for securing the cron endpoint against unauthorized calls.

**Google OAuth** — Optional fast sign-in via NextAuth Google provider. `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`.

**Upstash Redis** — Rate limiting for the public `/api/calculate` endpoint to prevent abuse. `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`.

## Environment Variables

```bash
# .env.example

# ============================================================
# DATABASE
# ============================================================
# Supabase Postgres connection string (pooled via PgBouncer for serverless)
DATABASE_URL="postgresql://postgres.[project-ref]:[password]@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
# Direct connection for Prisma migrations (bypasses PgBouncer)
DIRECT_URL="postgresql://postgres.[project-ref]:[password]@aws-0-us-east-1.pooler.supabase.com:5432/postgres"

# ============================================================
# NEXTAUTH
# ============================================================
# Random 32+ character secret: openssl rand -base64 32
NEXTAUTH_SECRET="your-nextauth-secret-here"
# Full URL of the app (no trailing slash)
NEXTAUTH_URL="http://localhost:3000"

# ============================================================
# GOOGLE OAUTH (optional fast sign-in)
# ============================================================
# From Google Cloud Console > APIs & Services > Credentials
GOOGLE_CLIENT_ID="your-google-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# ============================================================
# STRIPE
# ============================================================
# From Stripe Dashboard > Developers > API keys
STRIPE_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
# From Stripe Dashboard > Developers > Webhooks > Signing secret
STRIPE_WEBHOOK_SECRET="whsec_..."
# Price IDs from Stripe Dashboard > Products
STRIPE_MONTHLY_PRICE_ID="price_..."
STRIPE_ANNUAL_PRICE_ID="price_..."

# ============================================================
# PLAID
# ============================================================
# From Plaid Dashboard > Team Settings > Keys
PLAID_CLIENT_ID="your-plaid-client-id"
PLAID_SECRET="your-plaid-secret"
# "sandbox" for development, "production" for live
PLAID_ENV="sandbox"
# AES-256 encryption key for storing Plaid access tokens at rest
PLAID_TOKEN_ENCRYPTION_KEY="