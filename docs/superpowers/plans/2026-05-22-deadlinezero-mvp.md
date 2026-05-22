# DeadlineZero MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build DeadlineZero — a web app that tracks deferred-interest promotional financing deals, calculates the exact monthly payment to beat each deadline, fires 90/60/30-day email alerts, and gates unlimited tracking behind a Stripe subscription.

**Architecture:** Next.js 14 App Router. Pure TypeScript financial calculation functions in `lib/calculations/` are unit-tested and shared across server components, API routes, and the cron worker. Prisma + Supabase Postgres stores all data with amounts as integer cents. NextAuth v5 handles magic-link + Google sign-in. Vercel Cron drives daily alert processing.

**Tech Stack:** Next.js 14, TypeScript, PostgreSQL (Supabase + Prisma), NextAuth v5, @auth/prisma-adapter, Stripe, Resend + React Email, Tailwind CSS + shadcn/ui, Recharts, Zod, date-fns, Jest + ts-jest

---

> **Scope note:** Plaid bank-sync (premium auto-balance feature) is a separate plan that depends on Stripe billing being live (Task 13 here).

---

## File Structure

```
deadlinezero/
├── app/
│   ├── (auth)/login/page.tsx               — Magic link + Google sign-in page
│   ├── (dashboard)/
│   │   ├── layout.tsx                      — Auth-gated layout with sidebar
│   │   └── dashboard/
│   │       ├── page.tsx                    — Deal cards sorted by urgency
│   │       ├── deals/new/page.tsx          — Add deal form
│   │       ├── deals/[id]/page.tsx         — Deal detail + payoff chart
│   │       ├── deals/[id]/edit/page.tsx    — Edit deal
│   │       ├── deals/[id]/payment/page.tsx — Log payment
│   │       ├── settings/page.tsx           — Alert preferences, timezone
│   │       └── billing/page.tsx            — Plan + Stripe portal link
│   ├── (public)/
│   │   ├── page.tsx                        — Marketing homepage
│   │   ├── calculator/page.tsx             — Free standalone calculator
│   │   └── pricing/page.tsx               — Free vs Premium comparison
│   └── api/
│       ├── auth/[...nextauth]/route.ts     — NextAuth handler
│       ├── deals/route.ts                  — GET all, POST create
│       ├── deals/[id]/route.ts             — GET, PATCH, DELETE
│       ├── deals/[id]/payments/route.ts    — POST log payment
│       ├── deals/[id]/payoff/route.ts      — POST mark paid off
│       ├── deals/[id]/schedule/route.ts    — GET payoff schedule
│       ├── deals/[id]/export/ical/route.ts — GET iCal file
│       ├── calculate/route.ts              — Public calculator endpoint (rate-limited)
│       ├── cron/send-alerts/route.ts       — Vercel Cron daily alert job
│       ├── stripe/create-checkout/route.ts — Create Stripe Checkout session
│       ├── stripe/portal/route.ts          — Create Stripe portal session
│       └── webhooks/stripe/route.ts        — Stripe webhook handler
├── lib/
│   ├── calculations/
│   │   ├── index.ts                        — Re-exports all calc functions
│   │   ├── monthly-payment.ts              — calculateMonthlyPaymentNeeded()
│   │   ├── retro-interest.ts               — calculateRetroInterestExposure()
│   │   ├── days-remaining.ts               — daysUntilDeadline()
│   │   ├── payoff-schedule.ts              — generatePayoffSchedule()
│   │   └── cache-fields.ts                 — updateDealCachedFields() — writes cached calcs to DB
│   ├── auth.ts                             — NextAuth config (handlers, auth, signIn, signOut)
│   ├── db.ts                               — Prisma client singleton
│   ├── stripe.ts                           — Stripe client singleton
│   └── resend.ts                           — Resend client + sendAlertEmail() helper
├── components/
│   ├── deals/
│   │   ├── deal-card.tsx                   — Dashboard deal card with urgency badge
│   │   ├── deal-form.tsx                   — Shared create/edit form (controlled)
│   │   ├── payment-form.tsx                — Log payment form
│   │   └── payoff-chart.tsx                — Recharts balance-over-time chart
│   ├── calculator/calculator-form.tsx      — Public calculator UI + results
│   └── layout/dashboard-nav.tsx            — Sidebar with nav links + user menu
├── emails/deadline-alert.tsx               — React Email deadline alert template
├── prisma/
│   ├── schema.prisma                       — Full schema from spec
│   └── seed.ts                             — Demo deals for local dev
├── middleware.ts                           — Redirect unauthenticated /dashboard/* to /login
├── types/next-auth.d.ts                    — Extends Session with id + subscriptionTier
├── vercel.json                             — Cron schedule config
└── __tests__/lib/calculations/
    ├── monthly-payment.test.ts
    ├── retro-interest.test.ts
    ├── days-remaining.test.ts
    └── payoff-schedule.test.ts
```

---

## Task 1: Project Initialization + Testing Setup

**Files:**
- Create: (root — Next.js bootstrap + config files)
- Create: `jest.config.ts`
- Create: `jest.setup.ts`
- Create: `.env.local` (from template)

- [ ] **Step 1: Bootstrap Next.js 14 app**

```bash
npx create-next-app@14 . --typescript --tailwind --app --no-src-dir --import-alias "@/*" --eslint
```

Expected: Next.js 14 scaffold created with `app/`, `public/`, `tailwind.config.ts`, `tsconfig.json`.

- [ ] **Step 2: Install project dependencies**

```bash
npm install prisma @prisma/client @auth/prisma-adapter
npm install next-auth@beta
npm install stripe
npm install resend @react-email/components @react-email/render
npm install zod date-fns recharts
npm install @upstash/ratelimit @upstash/redis
npm install -D jest jest-environment-node ts-jest @types/jest
```

- [ ] **Step 3: Initialize shadcn/ui**

```bash
npx shadcn@latest init
```

Select: Default style, Slate base color, CSS variables: yes. Then add required components:

```bash
npx shadcn@latest add button card input label form select badge alert dialog progress
```

- [ ] **Step 4: Create Jest config**

Create `jest.config.ts`:

```typescript
import type { Config } from 'jest'

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  testMatch: ['**/__tests__/**/*.test.ts'],
  setupFilesAfterFramework: ['<rootDir>/jest.setup.ts'],
}

export default config
```

Create `jest.setup.ts`:

```typescript
// intentionally empty — add global mocks here if needed
```

Add to `package.json` scripts:

```json
"test": "jest",
"test:watch": "jest --watch"
```

- [ ] **Step 5: Create `.env.local`**

Create `.env.local`:

```bash
DATABASE_URL="postgresql://postgres.[project-ref]:[password]@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[project-ref]:[password]@aws-0-us-east-1.pooler.supabase.com:5432/postgres"
NEXTAUTH_SECRET="replace-with-openssl-rand-base64-32-output"
NEXTAUTH_URL="http://localhost:3000"
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
STRIPE_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
STRIPE_MONTHLY_PRICE_ID="price_..."
STRIPE_ANNUAL_PRICE_ID="price_..."
RESEND_API_KEY=""
RESEND_FROM_EMAIL="alerts@yourdomain.com"
CRON_SECRET="replace-with-random-32-char-string"
UPSTASH_REDIS_REST_URL=""
UPSTASH_REDIS_REST_TOKEN=""
```

- [ ] **Step 6: Verify dev server starts**

```bash
npm run dev
```

Expected: `ready - started server on 0.0.0.0:3000` with no errors.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: bootstrap Next.js 14 app with dependencies and Jest config"
```

---

## Task 2: Prisma Schema + Database Setup

**Files:**
- Create: `prisma/schema.prisma`
- Create: `prisma/seed.ts` (empty for now — filled in Task 13)

- [ ] **Step 1: Initialize Prisma**

```bash
npx prisma init
```

Expected: `prisma/schema.prisma` and `.env` created. The `.env` from Prisma conflicts with `.env.local` — delete it:

```bash
rm .env
```

- [ ] **Step 2: Replace schema with the full spec schema**

Replace `prisma/schema.prisma` entirely:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
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
  plaidAccessToken      String?
  plaidItemId           String?
  plaidLinkedAt         DateTime?
  emailAlerts           Boolean          @default(true)
  alertLeadDays         Int[]            @default([90, 60, 30, 14, 7])
  timezone              String           @default("America/New_York")
  createdAt             DateTime         @default(now())
  updatedAt             DateTime         @updatedAt

  deals    PromoDeal[]
  alerts   Alert[]
  sessions Session[]
  accounts Account[]

  @@index([email])
  @@index([stripeCustomerId])
}

model PromoDeal {
  id                      String      @id @default(cuid())
  userId                  String
  merchantName            String
  description             String?
  issuingBank             IssuingBank @default(OTHER)
  originalPurchaseAmountCents  Int
  currentBalanceCents          Int
  minimumPaymentCents          Int?
  regularAprBps                Int
  promoStartDate          DateTime
  promoDeadline           DateTime
  promoDescription        String?
  status                  DealStatus  @default(ACTIVE)
  paidOffAt               DateTime?
  missedDeadlineAt        DateTime?
  plaidAccountId          String?
  plaidTransactionId      String?
  lastSyncedAt            DateTime?
  cachedMonthlyPaymentNeededCents  Int?
  cachedDaysRemaining              Int?
  cachedRetroInterestExposureCents Int?
  cacheUpdatedAt                   DateTime?
  createdAt               DateTime    @default(now())
  updatedAt               DateTime    @updatedAt

  user           User             @relation(fields: [userId], references: [id], onDelete: Cascade)
  alerts         Alert[]
  paymentHistory PaymentRecord[]
  balanceHistory BalanceSnapshot[]

  @@index([userId])
  @@index([promoDeadline])
  @@index([status])
  @@index([userId, status])
}

model Alert {
  id           String    @id @default(cuid())
  userId       String
  dealId       String
  alertType    AlertType
  scheduledFor DateTime
  sentAt       DateTime?
  balanceAtAlertCents       Int
  monthlyPaymentNeededCents Int
  retroInterestExposureCents Int
  daysRemainingAtAlert      Int
  emailMessageId String?
  createdAt    DateTime  @default(now())

  user User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  deal PromoDeal @relation(fields: [dealId], references: [id], onDelete: Cascade)

  @@unique([dealId, alertType])
  @@index([userId])
  @@index([sentAt])
  @@index([scheduledFor])
}

model PaymentRecord {
  id                 String   @id @default(cuid())
  dealId             String
  amountCents        Int
  paymentDate        DateTime
  note               String?
  isManual           Boolean  @default(true)
  plaidTransactionId String?
  createdAt          DateTime @default(now())

  deal PromoDeal @relation(fields: [dealId], references: [id], onDelete: Cascade)

  @@index([dealId])
  @@index([paymentDate])
}

model BalanceSnapshot {
  id           String   @id @default(cuid())
  dealId       String
  balanceCents Int
  snapshotDate DateTime
  source       String
  createdAt    DateTime @default(now())

  deal PromoDeal @relation(fields: [dealId], references: [id], onDelete: Cascade)

  @@index([dealId])
  @@index([snapshotDate])
}

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

- [ ] **Step 3: Add seed script config to `package.json`**

Add to `package.json`:

```json
"prisma": {
  "seed": "ts-node --compiler-options {\"module\":\"CommonJS\"} prisma/seed.ts"
}
```

- [ ] **Step 4: Create first migration**

```bash
npx prisma migrate dev --name init
```

Expected: Migration files created in `prisma/migrations/`. If your Supabase database isn't set up yet, set up a project at supabase.com first, then copy the connection strings into `.env.local`.

- [ ] **Step 5: Generate Prisma client**

```bash
npx prisma generate
```

Expected: `@prisma/client` generated. TypeScript types now available for all models.

- [ ] **Step 6: Commit**

```bash
git add prisma/ package.json
git commit -m "feat: add Prisma schema with full data model and initial migration"
```

---

## Task 3: Core Calculations Library (TDD)

**Files:**
- Create: `lib/calculations/monthly-payment.ts`
- Create: `lib/calculations/retro-interest.ts`
- Create: `lib/calculations/days-remaining.ts`
- Create: `lib/calculations/index.ts`
- Test: `__tests__/lib/calculations/monthly-payment.test.ts`
- Test: `__tests__/lib/calculations/retro-interest.test.ts`
- Test: `__tests__/lib/calculations/days-remaining.test.ts`

These are pure functions with no dependencies beyond date-fns. All amounts in cents. All results are integers.

- [ ] **Step 1: Write failing tests for monthly payment**

Create `__tests__/lib/calculations/monthly-payment.test.ts`:

```typescript
import { addMonths } from 'date-fns'
import { calculateMonthlyPaymentNeeded } from '@/lib/calculations/monthly-payment'

