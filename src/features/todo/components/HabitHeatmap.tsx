import { useMemo } from 'react'
import type { HabitLog } from '@/types'
import { cn } from '@/lib/utils'

interface HabitHeatmapProps {
  logs: HabitLog[]
  daysCount?: number
  color?: string
}

export function HabitHeatmap({ logs, daysCount = 60, color = '#10B981' }: HabitHeatmapProps) {
  const completedDateMap = useMemo(() => {
    const map = new Map<string, number>()
    for (const log of logs) {
      map.set(log.completed_date, (map.get(log.completed_date) || 0) + 1)
    }
    return map
  }, [logs])

  const cells = useMemo(() => {
    const list = []
    const today = new Date()

    for (let i = daysCount - 1; i >= 0; i--) {
      const d = new Date(today)
      d.setDate(d.getDate() - i)
      const y = d.getFullYear()
      const m = String(d.getMonth() + 1).padStart(2, '0')
      const dayNum = String(d.getDate()).padStart(2, '0')
      const dateStr = `${y}-${m}-${dayNum}`

      const count = completedDateMap.get(dateStr) || 0

      list.push({
        date: dateStr,
        count,
        isCompleted: count > 0,
      })
    }
    return list
  }, [completedDateMap, daysCount])

  const totalCompletions = logs.length
  const consistencyRate = Math.min(100, Math.round((totalCompletions / daysCount) * 100))

  return (
    <div className="p-3.5 sm:p-4 rounded-2xl bg-white/80 dark:bg-gray-800/80 border border-gray-100 dark:border-gray-700/60 shadow-xs backdrop-blur-md">
      <div className="flex items-center justify-between mb-2.5">
        <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
          Konsistensi ({daysCount} Hari Terakhir)
        </span>
        <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">
          {consistencyRate}%
        </span>
      </div>

      <div className="flex flex-wrap gap-1.5 justify-start">
        {cells.map(cell => (
          <div
            key={cell.date}
            className={cn(
              'w-3.5 h-3.5 rounded-sm transition-all cursor-default',
              cell.isCompleted
                ? 'shadow-2xs'
                : 'bg-gray-100 dark:bg-gray-700/60'
            )}
            style={{
              backgroundColor: cell.isCompleted ? color : undefined,
              opacity: cell.isCompleted ? 1 : 0.6,
            }}
            title={`${cell.date}: ${cell.isCompleted ? 'Selesai' : 'Tidak ada log'}`}
          />
        ))}
      </div>
    </div>
  )
}
