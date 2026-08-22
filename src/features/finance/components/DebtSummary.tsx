import { formatCurrency } from '@/utils/currency'
import { Card } from '@/components/ui/Card'
import { ArrowUpRight, ArrowDownLeft } from 'lucide-react'
import type { DebtSummary as DebtSummaryType } from '@/features/finance/services/debtService'

interface DebtSummaryProps {
  summary: DebtSummaryType
}

export function DebtSummary({ summary }: DebtSummaryProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {/* Utang Card */}
      <Card glass className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-900/30 flex items-center justify-center text-rose-600 dark:text-rose-400">
              <ArrowUpRight className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Total Utang (Saya Berutang)
              </p>
              <p className="text-lg font-bold text-gray-900 dark:text-gray-100 tracking-tight">
                {formatCurrency(summary.totalDebtRemaining)}
              </p>
            </div>
          </div>
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300 font-medium">
            {summary.unpaidDebtCount} belum lunas
          </span>
        </div>
        <div className="mt-3 pt-2 border-t border-gray-100 dark:border-gray-800 flex justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>Total Pokok Awal:</span>
          <span className="font-medium text-gray-700 dark:text-gray-300">
            {formatCurrency(summary.totalDebt)}
          </span>
        </div>
      </Card>

      {/* Piutang Card */}
      <Card glass className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <ArrowDownLeft className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Total Piutang (Tertagih)</p>
              <p className="text-lg font-bold text-gray-900 dark:text-gray-100 tracking-tight">
                {formatCurrency(summary.totalReceivableRemaining)}
              </p>
            </div>
          </div>
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 font-medium">
            {summary.unpaidReceivableCount} belum tertagih
          </span>
        </div>
        <div className="mt-3 pt-2 border-t border-gray-100 dark:border-gray-800 flex justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>Total Pokok Awal:</span>
          <span className="font-medium text-gray-700 dark:text-gray-300">
            {formatCurrency(summary.totalReceivable)}
          </span>
        </div>
      </Card>
    </div>
  )
}