const today = new Date('2026-01-15')

describe('calculateMonthlyPaymentNeeded', () => {
  it('divides balance evenly over months, rounding up', () => {
    const deadline = addMonths(today, 8)
    // 84000 / 8 = 10500 exactly
    expect(calculateMonthlyPaymentNeeded(84000, deadline, today)).toBe(10500)
  })

  it('rounds up fractional cents', () => {
    const deadline = addMonths(today, 3)
    // 10001 / 3 = 3333.67 → ceil = 3334
    expect(calculateMonthlyPaymentNeeded(10001, deadline, today)).toBe(3334)
  })

  it('returns full balance when one month remains', () => {
    const deadline = addMonths(today, 1)
    expect(calculateMonthlyPaymentNeeded(50000, deadline, today)).toBe(50000)
  })

  it('returns full balance when deadline has passed', () => {
    const deadline = addMonths(today, -1)
    expect(calculateMonthlyPaymentNeeded(50000, deadline, today)).toBe(50000)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx jest __tests__/lib/calculations/monthly-payment.test.ts
```

Expected: FAIL — `Cannot find module '@/lib/calculations/monthly-payment'`

- [ ] **Step 3: Implement `calculateMonthlyPaymentNeeded`**

Create `lib/calculations/monthly-payment.ts`:

```typescript
import { differenceInCalendarMonths } from 'date-fns'

export function calculateMonthlyPaymentNeeded(
  currentBalanceCents: number,
  promoDeadline: Date,
  today: Date = new Date()
): number {
  const monthsRemaining = differenceInCalendarMonths(promoDeadline, today)
  if (monthsRemaining <= 0) return currentBalanceCents
  return Math.ceil(currentBalanceCents / monthsRemaining)
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npx jest __tests__/lib/calculations/monthly-payment.test.ts
```

Expected: PASS — 4 tests passed.

- [ ] **Step 5: Write failing tests for retro interest**

Create `__tests__/lib/calculations/retro-interest.test.ts`:

```typescript
import { subDays } from 'date-fns'
import { calculateRetroInterestExposure } from '@/lib/calculations/retro-interest'

const today = new Date('2026-01-15')

describe('calculateRetroInterestExposure', () => {
  it('returns 0 when purchase was today', () => {
    expect(calculateRetroInterestExposure(120000, 2699, today, today)).toBe(0)
  })

  it('calculates exact retroactive interest', () => {
    // 365 days of 26.99% APR on $1200 = full year of interest = $1200 * 0.2699 = $323.88 = 32388 cents
    const purchaseDate = subDays(today, 365)
    expect(calculateRetroInterestExposure(120000, 2699, purchaseDate, today)).toBe(32388)
  })

  it('rounds to nearest cent', () => {
    // 1 day, $100 (10000 cents), 26.99% APR
    // 10000 * 0.2699 / 365 * 1 = 7.394... → round = 7 cents
    const purchaseDate = subDays(today, 1)
    expect(calculateRetroInterestExposure(10000, 2699, purchaseDate, today)).toBe(7)
  })
})
```

- [ ] **Step 6: Run test to verify it fails**

```bash
npx jest __tests__/lib/calculations/retro-interest.test.ts
```

Expected: FAIL — `Cannot find module '@/lib/calculations/retro-interest'`

- [ ] **Step 7: Implement `calculateRetroInterestExposure`**

Create `lib/calculations/retro-interest.ts`:

```typescript
import { differenceInDays } from 'date-fns'

export function calculateRetroInterestExposure(
  originalPurchaseAmountCents: number,
  regularAprBps: number,
  promoStartDate: Date,
  today: Date = new Date()
): number {
  const daysSincePurchase = differenceInDays(today, promoStartDate)
  if (daysSincePurchase <= 0) return 0
  const dailyRate = (regularAprBps / 10000) / 365
  return Math.round(originalPurchaseAmountCents * dailyRate * daysSincePurchase)
}
```

- [ ] **Step 8: Run test to verify it passes**

```bash
npx jest __tests__/lib/calculations/retro-interest.test.ts
```

Expected: PASS — 3 tests passed.

- [ ] **Step 9: Write failing tests for days remaining**

Create `__tests__/lib/calculations/days-remaining.test.ts`:

```typescript
import { addDays, subDays } from 'date-fns'
import { daysUntilDeadline } from '@/lib/calculations/days-remaining'

const today = new Date('2026-01-15')

describe('daysUntilDeadline', () => {
  it('returns positive days for future deadline', () => {
    expect(daysUntilDeadline(addDays(today, 30), today)).toBe(30)
  })

  it('returns 0 for today', () => {
    expect(daysUntilDeadline(today, today)).toBe(0)
  })

  it('returns negative days for past deadline', () => {
    expect(daysUntilDeadline(subDays(today, 5), today)).toBe(-5)
  })
})
```

- [ ] **Step 10: Implement `daysUntilDeadline`**

Create `lib/calculations/days-remaining.ts`:

```typescript
import { differenceInCalendarDays } from 'date-fns'

export function daysUntilDeadline(promoDeadline: Date, today: Date = new Date()): number {
  return differenceInCalendarDays(promoDeadline, today)
}
```

- [ ] **Step 11: Run tests to verify all pass**

```bash
npx jest __tests__/lib/calculations/days-remaining.test.ts
```

Expected: PASS — 3 tests passed.

- [ ] **Step 12: Create `lib/calculations/index.ts`**

```typescript
export { calculateMonthlyPaymentNeeded } from './monthly-payment'
export { calculateRetroInterestExposure } from './retro-interest'
export { daysUntilDeadline } from './days-remaining'
export { generatePayoffSchedule } from './payoff-schedule'
export { updateDealCachedFields } from './cache-fields'
```

- [ ] **Step 13: Commit**

```bash
git add lib/calculations/ __tests__/lib/calculations/
git commit -m "feat: add core financial calculations library (TDD)"
```

---

## Task 4: Payoff Schedule + Cache-Fields Updater

**Files:**
- Create: `lib/calculations/payoff-schedule.ts`
- Create: `lib/calculations/cache-fields.ts`
- Create: `lib/db.ts`
- Test: `__tests__/lib/calculations/payoff-schedule.test.ts`

- [ ] **Step 1: Create Prisma client singleton**

Create `lib/db.ts`:

```typescript
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const db = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
```

- [ ] **Step 2: Write failing tests for payoff schedule**

Create `__tests__/lib/calculations/payoff-schedule.test.ts`:

```typescript
import { addMonths } from 'date-fns'
import { generatePayoffSchedule } from '@/lib/calculations/payoff-schedule'

const today = new Date('2026-01-15')

describe('generatePayoffSchedule', () => {
  it('generates one entry per month until deadline', () => {
    const deadline = addMonths(today, 3)
    const schedule = generatePayoffSchedule(30000, deadline, today)
    expect(schedule).toHaveLength(3)
  })

  it('balance reaches 0 by final month', () => {
    const deadline = addMonths(today, 3)
    const schedule = generatePayoffSchedule(30000, deadline, today)
    expect(schedule[schedule.length - 1].balanceCents).toBe(0)
  })

  it('each entry has month, paymentCents, balanceCents', () => {
    const deadline = addMonths(today, 2)
    const schedule = generatePayoffSchedule(20000, deadline, today)
    expect(schedule[0]).toMatchObject({
      month: expect.any(Date),
      paymentCents: expect.any(Number),
      balanceCents: expect.any(Number),
    })
  })

  it('returns empty array when deadline has passed', () => {
    const deadline = addMonths(today, -1)
    expect(generatePayoffSchedule(10000, deadline, today)).toEqual([])
  })
})
```

- [ ] **Step 3: Run test to verify it fails**

```bash
npx jest __tests__/lib/calculations/payoff-schedule.test.ts
```

Expected: FAIL — `Cannot find module '@/lib/calculations/payoff-schedule'`

- [ ] **Step 4: Implement `generatePayoffSchedule`**

Create `lib/calculations/payoff-schedule.ts`:

```typescript
import { addMonths, startOfMonth } from 'date-fns'
import { calculateMonthlyPaymentNeeded } from './monthly-payment'

export interface PayoffMonth {
  month: Date
  paymentCents: number
  balanceCents: number
}

export function generatePayoffSchedule(
  currentBalanceCents: number,
  promoDeadline: Date,
  today: Date = new Date()
): PayoffMonth[] {
  const monthlyPayment = calculateMonthlyPaymentNeeded(currentBalanceCents, promoDeadline, today)
  if (monthlyPayment === currentBalanceCents && currentBalanceCents > 0) {
    // deadline passed or 0 months
    const months = Math.round((promoDeadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24 * 30))
    if (months <= 0) return []
  }

  const schedule: PayoffMonth[] = []
  let remaining = currentBalanceCents
  let month = 1

  while (remaining > 0) {
    const payment = Math.min(monthlyPayment, remaining)
    remaining = Math.max(0, remaining - payment)
    schedule.push({
      month: addMonths(startOfMonth(today), month),
      paymentCents: payment,
      balanceCents: remaining,
    })
    month++
    if (month > 360) break // safety cap
  }

  return schedule
}
```

- [ ] **Step 5: Run tests to verify all pass**

```bash
npx jest __tests__/lib/calculations/payoff-schedule.test.ts
```

Expected: PASS — 4 tests passed.

- [ ] **Step 6: Implement `updateDealCachedFields`**

Create `lib/calculations/cache-fields.ts`:

```typescript
import { db } from '@/lib/db'
import { calculateMonthlyPaymentNeeded } from './monthly-payment'
import { calculateRetroInterestExposure } from './retro-interest'
import { daysUntilDeadline } from './days-remaining'

export async function updateDealCachedFields(dealId: string) {
  const deal = await db.promoDeal.findUniqueOrThrow({ where: { id: dealId } })
  const today = new Date()

  return db.promoDeal.update({
    where: { id: dealId },
    data: {
      cachedMonthlyPaymentNeededCents: calculateMonthlyPaymentNeeded(
        deal.currentBalanceCents,
        deal.promoDeadline,
        today
      ),
      cachedRetroInterestExposureCents: calculateRetroInterestExposure(
        deal.originalPurchaseAmountCents,
        deal.regularAprBps,
        deal.promoStartDate,
        today
      ),
      cachedDaysRemaining: daysUntilDeadline(deal.promoDeadline, today),
      cacheUpdatedAt: today,
    },
  })
}
```

- [ ] **Step 7: Run all calculation tests**

```bash
npx jest __tests__/lib/calculations/
```

Expected: PASS — all 13 tests across 4 files.

- [ ] **Step 8: Commit**

```bash
git add lib/ __tests__/lib/calculations/payoff-schedule.test.ts
git commit -m "feat: add payoff schedule, cache-fields updater, and Prisma singleton"
```

---

## Task 5: NextAuth v5 + Auth Middleware

**Files:**
- Create: `lib/auth.ts`
- Create: `app/api/auth/[...nextauth]/route.ts`
- Create: `types/next-auth.d.ts`
- Create: `middleware.ts`
- Create: `app/(auth)/login/page.tsx`

NextAuth v5 uses a named export pattern: `auth.ts` exports `{ handlers, auth, signIn, signOut }`. The `auth()` function acts as both session getter (in server components) and middleware wrapper.

- [ ] **Step 1: Extend NextAuth session types**

Create `types/next-auth.d.ts`:

```typescript
import { SubscriptionTier } from '@prisma/client'
import { DefaultSession } from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      subscriptionTier: SubscriptionTier
    } & DefaultSession['user']
  }

  interface User {
    subscriptionTier: SubscriptionTier
  }
}
```

- [ ] **Step 2: Create NextAuth config**

Create `lib/auth.ts`:

```typescript
import NextAuth from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import Google from 'next-auth/providers/google'
import Resend from 'next-auth/providers/resend'
import { db } from '@/lib/db'

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Resend({
      from: process.env.RESEND_FROM_EMAIL!,
    }),
  ],
  pages: {
    signIn: '/login',
  },
  callbacks: {
    session({ session, user }) {
      session.user.id = user.id
      session.user.subscriptionTier = user.subscriptionTier
      return session
    },
  },
})
```

- [ ] **Step 3: Create NextAuth API route handler**

Create `app/api/auth/[...nextauth]/route.ts`:

```typescript
import { handlers } from '@/lib/auth'
export const { GET, POST } = handlers
```

- [ ] **Step 4: Create auth middleware**

Create `middleware.ts`:

```typescript
import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'

