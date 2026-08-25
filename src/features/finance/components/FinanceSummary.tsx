import { formatCurrency } from '@/utils/currency'
import { Wallet, TrendingUp, ArrowDownLeft, ArrowUpRight } from 'lucide-react'

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
    <div className="relative overflow-hidden rounded-[26px] bg-gradient-to-tr from-[#3B82F6] via-[#3B7BF2] to-[#5085F8] text-white p-5 sm:p-6 shadow-xl shadow-blue-500/20">
      {/* Subtle glow highlight */}
      <div className="absolute top-0 right-0 -mt-10 -mr-10 w-44 h-44 bg-white/10 rounded-full blur-2xl pointer-events-none" />

      {/* Top Label */}
      <div className="flex items-center justify-between text-white/90">
        <div className="flex items-center gap-2">
          <Wallet className="w-5 h-5 text-white stroke-[2.2]" />
          <span className="text-xs sm:text-sm font-medium tracking-wide">Total Saldo Bersih</span>
        </div>
      </div>

      {/* Big Balance Number */}
      <div className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight">
        {formatCurrency(totalBalance)}
      </div>

      {/* Net Indicator */}
      <div className="mt-1 flex items-center gap-1 text-xs text-blue-100/90 font-medium">
        <TrendingUp className="w-3.5 h-3.5 text-emerald-300 stroke-[2.5]" />
        <span>{netIncome >= 0 ? '+' : ''}{formatCurrency(netIncome)} bulan ini</span>
      </div>

      {/* 2-Column Split */}
      <div className="mt-5 grid grid-cols-2 gap-4 pt-4 border-t border-white/20">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-white/15 flex items-center justify-center text-emerald-300">
            <ArrowDownLeft className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] text-white/75 font-semibold uppercase">Pemasukan</div>
            <div className="text-xs sm:text-sm font-bold text-[#86EFAC] tracking-tight">
              +{formatCurrency(totalIncome)}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-white/15 flex items-center justify-center text-rose-300">
            <ArrowUpRight className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] text-white/75 font-semibold uppercase">Pengeluaran</div>
            <div className="text-xs sm:text-sm font-bold text-[#FCA5A5] tracking-tight">
              -{formatCurrency(totalExpense)}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
