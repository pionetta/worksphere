import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { formatCurrency } from '@/utils/currency'
import { aggregateExpenseByCategory } from '@/features/finance/services/chartAggregationService'
import type { Transaction } from '@/types'
import { PieChart as PieIcon, Tag } from 'lucide-react'

interface ExpenseByCategoryChartProps {
  transactions: Transaction[]
  categoryMap: Record<string, string>
  year?: number
  month?: number
  onManageCategories?: () => void
}

const COLORS = [
  '#2563EB', // Royal Blue
  '#3B82F6', // Blue 500
  '#10B981', // Emerald
  '#F59E0B', // Amber
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#06B6D4', // Cyan
  '#F97316', // Orange
]

interface TooltipPayloadItem {
  name: string
  value: number
  payload: { categoryName: string; amount: number; percentage: number }
}

function ChartTooltip({ active, payload }: { active?: boolean; payload?: TooltipPayloadItem[] }) {
  if (!active || !payload?.length) return null
  const item = payload[0]
  return (
    <div className="rounded-2xl border border-white/80 dark:border-gray-700/80 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md p-3 shadow-xl text-xs space-y-1">
      <p className="font-bold text-gray-900 dark:text-gray-100">{item.payload.categoryName}</p>
      <p className="text-rose-600 dark:text-rose-400 font-extrabold">{formatCurrency(item.payload.amount)}</p>
      <p className="text-gray-500 dark:text-gray-400 text-[11px] font-semibold">{item.payload.percentage}% dari total</p>
    </div>
  )
}

export function ExpenseByCategoryChart({
  transactions,
  categoryMap,
  year,
  month,
  onManageCategories,
}: ExpenseByCategoryChartProps) {
  const filteredTransactions = (year && month)
    ? transactions.filter(t => {
        const d = t.transaction_date
        return d && d.startsWith(`${year}-${String(month).padStart(2, '0')}`)
      })
    : transactions

  const categories = aggregateExpenseByCategory(filteredTransactions, categoryMap)
  const hasData = categories.length > 0

  return (
    <div className="rounded-3xl bg-white/75 dark:bg-slate-900/75 backdrop-blur-xl border border-white/60 dark:border-white/10 shadow-lg shadow-indigo-500/5 p-4 sm:p-5 transition-colors space-y-3">
      <div className="flex items-center justify-between pb-2 border-b border-white/60 dark:border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <PieIcon className="w-3.5 h-3.5" />
          </div>
          <h3 className="text-xs sm:text-sm font-bold text-[#1E1B4B] dark:text-slate-100">
            Pengeluaran per Kategori
          </h3>
        </div>
        <div className="flex items-center gap-2">
          {onManageCategories && (
            <button
              type="button"
              onClick={onManageCategories}
              className="text-xs text-[#2563EB] dark:text-[#3B82F6] font-semibold hover:underline cursor-pointer flex items-center gap-1"
            >
              <Tag className="w-3 h-3" />
              <span>Kelola Kategori</span>
            </button>
          )}
          <span className="text-[11px] font-medium text-[#737373] dark:text-[#A3A3A3]">
            {categories.length} Kategori
          </span>
        </div>
      </div>

      {!hasData ? (
        <div className="py-5 px-3 flex flex-col items-center justify-center text-center">
          {/* Ghost Donut Illustration */}
          <div className="relative w-32 h-32 flex items-center justify-center mb-2.5">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="38"
                fill="none"
                className="stroke-gray-200 dark:stroke-gray-700/60"
                strokeWidth="8"
                strokeDasharray="4 3"
              />
              <circle
                cx="50"
                cy="50"
                r="38"
                fill="none"
                stroke="#3B82F6"
                strokeWidth="8"
                strokeDasharray="25 100"
                strokeLinecap="round"
                className="opacity-40"
              />
              <circle
                cx="50"
                cy="50"
                r="38"
                fill="none"
                stroke="#10B981"
                strokeWidth="8"
                strokeDasharray="18 100"
                strokeDashoffset="-32"
                strokeLinecap="round"
                className="opacity-40"
              />
              <circle
                cx="50"
                cy="50"
                r="38"
                fill="none"
                stroke="#F59E0B"
                strokeWidth="8"
                strokeDasharray="15 100"
                strokeDashoffset="-55"
                strokeLinecap="round"
                className="opacity-40"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-[#2563EB] dark:text-[#3B82F6] flex items-center justify-center shadow-xs">
                <PieIcon className="w-4 h-4 stroke-[2.2]" />
              </div>
            </div>
          </div>

          <h4 className="text-xs sm:text-sm font-bold text-[#171717] dark:text-[#F5F5F5] mb-1">
            Belum Ada Pengeluaran
          </h4>
          <p className="text-[11px] text-[#737373] dark:text-[#A3A3A3] max-w-xs leading-relaxed mb-3">
            Belum ada pengeluaran yang dicatat bulan ini. Catat transaksi pengeluaran untuk melihat komposisi persentase belanja berdasarkan kategori.
          </p>

          {/* Ghost Categories Pills */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 opacity-60">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#F7F7F5] dark:bg-[#181818] text-[#737373] dark:text-[#A3A3A3] border border-dashed border-[#E6E6E3] dark:border-[#272727]">
              Makanan & Minuman
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#F7F7F5] dark:bg-[#181818] text-[#737373] dark:text-[#A3A3A3] border border-dashed border-[#E6E6E3] dark:border-[#272727]">
              Transportasi
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#F7F7F5] dark:bg-[#181818] text-[#737373] dark:text-[#A3A3A3] border border-dashed border-[#E6E6E3] dark:border-[#272727]">
              Tagihan
            </span>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="h-48 sm:h-52">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categories}
                  dataKey="amount"
                  nameKey="categoryName"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  innerRadius={45}
                  paddingAngle={3}
                  strokeWidth={0}
                >
                  {categories.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<ChartTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="pt-2 border-t border-gray-100 dark:border-gray-800 space-y-2">
            {categories.slice(0, 6).map((cat, i) => (
              <div key={cat.categoryId} className="flex items-center justify-between text-xs py-1">
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: COLORS[i % COLORS.length] }}
                  />
                  <span className="text-gray-700 dark:text-gray-300 font-medium truncate">
                    {cat.categoryName}
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400">
                    {formatCurrency(cat.amount)}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-blue-50 dark:bg-blue-950/50 text-[#2563EB] dark:text-blue-300">
                    {cat.percentage}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
