import { Card } from '@/components/ui/Card'
import { Wallet, TrendingUp, TrendingDown } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { formatCurrency } from '@/utils/currency'

interface FinanceDashboardCardProps {
  totalBalance: number
  totalIncome: number
  totalExpense: number
  walletCount: number
}

export function FinanceDashboardCard({
  totalBalance,
  totalIncome,
  totalExpense,
  walletCount,
}: FinanceDashboardCardProps) {
  const navigate = useNavigate()

  if (walletCount === 0) {
    return (
      <Card
        glass
        className="cursor-pointer hover:shadow-md transition-shadow"
        onClick={() => navigate('/app/finance')}
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary-50 dark:bg-primary-900/30">
            <Wallet className="w-5 h-5 text-primary-500" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">Keuangan</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">Belum ada dompet</p>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card
      glass
      className="cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => navigate('/app/finance')}
    >
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-xl bg-primary-50 dark:bg-primary-900/30">
          <Wallet className="w-5 h-5 text-primary-500" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">Keuangan</h3>
          <p className="text-lg font-semibold text-gray-900 dark:text-gray-100 mt-1">
            {formatCurrency(totalBalance)}
          </p>
          <div className="flex gap-4 mt-2">
            <div className="flex items-center gap-1 text-xs">
              <TrendingUp className="w-3 h-3 text-success" />
              <span className="text-gray-600 dark:text-gray-400">Pemasukan</span>
              <span className="font-medium text-success">{formatCurrency(totalIncome)}</span>
            </div>
            <div className="flex items-center gap-1 text-xs">
              <TrendingDown className="w-3 h-3 text-danger" />
              <span className="text-gray-600 dark:text-gray-400">Pengeluaran</span>
              <span className="font-medium text-danger">{formatCurrency(totalExpense)}</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}
