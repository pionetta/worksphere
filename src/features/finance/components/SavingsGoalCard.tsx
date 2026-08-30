import { formatCurrency } from '@/utils/currency'
import { formatDate } from '@/utils/date'
import { calculateProgress } from '@/features/finance/services/savingsService'
import { calculateTargetBreakdown } from '@/features/finance/utils/paymentCalculator'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Progress } from '@/components/ui/progress'
import { Target, Pencil, PlusCircle, MinusCircle, Trash2, Calendar, Calculator } from 'lucide-react'
import type { SavingsGoal } from '@/types'

interface SavingsGoalCardProps {
  goal: SavingsGoal
  onEdit?: () => void
  onAdd?: (id: string) => void
  onWithdraw?: (id: string) => void
  onDelete?: (id: string) => void
}

function getDeadlineInfo(deadline: string) {
  const targetDate = new Date(deadline)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  targetDate.setHours(0, 0, 0, 0)

  const diffTime = targetDate.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays < 0) {
    return { label: `Lewat ${Math.abs(diffDays)} hari`, variant: 'danger' as const }
  }
  if (diffDays === 0) {
    return { label: 'Hari ini', variant: 'warning' as const }
  }
  if (diffDays <= 7) {
    return { label: `${diffDays} hari lagi`, variant: 'warning' as const }
  }
  return { label: `${diffDays} hari lagi`, variant: 'default' as const }
}

export function SavingsGoalCard({
  goal,
  onEdit,
  onAdd,
  onWithdraw,
  onDelete,
}: SavingsGoalCardProps) {
  const progress = calculateProgress(goal.current_amount, goal.target_amount)
  const isCompleted = goal.current_amount >= goal.target_amount
  const deadlineInfo = goal.deadline ? getDeadlineInfo(goal.deadline) : null
  const remaining = Math.max(0, goal.target_amount - goal.current_amount)
  const breakdown = goal.deadline && remaining > 0 ? calculateTargetBreakdown(remaining, goal.deadline) : null

  return (
    <Card className="hover:border-primary-200 dark:hover:border-primary-800 transition-all duration-200 shadow-sm hover:shadow-md">
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400 shrink-0">
            <Target className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-sm font-bold text-gray-900 dark:text-gray-100 truncate">{goal.name}</p>
              {isCompleted && <Badge variant="success" className="whitespace-nowrap shrink-0">Tercapai</Badge>}
            </div>
            {goal.deadline && (
              <div className="flex flex-wrap items-center gap-2 mt-1">
                <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 whitespace-nowrap">
                  <Calendar className="w-3.5 h-3.5 shrink-0" />
                  {formatDate(goal.deadline)}
                </span>
                {deadlineInfo && !isCompleted && (
                  <Badge variant={deadlineInfo.variant} className="text-[11px] font-semibold py-0.5 px-2.5 whitespace-nowrap shrink-0">
                    {deadlineInfo.label}
                  </Badge>
                )}
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {onAdd && (
            <button
              onClick={() => onAdd(goal.id)}
              className="p-1.5 rounded-lg text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/30 transition-colors cursor-pointer"
              aria-label="Tambah tabungan"
              title="Setor Tabungan"
            >
              <PlusCircle className="w-4 h-4" />
            </button>
          )}
          {onWithdraw && goal.current_amount > 0 && (
            <button
              onClick={() => onWithdraw(goal.id)}
              className="p-1.5 rounded-lg text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/30 transition-colors cursor-pointer"
              aria-label="Tarik tabungan"
              title="Tarik / Kurangi Saldo"
            >
              <MinusCircle className="w-4 h-4" />
            </button>
          )}
          {onEdit && (
            <button
              onClick={onEdit}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:text-gray-300 dark:hover:bg-gray-700 transition-colors cursor-pointer"
              aria-label="Edit tabungan"
              title="Edit"
            >
              <Pencil className="w-4 h-4" />
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(goal.id)}
              className="p-1.5 rounded-lg text-gray-400 hover:text-danger hover:bg-danger-light dark:hover:bg-red-900/30 transition-colors cursor-pointer"
              aria-label="Hapus tabungan"
              title="Hapus"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Progress
          value={Math.min(progress, 100)}
          variant={isCompleted ? 'success' : 'default'}
          className="h-2.5"
        />

        <div className="flex justify-between items-center text-sm">
          <div className="flex items-baseline gap-1.5">
            <span className="text-xs text-gray-500 dark:text-gray-400">Terkumpul:</span>
            <span className="font-bold text-gray-900 dark:text-gray-100">
              {formatCurrency(goal.current_amount)}
            </span>
          </div>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Target: {formatCurrency(goal.target_amount)} ({progress}%)
          </span>
        </div>

        {/* Automated Target Calculator Breakdown */}
        {breakdown && !breakdown.isExpired && !isCompleted && (
          <div className="pt-2 border-t border-gray-100 dark:border-gray-800 space-y-1">
            <div className="flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-400">
              <span className="flex items-center gap-1 font-medium text-blue-600 dark:text-blue-400">
                <Calculator className="w-3 h-3" /> Target Menabung:
              </span>
              <span>Sisa {formatCurrency(remaining)}</span>
            </div>
            <div className="grid grid-cols-3 gap-1 text-center">
              <div className="py-1 px-1.5 rounded-md bg-gray-50 dark:bg-gray-800/80 border border-gray-100 dark:border-gray-700/60">
                <p className="text-[9px] text-gray-400">Harian</p>
                <p className="text-[11px] font-bold text-gray-800 dark:text-gray-200">
                  {formatCurrency(breakdown.perDay)}
                </p>
              </div>
              <div className="py-1 px-1.5 rounded-md bg-gray-50 dark:bg-gray-800/80 border border-gray-100 dark:border-gray-700/60">
                <p className="text-[9px] text-gray-400">Mingguan</p>
                <p className="text-[11px] font-bold text-gray-800 dark:text-gray-200">
                  {formatCurrency(breakdown.perWeek)}
                </p>
              </div>
              <div className="py-1 px-1.5 rounded-md bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-900/50">
                <p className="text-[9px] text-blue-500 dark:blue-400 font-medium">Bulanan</p>
                <p className="text-[11px] font-bold text-blue-700 dark:text-blue-300">
                  {formatCurrency(breakdown.perMonth)}
                </p>
              </div>
            </div>
          </div>
        )}

        {goal.note && (
          <p className="pt-1 text-xs text-gray-500 dark:text-gray-400 border-t border-gray-100 dark:border-gray-800 truncate">
            {goal.note}
          </p>
        )}
      </div>
    </Card>
  )
}
