import { addMonths, startOfMonth, differenceInCalendarMonths } from 'date-fns'
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
  if (currentBalanceCents <= 0) return []

  const monthsRemaining = differenceInCalendarMonths(promoDeadline, today)
  if (monthsRemaining <= 0) return []

  const monthlyPayment = calculateMonthlyPaymentNeeded(currentBalanceCents, promoDeadline, today)

  const schedule: PayoffMonth[] = []
  let remaining = currentBalanceCents

  for (let i = 1; i <= monthsRemaining; i++) {
    const payment = Math.min(monthlyPayment, remaining)
    remaining = Math.max(0, remaining - payment)
    schedule.push({
      month: addMonths(startOfMonth(today), i),
      paymentCents: payment,
      balanceCents: remaining,
    })
  }

  return schedule
}