export default auth((req) => {
  const isAuthenticated = !!req.auth
  const isDashboard = req.nextUrl.pathname.startsWith('/dashboard')

  if (isDashboard && !isAuthenticated) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/dashboard/:path*'],
}
```

- [ ] **Step 5: Create login page**

Create `app/(auth)/login/page.tsx`:

```tsx
import { signIn } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-xl shadow">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Sign in to DeadlineZero</h2>
          <p className="mt-2 text-sm text-gray-600">
            Get a magic link sent to your email — no password needed.
          </p>
        </div>

        <form
          action={async (formData: FormData) => {
            'use server'
            await signIn('resend', formData)
          }}
          className="space-y-4"
        >
          <div>
            <Label htmlFor="email">Email address</Label>
            <Input id="email" name="email" type="email" required placeholder="you@example.com" />
          </div>
          <Button type="submit" className="w-full">
            Send magic link
          </Button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Or</span>
          </div>
        </div>

        <form
          action={async () => {
            'use server'
            await signIn('google', { redirectTo: '/dashboard' })
          }}
        >
          <Button type="submit" variant="outline" className="w-full">
            Continue with Google
          </Button>
        </form>
      </div>
    </div>
  )
}
```

- [ ] **Step 6: Verify type-check passes**

```bash
npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 7: Commit**

```bash
git add lib/auth.ts app/api/auth/ types/ middleware.ts app/\(auth\)/
git commit -m "feat: add NextAuth v5 with magic link, Google OAuth, and auth middleware"
```

---

## Task 6: Deals CRUD API

**Files:**
- Create: `app/api/deals/route.ts`
- Create: `app/api/deals/[id]/route.ts`
- Create: `app/api/deals/[id]/payments/route.ts`
- Create: `app/api/deals/[id]/payoff/route.ts`
- Create: `app/api/deals/[id]/schedule/route.ts`
- Create: `app/api/deals/[id]/export/ical/route.ts`

All routes verify session ownership. Amounts arrive and leave as integer cents. Every write triggers `updateDealCachedFields`.

- [ ] **Step 1: Create shared Zod schema for deal input**

This schema is used by both the create (`POST /api/deals`) and update (`PATCH /api/deals/[id]`) endpoints.

Create `lib/validations/deal.ts`:

```typescript
import { z } from 'zod'

export const createDealSchema = z.object({
  merchantName: z.string().min(1).max(100),
  description: z.string().max(200).optional(),
  issuingBank: z.enum([
    'SYNCHRONY', 'CARECREDIT', 'COMENITY', 'CITIBANK',
    'TD_RETAIL', 'WELLS_FARGO_RETAIL', 'OTHER',
  ]).default('OTHER'),
  originalPurchaseAmountCents: z.number().int().positive(),
  currentBalanceCents: z.number().int().nonnegative(),
  minimumPaymentCents: z.number().int().nonnegative().optional(),
  regularAprBps: z.number().int().positive().max(10000),
  promoStartDate: z.string().datetime(),
  promoDeadline: z.string().datetime(),
  promoDescription: z.string().max(200).optional(),
})

export const updateDealSchema = createDealSchema.partial()
```

- [ ] **Step 2: Create `GET /api/deals` and `POST /api/deals`**

Create `app/api/deals/route.ts`:

```typescript
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { updateDealCachedFields } from '@/lib/calculations/cache-fields'
import { createDealSchema } from '@/lib/validations/deal'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const deals = await db.promoDeal.findMany({
    where: { userId: session.user.id, status: 'ACTIVE' },
    orderBy: { promoDeadline: 'asc' },
  })
  return NextResponse.json(deals)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Free tier: max 2 active deals
  if (session.user.subscriptionTier === 'FREE') {
    const count = await db.promoDeal.count({
      where: { userId: session.user.id, status: 'ACTIVE' },
    })
    if (count >= 2) {
      return NextResponse.json(
        { error: 'Free plan limit: 2 active deals. Upgrade to Premium for unlimited.' },
        { status: 403 }
      )
    }
  }

  const body = await req.json()
  const parsed = createDealSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const deal = await db.promoDeal.create({
    data: {
      ...parsed.data,
      userId: session.user.id,
      promoStartDate: new Date(parsed.data.promoStartDate),
      promoDeadline: new Date(parsed.data.promoDeadline),
    },
  })

  const updated = await updateDealCachedFields(deal.id)
  return NextResponse.json(updated, { status: 201 })
}
```

- [ ] **Step 3: Create `GET`, `PATCH`, `DELETE /api/deals/[id]`**

Create `app/api/deals/[id]/route.ts`:

