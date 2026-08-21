import { formatCurrency } from '@/utils/currency'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
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
    <Card>
      <div className="flex items-start justify-between mb-2">
        <div>
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {categoryName || 'Tanpa kategori'}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
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

      <Progress
        value={Math.min(percent, 100)}
        variant={isOver ? 'danger' : status === 'warning' ? 'warning' : 'primary'}
      />

      <div className="flex justify-between items-center mt-2 text-xs text-gray-500 dark:text-gray-400">
        <span>Terkonsumsi: {formatCurrency(spent)}</span>
        <span>
          {isOver
            ? `Melebihi ${formatCurrency(Math.abs(remaining))}`
            : `Sisa: ${formatCurrency(remaining)}`}
        </span>
      </div>

      <div className="mt-2 flex items-center justify-between">
        <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
        <span className="text-xs text-gray-400 dark:text-gray-500">{percent}%</span>
      </div>
    </Card>
  )
}

// ─── Progress Bar ─────────────────────────────────────────────────────────────

function Progress({
  value,
  variant = 'primary',
}: {
  value: number
  variant?: 'primary' | 'warning' | 'danger'
}) {
  const colorMap = {
    primary: 'bg-primary-500',
    warning: 'bg-warning',
    danger: 'bg-danger',
  }

  return (
    <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
      <div
        className={`h-full rounded-full transition-all ${colorMap[variant]}`}
        style={{ width: `${value}%` }}
      />
    </div>
  )
}
