import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { formatCurrency } from '@/utils/currency'
import { aggregateExpenseByCategory } from '@/features/finance/services/chartAggregationService'
import type { Transaction } from '@/types'
import { PieChart as PieIcon } from 'lucide-react'

interface ExpenseByCategoryChartProps {
  transactions: Transaction[]
  categoryMap: Record<string, string>
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

export function ExpenseByCategoryChart({ transactions, categoryMap }: ExpenseByCategoryChartProps) {
  const categories = aggregateExpenseByCategory(transactions, categoryMap)
  const hasData = categories.length > 0

  return (
    <div className="rounded-[26px] bg-white/90 dark:bg-gray-800/90 border border-white/80 dark:border-gray-700/50 p-4 sm:p-5 shadow-sm backdrop-blur-md space-y-3">
      <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-[#2563EB] dark:text-blue-400 flex items-center justify-center">
            <PieIcon className="w-4 h-4" />
          </div>
          <h3 className="text-xs sm:text-sm font-extrabold text-gray-900 dark:text-gray-100">
            Pengeluaran per Kategori
          </h3>
        </div>
        <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400">
          {categories.length} Kategori
        </span>
      </div>

      {!hasData ? (
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center py-8">
          Belum ada data pengeluaran
        </p>
      ) : (
        <div className="space-y-4">
          <div className="h-56">
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
