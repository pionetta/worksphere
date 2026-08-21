import { describe, it, expect } from 'vitest'
import { validate } from '@/lib/validation'
import { createBudgetSchema, updateBudgetSchema } from './budgetSchema'

const validCategoryId = '550e8400-e29b-41d4-a716-446655440000'

describe('Budget Schemas', () => {
  describe('createBudgetSchema', () => {
    it('should accept valid budget', () => {
      const result = validate(createBudgetSchema, {
        category_id: validCategoryId,
        amount: 1000000,
        month: 8,
        year: 2026,
      })
      expect(result.amount).toBe(1000000)
      expect(result.month).toBe(8)
    })

    it('should reject zero amount', () => {
      expect(() =>
        validate(createBudgetSchema, {
          category_id: validCategoryId,
          amount: 0,
          month: 8,
          year: 2026,
        })
      ).toThrow('Nominal harus lebih dari 0.')
    })

    it('should reject negative amount', () => {
      expect(() =>
        validate(createBudgetSchema, {
          category_id: validCategoryId,
          amount: -100000,
          month: 8,
          year: 2026,
        })
      ).toThrow()
    })

    it('should reject non-integer amount', () => {
      expect(() =>
        validate(createBudgetSchema, {
          category_id: validCategoryId,
          amount: 1000.5,
          month: 8,
          year: 2026,
        })
      ).toThrow('Nominal harus berupa bilangan bulat.')
    })

    it('should reject month < 1', () => {
      expect(() =>
        validate(createBudgetSchema, {
          category_id: validCategoryId,
          amount: 1000000,
          month: 0,
          year: 2026,
        })
      ).toThrow('Bulan harus antara 1–12.')
    })

    it('should reject month > 12', () => {
      expect(() =>
        validate(createBudgetSchema, {
          category_id: validCategoryId,
          amount: 1000000,
          month: 13,
          year: 2026,
        })
      ).toThrow('Bulan harus antara 1–12.')
    })

    it('should reject year < 2000', () => {
      expect(() =>
        validate(createBudgetSchema, {
          category_id: validCategoryId,
          amount: 1000000,
          month: 8,
          year: 1999,
        })
      ).toThrow('Tahun tidak valid.')
    })

    it('should reject year > 2100', () => {
      expect(() =>
        validate(createBudgetSchema, {
          category_id: validCategoryId,
          amount: 1000000,
          month: 8,
          year: 2101,
        })
      ).toThrow('Tahun tidak valid.')
    })

    it('should reject empty category ID', () => {
      expect(() =>
        validate(createBudgetSchema, {
          category_id: '',
          amount: 1000000,
          month: 8,
          year: 2026,
        })
      ).toThrow('ID tidak valid.')
    })

    it('should accept note', () => {
      const result = validate(createBudgetSchema, {
        category_id: validCategoryId,
        amount: 1000000,
        month: 8,
        year: 2026,
        note: 'Budget makan bulanan',
      })
      expect(result.note).toBe('Budget makan bulanan')
    })
  })

  describe('updateBudgetSchema', () => {
    it('should accept valid update', () => {
      const result = validate(updateBudgetSchema, { amount: 2000000 })
      expect(result.amount).toBe(2000000)
    })

    it('should accept empty update', () => {
      const result = validate(updateBudgetSchema, {})
      expect(result).toEqual({})
    })

    it('should reject zero amount on update', () => {
      expect(() => validate(updateBudgetSchema, { amount: 0 })).toThrow()
    })

    it('should reject negative amount on update', () => {
      expect(() => validate(updateBudgetSchema, { amount: -100 })).toThrow()
    })
  })
})
