import { describe, it, expect } from 'vitest'
import { createDebtSchema, updateDebtSchema, payDebtSchema } from './debtSchema'

describe('createDebtSchema', () => {
  it('should validate valid debt input', () => {
    const input = {
      type: 'debt',
      person_name: 'Budi Santoso',
      amount: 500000,
      due_date: '2026-09-01',
      note: 'Pinjaman modal usaha',
    }
    const result = createDebtSchema.safeParse(input)
    expect(result.success).toBe(true)
  })

  it('should validate valid receivable input', () => {
    const input = {
      type: 'receivable',
      person_name: 'Siti Aminah',
      amount: 250000,
    }
    const result = createDebtSchema.safeParse(input)
    expect(result.success).toBe(true)
  })

  it('should fail when person_name is empty', () => {
    const input = {
      type: 'debt',
      person_name: '   ',
      amount: 100000,
    }
    const result = createDebtSchema.safeParse(input)
    expect(result.success).toBe(false)
  })

  it('should fail when amount is 0 or negative', () => {
    const resultZero = createDebtSchema.safeParse({
      type: 'debt',
      person_name: 'Budi',
      amount: 0,
    })
    expect(resultZero.success).toBe(false)

    const resultNeg = createDebtSchema.safeParse({
      type: 'debt',
      person_name: 'Budi',
      amount: -50000,
    })
    expect(resultNeg.success).toBe(false)
  })
})

describe('updateDebtSchema', () => {
  it('should allow partial updates', () => {
    const result = updateDebtSchema.safeParse({
      person_name: 'Budi Updated',
      amount: 600000,
    })
    expect(result.success).toBe(true)
  })
})

describe('payDebtSchema', () => {
  it('should validate positive payment amount', () => {
    const result = payDebtSchema.safeParse({ amount: 150000 })
    expect(result.success).toBe(true)
  })

  it('should fail when payment amount is <= 0', () => {
    const resultZero = payDebtSchema.safeParse({ amount: 0 })
    expect(resultZero.success).toBe(false)

    const resultNeg = payDebtSchema.safeParse({ amount: -10000 })
    expect(resultNeg.success).toBe(false)
  })
})