```typescript
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { updateDealCachedFields } from '@/lib/calculations/cache-fields'
import { updateDealSchema } from '@/lib/validations/deal'
import { NextRequest, NextResponse } from 'next/server'

type Params = { params: { id: string } }

async function ownedDeal(dealId: string, userId: string) {
  return db.promoDeal.findFirst({ where: { id: dealId, userId } })
}

export async function GET(_req: NextRequest, { params }: Params) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const deal = await ownedDeal(params.id, session.user.id)
  if (!deal) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const [alerts, paymentHistory, balanceHistory] = await Promise.all([
    db.alert.findMany({ where: { dealId: deal.id }, orderBy: { scheduledFor: 'desc' } }),
    db.paymentRecord.findMany({ where: { dealId: deal.id }, orderBy: { paymentDate: 'desc' } }),
    db.balanceSnapshot.findMany({ where: { dealId: deal.id }, orderBy: { snapshotDate: 'asc' } }),
  ])

  return NextResponse.json({ ...deal, alerts, paymentHistory, balanceHistory })
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const deal = await ownedDeal(params.id, session.user.id)
  if (!deal) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const body = await req.json()
  const parsed = updateDealSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  await db.promoDeal.update({
    where: { id: params.id },
    data: {
      ...parsed.data,
      ...(parsed.data.promoStartDate ? { promoStartDate: new Date(parsed.data.promoStartDate) } : {}),
      ...(parsed.data.promoDeadline ? { promoDeadline: new Date(parsed.data.promoDeadline) } : {}),
    },
  })

  const updated = await updateDealCachedFields(params.id)
  return NextResponse.json(updated)
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const deal = await ownedDeal(params.id, session.user.id)
  if (!deal) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  await db.promoDeal.update({ where: { id: params.id }, data: { status: 'ARCHIVED' } })
  return NextResponse.json({ success: true })
}
```

- [ ] **Step 4: Create `POST /api/deals/[id]/payments`**

Create `app/api/deals/[id]/payments/route.ts`:

```typescript
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { updateDealCachedFields } from '@/lib/calculations/cache-fields'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const paymentSchema = z.object({
  amountCents: z.number().int().positive(),
  paymentDate: z.string().datetime().default(() => new Date().toISOString()),
  note: z.string().max(200).optional(),
})

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const deal = await db.promoDeal.findFirst({ where: { id: params.id, userId: session.user.id } })
  if (!deal) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const body = await req.json()
  const parsed = paymentSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const newBalance = Math.max(0, deal.currentBalanceCents - parsed.data.amountCents)
  const paymentDate = new Date(parsed.data.paymentDate)

  await db.$transaction([
    db.paymentRecord.create({
      data: { dealId: params.id, ...parsed.data, paymentDate },
    }),
    db.balanceSnapshot.create({
      data: { dealId: params.id, balanceCents: newBalance, snapshotDate: paymentDate, source: 'payment_recorded' },
    }),
    db.promoDeal.update({
      where: { id: params.id },
      data: { currentBalanceCents: newBalance },
    }),
  ])

  const updated = await updateDealCachedFields(params.id)
  return NextResponse.json(updated, { status: 201 })
}
```

- [ ] **Step 5: Create `POST /api/deals/[id]/payoff`**

Create `app/api/deals/[id]/payoff/route.ts`:

```typescript
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const deal = await db.promoDeal.findFirst({ where: { id: params.id, userId: session.user.id } })
  if (!deal) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const updated = await db.promoDeal.update({
    where: { id: params.id },
    data: { status: 'PAID_OFF', paidOffAt: new Date(), currentBalanceCents: 0 },
  })
  return NextResponse.json(updated)
}
```

- [ ] **Step 6: Create `GET /api/deals/[id]/schedule`**

Create `app/api/deals/[id]/schedule/route.ts`:

```typescript
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { generatePayoffSchedule } from '@/lib/calculations'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const deal = await db.promoDeal.findFirst({ where: { id: params.id, userId: session.user.id } })
  if (!deal) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const schedule = generatePayoffSchedule(deal.currentBalanceCents, deal.promoDeadline)
  return NextResponse.json(schedule)
}
```

- [ ] **Step 7: Create `GET /api/deals/[id]/export/ical`**

Create `app/api/deals/[id]/export/ical/route.ts`:

```typescript
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { generatePayoffSchedule } from '@/lib/calculations'
import { format } from 'date-fns'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const deal = await db.promoDeal.findFirst({ where: { id: params.id, userId: session.user.id } })
  if (!deal) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const schedule = generatePayoffSchedule(deal.currentBalanceCents, deal.promoDeadline)
  const now = format(new Date(), "yyyyMMdd'T'HHmmss'Z'")

  const events = schedule.map((entry) => {
    const dateStr = format(entry.month, "yyyyMMdd")
    const payment = (entry.paymentCents / 100).toFixed(2)
    return [
      'BEGIN:VEVENT',
      `UID:deadlinezero-${deal.id}-${dateStr}`,
      `DTSTAMP:${now}`,
      `DTSTART;VALUE=DATE:${dateStr}`,
      `SUMMARY:Pay $${payment} on ${deal.merchantName} deal`,
      `DESCRIPTION:DeadlineZero payment reminder. Balance after: $${(entry.balanceCents / 100).toFixed(2)}`,
      'END:VEVENT',
    ].join('\r\n')
  }).join('\r\n')

  const ical = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//DeadlineZero//EN',
    events,
    'END:VCALENDAR',
  ].join('\r\n')

  return new NextResponse(ical, {
    headers: {
      'Content-Type': 'text/calendar',
      'Content-Disposition': `attachment; filename="deadlinezero-${deal.id}.ics"`,
    },
  })
}
```

- [ ] **Step 8: Verify type-check**

```bash
npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 9: Commit**

```bash
git add app/api/deals/ lib/validations/
git commit -m "feat: add deals CRUD API with payment logging and iCal export"
```

---

## Task 7: Public Calculate API + Rate Limiting

**Files:**
- Create: `app/api/calculate/route.ts`
- Create: `lib/rate-limit.ts`

- [ ] **Step 1: Create Upstash rate limiter helper**

Create `lib/rate-limit.ts`:

```typescript
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

export const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '1 m'),
  analytics: true,
})
```

- [ ] **Step 2: Create public calculate endpoint**

Create `app/api/calculate/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { calculateMonthlyPaymentNeeded, calculateRetroInterestExposure, daysUntilDeadline } from '@/lib/calculations'
import { ratelimit } from '@/lib/rate-limit'

const schema = z.object({
  originalPurchaseAmountCents: z.number().int().positive(),
  currentBalanceCents: z.number().int().nonnegative(),
  regularAprBps: z.number().int().positive().max(10000),
  promoStartDate: z.string().datetime(),
  promoDeadline: z.string().datetime(),
})

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') ?? 'anonymous'
  const { success } = await ratelimit.limit(ip)
  if (!success) return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })

  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const { originalPurchaseAmountCents, currentBalanceCents, regularAprBps, promoStartDate, promoDeadline } = parsed.data
  const deadline = new Date(promoDeadline)
  const startDate = new Date(promoStartDate)
  const today = new Date()

  return NextResponse.json({
    monthlyPaymentNeededCents: calculateMonthlyPaymentNeeded(currentBalanceCents, deadline, today),
    retroInterestExposureCents: calculateRetroInterestExposure(originalPurchaseAmountCents, regularAprBps, startDate, today),
    daysRemaining: daysUntilDeadline(deadline, today),
  })
}
```

- [ ] **Step 3: Commit**

```bash
git add app/api/calculate/ lib/rate-limit.ts
git commit -m "feat: add public calculate API endpoint with rate limiting"
```

---

## Task 8: Dashboard Layout + Deal Cards

**Files:**
- Create: `components/layout/dashboard-nav.tsx`
- Create: `app/(dashboard)/layout.tsx`
- Create: `components/deals/deal-card.tsx`
- Create: `app/(dashboard)/dashboard/page.tsx`

- [ ] **Step 1: Create dashboard sidebar nav**

Create `components/layout/dashboard-nav.tsx`:

```tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { cn } from '@/lib/utils'

const links = [
  { href: '/dashboard', label: 'Deals' },
  { href: '/dashboard/settings', label: 'Settings' },
  { href: '/dashboard/billing', label: 'Billing' },
]

export function DashboardNav({ userName }: { userName?: string | null }) {
  const pathname = usePathname()
  return (
    <nav className="flex flex-col w-64 min-h-screen bg-gray-900 text-white p-4 gap-2">
      <div className="text-xl font-bold mb-6 text-white">DeadlineZero</div>
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={cn(
            'px-3 py-2 rounded-md text-sm font-medium',
            pathname === link.href ? 'bg-gray-700 text-white' : 'text-gray-300 hover:bg-gray-700'
          )}
        >
          {link.label}
        </Link>
      ))}
      <div className="mt-auto pt-4 border-t border-gray-700">
        <p className="text-xs text-gray-400 mb-2">{userName}</p>
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className="text-sm text-gray-300 hover:text-white"
        >
          Sign out
        </button>
      </div>
    </nav>
  )
}
```

- [ ] **Step 2: Create dashboard layout**

Create `app/(dashboard)/layout.tsx`:

```tsx
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { DashboardNav } from '@/components/layout/dashboard-nav'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user) redirect('/login')

  return (
    <div className="flex min-h-screen">
      <DashboardNav userName={session.user.name ?? session.user.email} />
      <main className="flex-1 p-8 bg-gray-50">{children}</main>
    </div>
  )
}
```

- [ ] **Step 3: Create deal card component**

Create `components/deals/deal-card.tsx`:

```tsx
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PromoDeal } from '@prisma/client'

function urgencyBadge(daysRemaining: number | null) {
  if (daysRemaining === null) return null
  if (daysRemaining <= 14) return <Badge variant="destructive">{daysRemaining}d left</Badge>
  if (daysRemaining <= 30) return <Badge className="bg-orange-500">{daysRemaining}d left</Badge>
  if (daysRemaining <= 90) return <Badge className="bg-yellow-500">{daysRemaining}d left</Badge>
  return <Badge variant="secondary">{daysRemaining}d left</Badge>
}

