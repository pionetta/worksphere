import type { Transaction } from '@/types'

// ─── Chart Data Types ────────────────────────────────────────────────────────

export interface DailyAmount {
  date: string
  label: string
  amount: number
}

export interface CategoryAmount {
  categoryId: string
  categoryName: string
  amount: number
  percentage: number
}

export interface IncomeExpenseByDay {
  incomeByDay: DailyAmount[]
  expenseByDay: DailyAmount[]
}

// ─── Pure Aggregation Functions ──────────────────────────────────────────────

/**
 * Aggregate transactions into daily income/expense buckets for a given month.
 * Only non-deleted, non-transfer, non-adjustment transactions are included.
 */
export function aggregateIncomeExpenseByDay(
  transactions: Transaction[],
  year: number,
  month: number
): IncomeExpenseByDay {
  const daysInMonth = new Date(year, month, 0).getDate()
  const monthPrefix = `${year}-${String(month).padStart(2, '0')}`

  const incomeMap = new Map<string, number>()
  const expenseMap = new Map<string, number>()

  for (const t of transactions) {
    if (t.deleted_at !== null) continue
    if (!t.transaction_date.startsWith(monthPrefix)) continue
    if (t.type !== 'income' && t.type !== 'expense') continue

    const datePart = t.transaction_date.split('T')[0]
    const day = datePart.split('-')[2]
    if (!day) continue
    if (t.type === 'income') {
      incomeMap.set(day, (incomeMap.get(day) ?? 0) + t.amount)
    } else {
      expenseMap.set(day, (expenseMap.get(day) ?? 0) + t.amount)
    }
  }

  const incomeByDay: DailyAmount[] = []
  const expenseByDay: DailyAmount[] = []

  for (let d = 1; d <= daysInMonth; d++) {
    const dayStr = String(d).padStart(2, '0')
    incomeByDay.push({
      date: dayStr,
      label: String(d),
      amount: incomeMap.get(dayStr) ?? 0,
    })
    expenseByDay.push({
      date: dayStr,
      label: String(d),
      amount: expenseMap.get(dayStr) ?? 0,
    })
  }

  return { incomeByDay, expenseByDay }
}

/**
 * Aggregate expense transactions by category.
 * Returns sorted by amount descending with percentage.
 * Only non-deleted, expense-only transactions are included.
 */
export function aggregateExpenseByCategory(
  transactions: Transaction[],
  categoryMap: Record<string, string>
): CategoryAmount[] {
  const categoryTotals = new Map<string, number>()
  let total = 0

  for (const t of transactions) {
    if (t.deleted_at !== null) continue
    if (t.type !== 'expense') continue

    const catId = t.category_id ?? '__uncategorized__'
    categoryTotals.set(catId, (categoryTotals.get(catId) ?? 0) + t.amount)
    total += t.amount
  }

  const result: CategoryAmount[] = []
  for (const [catId, amount] of categoryTotals) {
    result.push({
      categoryId: catId,
      categoryName:
        catId === '__uncategorized__' ? 'Tanpa Kategori' : (categoryMap[catId] ?? 'Lainnya'),
      amount,
      percentage: total > 0 ? Math.round((amount / total) * 100) : 0,
    })
  }

  result.sort((a, b) => b.amount - a.amount)
  return result
}
