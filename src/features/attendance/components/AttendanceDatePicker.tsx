import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react'
import { format, subDays, isToday, isYesterday } from 'date-fns'
import { id } from 'date-fns/locale'
import { cn } from '@/lib/utils'

interface AttendanceDatePickerProps {
  date: Date
  onChange: (date: Date) => void
}

export function AttendanceDatePicker({ date, onChange }: AttendanceDatePickerProps) {
  const goToPrev = () => {
    const prev = new Date(date)
    prev.setDate(prev.getDate() - 1)
    onChange(prev)
  }

  const goToNext = () => {
    const next = new Date(date)
    next.setDate(next.getDate() + 1)
    onChange(next)
  }

  const isCurrentDateToday = isToday(date)
  const isCurrentDateYesterday = isYesterday(date)

  return (
    <div className="space-y-2.5">
      {/* Quick Select Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        <button
          type="button"
          onClick={() => onChange(new Date())}
          className={cn(
            'px-3 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer shrink-0',
            isCurrentDateToday
              ? 'bg-[#2563EB] text-white shadow-xs'
              : 'bg-white/80 dark:bg-gray-800/80 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50'
          )}
        >
          Hari Ini
        </button>
        <button
          type="button"
          onClick={() => onChange(subDays(new Date(), 1))}
          className={cn(
            'px-3 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer shrink-0',
            isCurrentDateYesterday
              ? 'bg-[#2563EB] text-white shadow-xs'
              : 'bg-white/80 dark:bg-gray-800/80 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50'
          )}
        >
          Kemarin
        </button>
        <button
          type="button"
          onClick={() => onChange(subDays(new Date(), 2))}
          className={cn(
            'px-3 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer shrink-0',
            !isCurrentDateToday && !isCurrentDateYesterday
              ? 'bg-[#2563EB] text-white shadow-xs'
              : 'bg-white/80 dark:bg-gray-800/80 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50'
          )}
        >
          2 Hari Lalu
        </button>
      </div>

      {/* Date Stepper Bar */}
      <div className="flex items-center justify-between p-2 rounded-2xl bg-white/70 dark:bg-gray-900/40 border border-gray-200/80 dark:border-gray-700/70 shadow-xs">
        <button
          onClick={goToPrev}
          className="p-1.5 rounded-xl text-gray-500 hover:text-gray-800 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-800 transition-colors cursor-pointer"
          aria-label="Tanggal sebelumnya"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-center">
          <CalendarDays className="w-4 h-4 text-[#2563EB] dark:text-blue-400 shrink-0" />
          <span className="text-xs sm:text-sm font-bold text-gray-900 dark:text-gray-100">
            {format(date, 'EEEE, d MMMM yyyy', { locale: id })}
          </span>
        </div>

        <button
          onClick={goToNext}
          className="p-1.5 rounded-xl text-gray-500 hover:text-gray-800 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-800 transition-colors cursor-pointer"
          aria-label="Tanggal berikutnya"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}