export function DealCard({ deal }: { deal: PromoDeal }) {
  const balance = ((deal.currentBalanceCents ?? 0) / 100).toFixed(2)
  const monthly = deal.cachedMonthlyPaymentNeededCents
    ? `$${(deal.cachedMonthlyPaymentNeededCents / 100).toFixed(2)}/mo`
    : '—'
  const retroInterest = deal.cachedRetroInterestExposureCents
    ? `$${(deal.cachedRetroInterestExposureCents / 100).toFixed(2)}`
    : '—'
  const progress = deal.originalPurchaseAmountCents > 0
    ? Math.round((1 - deal.currentBalanceCents / deal.originalPurchaseAmountCents) * 100)
    : 0

  return (
    <Link href={`/dashboard/deals/${deal.id}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg">{deal.merchantName}</CardTitle>
          {urgencyBadge(deal.cachedDaysRemaining)}
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm text-gray-500">{deal.description}</p>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-green-500 h-2 rounded-full" style={{ width: `${progress}%` }} />
          </div>
          <div className="flex justify-between text-sm">
            <span>Balance: <strong>${balance}</strong></span>
            <span>Need: <strong>{monthly}</strong></span>
          </div>
          <p className="text-sm text-red-600 font-medium">
            Retroactive interest if missed: {retroInterest}
          </p>
        </CardContent>
      </Card>
    </Link>
  )
}
```

- [ ] **Step 4: Create dashboard page**

Create `app/(dashboard)/dashboard/page.tsx`:

```tsx
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { DealCard } from '@/components/deals/deal-card'

export default async function DashboardPage() {
  const session = await auth()
  const deals = await db.promoDeal.findMany({
    where: { userId: session!.user.id, status: 'ACTIVE' },
    orderBy: { promoDeadline: 'asc' },
  })

  const totalRetroExposure = deals.reduce(
    (sum, d) => sum + (d.cachedRetroInterestExposureCents ?? 0), 0
  )

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Your Deals</h1>
          {totalRetroExposure > 0 && (
            <p className="text-red-600 text-sm mt-1">
              Total retroactive interest exposure: ${(totalRetroExposure / 100).toFixed(2)}
            </p>
          )}
        </div>
        <Button asChild>
          <Link href="/dashboard/deals/new">+ Add Deal</Link>
        </Button>
      </div>

      {deals.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <p className="text-lg mb-4">No active deals yet.</p>
          <Button asChild>
            <Link href="/dashboard/deals/new">Add your first deal</Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {deals.map((deal) => <DealCard key={deal.id} deal={deal} />)}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 5: Commit**

```bash
git add app/\(dashboard\)/ components/layout/ components/deals/deal-card.tsx
git commit -m "feat: add dashboard layout, sidebar nav, and deal cards"
```

---

## Task 9: Deal Forms + Detail Page

**Files:**
- Create: `components/deals/deal-form.tsx`
- Create: `components/deals/payment-form.tsx`
- Create: `components/deals/payoff-chart.tsx`
- Create: `app/(dashboard)/dashboard/deals/new/page.tsx`
- Create: `app/(dashboard)/dashboard/deals/[id]/page.tsx`
- Create: `app/(dashboard)/dashboard/deals/[id]/edit/page.tsx`
- Create: `app/(dashboard)/dashboard/deals/[id]/payment/page.tsx`

- [ ] **Step 1: Create shared deal form component**

Create `components/deals/deal-form.tsx`:

```tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface DealFormValues {
  merchantName: string
  description: string
  issuingBank: string
  originalPurchaseAmountCents: number
  currentBalanceCents: number
  regularAprBps: number
  promoStartDate: string
  promoDeadline: string
  promoDescription: string
}

interface DealFormProps {
  initialValues?: Partial<DealFormValues>
  dealId?: string
}

export function DealForm({ initialValues, dealId }: DealFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const fd = new FormData(e.currentTarget)

    // Convert dollar inputs to cents
    const originalAmountDollars = parseFloat(fd.get('originalAmount') as string)
    const balanceDollars = parseFloat(fd.get('currentBalance') as string)
    const aprPercent = parseFloat(fd.get('apr') as string)

    const body = {
      merchantName: fd.get('merchantName') as string,
      description: fd.get('description') as string,
      issuingBank: fd.get('issuingBank') as string,
      originalPurchaseAmountCents: Math.round(originalAmountDollars * 100),
      currentBalanceCents: Math.round(balanceDollars * 100),
      regularAprBps: Math.round(aprPercent * 100),
      promoStartDate: new Date(fd.get('promoStartDate') as string).toISOString(),
      promoDeadline: new Date(fd.get('promoDeadline') as string).toISOString(),
      promoDescription: fd.get('promoDescription') as string,
    }

    const res = await fetch(dealId ? `/api/deals/${dealId}` : '/api/deals', {
      method: dealId ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    if (!res.ok) {
      const data = await res.json()
      setError(data.error?.message ?? 'Something went wrong')
      setLoading(false)
      return
    }

    const deal = await res.json()
    router.push(`/dashboard/deals/${deal.id}`)
  }

  const iv = initialValues ?? {}

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
      {error && <p className="text-red-600 text-sm bg-red-50 p-3 rounded">{error}</p>}

      <div>
        <Label htmlFor="merchantName">Merchant name</Label>
        <Input id="merchantName" name="merchantName" required defaultValue={iv.merchantName} placeholder="Best Buy" />
      </div>

      <div>
        <Label htmlFor="description">Description (optional)</Label>
        <Input id="description" name="description" defaultValue={iv.description} placeholder="65-inch TV" />
      </div>

      <div>
        <Label htmlFor="issuingBank">Issuing bank</Label>
        <Select name="issuingBank" defaultValue={iv.issuingBank ?? 'OTHER'}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="SYNCHRONY">Synchrony</SelectItem>
            <SelectItem value="CARECREDIT">CareCredit</SelectItem>
            <SelectItem value="COMENITY">Comenity</SelectItem>
            <SelectItem value="CITIBANK">Citibank</SelectItem>
            <SelectItem value="TD_RETAIL">TD Retail</SelectItem>
            <SelectItem value="WELLS_FARGO_RETAIL">Wells Fargo Retail</SelectItem>
            <SelectItem value="OTHER">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="originalAmount">Original amount ($)</Label>
          <Input id="originalAmount" name="originalAmount" type="number" step="0.01" required
            defaultValue={iv.originalPurchaseAmountCents ? (iv.originalPurchaseAmountCents / 100).toFixed(2) : ''} />
        </div>
        <div>
          <Label htmlFor="currentBalance">Current balance ($)</Label>
          <Input id="currentBalance" name="currentBalance" type="number" step="0.01" required
            defaultValue={iv.currentBalanceCents ? (iv.currentBalanceCents / 100).toFixed(2) : ''} />
        </div>
      </div>

      <div>
        <Label htmlFor="apr">APR (%)</Label>
        <Input id="apr" name="apr" type="number" step="0.01" required placeholder="26.99"
          defaultValue={iv.regularAprBps ? (iv.regularAprBps / 100).toFixed(2) : ''} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="promoStartDate">Purchase date</Label>
          <Input id="promoStartDate" name="promoStartDate" type="date" required
            defaultValue={iv.promoStartDate?.slice(0, 10)} />
        </div>
        <div>
          <Label htmlFor="promoDeadline">Promo deadline</Label>
          <Input id="promoDeadline" name="promoDeadline" type="date" required
            defaultValue={iv.promoDeadline?.slice(0, 10)} />
        </div>
      </div>

      <div>
        <Label htmlFor="promoDescription">Promo description (optional)</Label>
        <Input id="promoDescription" name="promoDescription" placeholder="18 months no interest if paid in full"
          defaultValue={iv.promoDescription} />
      </div>

      <Button type="submit" disabled={loading}>
        {loading ? 'Saving…' : dealId ? 'Save changes' : 'Start tracking'}
      </Button>
    </form>
  )
}
```

- [ ] **Step 2: Create add deal page**

Create `app/(dashboard)/dashboard/deals/new/page.tsx`:

```tsx
import { DealForm } from '@/components/deals/deal-form'

export default function NewDealPage() {
  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Add a promotional deal</h1>
      <DealForm />
    </div>
  )
}
```

- [ ] **Step 3: Create payoff chart component**

Create `components/deals/payoff-chart.tsx`:

```tsx
'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import { format } from 'date-fns'

interface BalancePoint {
  snapshotDate: string
  balanceCents: number
}

export function PayoffChart({ history, deadline }: { history: BalancePoint[], deadline: string }) {
  const data = history.map((p) => ({
    date: format(new Date(p.snapshotDate), 'MMM d'),
    balance: p.balanceCents / 100,
  }))

  return (
    <ResponsiveContainer width="100%" height={240}>
      <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" tick={{ fontSize: 12 }} />
        <YAxis tickFormatter={(v) => `$${v}`} tick={{ fontSize: 12 }} />
        <Tooltip formatter={(v: number) => [`$${v.toFixed(2)}`, 'Balance']} />
        <Line type="monotone" dataKey="balance" stroke="#2563eb" strokeWidth={2} dot={false} />
        <ReferenceLine y={0} stroke="#16a34a" strokeDasharray="4 4" label="$0" />
      </LineChart>
    </ResponsiveContainer>
  )
}
```

- [ ] **Step 4: Create deal detail page**

Create `app/(dashboard)/dashboard/deals/[id]/page.tsx`:

```tsx
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { PayoffChart } from '@/components/deals/payoff-chart'
import { format } from 'date-fns'

export default async function DealDetailPage({ params }: { params: { id: string } }) {
  const session = await auth()
  const deal = await db.promoDeal.findFirst({
    where: { id: params.id, userId: session!.user.id },
    include: { balanceHistory: { orderBy: { snapshotDate: 'asc' } }, paymentHistory: { orderBy: { paymentDate: 'desc' } } },
  })
  if (!deal) notFound()

  const balance = (deal.currentBalanceCents / 100).toFixed(2)
  const monthly = deal.cachedMonthlyPaymentNeededCents
    ? `$${(deal.cachedMonthlyPaymentNeededCents / 100).toFixed(2)}`
    : '—'
  const retro = deal.cachedRetroInterestExposureCents
    ? `$${(deal.cachedRetroInterestExposureCents / 100).toFixed(2)}`
    : '—'
  const progress = Math.round((1 - deal.currentBalanceCents / deal.originalPurchaseAmountCents) * 100)

  return (
    <div className="max-w-3xl">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold">{deal.merchantName}</h1>
          {deal.description && <p className="text-gray-500">{deal.description}</p>}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/dashboard/deals/${deal.id}/edit`}>Edit</Link>
          </Button>
          <Button asChild>
            <Link href={`/dashboard/deals/${deal.id}/payment`}>Log payment</Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <p className="text-sm text-gray-500">Balance</p>
          <p className="text-2xl font-bold">${balance}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <p className="text-sm text-gray-500">Pay per month</p>
          <p className="text-2xl font-bold">{monthly}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-red-200">
          <p className="text-sm text-red-600">If you miss the deadline</p>
          <p className="text-2xl font-bold text-red-600">{retro}</p>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex justify-between text-sm mb-1">
          <span>Progress</span>
          <span>{progress}% paid off</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div className="bg-green-500 h-3 rounded-full" style={{ width: `${progress}%` }} />
        </div>
        <p className="text-sm text-gray-500 mt-1">
          Deadline: {format(deal.promoDeadline, 'MMMM d, yyyy')}
        </p>
      </div>

      {deal.balanceHistory.length > 0 && (
        <div className="bg-white p-4 rounded-lg shadow-sm border mb-4">
          <h2 className="font-semibold mb-3">Balance history</h2>
          <PayoffChart
            history={deal.balanceHistory.map(b => ({ snapshotDate: b.snapshotDate.toISOString(), balanceCents: b.balanceCents }))}
            deadline={deal.promoDeadline.toISOString()}
          />
        </div>
      )}

      <div className="flex gap-2 mb-6">
        <Button variant="outline" asChild>
          <a href={`/api/deals/${deal.id}/export/ical`} download>
            Add to Calendar
          </a>
        </Button>
      </div>

      {deal.paymentHistory.length > 0 && (
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <h2 className="font-semibold mb-3">Payment history</h2>
          <table className="w-full text-sm">
            <thead><tr className="text-gray-500 text-left"><th>Date</th><th>Amount</th><th>Note</th></tr></thead>
            <tbody>
              {deal.paymentHistory.map((p) => (
                <tr key={p.id} className="border-t">
                  <td className="py-2">{format(p.paymentDate, 'MMM d, yyyy')}</td>
                  <td>${(p.amountCents / 100).toFixed(2)}</td>
                  <td className="text-gray-400">{p.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 5: Create edit deal page**

Create `app/(dashboard)/dashboard/deals/[id]/edit/page.tsx`:

```tsx
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { notFound } from 'next/navigation'
import { DealForm } from '@/components/deals/deal-form'

export default async function EditDealPage({ params }: { params: { id: string } }) {
  const session = await auth()
  const deal = await db.promoDeal.findFirst({ where: { id: params.id, userId: session!.user.id } })
  if (!deal) notFound()

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Edit deal</h1>
      <DealForm
        dealId={deal.id}
        initialValues={{
          merchantName: deal.merchantName,
          description: deal.description ?? '',
          issuingBank: deal.issuingBank,
          originalPurchaseAmountCents: deal.originalPurchaseAmountCents,
          currentBalanceCents: deal.currentBalanceCents,
          regularAprBps: deal.regularAprBps,
          promoStartDate: deal.promoStartDate.toISOString(),
          promoDeadline: deal.promoDeadline.toISOString(),
          promoDescription: deal.promoDescription ?? '',
        }}
      />
    </div>
  )
}
```

- [ ] **Step 6: Create log payment page**

Create `app/(dashboard)/dashboard/deals/[id]/payment/page.tsx`:

```tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function LogPaymentPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const fd = new FormData(e.currentTarget)
    const amountCents = Math.round(parseFloat(fd.get('amount') as string) * 100)

    await fetch(`/api/deals/${params.id}/payments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amountCents,
        paymentDate: new Date().toISOString(),
        note: fd.get('note') as string,
      }),
    })

    router.push(`/dashboard/deals/${params.id}`)
  }

  return (
    <div className="max-w-md">
      <h1 className="text-2xl font-bold mb-6">Log a payment</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="amount">Amount paid ($)</Label>
          <Input id="amount" name="amount" type="number" step="0.01" required placeholder="105.00" />
        </div>
        <div>
          <Label htmlFor="note">Note (optional)</Label>
          <Input id="note" name="note" placeholder="Monthly payment" />
        </div>
        <Button type="submit" disabled={loading}>{loading ? 'Saving…' : 'Log payment'}</Button>
      </form>
    </div>
  )
}
```

- [ ] **Step 7: Commit**

```bash
git add app/\(dashboard\)/dashboard/deals/ components/deals/
git commit -m "feat: add deal forms, detail page, payoff chart, and payment logging UI"
```

---

## Task 10: Public Pages (Calculator + Homepage + Pricing)

**Files:**
- Create: `components/calculator/calculator-form.tsx`
- Create: `app/(public)/calculator/page.tsx`
- Create: `app/(public)/page.tsx`
- Create: `app/(public)/pricing/page.tsx`

- [ ] **Step 1: Create calculator form component**

Create `components/calculator/calculator-form.tsx`:

```tsx
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'

interface CalcResult {
  monthlyPaymentNeededCents: number
  retroInterestExposureCents: number
  daysRemaining: number
}

export function CalculatorForm() {
  const [result, setResult] = useState<CalcResult | null>(null)
  const [loading, setLoading] = useState(false)

  // Store form values in state so we can pass them to sessionStorage for the signup flow
  const [formValues, setFormValues] = useState({
    originalAmount: '',
    currentBalance: '',
    apr: '',
    promoStartDate: '',
    promoDeadline: '',
  })

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const body = {
      originalPurchaseAmountCents: Math.round(parseFloat(formValues.originalAmount) * 100),
      currentBalanceCents: Math.round(parseFloat(formValues.currentBalance) * 100),
      regularAprBps: Math.round(parseFloat(formValues.apr) * 100),
      promoStartDate: new Date(formValues.promoStartDate).toISOString(),
      promoDeadline: new Date(formValues.promoDeadline).toISOString(),
    }

    const res = await fetch('/api/calculate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    if (res.ok) {
      const data = await res.json()
      setResult(data)
      // Pre-populate the new deal form after sign-in
      sessionStorage.setItem('pendingDeal', JSON.stringify({ ...body, ...formValues }))
    }
    setLoading(false)
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Original financed amount ($)</Label>
            <Input type="number" step="0.01" required value={formValues.originalAmount}
              onChange={(e) => setFormValues(v => ({ ...v, originalAmount: e.target.value }))} placeholder="1200.00" />
          </div>
          <div>
            <Label>Current balance ($)</Label>
            <Input type="number" step="0.01" required value={formValues.currentBalance}
              onChange={(e) => setFormValues(v => ({ ...v, currentBalance: e.target.value }))} placeholder="840.00" />
          </div>
        </div>
        <div>
          <Label>APR (%)</Label>
          <Input type="number" step="0.01" required value={formValues.apr}
            onChange={(e) => setFormValues(v => ({ ...v, apr: e.target.value }))} placeholder="26.99" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Purchase date</Label>
            <Input type="date" required value={formValues.promoStartDate}
              onChange={(e) => setFormValues(v => ({ ...v, promoStartDate: e.target.value }))} />
          </div>
          <div>
            <Label>Promo deadline</Label>
            <Input type="date" required value={formValues.promoDeadline}
              onChange={(e) => setFormValues(v => ({ ...v, promoDeadline: e.target.value }))} />
          </div>
        </div>
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? 'Calculating…' : 'Calculate my exposure'}
        </Button>
      </form>

      {result && (
        <div className="bg-gray-50 rounded-xl p-6 space-y-4 border">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-sm text-gray-500">Monthly payment needed</p>
              <p className="text-3xl font-bold text-blue-600">
                ${(result.monthlyPaymentNeededCents / 100).toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-sm text-red-500">Retroactive interest if missed</p>
              <p className="text-3xl font-bold text-red-600">
                ${(result.retroInterestExposureCents / 100).toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Days remaining</p>
              <p className="text-3xl font-bold">{result.daysRemaining}</p>
            </div>
          </div>
          <Button asChild className="w-full">
            <Link href="/login">Track this deal and get alerts →</Link>
          </Button>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Create calculator page**

Create `app/(public)/calculator/page.tsx`:

```tsx
import { CalculatorForm } from '@/components/calculator/calculator-form'

export const metadata = {
  title: 'Deferred Interest Calculator — DeadlineZero',
  description: 'Calculate your exact monthly payment and retroactive interest exposure on any deferred-interest financing deal.',
}

export default function CalculatorPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold mb-2">Deferred Interest Calculator</h1>
        <p className="text-gray-600 mb-8">
          Find out exactly how much you'll owe if you miss your "no interest if paid in full" deadline — and what you need to pay each month to beat it.
        </p>
        <CalculatorForm />
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Create marketing homepage**

Create `app/(public)/page.tsx`:

```tsx
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="flex justify-between items-center px-6 py-4 border-b">
        <span className="font-bold text-xl">DeadlineZero</span>
        <div className="flex gap-4">
          <Button variant="ghost" asChild><Link href="/calculator">Calculator</Link></Button>
          <Button variant="ghost" asChild><Link href="/pricing">Pricing</Link></Button>
          <Button asChild><Link href="/login">Sign in</Link></Button>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 py-24 text-center">
        <h1 className="text-5xl font-bold tracking-tight mb-6">
          Miss your "no interest" deadline by one day.<br />
          <span className="text-red-600">Pay 27% interest on every dollar.</span>
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          DeadlineZero tracks your deferred-interest deals and tells you exactly what to pay each month — so you never trigger the retroactive interest trap.
        </p>
        <div className="flex gap-4 justify-center">
          <Button size="lg" asChild>
            <Link href="/calculator">Calculate my exposure — free</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/login">Track my deals</Link>
          </Button>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">How it works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '1', title: 'Add your deal', desc: 'Enter your original amount, current balance, APR, and deadline.' },
              { step: '2', title: 'See your exposure', desc: 'Instantly see the exact retroactive interest you risk and the monthly payment to avoid it.' },
              { step: '3', title: 'Get alerts', desc: '90, 60, and 30-day email alerts with exact payoff amounts. Never miss a deadline.' },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center text-xl font-bold mx-auto mb-4">{item.step}</div>
                <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
```

- [ ] **Step 4: Create pricing page**

Create `app/(public)/pricing/page.tsx`:

```tsx
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-white py-16">
      <div className="max-w-4xl mx-auto px-6">
        <h1 className="text-4xl font-bold text-center mb-4">Simple pricing</h1>
        <p className="text-gray-600 text-center mb-12">Less than the interest you'll pay if you miss one deadline.</p>
        <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto">
          {/* Free */}
          <div className="border rounded-xl p-8">
            <h2 className="text-2xl font-bold mb-2">Free</h2>
            <p className="text-4xl font-bold mb-6">$0</p>
            <ul className="space-y-2 text-sm mb-8">
              <li>✓ Track up to 2 active deals</li>
              <li>✓ Monthly payment calculator</li>
              <li>✓ Retroactive interest shock display</li>
              <li>✓ 90/60/30-day email alerts</li>
              <li className="text-gray-400">✗ Unlimited deals</li>
              <li className="text-gray-400">✗ Auto bank sync (Plaid)</li>
              <li className="text-gray-400">✗ Calendar export</li>
            </ul>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/login">Get started free</Link>
            </Button>
          </div>
          {/* Premium */}
          <div className="border-2 border-blue-600 rounded-xl p-8 relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs px-3 py-1 rounded-full">Most popular</div>
            <h2 className="text-2xl font-bold mb-2">Premium</h2>
            <p className="text-4xl font-bold mb-1">$29<span className="text-lg font-normal text-gray-500">/year</span></p>
            <p className="text-sm text-gray-500 mb-6">or $4/month</p>
            <ul className="space-y-2 text-sm mb-8">
              <li>✓ Unlimited active deals</li>
              <li>✓ Monthly payment calculator</li>
              <li>✓ Retroactive interest shock display</li>
              <li>✓ 90/60/30-day email alerts</li>
              <li>✓ Auto bank sync (Plaid)</li>
              <li>✓ Calendar export (iCal)</li>
              <li>✓ Priority support</li>
            </ul>
            <Button className="w-full" asChild>
              <Link href="/login">Start free trial</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 5: Commit**

```bash
git add app/\(public\)/ components/calculator/
git commit -m "feat: add public calculator, homepage, and pricing pages"
```

---

## Task 11: Alert Email + Cron Endpoint

**Files:**
- Create: `lib/resend.ts`
- Create: `emails/deadline-alert.tsx`
- Create: `app/api/cron/send-alerts/route.ts`

- [ ] **Step 1: Create Resend client**

Create `lib/resend.ts`:

```typescript
import { Resend } from 'resend'

export const resend = new Resend(process.env.RESEND_API_KEY)
```

- [ ] **Step 2: Create deadline alert email template**

Create `emails/deadline-alert.tsx`:

```tsx
import {
  Body, Button, Container, Head, Heading, Html, Preview, Section, Text
} from '@react-email/components'

interface DeadlineAlertEmailProps {
  merchantName: string
  daysRemaining: number
  monthlyPaymentNeeded: string   // formatted dollar string e.g. "$105.00"
  retroInterestExposure: string  // formatted dollar string e.g. "$272.88"
  dealUrl: string
}

export function DeadlineAlertEmail({
  merchantName, daysRemaining, monthlyPaymentNeeded, retroInterestExposure, dealUrl,
}: DeadlineAlertEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>
        {daysRemaining} days left — pay {monthlyPaymentNeeded}/month to avoid {retroInterestExposure} in retroactive interest on your {merchantName} deal
      </Preview>
      <Body style={{ fontFamily: 'Arial, sans-serif', backgroundColor: '#f9fafb', padding: '20px' }}>
        <Container style={{ maxWidth: '600px', margin: '0 auto', backgroundColor: '#fff', borderRadius: '8px', padding: '32px' }}>
          <Heading style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>
            ⏰ {daysRemaining} days left on your {merchantName} deal
          </Heading>
          <Text style={{ color: '#6b7280' }}>
            Your deferred-interest promotional period is ending soon. Here's what you need to know:
          </Text>

          <Section style={{ backgroundColor: '#fef2f2', borderRadius: '8px', padding: '16px', margin: '16px 0' }}>
            <Text style={{ fontSize: '18px', color: '#dc2626', margin: '0', fontWeight: 'bold' }}>
              If you miss the deadline: {retroInterestExposure} in retroactive interest
            </Text>
            <Text style={{ color: '#7f1d1d', margin: '4px 0 0' }}>
              This is charged on your original purchase amount — not your remaining balance.
            </Text>
          </Section>

          <Section style={{ backgroundColor: '#eff6ff', borderRadius: '8px', padding: '16px', margin: '16px 0' }}>
            <Text style={{ fontSize: '18px', color: '#1d4ed8', margin: '0', fontWeight: 'bold' }}>
              Pay {monthlyPaymentNeeded}/month to pay it off in time
            </Text>
          </Section>

          <Button
            href={dealUrl}
            style={{ backgroundColor: '#2563eb', color: '#fff', padding: '12px 24px', borderRadius: '6px', textDecoration: 'none', display: 'inline-block' }}
          >
            View your deal →
          </Button>
        </Container>
      </Body>
    </Html>
  )
}
```

- [ ] **Step 3: Create cron alert endpoint**

Create `app/api/cron/send-alerts/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { resend } from '@/lib/resend'
import { render } from '@react-email/render'
import { DeadlineAlertEmail } from '@/emails/deadline-alert'
import { calculateMonthlyPaymentNeeded, calculateRetroInterestExposure, daysUntilDeadline } from '@/lib/calculations'
import { AlertType } from '@prisma/client'

// Maps alert threshold (days) to AlertType enum value
const ALERT_THRESHOLDS: Record<number, AlertType> = {
  90: 'DAYS_90',
  60: 'DAYS_60',
  30: 'DAYS_30',
  14: 'DAYS_14',
  7:  'DAYS_7',
}

export async function GET(req: NextRequest) {
  // Verify cron secret to prevent unauthorized calls
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const today = new Date()
  let sent = 0

  const activeDeals = await db.promoDeal.findMany({
    where: { status: 'ACTIVE' },
    include: { user: true, alerts: true },
  })

  for (const deal of activeDeals) {
    if (!deal.user.emailAlerts) continue

    const days = daysUntilDeadline(deal.promoDeadline, today)

    // Find the closest threshold this deal qualifies for today
    const thresholdDays = deal.user.alertLeadDays
      .filter((d) => days <= d)
      .sort((a, b) => a - b)[0]

    if (!thresholdDays) continue
    const alertType = ALERT_THRESHOLDS[thresholdDays]
    if (!alertType) continue

    // Check if this alert type was already sent for this deal
    const alreadySent = deal.alerts.some((a) => a.alertType === alertType && a.sentAt)
    if (alreadySent) continue

    const monthlyPaymentNeededCents = calculateMonthlyPaymentNeeded(deal.currentBalanceCents, deal.promoDeadline, today)
    const retroInterestExposureCents = calculateRetroInterestExposure(deal.originalPurchaseAmountCents, deal.regularAprBps, deal.promoStartDate, today)

    const html = render(
      DeadlineAlertEmail({
        merchantName: deal.merchantName,
        daysRemaining: days,
        monthlyPaymentNeeded: `$${(monthlyPaymentNeededCents / 100).toFixed(2)}`,
        retroInterestExposure: `$${(retroInterestExposureCents / 100).toFixed(2)}`,
        dealUrl: `${process.env.NEXTAUTH_URL}/dashboard/deals/${deal.id}`,
      })
    )

    const { data } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL!,
      to: deal.user.email,
      subject: `⚠️ ${days} days left — pay $${(monthlyPaymentNeededCents / 100).toFixed(2)}/month to avoid $${(retroInterestExposureCents / 100).toFixed(2)} on your ${deal.merchantName} deal`,
      html: await html,
    })

    // Upsert alert record
    await db.alert.upsert({
      where: { dealId_alertType: { dealId: deal.id, alertType } },
      update: { sentAt: today, emailMessageId: data?.id },
      create: {
        userId: deal.userId,
        dealId: deal.id,
        alertType,
        scheduledFor: today,
        sentAt: today,
        emailMessageId: data?.id,
        balanceAtAlertCents: deal.currentBalanceCents,
        monthlyPaymentNeededCents,
        retroInterestExposureCents,
        daysRemainingAtAlert: days,
      },
    })

    sent++
  }

  return NextResponse.json({ sent })
}
```

- [ ] **Step 4: Create `vercel.json` for cron schedule**

Create `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/send-alerts",
      "schedule": "0 8 * * *"
    }
  ]
}
```

- [ ] **Step 5: Commit**

```bash
git add lib/resend.ts emails/ app/api/cron/ vercel.json
git commit -m "feat: add deadline alert emails and Vercel Cron job"
```

---

## Task 12: Stripe Billing

**Files:**
- Create: `lib/stripe.ts`
- Create: `app/api/stripe/create-checkout/route.ts`
- Create: `app/api/stripe/portal/route.ts`
- Create: `app/api/webhooks/stripe/route.ts`
- Create: `app/(dashboard)/dashboard/billing/page.tsx`
- Create: `app/(dashboard)/dashboard/settings/page.tsx`

- [ ] **Step 1: Create Stripe client**

Create `lib/stripe.ts`:

```typescript
import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
})
```

- [ ] **Step 2: Create checkout session endpoint**

Create `app/api/stripe/create-checkout/route.ts`:

```typescript
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { stripe } from '@/lib/stripe'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const schema = z.object({ plan: z.enum(['monthly', 'annual']) })

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const user = await db.user.findUniqueOrThrow({ where: { id: session.user.id } })

  // Create Stripe customer if first checkout
  let customerId = user.stripeCustomerId
  if (!customerId) {
    const customer = await stripe.customers.create({ email: user.email, name: user.name ?? undefined })
    customerId = customer.id
    await db.user.update({ where: { id: user.id }, data: { stripeCustomerId: customerId } })
  }

  const priceId = parsed.data.plan === 'annual'
    ? process.env.STRIPE_ANNUAL_PRICE_ID!
    : process.env.STRIPE_MONTHLY_PRICE_ID!

  const checkoutSession = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${process.env.NEXTAUTH_URL}/dashboard/billing?success=1`,
    cancel_url: `${process.env.NEXTAUTH_URL}/pricing`,
  })

  return NextResponse.json({ checkoutUrl: checkoutSession.url })
}
```

