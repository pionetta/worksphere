import { describe, it, expect } from 'vitest'
import { validate } from '@/lib/validation'
import {
  createSavingsGoalSchema,
  updateSavingsGoalSchema,
  addToSavingsSchema,
} from './savingsSchema'

describe('Savings Goal Schemas', () => {
  describe('createSavingsGoalSchema', () => {
    it('should accept valid savings goal', () => {
      const result = validate(createSavingsGoalSchema, {
        name: 'Dana Darurat',
        target_amount: 10000000,
      })
      expect(result.name).toBe('Dana Darurat')
      expect(result.target_amount).toBe(10000000)
      expect(result.current_amount).toBe(0)
    })

    it('should trim name', () => {
      const result = validate(createSavingsGoalSchema, {
        name: '  Dana Darurat  ',
        target_amount: 10000000,
      })
      expect(result.name).toBe('Dana Darurat')
    })

    it('should reject empty name', () => {
      expect(() =>
        validate(createSavingsGoalSchema, { name: '', target_amount: 10000000 })
      ).toThrow('Nama target tabungan wajib diisi.')
    })

    it('should reject whitespace-only name', () => {
      expect(() =>
        validate(createSavingsGoalSchema, { name: '   ', target_amount: 10000000 })
      ).toThrow('Nama target tabungan wajib diisi.')
    })

    it('should reject zero target', () => {
      expect(() =>
        validate(createSavingsGoalSchema, { name: 'Dana Darurat', target_amount: 0 })
      ).toThrow('Target harus lebih dari 0.')
    })

    it('should reject negative target', () => {
      expect(() =>
        validate(createSavingsGoalSchema, { name: 'Dana Darurat', target_amount: -1000 })
      ).toThrow()
    })

    it('should reject non-integer target', () => {
      expect(() =>
        validate(createSavingsGoalSchema, { name: 'Dana Darurat', target_amount: 1000.5 })
      ).toThrow('Target harus berupa bilangan bulat.')
    })

    it('should accept valid deadline', () => {
      const result = validate(createSavingsGoalSchema, {
        name: 'Dana Darurat',
        target_amount: 10000000,
        deadline: '2026-12-31',
      })
      expect(result.deadline).toBe('2026-12-31')
    })

    it('should reject invalid deadline date', () => {
      expect(() =>
        validate(createSavingsGoalSchema, {
          name: 'Dana Darurat',
          target_amount: 10000000,
          deadline: '2026-02-30',
        })
      ).toThrow('Tanggal tidak valid.')
    })

    it('should accept null deadline', () => {
      const result = validate(createSavingsGoalSchema, {
        name: 'Dana Darurat',
        target_amount: 10000000,
        deadline: null,
      })
      expect(result.deadline).toBeNull()
    })

    it('should accept note', () => {
      const result = validate(createSavingsGoalSchema, {
        name: 'Dana Darurat',
        target_amount: 10000000,
        note: 'Untuk kondisi darurat',
      })
      expect(result.note).toBe('Untuk kondisi darurat')
    })
  })

  describe('updateSavingsGoalSchema', () => {
    it('should accept valid update', () => {
      const result = validate(updateSavingsGoalSchema, { name: 'Dana Liburan' })
      expect(result.name).toBe('Dana Liburan')
    })

    it('should accept empty update', () => {
      const result = validate(updateSavingsGoalSchema, {})
      expect(result).toEqual({})
    })

    it('should reject empty name on update', () => {
      expect(() => validate(updateSavingsGoalSchema, { name: '' })).toThrow()
    })

    it('should reject negative current amount on update', () => {
      expect(() => validate(updateSavingsGoalSchema, { current_amount: -1000 })).toThrow(
        'Saldo tidak boleh negatif.'
      )
    })
  })

  describe('addToSavingsSchema', () => {
    it('should accept valid amount', () => {
      const result = validate(addToSavingsSchema, { amount: 500000 })
      expect(result.amount).toBe(500000)
    })

    it('should reject zero amount', () => {
      expect(() => validate(addToSavingsSchema, { amount: 0 })).toThrow(
        'Nominal harus lebih dari 0.'
      )
    })

    it('should reject negative amount', () => {
      expect(() => validate(addToSavingsSchema, { amount: -100 })).toThrow()
    })

    it('should reject non-integer amount', () => {
      expect(() => validate(addToSavingsSchema, { amount: 100.5 })).toThrow(
        'Nominal harus berupa bilangan bulat.'
      )
    })
  })
})
