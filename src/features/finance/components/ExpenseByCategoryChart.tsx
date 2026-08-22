import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { Card } from '@/components/ui/Card'
import { formatCurrency } from '@/utils/currency'
import { aggregateExpenseByCategory } from '@/features/finance/services/chartAggregationService'
import type { Transaction } from '@/types'

interface ExpenseByCategoryChartProps {
  transactions: Transaction[]
  categoryMap: Record<string, string>
}

const COLORS = [
  '#6366f1',
  '#22c55e',
  '#ef4444',
  '#f59e0b',
  '#3b82f6',
  '#a855f7',
  '#14b8a6',
  '#ec4899',
]

interface TooltipPayloadItem {
  name: string
  value: number
  payload: { name: string; amount: number }
}

function ChartTooltip({ active, payload }: { active?: boolean; payload?: TooltipPayloadItem[] }) {
  if (!active || !payload?.length) return null
  const item = payload[0]
  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm px-3 py-2 shadow-lg text-xs">
      <p className="font-medium text-gray-700 dark:text-gray-300">{item.payload.name}</p>
      <p className="text-gray-600 dark:text-gray-400">{formatCurrency(item.payload.amount)}</p>
    </div>
  )
}

interface LegendPayload {
  value: string
  color: string
}

function ChartLegend({ payload }: { payload?: LegendPayload[] }) {
  if (!payload) return null
  return (
    <div className="flex flex-wrap gap-x-3 gap-y-1 justify-center mt-2">
      {payload.map(entry => (
        <span
          key={entry.value}
          className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400"
        >
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
          {entry.value}
        </span>
      ))}
    </div>
  )
}

export function ExpenseByCategoryChart({ transactions, categoryMap }: ExpenseByCategoryChartProps) {
  const categories = aggregateExpenseByCategory(transactions, categoryMap)
  const hasData = categories.length > 0

  return (
    <Card>
      <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
        Pengeluaran per Kategori
      </h3>
      {!hasData ? (
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center py-8">
          Belum ada data pengeluaran
        </p>
      ) : (
        <div className="space-y-3">
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categories}
                  dataKey="amount"
                  nameKey="categoryName"
                  cx="50%"
                  cy="45%"
                  outerRadius={75}
                  innerRadius={35}
                  paddingAngle={2}
                  strokeWidth={0}
                >
                  {categories.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<ChartTooltip />} />
                <Legend content={<ChartLegend />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="pt-2 border-t border-gray-100 dark:border-gray-700/50 space-y-1.5">
            {categories.slice(0, 5).map((cat, i) => (
              <div key={cat.categoryId} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: COLORS[i % COLORS.length] }}
                  />
                  <span className="text-gray-600 dark:text-gray-400 truncate">
                    {cat.categoryName}
                  </span>
                </div>
                <span className="text-gray-900 dark:text-gray-100 font-medium ml-2 shrink-0">
                  {cat.percentage}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  )
}
