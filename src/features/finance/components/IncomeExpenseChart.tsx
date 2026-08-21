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
import { Card } from '@/components/ui/Card'
import { formatCurrency } from '@/utils/currency'
import { aggregateIncomeExpenseByDay } from '@/features/finance/services/chartAggregationService'
import type { Transaction } from '@/types'

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
    <Card>
      <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
        Pemasukan vs Pengeluaran
      </h3>
      {!hasData ? (
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center py-8">
          Belum ada data transaksi bulan ini
        </p>
      ) : (
        <div className="h-56">
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
    </Card>
  )
}
