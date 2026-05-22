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
