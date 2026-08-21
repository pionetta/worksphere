import { formatCurrency } from '@/utils/currency'
import { formatDate } from '@/utils/date'
import { calculateProgress } from '@/features/finance/services/savingsService'
import { Card } from '@/components/ui/Card'
import { Target, Pencil, PlusCircle, Trash2 } from 'lucide-react'
import type { SavingsGoal } from '@/types'

interface SavingsGoalCardProps {
  goal: SavingsGoal
  onEdit?: () => void
  onAdd?: (id: string) => void
  onDelete?: (id: string) => void
}

export function SavingsGoalCard({ goal, onEdit, onAdd, onDelete }: SavingsGoalCardProps) {
  const progress = calculateProgress(goal.current_amount, goal.target_amount)

  return (
    <Card>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
            <Target className="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{goal.name}</p>
            {goal.deadline && (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Deadline: {formatDate(goal.deadline)}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1">
          {onAdd && (
            <button
              onClick={() => onAdd(goal.id)}
              className="p-1.5 rounded-lg text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/30 transition-colors"
              aria-label="Tambah tabungan"
            >
              <PlusCircle className="w-4 h-4" />
            </button>
          )}
          {onEdit && (
            <button
              onClick={onEdit}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:text-gray-300 dark:hover:bg-gray-700 transition-colors"
              aria-label="Edit tabungan"
            >
              <Pencil className="w-4 h-4" />
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(goal.id)}
              className="p-1.5 rounded-lg text-gray-400 hover:text-danger hover:bg-danger-light dark:hover:bg-red-900/30 transition-colors"
              aria-label="Hapus tabungan"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-2">
        <div
          className="h-full rounded-full bg-primary-500 transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex justify-between text-sm">
        <span className="font-medium text-gray-900 dark:text-gray-100">
          {formatCurrency(goal.current_amount)}
        </span>
        <span className="text-gray-500 dark:text-gray-400">
          {formatCurrency(goal.target_amount)} ({progress}%)
        </span>
      </div>

      {goal.note && <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">{goal.note}</p>}
    </Card>
  )
}