- [ ] **Step 3: Create Stripe portal endpoint**

Create `app/api/stripe/portal/route.ts`:

```typescript
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { stripe } from '@/lib/stripe'
import { NextResponse } from 'next/server'

export async function POST() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await db.user.findUniqueOrThrow({ where: { id: session.user.id } })
  if (!user.stripeCustomerId) return NextResponse.json({ error: 'No billing account' }, { status: 400 })

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: user.stripeCustomerId,
    return_url: `${process.env.NEXTAUTH_URL}/dashboard/billing`,
  })

  return NextResponse.json({ portalUrl: portalSession.url })
}
```

- [ ] **Step 4: Create Stripe webhook handler**

Create `app/api/webhooks/stripe/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { db } from '@/lib/db'
import Stripe from 'stripe'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    if (session.mode === 'subscription' && session.customer) {
      const subscription = await stripe.subscriptions.retrieve(session.subscription as string)
      await db.user.update({
        where: { stripeCustomerId: session.customer as string },
        data: {
          subscriptionTier: 'PREMIUM',
          stripeSubscriptionId: subscription.id,
          subscriptionExpiresAt: new Date(subscription.current_period_end * 1000),
        },
      })
    }
  }

  if (event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object as Stripe.Subscription
    await db.user.update({
      where: { stripeCustomerId: subscription.customer as string },
      data: { subscriptionTier: 'FREE', stripeSubscriptionId: null, subscriptionExpiresAt: null },
    })
  }

  if (event.type === 'customer.subscription.updated') {
    const subscription = event.data.object as Stripe.Subscription
    await db.user.update({
      where: { stripeCustomerId: subscription.customer as string },
      data: { subscriptionExpiresAt: new Date(subscription.current_period_end * 1000) },
    })
  }

  return NextResponse.json({ received: true })
}
```

