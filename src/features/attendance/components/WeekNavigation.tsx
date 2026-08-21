import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react'
import { formatWeekRange } from '@/utils/date'
import { startOfWeek, endOfWeek } from 'date-fns'

interface WeekNavigationProps {
  currentDate: Date
  onNext: () => void
  onPrev: () => void
  onToday: () => void
  isToday?: boolean
}

export function WeekNavigation({
  currentDate,
  onNext,
  onPrev,
  onToday,
  isToday,
}: WeekNavigationProps) {
  const start = startOfWeek(currentDate, { weekStartsOn: 1 })
  const end = endOfWeek(currentDate, { weekStartsOn: 1 })
  const label = formatWeekRange(start, end)

  return (
    <div className="flex items-center justify-between">
      <button
        onClick={onPrev}
        className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700 transition-colors"
        aria-label="Minggu sebelumnya"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{label}</span>
        {!isToday && (
          <button
            onClick={onToday}
            className="p-1.5 rounded-lg text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/30 transition-colors"
            aria-label="Kembali ke minggu ini"
          >
            <Calendar className="w-4 h-4" />
          </button>
        )}
      </div>

      <button
        onClick={onNext}
        className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700 transition-colors"
        aria-label="Minggu berikutnya"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  )
}
