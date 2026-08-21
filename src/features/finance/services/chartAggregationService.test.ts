import { describe, it, expect } from 'vitest'
import { aggregateIncomeExpenseByDay, aggregateExpenseByCategory } from './chartAggregationService'
import type { Transaction } from '@/types'

function makeTx(overrides: Partial<Transaction>): Transaction {
  return {
    id: 'tx-1',
    user_id: 'user-1',
    wallet_id: 'wallet-1',
    type: 'income',
    amount: 100000,
    category_id: 'cat-1',
    transaction_date: '2026-08-15',
    note: null,
    transfer_group_id: null,
    created_at: '2026-08-15T10:00:00.000Z',
    updated_at: '2026-08-15T10:00:00.000Z',
    deleted_at: null,
    ...overrides,
  }
}

describe('aggregateIncomeExpenseByDay', () => {
  it('should return 31 days for August', () => {
    const result = aggregateIncomeExpenseByDay([], 2026, 8)
    expect(result.incomeByDay).toHaveLength(31)
    expect(result.expenseByDay).toHaveLength(31)
  })

  it('should return 28 days for February non-leap year', () => {
    const result = aggregateIncomeExpenseByDay([], 2026, 2)
    expect(result.incomeByDay).toHaveLength(28)
  })

  it('should return 29 days for February leap year', () => {
    const result = aggregateIncomeExpenseByDay([], 2028, 2)
    expect(result.incomeByDay).toHaveLength(29)
  })

  it('should aggregate income by day', () => {
    const txs = [
      makeTx({ id: 't1', type: 'income', amount: 50000, transaction_date: '2026-08-15' }),
      makeTx({ id: 't2', type: 'income', amount: 30000, transaction_date: '2026-08-15' }),
      makeTx({ id: 't3', type: 'income', amount: 20000, transaction_date: '2026-08-20' }),
    ]

    const result = aggregateIncomeExpenseByDay(txs, 2026, 8)
    const day15 = result.incomeByDay.find(d => d.date === '15')
    const day20 = result.incomeByDay.find(d => d.date === '20')

    expect(day15!.amount).toBe(80000)
    expect(day20!.amount).toBe(20000)
  })

  it('should aggregate expense by day', () => {
    const txs = [
      makeTx({ id: 't1', type: 'expense', amount: 100000, transaction_date: '2026-08-10' }),
      makeTx({ id: 't2', type: 'expense', amount: 50000, transaction_date: '2026-08-10' }),
    ]

    const result = aggregateIncomeExpenseByDay(txs, 2026, 8)
    const day10 = result.expenseByDay.find(d => d.date === '10')
    expect(day10!.amount).toBe(150000)
  })

  it('should ignore transactions from other months', () => {
    const txs = [
      makeTx({ id: 't1', type: 'income', amount: 50000, transaction_date: '2026-07-15' }),
      makeTx({ id: 't2', type: 'income', amount: 30000, transaction_date: '2026-09-15' }),
    ]

    const result = aggregateIncomeExpenseByDay(txs, 2026, 8)
    const totalIncome = result.incomeByDay.reduce((s, d) => s + d.amount, 0)
    expect(totalIncome).toBe(0)
  })

  it('should ignore deleted transactions', () => {
    const txs = [
      makeTx({
        id: 't1',
        type: 'income',
        amount: 50000,
        transaction_date: '2026-08-15',
        deleted_at: '2026-08-16T10:00:00.000Z',
      }),
    ]

    const result = aggregateIncomeExpenseByDay(txs, 2026, 8)
    const totalIncome = result.incomeByDay.reduce((s, d) => s + d.amount, 0)
    expect(totalIncome).toBe(0)
  })

  it('should ignore transfer and adjustment transactions', () => {
    const txs = [
      makeTx({ id: 't1', type: 'transfer_in', amount: 50000, transaction_date: '2026-08-15' }),
      makeTx({ id: 't2', type: 'transfer_out', amount: 30000, transaction_date: '2026-08-15' }),
      makeTx({ id: 't3', type: 'adjustment', amount: 10000, transaction_date: '2026-08-15' }),
    ]

    const result = aggregateIncomeExpenseByDay(txs, 2026, 8)
    const totalIncome = result.incomeByDay.reduce((s, d) => s + d.amount, 0)
    const totalExpense = result.expenseByDay.reduce((s, d) => s + d.amount, 0)
    expect(totalIncome).toBe(0)
    expect(totalExpense).toBe(0)
  })

  it('should fill zeros for days with no transactions', () => {
    const txs = [
      makeTx({ id: 't1', type: 'income', amount: 50000, transaction_date: '2026-08-05' }),
    ]

    const result = aggregateIncomeExpenseByDay(txs, 2026, 8)
    const day1 = result.incomeByDay.find(d => d.date === '01')
    const day5 = result.incomeByDay.find(d => d.date === '05')
    expect(day1!.amount).toBe(0)
    expect(day5!.amount).toBe(50000)
  })
})

