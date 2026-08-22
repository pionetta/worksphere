import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Wallet, TrendingUp, TrendingDown, Eye, EyeOff } from 'lucide-react'
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
  const [showBalance, setShowBalance] = useState(true)

  if (walletCount === 0) {
    return (
      <Card
        glass
        className="cursor-pointer hover:shadow-md transition-all duration-200 hover:border-primary-200 dark:hover:border-primary-800"
        onClick={() => navigate('/app/finance')}
      >
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Keuangan</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">Belum ada dompet</p>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card
      glass
      className="cursor-pointer hover:shadow-md transition-all duration-200 hover:border-primary-200 dark:hover:border-primary-800"
      onClick={() => navigate('/app/finance')}
    >
      <div className="flex items-start gap-3.5">
        <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary-500 to-indigo-600 text-white shadow-sm">
          <Wallet className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Keuangan</h3>
            <button
              onClick={e => {
                e.stopPropagation()
                setShowBalance(prev => !prev)
              }}
              className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors cursor-pointer"
              aria-label={showBalance ? 'Sembunyikan saldo' : 'Tampilkan saldo'}
              title={showBalance ? 'Sembunyikan saldo' : 'Tampilkan saldo'}
            >
              {showBalance ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          <p className="text-xl font-bold text-gray-900 dark:text-gray-100 mt-1 tracking-tight">
            {showBalance ? formatCurrency(totalBalance) : '••••••••'}
          </p>

          <div className="flex gap-4 mt-2.5 pt-2 border-t border-gray-100 dark:border-gray-800/80">
            <div className="flex items-center gap-1.5 text-xs">
              <div className="w-4 h-4 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <TrendingUp className="w-2.5 h-2.5" />
              </div>
              <span className="text-gray-500 dark:text-gray-400">Masuk:</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                {showBalance ? formatCurrency(totalIncome) : '•••'}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs">
              <div className="w-4 h-4 rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center text-rose-600 dark:text-rose-400">
                <TrendingDown className="w-2.5 h-2.5" />
              </div>
              <span className="text-gray-500 dark:text-gray-400">Keluar:</span>
              <span className="font-semibold text-rose-600 dark:text-rose-400">
                {showBalance ? formatCurrency(totalExpense) : '•••'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}
