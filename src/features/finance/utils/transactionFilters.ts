import { useMemo } from 'react'
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns'
import type { Transaction } from '@/types'

// ─── Filter Types ─────────────────────────────────────────────────────────────

export type TransactionTypeFilter = 'all' | 'income' | 'expense' | 'transfer' | 'adjustment'
export type TransactionSort = 'newest' | 'oldest' | 'highest' | 'lowest'

export interface TransactionFilters {
  dateRange: 'all' | 'today' | 'week' | 'month' | 'custom'
  startDate: string | null
  endDate: string | null
  categoryId: string | null
  walletId: string | null
  type: TransactionTypeFilter
  search: string
  sort: TransactionSort
}

export const DEFAULT_FILTERS: TransactionFilters = {
  dateRange: 'all',
  startDate: null,
  endDate: null,
  categoryId: null,
  walletId: null,
  type: 'all',
  search: '',
  sort: 'newest',
}

// ─── Date Helpers ─────────────────────────────────────────────────────────────

function getDateRange(range: TransactionFilters['dateRange']): {
  start: string
  end: string
} | null {
  const now = new Date()

  switch (range) {
    case 'today':
      return {
        start: formatLocalDate(startOfDay(now)),
        end: formatLocalDate(endOfDay(now)),
      }
    case 'week':
      return {
        start: formatLocalDate(startOfWeek(now, { weekStartsOn: 1 })),
        end: formatLocalDate(endOfWeek(now, { weekStartsOn: 1 })),
      }
    case 'month':
      return {
        start: formatLocalDate(startOfMonth(now)),
        end: formatLocalDate(endOfMonth(now)),
      }
    default:
      return null
  }
}

function formatLocalDate(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

// ─── Filter Logic ─────────────────────────────────────────────────────────────

export function filterTransactions(
  transactions: Transaction[],
  filters: TransactionFilters
): Transaction[] {
  let result = [...transactions]

  // Date filter
  if (filters.dateRange === 'custom' && filters.startDate && filters.endDate) {
    result = result.filter(
      t => t.transaction_date >= filters.startDate! && t.transaction_date <= filters.endDate!
    )
  } else if (filters.dateRange !== 'all') {
    const range = getDateRange(filters.dateRange)
    if (range) {
      result = result.filter(
        t => t.transaction_date >= range.start && t.transaction_date <= range.end
      )
    }
  }

  // Category filter
  if (filters.categoryId) {
    result = result.filter(t => t.category_id === filters.categoryId)
  }

  // Wallet filter
  if (filters.walletId) {
    result = result.filter(t => t.wallet_id === filters.walletId)
  }

  // Type filter
  if (filters.type !== 'all') {
    if (filters.type === 'transfer') {
      result = result.filter(t => t.type === 'transfer_in' || t.type === 'transfer_out')
    } else {
      result = result.filter(t => t.type === filters.type)
    }
  }

  // Search filter
  if (filters.search.trim()) {
    const q = filters.search.toLowerCase().trim()
    result = result.filter(t => {
      const note = t.note?.toLowerCase() ?? ''
      return note.includes(q)
    })
  }

  // Sort
  result = sortTransactions(result, filters.sort)

  return result
}

export function sortTransactions(
  transactions: Transaction[],
  sort: TransactionSort
): Transaction[] {
  const sorted = [...transactions]

  switch (sort) {
    case 'newest':
      sorted.sort((a, b) => b.transaction_date.localeCompare(a.transaction_date))
      break
    case 'oldest':
      sorted.sort((a, b) => a.transaction_date.localeCompare(b.transaction_date))
      break
    case 'highest':
      sorted.sort((a, b) => b.amount - a.amount)
      break
    case 'lowest':
      sorted.sort((a, b) => a.amount - b.amount)
      break
  }

  return sorted
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useFilteredTransactions(
  transactions: Transaction[],
  filters: TransactionFilters,
  categoryMap: Record<string, string>,
  walletMap: Record<string, string>
) {
  const filtered = useMemo(() => {
    let result = filterTransactions(transactions, filters)

    // Enhance search with category and wallet names
    if (filters.search.trim()) {
      const q = filters.search.toLowerCase().trim()
      const matchesFromTransactions = new Set(result.map(t => t.id))

      // Also search by category name and wallet name
      const additionalMatches = transactions.filter(t => {
        if (matchesFromTransactions.has(t.id)) return false
        const catName = t.category_id ? (categoryMap[t.category_id]?.toLowerCase() ?? '') : ''
        const walletName = walletMap[t.wallet_id]?.toLowerCase() ?? ''
        return catName.includes(q) || walletName.includes(q)
      })

      result = [...result, ...additionalMatches]
    }

    return result
  }, [transactions, filters, categoryMap, walletMap])

  return filtered
}