- [ ] **Step 5: Create billing page**

Create `app/(dashboard)/dashboard/billing/page.tsx`:

```tsx
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'

export default async function BillingPage() {
  const session = await auth()
  const user = await db.user.findUniqueOrThrow({ where: { id: session!.user.id } })
  const isPremium = user.subscriptionTier === 'PREMIUM'

  async function openPortal() {
    'use server'
    // Redirect handled client-side — see billing-actions below
  }

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-bold mb-6">Billing</h1>
      <div className="bg-white border rounded-xl p-6 mb-4">
        <p className="text-sm text-gray-500 mb-1">Current plan</p>
        <p className="text-xl font-bold">{isPremium ? 'Premium' : 'Free'}</p>
        {isPremium && user.subscriptionExpiresAt && (
          <p className="text-sm text-gray-500 mt-1">
            Renews {format(user.subscriptionExpiresAt, 'MMMM d, yyyy')}
          </p>
        )}
      </div>

      {isPremium ? (
        <form action={async () => {
          'use server'
          const { redirect } = await import('next/navigation')
          const res = await fetch(`${process.env.NEXTAUTH_URL}/api/stripe/portal`, {
            method: 'POST',
            headers: { Cookie: '' }, // handled by Stripe portal session with customer ID
          })
          const { portalUrl } = await res.json()
          redirect(portalUrl)
        }}>
          <Button type="submit" variant="outline">Manage subscription</Button>
        </form>
      ) : (
        <div className="space-y-3">
          <p className="text-gray-600">Upgrade to track unlimited deals and connect your bank account.</p>
          <div className="flex gap-3">
            <form action={async () => {
              'use server'
              const { redirect } = await import('next/navigation')
              const res = await fetch(`${process.env.NEXTAUTH_URL}/api/stripe/create-checkout`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ plan: 'annual' }),
              })
              const { checkoutUrl } = await res.json()
              redirect(checkoutUrl)
            }}>
              <Button type="submit">Upgrade — $29/year</Button>
            </form>
            <form action={async () => {
              'use server'
              const { redirect } = await import('next/navigation')
              const res = await fetch(`${process.env.NEXTAUTH_URL}/api/stripe/create-checkout`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ plan: 'monthly' }),
              })
              const { checkoutUrl } = await res.json()
              redirect(checkoutUrl)
            }}>
              <Button type="submit" variant="outline">$4/month</Button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
```

