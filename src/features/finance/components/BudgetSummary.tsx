import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Progress } from '@/components/ui/progress'
import { getBudgetStatus, STATUS_CONFIG } from '@/features/finance/components/BudgetCard'
import { formatCurrency } from '@/utils/currency'
import type { Budget } from '@/types'

interface BudgetSummaryProps {
  budgets: Budget[]
  spentByCategory: Record<string, number>
  categoryMap: Record<string, string>
  onViewAll: () => void
}

export function BudgetSummary({
  budgets,
  spentByCategory,
  categoryMap,
  onViewAll,
}: BudgetSummaryProps) {
  if (budgets.length === 0) return null

  // Sort budgets by usage percentage (highest first) to show the most critical ones
  const sortedBudgets = [...budgets].sort((a, b) => {
    const aSpent = spentByCategory[a.category_id] || 0
    const bSpent = spentByCategory[b.category_id] || 0
    const aPercent = a.amount > 0 ? aSpent / a.amount : 0
    const bPercent = b.amount > 0 ? bSpent / b.amount : 0
    return bPercent - aPercent
  })

  // Show top 3 most critical budgets
  const displayBudgets = sortedBudgets.slice(0, 3)

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">Ringkasan Anggaran</h3>
        <button
          onClick={onViewAll}
          className="text-xs font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 transition-colors"
        >
          Lihat Semua
        </button>
      </div>

      <div className="space-y-4">
        {displayBudgets.map(budget => {
          const spent = spentByCategory[budget.category_id] || 0
          const percent =
            budget.amount > 0 ? Math.min(Math.round((spent / budget.amount) * 100), 100) : 0
          const isOver = spent > budget.amount
          const status = getBudgetStatus(spent, budget.amount)
          const config = STATUS_CONFIG[status]

          return (
            <div key={budget.id} className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {categoryMap[budget.category_id] || 'Kategori tidak diketahui'}
                </span>
                <Badge variant={config.variant}>{config.label}</Badge>
              </div>
              <Progress
                value={percent}
                variant={isOver ? 'danger' : status === 'warning' ? 'warning' : 'success'}
                className="h-2"
              />
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>{formatCurrency(spent)}</span>
                <span>{formatCurrency(budget.amount)}</span>
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}
