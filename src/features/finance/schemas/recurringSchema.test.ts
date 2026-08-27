import { describe, it, expect } from 'vitest'
import { createRecurringSchema, updateRecurringSchema } from './recurringSchema'

describe('recurringSchema', () => {
  it('validates a valid create recurring payload', () => {
    const validData = {
      wallet_id: '11111111-1111-4111-8111-111111111111',
      category_id: '22222222-2222-4222-8222-222222222222',
      type: 'expense',
      amount: 150000,
      frequency: 'monthly',
      start_date: '2026-09-01',
      auto_record: true,
      note: 'Netflix Subscription',
    }

    const result = createRecurringSchema.safeParse(validData)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.interval_count).toBe(1)
    }
  })

  it('rejects negative or zero amount', () => {
    const invalidData = {
      wallet_id: '11111111-1111-4111-8111-111111111111',
      type: 'expense',
      amount: 0,
      frequency: 'monthly',
      start_date: '2026-09-01',
    }

    const result = createRecurringSchema.safeParse(invalidData)
    expect(result.success).toBe(false)
  })

  it('rejects invalid frequency', () => {
    const invalidData = {
      wallet_id: '11111111-1111-4111-8111-111111111111',
      type: 'expense',
      amount: 100000,
      frequency: 'hourly',
      start_date: '2026-09-01',
    }

    const result = createRecurringSchema.safeParse(invalidData)
    expect(result.success).toBe(false)
  })

  it('validates update partial schema', () => {
    const updateData = {
      amount: 200000,
      is_active: false,
    }

    const result = updateRecurringSchema.safeParse(updateData)
    expect(result.success).toBe(true)
  })
})