> **Note:** The server actions above call the API routes via internal fetch. A cleaner pattern in production is to call Stripe directly in the server action, but this reuses the existing API route logic.

- [ ] **Step 6: Create settings page**

Create `app/(dashboard)/dashboard/settings/page.tsx`:

```tsx
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

export default async function SettingsPage() {
  const session = await auth()
  const user = await db.user.findUniqueOrThrow({ where: { id: session!.user.id } })

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      <div className="bg-white border rounded-xl p-6 space-y-4">
        <div>
          <p className="text-sm text-gray-500">Email</p>
          <p className="font-medium">{user.email}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Alert lead days</p>
          <p className="font-medium">{user.alertLeadDays.join(', ')} days before deadline</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Timezone</p>
          <p className="font-medium">{user.timezone}</p>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 7: Verify type-check and build**

```bash
npx tsc --noEmit
npm run build
```

Expected: No type errors. Build succeeds.

- [ ] **Step 8: Commit**

```bash
git add lib/stripe.ts app/api/stripe/ app/api/webhooks/ app/\(dashboard\)/dashboard/billing/ app/\(dashboard\)/dashboard/settings/
git commit -m "feat: add Stripe billing — checkout, webhook, portal, and billing page"
```

---

## Task 13: Seed Data + Final Setup

**Files:**
- Create: `prisma/seed.ts`
- Create: `.env.example`

- [ ] **Step 1: Create seed data with demo deals**

Create `prisma/seed.ts`:

```typescript
import { PrismaClient } from '@prisma/client'
import { addMonths, subMonths } from 'date-fns'

const db = new PrismaClient()

async function main() {
  const user = await db.user.upsert({
    where: { email: 'demo@deadlinezero.dev' },
    update: {},
    create: {
      email: 'demo@deadlinezero.dev',
      name: 'Demo User',
      subscriptionTier: 'FREE',
    },
  })

  const today = new Date()

  await db.promoDeal.createMany({
    skipDuplicates: true,
    data: [
      {
        userId: user.id,
        merchantName: 'Best Buy',
        description: '65-inch OLED TV',
        issuingBank: 'CITIBANK',
        originalPurchaseAmountCents: 179900,
        currentBalanceCents: 126000,
        regularAprBps: 2699,
        promoStartDate: subMonths(today, 6),
        promoDeadline: addMonths(today, 3),
        promoDescription: '18 months no interest if paid in full',
        status: 'ACTIVE',
      },
      {
        userId: user.id,
        merchantName: 'CareCredit',
        description: 'Root canal + crown',
        issuingBank: 'CARECREDIT',
        originalPurchaseAmountCents: 320000,
        currentBalanceCents: 280000,
        regularAprBps: 2699,
        promoStartDate: subMonths(today, 2),
        promoDeadline: addMonths(today, 10),
        promoDescription: '12 months deferred interest',
        status: 'ACTIVE',
      },
    ],
  })

  console.log('Seed complete.')
}

main().catch(console.error).finally(() => db.$disconnect())
```

- [ ] **Step 2: Run seed**

```bash
npx prisma db seed
```

Expected: `Seed complete.`

- [ ] **Step 3: Create `.env.example`**

Create `.env.example`:

```bash
# Copy to .env.local and fill in your values

DATABASE_URL="postgresql://postgres.[project-ref]:[password]@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[project-ref]:[password]@aws-0-us-east-1.pooler.supabase.com:5432/postgres"

NEXTAUTH_SECRET="openssl rand -base64 32"
NEXTAUTH_URL="http://localhost:3000"

GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

STRIPE_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
STRIPE_MONTHLY_PRICE_ID="price_..."
STRIPE_ANNUAL_PRICE_ID="price_..."

RESEND_API_KEY=""
RESEND_FROM_EMAIL="alerts@yourdomain.com"

CRON_SECRET="generate-with-openssl-rand-hex-32"

UPSTASH_REDIS_REST_URL=""
UPSTASH_REDIS_REST_TOKEN=""
```

- [ ] **Step 4: Run full test suite**

```bash
npx jest
```

Expected: All 13 calculation tests pass.

- [ ] **Step 5: Run final type-check and build**

```bash
npx tsc --noEmit && npm run build
```

Expected: No errors. Build output in `.next/`.

- [ ] **Step 6: Final commit**

```bash
git add prisma/seed.ts .env.example
git commit -m "feat: add seed data, env example, and verify full build passes"
```

---

## Self-Review

**Spec coverage check:**

| Requirement | Task |
|---|---|
| Monthly payment calculation | Task 3 |
| Retroactive interest exposure | Task 3 |
| Days remaining | Task 3 |
| Payoff schedule / iCal export | Tasks 4, 6 |
| Magic link + Google OAuth | Task 5 |
| Auth middleware redirect | Task 5 |
| Deal CRUD (create, read, update, delete) | Task 6 |
| Free tier 2-deal limit | Task 6 |
| Payment logging + balance history | Task 6 |
| Mark deal paid off | Task 6 |
| Public `/api/calculate` + rate limiting | Task 7 |
| Dashboard deal cards sorted by urgency | Task 8 |
| Add/edit deal form (pre-populated from sessionStorage) | Task 9 |
| Deal detail page with payoff chart | Task 9 |
| Log payment page | Task 9 |
| Free calculator page | Task 10 |
| Marketing homepage | Task 10 |
| Pricing page | Task 10 |
| Alert email template | Task 11 |
| Vercel Cron 90/60/30/14/7-day alerts | Task 11 |
| Stripe checkout (monthly + annual) | Task 12 |
| Stripe webhook (upgrade/downgrade) | Task 12 |
| Stripe customer portal | Task 12 |
| Billing + settings pages | Task 12 |
| Seed data | Task 13 |

**Gaps flagged:**
- `/dashboard/connect` (Plaid Link page) — intentionally deferred to Plaid plan
- Blog SEO page (`/blog/deferred-interest-trap`) — not in MVP critical path; add as standalone page later
- Welcome email on deal creation — not implemented; can add a `sendWelcomeEmail` call in `POST /api/deals` using the same Resend client

**Placeholder scan:** No TBDs, TODOs, or "similar to Task N" references found.

**Type consistency:** `updateDealCachedFields` defined in Task 4 (`lib/calculations/cache-fields.ts`), used consistently in Tasks 6 and 7 via `import { updateDealCachedFields } from '@/lib/calculations/cache-fields'`. All amounts use `cents` suffix. `calculateMonthlyPaymentNeeded`, `calculateRetroInterestExposure`, `daysUntilDeadline`, `generatePayoffSchedule` signatures are consistent from Task 3/4 through all usage in Tasks 6, 7, 11.
