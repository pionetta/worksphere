import { describe, it, expect } from 'vitest'
import {
  filterTransactions,
  sortTransactions,
  DEFAULT_FILTERS,
} from '@/features/finance/utils/transactionFilters'
import type { Transaction } from '@/types'

function makeTx(overrides: Partial<Transaction> = {}): Transaction {
  return {
    id: crypto.randomUUID(),
    user_id: 'user-1',
    wallet_id: 'wallet-1',
    type: 'expense',
    amount: 100000,
    category_id: 'cat-1',
    transaction_date: '2026-08-20',
    note: 'Test note',
    transfer_group_id: null,
    deleted_at: null,
    created_at: '2026-08-20T00:00:00Z',
    updated_at: '2026-08-20T00:00:00Z',
    ...overrides,
  }
}

const currentMonth = new Date().toISOString().slice(0, 7)

const transactions: Transaction[] = [
  makeTx({
    id: '1',
    type: 'expense',
    amount: 50000,
    category_id: 'cat-food',
    wallet_id: 'w1',
    transaction_date: `${currentMonth}-20`,
    note: 'Makan siang',
  }),
  makeTx({
    id: '2',
    type: 'income',
    amount: 5000000,
    category_id: 'cat-salary',
    wallet_id: 'w1',
    transaction_date: `${currentMonth}-01`,
    note: 'Gaji bulanan',
  }),
  makeTx({
    id: '3',
    type: 'expense',
    amount: 200000,
    category_id: 'cat-transport',
    wallet_id: 'w2',
    transaction_date: `${currentMonth}-15`,
    note: 'Bensin motor',
  }),
  makeTx({
    id: '4',
    type: 'transfer_in',
    amount: 300000,
    category_id: null,
    wallet_id: 'w1',
    transaction_date: '2026-07-25',
    note: 'Transfer dari BCA',
  }),
  makeTx({
    id: '5',
    type: 'adjustment',
    amount: 100000,
    category_id: null,
    wallet_id: 'w1',
    transaction_date: '2026-06-10',
    note: 'Koreksi saldo',
  }),
]

