import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import {
  calculateMonthlyPaymentNeeded,
  calculateRetroInterestExposure,
  daysUntilDeadline,
} from '@/lib/calculations'
import { ratelimit } from '@/lib/rate-limit'

const schema = z.object({
  originalPurchaseAmountCents: z.number().int().positive(),
  currentBalanceCents: z.number().int().nonnegative(),
  regularAprBps: z.number().int().positive().max(10000),
  promoStartDate: z.string().datetime(),
  promoDeadline: z.string().datetime(),
})

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') ?? req.headers.get('x-real-ip') ?? 'anonymous'
  const { success } = await ratelimit.limit(ip)
  if (!success) return NextResponse.json({ error: 'Rate limit exceeded. Try again in a minute.' }, { status: 429 })

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
