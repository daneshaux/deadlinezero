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
