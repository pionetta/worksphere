import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react'
import { startOfWeek, endOfWeek, format } from 'date-fns'
import { id } from 'date-fns/locale'

interface WeekNavigationProps {
  currentDate: Date
  onNext: () => void
  onPrev: () => void
  onToday: () => void
  isToday?: boolean
}

export function formatWeekDisplay(start: Date, end: Date): string {
  const sameYear = start.getFullYear() === end.getFullYear()
  const sameMonth = sameYear && start.getMonth() === end.getMonth()
  if (sameMonth) {
    return `${format(start, 'd', { locale: id })} - ${format(end, 'd MMM yyyy', { locale: id })}`
  }
  if (sameYear) {
    return `${format(start, 'd MMM', { locale: id })} - ${format(end, 'd MMM yyyy', { locale: id })}`
  }
  return `${format(start, 'd MMM yyyy', { locale: id })} - ${format(end, 'd MMM yyyy', { locale: id })}`
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
  const label = formatWeekDisplay(start, end)

  return (
    <div className="flex items-center justify-between p-2 my-2.5 rounded-xl bg-white/60 dark:bg-slate-800/60 border border-slate-200/50 text-xs font-semibold text-slate-700 dark:text-slate-200">
      <button
        type="button"
        onClick={onPrev}
        className="p-1 rounded-lg text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 active:scale-90 transition-transform cursor-pointer"
        aria-label="Minggu sebelumnya"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      <div className="flex items-center gap-2">
        <span>{label}</span>
        {!isToday && (
          <button
            type="button"
            onClick={onToday}
            className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 active:scale-95 transition-all cursor-pointer"
            aria-label="Kembali ke minggu ini"
          >
            <Calendar className="w-3 h-3" />
            <span>Minggu Ini</span>
          </button>
        )}
      </div>

      <button
        type="button"
        onClick={onNext}
        className="p-1 rounded-lg text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 active:scale-90 transition-transform cursor-pointer"
        aria-label="Minggu berikutnya"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  )
}

