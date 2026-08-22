import { formatCurrency } from '@/utils/currency'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Progress } from '@/components/ui/progress'
import { Pencil, Trash2 } from 'lucide-react'
import type { Budget } from '@/types'

// ─── Thresholds ───────────────────────────────────────────────────────────────

const THRESHOLD_WARNING = 80

export type BudgetStatus = 'normal' | 'warning' | 'exceeded'

export function getBudgetStatus(spent: number, budget: number): BudgetStatus {
  if (budget <= 0) return 'normal'
  const percent = (spent / budget) * 100
  if (percent >= 100) return 'exceeded'
  if (percent >= THRESHOLD_WARNING) return 'warning'
  return 'normal'
}

export const STATUS_CONFIG: Record<
  BudgetStatus,
  { label: string; variant: 'success' | 'warning' | 'danger' }
> = {
  normal: { label: 'Normal', variant: 'success' },
  warning: { label: 'Hampir habis', variant: 'warning' },
  exceeded: { label: 'Terlampaui', variant: 'danger' },
}

// ─── Component ────────────────────────────────────────────────────────────────

interface BudgetCardProps {
  budget: Budget
  categoryName?: string
  spent?: number
  onEdit?: () => void
  onDelete?: (id: string) => void
}

export function BudgetCard({ budget, categoryName, spent = 0, onEdit, onDelete }: BudgetCardProps) {
  const percent = budget.amount > 0 ? Math.round((spent / budget.amount) * 100) : 0
  const isOver = spent > budget.amount
  const remaining = budget.amount - spent
  const status = getBudgetStatus(spent, budget.amount)
  const statusConfig = STATUS_CONFIG[status]

  return (
    <Card className="hover:border-primary-200 dark:hover:border-primary-800 transition-all duration-200 shadow-sm hover:shadow-md">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            {categoryName || 'Tanpa kategori'}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Anggaran: {formatCurrency(budget.amount)}
          </p>
        </div>
        <div className="flex items-center gap-1">
          {onEdit && (
            <button
              onClick={onEdit}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:text-gray-300 dark:hover:bg-gray-700 transition-colors"
              aria-label="Edit anggaran"
            >
              <Pencil className="w-4 h-4" />
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(budget.id)}
              className="p-1.5 rounded-lg text-gray-400 hover:text-danger hover:bg-danger-light dark:hover:bg-red-900/30 transition-colors"
              aria-label="Hapus anggaran"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Progress
          value={Math.min(percent, 100)}
          variant={isOver ? 'danger' : status === 'warning' ? 'warning' : 'success'}
          className="h-2.5"
        />

        <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
          <span>Terkonsumsi: {formatCurrency(spent)}</span>
          <span className={isOver ? 'text-danger font-medium' : ''}>
            {isOver
              ? `Melebihi ${formatCurrency(Math.abs(remaining))}`
              : `Sisa: ${formatCurrency(remaining)}`}
          </span>
        </div>

        <div className="flex items-center justify-between pt-1 border-t border-gray-100 dark:border-gray-800">
          <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
          <span
            className={`text-xs font-semibold ${
              isOver
                ? 'text-danger'
                : status === 'warning'
                  ? 'text-warning'
                  : 'text-gray-500 dark:text-gray-400'
            }`}
          >
            {percent}%
          </span>
        </div>
      </div>
    </Card>
  )
}
