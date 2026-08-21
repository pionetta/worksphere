import { formatCurrency } from '@/utils/currency'
import { Card } from '@/components/ui/Card'
import { TrendingUp, TrendingDown, Wallet, Activity } from 'lucide-react'

interface FinanceSummaryProps {
  totalBalance: number
  totalIncome: number
  totalExpense: number
  netIncome: number
}

export function FinanceSummary({
  totalBalance,
  totalIncome,
  totalExpense,
  netIncome,
}: FinanceSummaryProps) {
  return (
    <Card glass>
      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center">
            <Wallet className="w-5 h-5 text-primary-500" />
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Total Saldo</p>
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              {formatCurrency(totalBalance)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-success-light dark:bg-green-900/30 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-success" />
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Pemasukan</p>
            <p className="text-sm font-semibold text-success">{formatCurrency(totalIncome)}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-danger-light dark:bg-red-900/30 flex items-center justify-center">
            <TrendingDown className="w-5 h-5 text-danger" />
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Pengeluaran</p>
            <p className="text-sm font-semibold text-danger">{formatCurrency(totalExpense)}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
            <Activity className="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Bersih</p>
            <p
              className={`text-sm font-semibold ${netIncome >= 0 ? 'text-success' : 'text-danger'}`}
            >
              {formatCurrency(netIncome)}
            </p>
          </div>
        </div>
      </div>
    </Card>
  )
}
