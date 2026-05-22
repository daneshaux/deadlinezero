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