describe('aggregateExpenseByCategory', () => {
  const categoryMap: Record<string, string> = {
    'cat-food': 'Makanan',
    'cat-transport': 'Transportasi',
    'cat-utility': 'Utilitas',
  }

  it('should aggregate expenses by category', () => {
    const txs = [
      makeTx({ id: 't1', type: 'expense', amount: 50000, category_id: 'cat-food' }),
      makeTx({ id: 't2', type: 'expense', amount: 30000, category_id: 'cat-food' }),
      makeTx({ id: 't3', type: 'expense', amount: 20000, category_id: 'cat-transport' }),
    ]

    const result = aggregateExpenseByCategory(txs, categoryMap)
    expect(result).toHaveLength(2)
    expect(result[0].categoryName).toBe('Makanan')
    expect(result[0].amount).toBe(80000)
    expect(result[0].percentage).toBe(80)
    expect(result[1].categoryName).toBe('Transportasi')
    expect(result[1].amount).toBe(20000)
    expect(result[1].percentage).toBe(20)
  })

  it('should sort by amount descending', () => {
    const txs = [
      makeTx({ id: 't1', type: 'expense', amount: 10000, category_id: 'cat-food' }),
      makeTx({ id: 't2', type: 'expense', amount: 90000, category_id: 'cat-transport' }),
    ]

    const result = aggregateExpenseByCategory(txs, categoryMap)
    expect(result[0].categoryName).toBe('Transportasi')
    expect(result[1].categoryName).toBe('Makanan')
  })

  it('should handle transactions with null category_id', () => {
    const txs = [makeTx({ id: 't1', type: 'expense', amount: 40000, category_id: null })]

    const result = aggregateExpenseByCategory(txs, categoryMap)
    expect(result).toHaveLength(1)
    expect(result[0].categoryName).toBe('Tanpa Kategori')
    expect(result[0].percentage).toBe(100)
  })

  it('should handle unknown category_id', () => {
    const txs = [makeTx({ id: 't1', type: 'expense', amount: 40000, category_id: 'cat-unknown' })]

    const result = aggregateExpenseByCategory(txs, categoryMap)
    expect(result).toHaveLength(1)
    expect(result[0].categoryName).toBe('Lainnya')
  })

  it('should ignore income transactions', () => {
    const txs = [
      makeTx({ id: 't1', type: 'income', amount: 50000, category_id: 'cat-food' }),
      makeTx({ id: 't2', type: 'expense', amount: 30000, category_id: 'cat-food' }),
    ]

    const result = aggregateExpenseByCategory(txs, categoryMap)
    expect(result).toHaveLength(1)
    expect(result[0].amount).toBe(30000)
  })

  it('should ignore deleted transactions', () => {
    const txs = [
      makeTx({
        id: 't1',
        type: 'expense',
        amount: 50000,
        category_id: 'cat-food',
        deleted_at: '2026-08-16T10:00:00.000Z',
      }),
    ]

    const result = aggregateExpenseByCategory(txs, categoryMap)
    expect(result).toHaveLength(0)
  })

  it('should return empty array for no expenses', () => {
    const result = aggregateExpenseByCategory([], categoryMap)
    expect(result).toHaveLength(0)
  })

  it('should calculate percentage correctly with multiple categories', () => {
    const txs = [
      makeTx({ id: 't1', type: 'expense', amount: 25000, category_id: 'cat-food' }),
      makeTx({ id: 't2', type: 'expense', amount: 25000, category_id: 'cat-transport' }),
      makeTx({ id: 't3', type: 'expense', amount: 50000, category_id: 'cat-utility' }),
    ]

    const result = aggregateExpenseByCategory(txs, categoryMap)
    expect(result[0].percentage).toBe(50)
    expect(result[1].percentage).toBe(25)
    expect(result[2].percentage).toBe(25)
  })
})
