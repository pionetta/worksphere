import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { formatCurrency } from '@/utils/currency'
import { aggregateIncomeExpenseByDay } from '@/features/finance/services/chartAggregationService'
import type { Transaction } from '@/types'
import { BarChart3 } from 'lucide-react'

interface IncomeExpenseChartProps {
  transactions: Transaction[]
  year: number
  month: number
}

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: Array<{ name: string; value: number; color: string }>
  label?: string
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm px-3 py-2 shadow-lg text-xs">
      <p className="font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name === 'income' ? 'Pemasukan' : 'Pengeluaran'}: {formatCurrency(p.value)}
        </p>
      ))}
    </div>
  )
}

export function IncomeExpenseChart({ transactions, year, month }: IncomeExpenseChartProps) {
  const { incomeByDay, expenseByDay } = aggregateIncomeExpenseByDay(transactions, year, month)

  const data = incomeByDay.map((d, i) => ({
    label: d.label,
    income: d.amount,
    expense: expenseByDay[i].amount,
  }))

  const hasData = data.some(d => d.income > 0 || d.expense > 0)

  return (
    <div className="rounded-3xl bg-white/75 dark:bg-slate-900/75 backdrop-blur-xl border border-white/60 dark:border-white/10 shadow-lg shadow-indigo-500/5 p-4 sm:p-5 transition-colors space-y-3">
      <div className="flex items-center justify-between pb-2 border-b border-white/60 dark:border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <BarChart3 className="w-3.5 h-3.5" />
          </div>
          <h3 className="text-xs sm:text-sm font-bold text-[#1E1B4B] dark:text-slate-100">
            Arus Keuangan
          </h3>
        </div>
      </div>

      {!hasData ? (
        <div className="py-5 px-3 flex flex-col items-center justify-center text-center">
          {/* Ghost Comparison Bar Illustration */}
          <div className="relative w-48 h-28 flex items-end justify-between px-4 pb-2 border-b border-dashed border-gray-300 dark:border-gray-700 mb-3">
            {/* Pair 1 */}
            <div className="flex items-end gap-1">
              <div className="w-2.5 h-10 rounded-t-sm bg-emerald-500/35 dark:bg-emerald-500/45" />
              <div className="w-2.5 h-6 rounded-t-sm bg-rose-500/35 dark:bg-rose-500/45" />
            </div>
            {/* Pair 2 */}
            <div className="flex items-end gap-1">
              <div className="w-2.5 h-14 rounded-t-sm bg-emerald-500/40 dark:bg-emerald-500/50" />
              <div className="w-2.5 h-12 rounded-t-sm bg-rose-500/40 dark:bg-rose-500/50" />
            </div>
            {/* Pair 3 */}
            <div className="flex items-end gap-1">
              <div className="w-2.5 h-8 rounded-t-sm bg-emerald-500/35 dark:bg-emerald-500/45" />
              <div className="w-2.5 h-16 rounded-t-sm bg-rose-500/40 dark:bg-rose-500/50" />
            </div>
            {/* Pair 4 */}
            <div className="flex items-end gap-1">
              <div className="w-2.5 h-20 rounded-t-sm bg-emerald-500/45 dark:bg-emerald-500/55" />
              <div className="w-2.5 h-9 rounded-t-sm bg-rose-500/35 dark:bg-rose-500/45" />
            </div>
            {/* Pair 5 */}
            <div className="flex items-end gap-1">
              <div className="w-2.5 h-11 rounded-t-sm bg-emerald-500/35 dark:bg-emerald-500/45" />
              <div className="w-2.5 h-15 rounded-t-sm bg-rose-500/40 dark:bg-rose-500/50" />
            </div>
          </div>

          <h4 className="text-xs sm:text-sm font-extrabold text-gray-800 dark:text-gray-200 mb-1">
            Belum Ada Aktivitas Transaksi
          </h4>
          <p className="text-[11px] text-gray-500 dark:text-gray-400 max-w-xs leading-relaxed mb-3">
            Grafik arus pemasukan dan pengeluaran harian akan muncul secara otomatis saat ada transaksi di bulan ini.
          </p>

          {/* Ghost Legend */}
          <div className="flex items-center gap-3 text-[10px] font-bold text-gray-400 dark:text-gray-500">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500/50" /> Pemasukan
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-rose-500/50" /> Pengeluaran
            </span>
          </div>
        </div>
      ) : (
        <div className="h-48 sm:h-52">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
              <YAxis
                tick={{ fontSize: 10 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={v => {
                  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(0)}jt`
                  if (v >= 1_000) return `${(v / 1_000).toFixed(0)}rb`
                  return String(v)
                }}
              />
              <Tooltip content={<ChartTooltip />} />
              <Legend
                formatter={(value: string) => (value === 'income' ? 'Pemasukan' : 'Pengeluaran')}
                wrapperStyle={{ fontSize: 11 }}
              />
              <Bar dataKey="income" fill="#22c55e" radius={[3, 3, 0, 0]} />
              <Bar dataKey="expense" fill="#ef4444" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}

