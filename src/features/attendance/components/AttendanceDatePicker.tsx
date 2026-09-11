import { ChevronLeft, ChevronRight, Calendar, RotateCcw } from 'lucide-react'
import { format, isToday } from 'date-fns'
import { id } from 'date-fns/locale'

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

  const resetToToday = () => {
    onChange(new Date())
  }

  const isCurrentDateToday = isToday(date)

  return (
    <div className="w-full h-12 min-h-[48px] flex items-center justify-between px-3 py-2 my-2 rounded-2xl bg-[#F0F3F8] dark:bg-slate-800 border border-white/80 dark:border-white/10 shadow-[-4px_-4px_9px_rgba(255,255,255,0.9),4px_4px_9px_rgba(163,177,198,0.28)] shadow-sm">
      <button
        type="button"
        onClick={goToPrev}
        className="p-1.5 rounded-xl text-slate-500 hover:text-indigo-600 active:scale-90 transition-transform cursor-pointer shrink-0"
        aria-label="Tanggal sebelumnya"
        title="Tanggal sebelumnya"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      <div className="flex items-center gap-2 text-center min-w-0 px-2 justify-center flex-1">
        <div className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
          <Calendar className="w-4 h-4" />
        </div>
        <div className="min-w-0 flex items-center justify-center truncate">
          <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 capitalize truncate">
            {format(date, 'EEEE, d MMMM yyyy', { locale: id })}
          </span>
          {isCurrentDateToday ? (
            <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 ml-2 shrink-0">
              • Hari Ini
            </span>
          ) : (
            <button
              type="button"
              onClick={resetToToday}
              className="flex items-center gap-1 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-full hover:bg-indigo-100 dark:hover:bg-indigo-900/80 transition-colors ml-2 cursor-pointer shrink-0"
            >
              <RotateCcw className="w-3 h-3" />
              Hari Ini
            </button>
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={goToNext}
        className="p-1.5 rounded-xl text-slate-500 hover:text-indigo-600 active:scale-90 transition-transform cursor-pointer shrink-0"
        aria-label="Tanggal berikutnya"
        title="Tanggal berikutnya"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  )
}
