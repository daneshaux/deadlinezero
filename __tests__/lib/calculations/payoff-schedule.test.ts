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

  it('each entry has month, paymentCents, balanceCents fields', () => {
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

  it('handles zero balance', () => {
    const deadline = addMonths(today, 3)
    expect(generatePayoffSchedule(0, deadline, today)).toEqual([])
  })
})
