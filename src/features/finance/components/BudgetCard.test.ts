import { describe, it, expect } from 'vitest'
import { getBudgetStatus } from '@/features/finance/components/BudgetCard'

describe('BudgetCard — getBudgetStatus', () => {
  describe('Normal status', () => {
    it('should return normal when spent is 0', () => {
      expect(getBudgetStatus(0, 1000000)).toBe('normal')
    })

    it('should return normal when spent < 80% of budget', () => {
      expect(getBudgetStatus(700000, 1000000)).toBe('normal')
    })

    it('should return normal when spent is 79% of budget', () => {
      expect(getBudgetStatus(790000, 1000000)).toBe('normal')
    })

    it('should return normal when budget is 0', () => {
      expect(getBudgetStatus(0, 0)).toBe('normal')
    })
  })

  describe('Warning status (hampir habis)', () => {
    it('should return warning when spent is 80% of budget', () => {
      expect(getBudgetStatus(800000, 1000000)).toBe('warning')
    })

    it('should return warning when spent is 90% of budget', () => {
      expect(getBudgetStatus(900000, 1000000)).toBe('warning')
    })

    it('should return warning when spent is 99% of budget', () => {
      expect(getBudgetStatus(990000, 1000000)).toBe('warning')
    })
  })

  describe('Exceeded status (terlampaui)', () => {
    it('should return exceeded when spent equals budget', () => {
      expect(getBudgetStatus(1000000, 1000000)).toBe('exceeded')
    })

    it('should return exceeded when spent exceeds budget', () => {
      expect(getBudgetStatus(1200000, 1000000)).toBe('exceeded')
    })

    it('should return exceeded when spent far exceeds budget', () => {
      expect(getBudgetStatus(5000000, 1000000)).toBe('exceeded')
    })
  })

  describe('Edge cases', () => {
    it('should handle very small budget', () => {
      expect(getBudgetStatus(80, 100)).toBe('warning')
      expect(getBudgetStatus(100, 100)).toBe('exceeded')
    })

    it('should handle negative spent (should not happen but be safe)', () => {
      expect(getBudgetStatus(-100, 1000000)).toBe('normal')
    })

    it('should handle zero spent on zero budget', () => {
      expect(getBudgetStatus(0, 0)).toBe('normal')
    })

    it('should handle spent exactly at boundary (79.999%)', () => {
      expect(getBudgetStatus(799990, 1000000)).toBe('normal')
    })

    it('should handle spent exactly at boundary (80.001%)', () => {
      expect(getBudgetStatus(800010, 1000000)).toBe('warning')
    })
  })
})

describe('BudgetCard Status Config', () => {
  it('should have correct label for normal', async () => {
    const { STATUS_CONFIG } = await import('@/features/finance/components/BudgetCard')
    expect(STATUS_CONFIG.normal.label).toBe('Normal')
    expect(STATUS_CONFIG.normal.variant).toBe('success')
  })

  it('should have correct label for warning', async () => {
    const { STATUS_CONFIG } = await import('@/features/finance/components/BudgetCard')
    expect(STATUS_CONFIG.warning.label).toBe('Hampir habis')
    expect(STATUS_CONFIG.warning.variant).toBe('warning')
  })

  it('should have correct label for exceeded', async () => {
    const { STATUS_CONFIG } = await import('@/features/finance/components/BudgetCard')
    expect(STATUS_CONFIG.exceeded.label).toBe('Terlampaui')
    expect(STATUS_CONFIG.exceeded.variant).toBe('danger')
  })
})
