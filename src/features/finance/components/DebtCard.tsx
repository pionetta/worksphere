import { useState } from 'react'
import { formatCurrency } from '@/utils/currency'
import { formatDate } from '@/utils/date'
import { calculateTargetBreakdown } from '@/features/finance/utils/paymentCalculator'
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
  Calculator,
  CreditCard,
  RefreshCw,
  CheckCircle2,
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
  const breakdown = debt.due_date && remaining > 0 ? calculateTargetBreakdown(remaining, debt.due_date) : null
  const inst = getInstallmentProgress(debt)
  const hasCustomSchedule = Boolean(debt.installment_schedule && debt.installment_schedule.length > 0)

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
              {debt.group_name && (
                <span className="text-[10px] font-medium py-0.5 px-2 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
                  {debt.group_name}
                </span>
              )}
              <Badge variant={isDebt ? 'danger' : 'success'} className="text-[10px] py-0 px-1.5 whitespace-nowrap shrink-0">
                {isDebt ? 'Saya Berutang' : 'Piutang'}
              </Badge>
              {inst && (
                <Badge variant="info" className="text-[10px] py-0.5 px-2 whitespace-nowrap shrink-0 flex items-center gap-1 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800 font-semibold">
                  {inst.isFlexible ? <RefreshCw className="w-3 h-3" /> : <CreditCard className="w-3 h-3" />}
                  {inst.isFlexible ? 'Paylater' : 'Cicilan'} {inst.paidCount}/{inst.totalCount} Selesai
                </Badge>
              )}
              {isPaid && <Badge variant="success" className="whitespace-nowrap shrink-0">Lunas</Badge>}
            </div>

            {/* Due Date & Installment Info */}
            <div className="flex flex-wrap items-center gap-2 mt-1.5">
              {inst && !isPaid && (
                <span className="text-[11px] font-bold text-indigo-700 dark:text-indigo-300 flex items-center gap-1 whitespace-nowrap bg-indigo-50/80 dark:bg-indigo-950/50 px-2 py-0.5 rounded-md border border-indigo-200/80 dark:border-indigo-900/50">
                  <CheckCircle2 className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
                  Sisa {inst.remainingCount}x angsuran lagi
                </span>
              )}

              {debt.is_installment && debt.installment_due_day && !isPaid && (
                <span className="text-[11px] font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1 whitespace-nowrap bg-gray-100/80 dark:bg-gray-800 px-2 py-0.5 rounded-md border border-gray-200 dark:border-gray-700">
                  <Calendar className="w-3 h-3 text-primary-500" />
                  Jatuh tempo tiap tgl {debt.installment_due_day}
                  {inst?.currentBillAmount ? ` • ${inst.isFlexible ? 'Tagihan Bln Ini:' : 'Angsuran:'} ${formatCurrency(inst.currentBillAmount)}` : ''}
                </span>
              )}

              {debt.due_date && (
                <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 whitespace-nowrap">
                  <Calendar className="w-3.5 h-3.5 shrink-0" />
                  Target: {formatDate(debt.due_date)}
                </span>
              )}

              {deadlineInfo && !isPaid && (
                <Badge variant={deadlineInfo.variant} className="text-[11px] font-semibold py-0.5 px-2.5 whitespace-nowrap shrink-0">
                  {deadlineInfo.label}
                </Badge>
              )}
            </div>
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
            <span className="font-bold text-gray-900 dark:text-gray-100">
              {formatCurrency(remaining)}
            </span>
          </div>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Total: {formatCurrency(debt.amount)} ({progress}% terbayar)
          </span>
        </div>

        {/* Custom Schedule Details Dropdown */}
        {hasCustomSchedule && debt.installment_schedule && (
          <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
            <button
              type="button"
              onClick={() => setShowScheduleDetails(prev => !prev)}
              className="w-full flex items-center justify-between text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 py-1 cursor-pointer transition-colors"
            >
              <span className="flex items-center gap-1.5">
                <SlidersHorizontal className="w-3.5 h-3.5" />
                Rincian Jadwal Cicilan per Bulan ({debt.installment_schedule.length} bulan)
              </span>
              {showScheduleDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {showScheduleDetails && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 pt-2 animate-fade-in">
                {debt.installment_schedule.map((nom, idx) => {
                  const monthNum = idx + 1
                  const paidCount = debt.installment_paid_count ?? 0
                  const isDone = isPaid || monthNum <= paidCount
                  const isCurrent = !isPaid && monthNum === paidCount + 1

                  return (
                    <div
                      key={monthNum}
                      className={cn(
                        'p-2 rounded-lg border text-xs space-y-0.5',
                        isDone
                          ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                          : isCurrent
                          ? 'bg-indigo-50/90 dark:bg-indigo-950/60 border-indigo-300 dark:border-indigo-700 text-indigo-900 dark:text-indigo-200 ring-1 ring-indigo-400/50'
                          : 'bg-gray-50/80 dark:bg-gray-800/60 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400'
                      )}
                    >
                      <div className="flex items-center justify-between text-[10px] font-bold">
                        <span>Bulan {monthNum}</span>
                        {isDone ? (
                          <span className="text-emerald-600 dark:text-emerald-400">✓ Lunas</span>
                        ) : isCurrent ? (
                          <span className="text-indigo-600 dark:text-indigo-400 font-extrabold">Bulan Ini</span>
                        ) : (
                          <span>Mendatang</span>
                        )}
                      </div>
                      <p className="font-bold text-xs">
                        {formatCurrency(nom)}
                      </p>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* Automated Target Repayment Calculator Breakdown (non-installment) */}
        {breakdown && !breakdown.isExpired && !isPaid && !debt.is_installment && (
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
