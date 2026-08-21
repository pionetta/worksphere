import { describe, it, expect } from 'vitest'
import { validate } from '@/lib/validation'
import {
  createIncomeSchema,
  createExpenseSchema,
  createAdjustmentSchema,
  updateTransactionNoteSchema,
  updateIncomeSchema,
  updateExpenseSchema,
} from './transactionSchema'

const validWalletId = '550e8400-e29b-41d4-a716-446655440000'
const validCategoryId = '660e8400-e29b-41d4-a716-446655440001'

describe('Transaction Schemas', () => {
  describe('createIncomeSchema', () => {
    it('should accept valid income', () => {
      const result = validate(createIncomeSchema, {
        wallet_id: validWalletId,
        category_id: validCategoryId,
        amount: 5000000,
        transaction_date: '2026-08-20',
      })
      expect(result.amount).toBe(5000000)
    })

    it('should accept null category_id', () => {
      const result = validate(createIncomeSchema, {
        wallet_id: validWalletId,
        category_id: null,
        amount: 5000000,
        transaction_date: '2026-08-20',
      })
      expect(result.category_id).toBeNull()
    })

    it('should reject zero amount', () => {
      expect(() =>
        validate(createIncomeSchema, {
          wallet_id: validWalletId,
          category_id: validCategoryId,
          amount: 0,
          transaction_date: '2026-08-20',
        })
      ).toThrow('Nominal harus lebih dari 0.')
    })

    it('should reject negative amount', () => {
      expect(() =>
        validate(createIncomeSchema, {
          wallet_id: validWalletId,
          category_id: validCategoryId,
          amount: -100000,
          transaction_date: '2026-08-20',
        })
      ).toThrow()
    })

    it('should reject non-integer amount', () => {
      expect(() =>
        validate(createIncomeSchema, {
          wallet_id: validWalletId,
          category_id: validCategoryId,
          amount: 100.5,
          transaction_date: '2026-08-20',
        })
      ).toThrow('Nominal harus berupa bilangan bulat.')
    })

    it('should reject empty wallet ID', () => {
      expect(() =>
        validate(createIncomeSchema, {
          wallet_id: '',
          category_id: validCategoryId,
          amount: 100000,
          transaction_date: '2026-08-20',
        })
      ).toThrow('ID tidak valid.')
    })

    it('should reject invalid date', () => {
      expect(() =>
        validate(createIncomeSchema, {
          wallet_id: validWalletId,
          category_id: validCategoryId,
          amount: 100000,
          transaction_date: 'not-a-date',
        })
      ).toThrow()
    })

    it('should reject non-existent date', () => {
      expect(() =>
        validate(createIncomeSchema, {
          wallet_id: validWalletId,
          category_id: validCategoryId,
          amount: 100000,
          transaction_date: '2026-02-30',
        })
      ).toThrow('Tanggal tidak valid.')
    })

    it('should accept note', () => {
      const result = validate(createIncomeSchema, {
        wallet_id: validWalletId,
        category_id: validCategoryId,
        amount: 100000,
        transaction_date: '2026-08-20',
        note: 'Gaji bulanan',
      })
      expect(result.note).toBe('Gaji bulanan')
    })
  })

  describe('createExpenseSchema', () => {
    it('should accept valid expense', () => {
      const result = validate(createExpenseSchema, {
        wallet_id: validWalletId,
        category_id: validCategoryId,
        amount: 50000,
        transaction_date: '2026-08-20',
      })
      expect(result.amount).toBe(50000)
    })

    it('should reject zero amount', () => {
      expect(() =>
        validate(createExpenseSchema, {
          wallet_id: validWalletId,
          category_id: validCategoryId,
          amount: 0,
          transaction_date: '2026-08-20',
        })
      ).toThrow('Nominal harus lebih dari 0.')
    })
  })

  describe('createAdjustmentSchema', () => {
    it('should accept positive adjustment', () => {
      const result = validate(createAdjustmentSchema, {
        wallet_id: validWalletId,
        amount: 100000,
        transaction_date: '2026-08-20',
      })
      expect(result.amount).toBe(100000)
    })

    it('should accept negative adjustment', () => {
      const result = validate(createAdjustmentSchema, {
        wallet_id: validWalletId,
        amount: -100000,
        transaction_date: '2026-08-20',
      })
      expect(result.amount).toBe(-100000)
    })

    it('should reject zero adjustment', () => {
      expect(() =>
        validate(createAdjustmentSchema, {
          wallet_id: validWalletId,
          amount: 0,
          transaction_date: '2026-08-20',
        })
      ).toThrow('Nominal tidak boleh 0.')
    })

    it('should reject non-integer amount', () => {
      expect(() =>
        validate(createAdjustmentSchema, {
          wallet_id: validWalletId,
          amount: 100.5,
          transaction_date: '2026-08-20',
        })
      ).toThrow('Nominal harus berupa bilangan bulat.')
    })
  })

  describe('updateTransactionNoteSchema', () => {
    it('should accept valid note', () => {
      const result = validate(updateTransactionNoteSchema, { note: 'Catatan baru' })
      expect(result.note).toBe('Catatan baru')
    })

    it('should accept null note', () => {
      const result = validate(updateTransactionNoteSchema, { note: null })
      expect(result.note).toBeNull()
    })

    it('should trim note', () => {
      const result = validate(updateTransactionNoteSchema, { note: '  Catatan  ' })
      expect(result.note).toBe('Catatan')
    })

    it('should reject note exceeding 500 characters', () => {
      expect(() => validate(updateTransactionNoteSchema, { note: 'A'.repeat(501) })).toThrow(
        'Catatan terlalu panjang.'
      )
    })
  })

  describe('updateIncomeSchema', () => {
    it('should accept valid update', () => {
      const result = validate(updateIncomeSchema, {
        wallet_id: validWalletId,
        category_id: validCategoryId,
        amount: 600000,
        transaction_date: '2026-08-21',
        note: 'Updated',
      })
      expect(result.amount).toBe(600000)
    })

    it('should reject zero amount', () => {
      expect(() =>
        validate(updateIncomeSchema, {
          wallet_id: validWalletId,
          category_id: null,
          amount: 0,
          transaction_date: '2026-08-20',
        })
      ).toThrow('Nominal harus lebih dari 0.')
    })

    it('should accept null category_id', () => {
      const result = validate(updateIncomeSchema, {
        wallet_id: validWalletId,
        category_id: null,
        amount: 100000,
        transaction_date: '2026-08-20',
      })
      expect(result.category_id).toBeNull()
    })
  })

  describe('updateExpenseSchema', () => {
    it('should accept valid update', () => {
      const result = validate(updateExpenseSchema, {
        wallet_id: validWalletId,
        category_id: validCategoryId,
        amount: 75000,
        transaction_date: '2026-08-21',
      })
      expect(result.amount).toBe(75000)
    })

    it('should reject negative amount', () => {
      expect(() =>
        validate(updateExpenseSchema, {
          wallet_id: validWalletId,
          category_id: null,
          amount: -100,
          transaction_date: '2026-08-20',
        })
      ).toThrow()
    })
  })
})
