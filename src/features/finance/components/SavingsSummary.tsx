import { useState } from 'react'
import { Progress } from '@/components/ui/progress'
import { calculateProgress } from '@/features/finance/services/savingsService'
import { formatCurrency } from '@/utils/currency'
import { ChevronDown, ChevronUp } from 'lucide-react'
import type { SavingsGoal } from '@/types'

interface SavingsSummaryProps {
  savings: SavingsGoal[]
  onViewAll: () => void
}

export function SavingsSummary({ savings, onViewAll }: SavingsSummaryProps) {
  const [expanded, setExpanded] = useState(false)

  if (savings.length === 0) return null

  // Sort savings by progress (highest first) to show the ones closest to completion
  const sortedSavings = [...savings].sort((a, b) => {
    const aProgress = calculateProgress(a.current_amount, a.target_amount)
    const bProgress = calculateProgress(b.current_amount, b.target_amount)
    return bProgress - aProgress
  })

  // Default to 2 items, expandable to show all
  const displaySavings = expanded ? sortedSavings : sortedSavings.slice(0, 2)

  return (
    <div className="rounded-3xl bg-white/75 dark:bg-slate-900/75 backdrop-blur-xl border border-white/60 dark:border-white/10 shadow-lg shadow-indigo-500/5 p-4 sm:p-5 transition-colors space-y-3">
      <div className="flex items-center justify-between pb-2 border-b border-white/60 dark:border-white/10">
        <h3 className="text-xs sm:text-sm font-bold text-[#1E1B4B] dark:text-slate-100">Target Tabungan</h3>
        {savings.length > 2 ? (
          <button
            type="button"
            onClick={() => setExpanded(prev => !prev)}
            className="text-xs font-semibold text-indigo-600 hover:underline dark:text-indigo-400 transition-colors cursor-pointer"
          >
            {expanded ? 'Sembunyikan' : `Lihat Semua (${savings.length})`}
          </button>
        ) : (
          <button
            type="button"
            onClick={onViewAll}
            className="text-xs font-semibold text-indigo-600 hover:underline dark:text-indigo-400 transition-colors cursor-pointer"
          >
            Lihat Semua &rarr;
          </button>
        )}
      </div>

      <div className="space-y-4">
        {displaySavings.map(goal => {
          const progress = calculateProgress(goal.current_amount, goal.target_amount)
          const isCompleted = goal.current_amount >= goal.target_amount

          return (
            <div key={goal.id} className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate pr-2">
                  {goal.name}
                </span>
                <span className="text-xs font-semibold text-primary-600 dark:text-primary-400 shrink-0">
                  {progress}%
                </span>
              </div>
              <Progress
                value={Math.min(progress, 100)}
                variant={isCompleted ? 'success' : 'default'}
                className="h-2"
              />
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>{formatCurrency(goal.current_amount)}</span>
                <span>{formatCurrency(goal.target_amount)}</span>
              </div>
            </div>
          )
        })}
      </div>

      {savings.length > 2 && (
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
              <span>Tampilkan Lebih Banyak ({savings.length - 2} lainnya)</span>
            </>
          )}
        </button>
      )}
    </div>
  )
}
