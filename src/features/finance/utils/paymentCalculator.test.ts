import { describe, it, expect } from 'vitest'
import { calculateTargetBreakdown } from './paymentCalculator'

describe('paymentCalculator', () => {
  it('should return null for invalid target or deadline', () => {
    expect(calculateTargetBreakdown(0, '2026-12-31')).toBeNull()
    expect(calculateTargetBreakdown(-100, '2026-12-31')).toBeNull()
    expect(calculateTargetBreakdown(1000000, null)).toBeNull()
    expect(calculateTargetBreakdown(1000000, '')).toBeNull()
    expect(calculateTargetBreakdown(1000000, 'invalid-date')).toBeNull()
  })

  it('should correctly calculate targets for 12 months with number of months', () => {
    const breakdown = calculateTargetBreakdown(1200000, 12)
    expect(breakdown).not.toBeNull()
    if (breakdown) {
      expect(breakdown.months).toBe(12)
      expect(breakdown.perMonth).toBe(100000)
      expect(breakdown.perDay).toBeGreaterThan(0)
      expect(breakdown.perWeek).toBeGreaterThan(0)
    }
  })

  it('should correctly calculate targets given a future deadline date', () => {
    const baseDate = new Date('2026-01-01T00:00:00Z')
    const deadline = '2026-01-11' // 10 days
    const breakdown = calculateTargetBreakdown(100000, deadline, baseDate)

    expect(breakdown).not.toBeNull()
    if (breakdown) {
      expect(breakdown.days).toBe(10)
      expect(breakdown.perDay).toBe(10000)
      expect(breakdown.isExpired).toBe(false)
    }
  })

  it('should handle past deadlines gracefully as expired', () => {
    const baseDate = new Date('2026-05-01T00:00:00Z')
    const pastDeadline = '2026-01-01'
    const breakdown = calculateTargetBreakdown(500000, pastDeadline, baseDate)

    expect(breakdown).not.toBeNull()
    if (breakdown) {
      expect(breakdown.isExpired).toBe(true)
      expect(breakdown.perDay).toBe(500000)
    }
  })
})
