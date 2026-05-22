import { subDays } from 'date-fns'
import { calculateRetroInterestExposure } from '@/lib/calculations/retro-interest'

const today = new Date('2026-01-15')

describe('calculateRetroInterestExposure', () => {
  it('returns 0 when purchase was today', () => {
    expect(calculateRetroInterestExposure(120000, 2699, today, today)).toBe(0)
  })

  it('calculates full year of interest correctly', () => {
    // 365 days of 26.99% on $1200 (120000 cents)
    // 120000 * 0.2699 / 365 * 365 = 120000 * 0.2699 = 32388
    const purchaseDate = subDays(today, 365)
    expect(calculateRetroInterestExposure(120000, 2699, purchaseDate, today)).toBe(32388)
  })

  it('rounds to nearest cent', () => {
    // 1 day, $100 (10000 cents), 26.99% APR
    // 10000 * 0.2699 / 365 * 1 = 7.394... → round = 7
    const purchaseDate = subDays(today, 1)
    expect(calculateRetroInterestExposure(10000, 2699, purchaseDate, today)).toBe(7)
  })
})
