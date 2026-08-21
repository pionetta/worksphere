import { describe, it, expect } from 'vitest'
import { formatCurrency, formatAmount, parseAmount } from './currency'

describe('currency utilities', () => {
  describe('formatCurrency', () => {
    it('should format positive integer to IDR', () => {
      expect(formatCurrency(100000)).toBe('Rp100.000')
      expect(formatCurrency(1500000)).toBe('Rp1.500.000')
      expect(formatCurrency(500)).toBe('Rp500')
    })

    it('should format negative integer to IDR', () => {
      expect(formatCurrency(-100000)).toMatch(/^-Rp100\.000$/)
    })

    it('should format zero to IDR', () => {
      expect(formatCurrency(0)).toBe('Rp0')
    })
  })

  describe('formatAmount', () => {
    it('should format integer with dot separators', () => {
      expect(formatAmount(100000)).toBe('100.000')
      expect(formatAmount(1500000)).toBe('1.500.000')
      expect(formatAmount(500)).toBe('500')
    })

    it('should format negative integer with dot separators', () => {
      expect(formatAmount(-100000)).toBe('-100.000')
    })

    it('should format zero', () => {
      expect(formatAmount(0)).toBe('0')
    })
  })

  describe('parseAmount', () => {
    it('should parse formatted string back to integer', () => {
      expect(parseAmount('100.000')).toBe(100000)
      expect(parseAmount('1.500.000')).toBe(1500000)
    })

    it('should parse string with currency symbol', () => {
      expect(parseAmount('Rp100.000')).toBe(100000)
      expect(parseAmount('Rp 1.500.000')).toBe(1500000)
    })

    it('should handle invalid string by returning 0', () => {
      expect(parseAmount('')).toBe(0)
      expect(parseAmount('abc')).toBe(0)
    })

    it('should ignore non-digit characters', () => {
      expect(parseAmount('100a.b000')).toBe(100000)
    })
  })
})
