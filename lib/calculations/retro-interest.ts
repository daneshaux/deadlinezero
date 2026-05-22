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
