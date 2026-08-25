import { formatCurrency } from '@/utils/currency'
import { formatDate } from '@/utils/date'
import { calculateTargetBreakdown } from '@/features/finance/utils/paymentCalculator'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Progress } from '@/components/ui/progress'
import { Pencil, Trash2, Calendar, Coins, ArrowUpRight, ArrowDownLeft, Calculator } from 'lucide-react'
import type { Debt } from '@/types'

interface DebtCardProps {
  debt: Debt
  onPay?: () => void
  onEdit?: () => void
  onDelete?: () => void
}

function getDeadlineInfo(dueDate: string) {
  const targetDate = new Date(dueDate)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  targetDate.setHours(0, 0, 0, 0)

  const diffTime = targetDate.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays < 0) {
    return { label: `Lewat ${Math.abs(diffDays)} hari`, variant: 'danger' as const }
  }
  if (diffDays === 0) {
    return { label: 'Jatuh tempo hari ini', variant: 'warning' as const }
  }
  if (diffDays <= 7) {
    return { label: `${diffDays} hari lagi`, variant: 'warning' as const }
  }
  return { label: `${diffDays} hari lagi`, variant: 'default' as const }
}

export function DebtCard({ debt, onPay, onEdit, onDelete }: DebtCardProps) {
  const remaining = Math.max(0, debt.amount - debt.paid_amount)
  const progress =
    debt.amount > 0 ? Math.min(100, Math.round((debt.paid_amount / debt.amount) * 100)) : 0
  const isPaid = debt.status === 'paid'
  const isDebt = debt.type === 'debt'
  const deadlineInfo = debt.due_date ? getDeadlineInfo(debt.due_date) : null
  const breakdown = debt.due_date && remaining > 0 ? calculateTargetBreakdown(remaining, debt.due_date) : null

  return (
    <Card className="hover:border-primary-200 dark:hover:border-primary-800 transition-all duration-200 shadow-sm hover:shadow-md">
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              isDebt
                ? 'bg-rose-50 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400'
                : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'
            }`}
          >
            {isDebt ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownLeft className="w-5 h-5" />}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-sm font-bold text-gray-900 dark:text-gray-100 truncate">
                {debt.person_name}
              </p>
              <Badge variant={isDebt ? 'danger' : 'success'} className="text-[10px] py-0 px-1.5 whitespace-nowrap shrink-0">
                {isDebt ? 'Saya Berutang' : 'Piutang'}
              </Badge>
              {isPaid && <Badge variant="success" className="whitespace-nowrap shrink-0">Lunas</Badge>}
            </div>
            {debt.due_date && (
              <div className="flex flex-wrap items-center gap-2 mt-1">
                <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 whitespace-nowrap">
                  <Calendar className="w-3.5 h-3.5 shrink-0" />
                  {formatDate(debt.due_date)}
                </span>
                {deadlineInfo && !isPaid && (
                  <Badge variant={deadlineInfo.variant} className="text-[11px] font-semibold py-0.5 px-2.5 whitespace-nowrap shrink-0">
                    {deadlineInfo.label}
                  </Badge>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {onPay && !isPaid && (
            <button
              onClick={onPay}
              className="p-1.5 rounded-lg text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/30 transition-colors cursor-pointer"
              aria-label="Bayar atau cicil"
              title="Bayar / Cicil"
            >
              <Coins className="w-4 h-4" />
            </button>
          )}
          {onEdit && (
            <button
              onClick={onEdit}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:text-gray-300 dark:hover:bg-gray-700 transition-colors cursor-pointer"
              aria-label="Edit utang"
              title="Edit"
            >
              <Pencil className="w-4 h-4" />
            </button>
          )}
          {onDelete && (
            <button
              onClick={onDelete}
              className="p-1.5 rounded-lg text-gray-400 hover:text-danger hover:bg-danger-light dark:hover:bg-red-900/30 transition-colors cursor-pointer"
              aria-label="Hapus utang"
              title="Hapus"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Progress
          value={progress}
          variant={isPaid ? 'success' : isDebt ? 'danger' : 'default'}
          className="h-2.5"
        />

        <div className="flex justify-between items-center text-sm">
          <div>
            <span className="text-xs text-gray-500 dark:text-gray-400">Sisa: </span>
            <span className="font-semibold text-gray-900 dark:text-gray-100">
              {formatCurrency(remaining)}
            </span>
          </div>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Total: {formatCurrency(debt.amount)} ({progress}% terbayar)
          </span>
        </div>

        {/* Automated Target Repayment Calculator Breakdown */}
        {breakdown && !breakdown.isExpired && !isPaid && (
          <div className="pt-2 border-t border-gray-100 dark:border-gray-800 space-y-1">
            <div className="flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-400">
              <span className="flex items-center gap-1 font-medium text-rose-600 dark:text-rose-400">
                <Calculator className="w-3 h-3" /> Rekomendasi {isDebt ? 'Cicilan' : 'Penagihan'}:
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
              <div className="py-1 px-1.5 rounded-md bg-rose-50/70 dark:bg-rose-950/40 border border-rose-200/60 dark:border-rose-900/50">
                <p className="text-[9px] text-rose-500 dark:text-rose-400 font-medium">Bulanan</p>
                <p className="text-[11px] font-bold text-rose-700 dark:text-rose-300">
                  {formatCurrency(breakdown.perMonth)}
                </p>
              </div>
            </div>
          </div>
        )}

        {debt.note && (
          <p className="pt-1 text-xs text-gray-500 dark:text-gray-400 border-t border-gray-100 dark:border-gray-800 truncate">
            {debt.note}
          </p>
        )}
      </div>
    </Card>
  )
}
