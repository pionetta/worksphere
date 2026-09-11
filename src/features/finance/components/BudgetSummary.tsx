import { useState } from 'react'
import { Badge } from '@/components/ui/Badge'
import { Progress } from '@/components/ui/progress'
import { getBudgetStatus, STATUS_CONFIG } from '@/features/finance/components/BudgetCard'
import { formatCurrency } from '@/utils/currency'
import { ChevronDown, ChevronUp } from 'lucide-react'
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
  const [expanded, setExpanded] = useState(false)

  if (budgets.length === 0) return null

  // Sort budgets by usage percentage (highest first) to show the most critical ones
  const sortedBudgets = [...budgets].sort((a, b) => {
    const aSpent = spentByCategory[a.category_id] || 0
    const bSpent = spentByCategory[b.category_id] || 0
    const aPercent = a.amount > 0 ? aSpent / a.amount : 0
    const bPercent = b.amount > 0 ? bSpent / b.amount : 0
    return bPercent - aPercent
  })

  // Default to 2 items, expandable to show all
  const displayBudgets = expanded ? sortedBudgets : sortedBudgets.slice(0, 2)

  return (
    <div className="rounded-3xl bg-white/75 dark:bg-slate-900/75 backdrop-blur-xl border border-white/60 dark:border-white/10 shadow-lg shadow-indigo-500/5 p-4 sm:p-5 transition-colors space-y-3">
      <div className="flex items-center justify-between pb-2 border-b border-white/60 dark:border-white/10">
        <h3 className="text-xs sm:text-sm font-bold text-[#1E1B4B] dark:text-slate-100">Anggaran Bulan Ini</h3>
        {budgets.length > 2 ? (
          <button
            type="button"
            onClick={() => setExpanded(prev => !prev)}
            className="text-xs font-semibold text-indigo-600 hover:underline dark:text-indigo-400 transition-colors cursor-pointer"
          >
            {expanded ? 'Sembunyikan' : `Lihat Semua (${budgets.length})`}
          </button>
        ) : (
          <button
            type="button"
            onClick={onViewAll}
            className="text-xs font-semibold text-[#2563EB] hover:underline dark:text-[#3B82F6] transition-colors cursor-pointer"
          >
            Lihat Semua &rarr;
          </button>
        )}
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

      {budgets.length > 2 && (
        <button
          type="button"
          onClick={() => setExpanded(prev => !prev)}
          className="w-full py-1.5 mt-3 rounded-xl text-xs font-bold text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100/70 dark:hover:bg-gray-800/70 flex items-center justify-center gap-1.5 transition-all cursor-pointer border border-transparent hover:border-gray-200 dark:hover:border-gray-700"
        >
          {expanded ? (
            <>
              <ChevronUp className="w-3.5 h-3.5 text-gray-500" />
              <span>Sembunyikan</span>
            </>
          ) : (
            <>
              <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
              <span>Tampilkan Lebih Banyak ({budgets.length - 2} lainnya)</span>
            </>
          )}
        </button>
      )}
    </div>
  )
}
