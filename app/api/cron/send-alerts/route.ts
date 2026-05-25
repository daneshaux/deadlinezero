import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { resend } from '@/lib/resend'
import { render } from '@react-email/render'
import { DeadlineAlertEmail } from '@/emails/deadline-alert'
import {
  calculateMonthlyPaymentNeeded,
  calculateRetroInterestExposure,
  daysUntilDeadline,
} from '@/lib/calculations'
type AlertType = 'DAYS_90' | 'DAYS_60' | 'DAYS_30' | 'DAYS_14' | 'DAYS_7'

type AlertRecord = { alertType: string; sentAt: Date | null }

const ALERT_THRESHOLDS: Record<number, AlertType> = {
  90: 'DAYS_90',
  60: 'DAYS_60',
  30: 'DAYS_30',
  14: 'DAYS_14',
  7: 'DAYS_7',
}

export async function GET(req: NextRequest) {
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

    // Find the smallest user-configured threshold that this deal qualifies for
    const qualifyingThreshold = deal.user.alertLeadDays
      .filter((d: number) => days <= d && ALERT_THRESHOLDS[d] !== undefined)
      .sort((a: number, b: number) => a - b)[0]

    if (qualifyingThreshold === undefined) continue

    const alertType = ALERT_THRESHOLDS[qualifyingThreshold]

    const alreadySent = deal.alerts.some((a: AlertRecord) => a.alertType === alertType && a.sentAt !== null)
    if (alreadySent) continue

    const monthlyPaymentNeededCents = calculateMonthlyPaymentNeeded(
      deal.currentBalanceCents,
      deal.promoDeadline,
      today
    )
    const retroInterestExposureCents = calculateRetroInterestExposure(
      deal.originalPurchaseAmountCents,
      deal.regularAprBps,
      deal.promoStartDate,
      today
    )

    const html = await render(
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
      subject: `${days} days left — pay $${(monthlyPaymentNeededCents / 100).toFixed(2)}/month to avoid $${(retroInterestExposureCents / 100).toFixed(2)} on your ${deal.merchantName} deal`,
      html,
    })

    await db.alert.upsert({
      where: { dealId_alertType: { dealId: deal.id, alertType } },
      update: { sentAt: today, emailMessageId: data?.id ?? null },
      create: {
        userId: deal.userId,
        dealId: deal.id,
        alertType,
        scheduledFor: today,
        sentAt: today,
        emailMessageId: data?.id ?? null,
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