describe('Transaction Filters', () => {
  describe('Default filters', () => {
    it('should return all transactions with default filters', () => {
      const result = filterTransactions(transactions, DEFAULT_FILTERS)
      expect(result).toHaveLength(transactions.length)
    })
  })

  describe('Date filter', () => {
    it('should filter by today', () => {
      const today = new Date().toISOString().slice(0, 10)
      const tx = [makeTx({ transaction_date: today }), makeTx({ transaction_date: '2026-01-01' })]
      const result = filterTransactions(tx, { ...DEFAULT_FILTERS, dateRange: 'today' })
      expect(result).toHaveLength(1)
    })

    it('should filter by month', () => {
      const result = filterTransactions(transactions, {
        ...DEFAULT_FILTERS,
        dateRange: 'month',
      })
      expect(result.every(t => t.transaction_date.startsWith(currentMonth))).toBe(true)
    })

    it('should filter by custom date range', () => {
      const result = filterTransactions(transactions, {
        ...DEFAULT_FILTERS,
        dateRange: 'custom',
        startDate: `${currentMonth}-15`,
        endDate: `${currentMonth}-20`,
      })
      expect(result).toHaveLength(2)
      expect(result.map(t => t.id).sort()).toEqual(['1', '3'])
    })
  })

  describe('Category filter', () => {
    it('should filter by category', () => {
      const result = filterTransactions(transactions, {
        ...DEFAULT_FILTERS,
        categoryId: 'cat-food',
      })
      expect(result).toHaveLength(1)
      expect(result[0].id).toBe('1')
    })

    it('should return empty when category has no matches', () => {
      const result = filterTransactions(transactions, {
        ...DEFAULT_FILTERS,
        categoryId: 'nonexistent',
      })
      expect(result).toHaveLength(0)
    })
  })

  describe('Wallet filter', () => {
    it('should filter by wallet', () => {
      const result = filterTransactions(transactions, {
        ...DEFAULT_FILTERS,
        walletId: 'w2',
      })
      expect(result).toHaveLength(1)
      expect(result[0].id).toBe('3')
    })
  })

  describe('Type filter', () => {
    it('should filter by income', () => {
      const result = filterTransactions(transactions, {
        ...DEFAULT_FILTERS,
        type: 'income',
      })
      expect(result).toHaveLength(1)
      expect(result[0].type).toBe('income')
    })

    it('should filter by expense', () => {
      const result = filterTransactions(transactions, {
        ...DEFAULT_FILTERS,
        type: 'expense',
      })
      expect(result).toHaveLength(2)
      result.forEach(t => expect(t.type).toBe('expense'))
    })

    it('should filter by transfer (includes transfer_in and transfer_out)', () => {
      const result = filterTransactions(transactions, {
        ...DEFAULT_FILTERS,
        type: 'transfer',
      })
      expect(result).toHaveLength(1)
      expect(result[0].type).toBe('transfer_in')
    })

    it('should filter by adjustment', () => {
      const result = filterTransactions(transactions, {
        ...DEFAULT_FILTERS,
        type: 'adjustment',
      })
      expect(result).toHaveLength(1)
      expect(result[0].type).toBe('adjustment')
    })
  })

  describe('Search', () => {
    it('should search by note', () => {
      const result = filterTransactions(transactions, {
        ...DEFAULT_FILTERS,
        search: 'siang',
      })
      expect(result).toHaveLength(1)
      expect(result[0].id).toBe('1')
    })

    it('should be case insensitive', () => {
      const result = filterTransactions(transactions, {
        ...DEFAULT_FILTERS,
        search: 'GAJI',
      })
      expect(result).toHaveLength(1)
      expect(result[0].id).toBe('2')
    })

    it('should handle empty search', () => {
      const result = filterTransactions(transactions, {
        ...DEFAULT_FILTERS,
        search: '',
      })
      expect(result).toHaveLength(5)
    })

    it('should handle whitespace-only search', () => {
      const result = filterTransactions(transactions, {
        ...DEFAULT_FILTERS,
        search: '   ',
      })
      expect(result).toHaveLength(5)
    })
  })

  describe('Sorting', () => {
    it('should sort by newest first (default)', () => {
      const result = filterTransactions(transactions, {
        ...DEFAULT_FILTERS,
        sort: 'newest',
      })
      expect(result[0].transaction_date >= result[1].transaction_date).toBe(true)
    })

    it('should sort by oldest first', () => {
      const result = filterTransactions(transactions, {
        ...DEFAULT_FILTERS,
        sort: 'oldest',
      })
      expect(result[0].transaction_date <= result[1].transaction_date).toBe(true)
    })

    it('should sort by highest amount', () => {
      const result = sortTransactions(transactions, 'highest')
      expect(result[0].amount).toBeGreaterThanOrEqual(result[1].amount)
    })

    it('should sort by lowest amount', () => {
      const result = sortTransactions(transactions, 'lowest')
      expect(result[0].amount).toBeLessThanOrEqual(result[1].amount)
    })

    it('should not mutate original array', () => {
      const original = [...transactions]
      sortTransactions(transactions, 'highest')
      expect(transactions).toEqual(original)
    })
  })

  describe('Combination filters', () => {
    it('should combine type + wallet filter', () => {
      const result = filterTransactions(transactions, {
        ...DEFAULT_FILTERS,
        type: 'expense',
        walletId: 'w1',
      })
      expect(result).toHaveLength(1)
      expect(result[0].id).toBe('1')
    })

    it('should combine type + category + date filter', () => {
      const result = filterTransactions(transactions, {
        ...DEFAULT_FILTERS,
        type: 'expense',
        categoryId: 'cat-food',
        dateRange: 'month',
      })
      expect(result).toHaveLength(1)
      expect(result[0].id).toBe('1')
    })

    it('should return empty when filters are too restrictive', () => {
      const result = filterTransactions(transactions, {
        ...DEFAULT_FILTERS,
        type: 'income',
        walletId: 'w2',
      })
      expect(result).toHaveLength(0)
    })
  })

  describe('Soft delete', () => {
    it('should not filter out non-deleted transactions', () => {
      const result = filterTransactions(transactions, DEFAULT_FILTERS)
      expect(result).toHaveLength(5)
    })

    it('deleted transactions should be filtered by listTransactions in repo (not by filter fn)', () => {
      // The filter function works on already-filtered data from the repository
      // Soft-deleted transactions are excluded at the repository level
      const withDeleted = [
        ...transactions,
        makeTx({ id: 'deleted', deleted_at: '2026-08-20T00:00:00Z' }),
      ]
      const result = filterTransactions(withDeleted, DEFAULT_FILTERS)
      // filterTransactions does not filter by deleted_at — that's the repo's job
      expect(result).toHaveLength(6)
    })
  })
})
