import { Card } from '@/components/ui/Card'
import { calculateProgress } from '@/features/finance/services/savingsService'
import { formatCurrency } from '@/utils/currency'
import type { SavingsGoal } from '@/types'

interface SavingsSummaryProps {
  savings: SavingsGoal[]
  onViewAll: () => void
}

export function SavingsSummary({ savings, onViewAll }: SavingsSummaryProps) {
  if (savings.length === 0) return null

  // Sort savings by progress (highest first) to show the ones closest to completion
  const sortedSavings = [...savings].sort((a, b) => {
    const aProgress = calculateProgress(a.current_amount, a.target_amount)
    const bProgress = calculateProgress(b.current_amount, b.target_amount)
    return bProgress - aProgress
  })

  // Show top 3 savings goals
  const displaySavings = sortedSavings.slice(0, 3)

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">Target Tabungan</h3>
        <button
          onClick={onViewAll}
          className="text-xs font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 transition-colors"
        >
          Lihat Semua
        </button>
      </div>

      <div className="space-y-4">
        {displaySavings.map(goal => {
          const progress = calculateProgress(goal.current_amount, goal.target_amount)

          return (
            <div key={goal.id} className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate pr-2">
                  {goal.name}
                </span>
                <span className="text-xs font-medium text-primary-600 dark:text-primary-400 shrink-0">
                  {progress}%
                </span>
              </div>
              <div className="h-2 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary-500 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>{formatCurrency(goal.current_amount)}</span>
                <span>{formatCurrency(goal.target_amount)}</span>
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}
