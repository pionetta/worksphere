import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react'
import { format } from 'date-fns'
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

  const goToToday = () => {
    onChange(new Date())
  }

  const isToday = format(date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')

  return (
    <div className="flex items-center justify-between">
      <button
        onClick={goToPrev}
        className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700 transition-colors"
        aria-label="Tanggal sebelumnya"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      <div className="flex items-center gap-2">
        <div className="text-center">
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {format(date, 'EEEE', { locale: id })}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {format(date, 'd MMMM yyyy', { locale: id })}
          </p>
        </div>
        {!isToday && (
          <button
            onClick={goToToday}
            className="p-1.5 rounded-lg text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/30 transition-colors"
            aria-label="Kembali ke hari ini"
          >
            <Calendar className="w-4 h-4" />
          </button>
        )}
      </div>

      <button
        onClick={goToNext}
        className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700 transition-colors"
        aria-label="Tanggal berikutnya"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  )
}
