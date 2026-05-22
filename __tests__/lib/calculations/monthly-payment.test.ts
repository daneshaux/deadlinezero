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
