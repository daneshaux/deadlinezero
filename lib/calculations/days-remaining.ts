import { differenceInCalendarDays } from 'date-fns'

export function daysUntilDeadline(promoDeadline: Date, today: Date = new Date()): number {
  return differenceInCalendarDays(promoDeadline, today)
}
