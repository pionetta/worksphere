import { useState } from 'react'
import { formatCurrency } from '@/utils/currency'
import { formatDate } from '@/utils/date'
import { getInstallmentProgress } from '@/features/finance/services/debtService'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Progress } from '@/components/ui/progress'
import {
  Pencil,
  Trash2,
  Calendar,
  Coins,
  ArrowUpRight,
  ArrowDownLeft,
  CreditCard,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  SlidersHorizontal,
} from 'lucide-react'
import { cn } from '@/lib/utils'
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
  const [showScheduleDetails, setShowScheduleDetails] = useState(false)
  const remaining = Math.max(0, debt.amount - debt.paid_amount)
  const progress =
    debt.amount > 0 ? Math.min(100, Math.round((debt.paid_amount / debt.amount) * 100)) : 0
  const isPaid = debt.status === 'paid'
  const isDebt = debt.type === 'debt'
  const deadlineInfo = debt.due_date ? getDeadlineInfo(debt.due_date) : null
  const inst = getInstallmentProgress(debt)
  const hasCustomSchedule = Boolean(debt.installment_schedule && debt.installment_schedule.length > 0)

  return (
    <Card className="p-3.5 hover:border-primary-200 dark:hover:border-primary-800 transition-all duration-200 shadow-2xs hover:shadow-xs space-y-2">
      {/* Header Row: Person Name, Tags, & Actions */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0 flex-1 flex-wrap">
          <div
            className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
              isDebt
                ? 'bg-rose-50 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400'
                : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'
            }`}
          >
            {isDebt ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownLeft className="w-4 h-4" />}
          </div>
          <span className="text-sm font-bold text-gray-900 dark:text-gray-100 truncate">
            {debt.person_name}
          </span>
          {debt.group_name && (
            <span className="text-[10px] font-medium py-0.5 px-1.5 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
              {debt.group_name}
            </span>
          )}
          <Badge variant={isDebt ? 'danger' : 'success'} className="text-[10px] py-0 px-1.5 whitespace-nowrap">
            {isDebt ? 'Saya Berutang' : 'Piutang'}
          </Badge>
          {isPaid && <Badge variant="success" className="text-[10px] py-0 px-1.5 whitespace-nowrap">Lunas</Badge>}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-0.5 shrink-0">
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

      {/* Concise Subtitle / Status Meta Row */}
      <div className="flex flex-wrap items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
        {inst && !isPaid ? (
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="inline-flex items-center gap-1 font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50/90 dark:bg-indigo-950/60 px-1.5 py-0.5 rounded-md border border-indigo-200/80 dark:border-indigo-900/50 text-[11px]">
              {inst.isFlexible ? <RefreshCw className="w-3 h-3" /> : <CreditCard className="w-3 h-3" />}
              {inst.isFlexible ? 'Paylater' : 'Cicilan'} {inst.paidCount}/{inst.totalCount} (sisa {inst.remainingCount}x)
            </span>
            {debt.installment_due_day && (
              <span className="inline-flex items-center gap-1 text-[11px] text-gray-600 dark:text-gray-300">
                <Calendar className="w-3 h-3 text-primary-500" />
                Tgl {debt.installment_due_day}
                {inst.currentBillAmount ? ` • ${formatCurrency(inst.currentBillAmount)}/bln` : ''}
              </span>
            )}
          </div>
        ) : debt.due_date && !isPaid ? (
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="inline-flex items-center gap-1 text-[11px]">
              <Calendar className="w-3 h-3 text-gray-400" />
              Target: {formatDate(debt.due_date)}
            </span>
            {deadlineInfo && (
              <Badge variant={deadlineInfo.variant} className="text-[10px] font-semibold py-0 px-1.5">
                {deadlineInfo.label}
              </Badge>
            )}
          </div>
        ) : null}
      </div>

      {/* Slim Progress Bar */}
      <Progress
        value={progress}
        variant={isPaid ? 'success' : isDebt ? 'danger' : 'default'}
        className="h-1.5"
      />

      {/* Amounts Row */}
      <div className="flex justify-between items-baseline text-xs pt-0.5">
        <div>
          <span className="text-[11px] text-gray-500 dark:text-gray-400">Sisa: </span>
          <span className="font-extrabold text-xs sm:text-sm text-gray-900 dark:text-gray-100">
            {formatCurrency(remaining)}
          </span>
        </div>
        <span className="text-[11px] text-gray-500 dark:text-gray-400">
          Total {formatCurrency(debt.amount)} ({progress}% lunas)
        </span>
      </div>

      {/* Note if available */}
      {debt.note && (
        <p className="text-[11px] text-gray-500 dark:text-gray-400 italic pt-1 border-t border-gray-100 dark:border-gray-800 truncate">
          {debt.note}
        </p>
      )}

      {/* Custom Schedule Details Dropdown (Collapsible & Compact) */}
      {hasCustomSchedule && debt.installment_schedule && (
        <div className="pt-1.5 border-t border-gray-100 dark:border-gray-800">
          <button
            type="button"
            onClick={() => setShowScheduleDetails(prev => !prev)}
            className="w-full flex items-center justify-between text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 py-0.5 cursor-pointer transition-colors"
          >
            <span className="flex items-center gap-1">
              <SlidersHorizontal className="w-3 h-3" />
              Rincian Jadwal Cicilan ({debt.installment_schedule.length} bulan)
            </span>
            {showScheduleDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {showScheduleDetails && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1 pt-1.5 animate-fade-in">
              {debt.installment_schedule.map((nom, idx) => {
                const monthNum = idx + 1
                const paidCount = debt.installment_paid_count ?? 0
                const isDone = isPaid || monthNum <= paidCount
                const isCurrent = !isPaid && monthNum === paidCount + 1

                return (
                  <div
                    key={monthNum}
                    className={cn(
                      'p-1.5 rounded-md border text-[11px] space-y-0.5',
                      isDone
                        ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                        : isCurrent
                        ? 'bg-indigo-50/90 dark:bg-indigo-950/60 border-indigo-300 dark:border-indigo-700 text-indigo-900 dark:text-indigo-200 font-semibold'
                        : 'bg-gray-50/80 dark:bg-gray-800/60 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400'
                    )}
                  >
                    <div className="flex items-center justify-between text-[9px] font-bold">
                      <span>Bln {monthNum}</span>
                      {isDone ? (
                        <span className="text-emerald-600 dark:text-emerald-400">✓ Lunas</span>
                      ) : isCurrent ? (
                        <span className="text-indigo-600 dark:text-indigo-400 font-extrabold">Bulan Ini</span>
                      ) : (
                        <span>Mendatang</span>
                      )}
                    </div>
                    <p className="font-bold text-[11px]">
                      {formatCurrency(nom)}
                    </p>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </Card>
  )
}
