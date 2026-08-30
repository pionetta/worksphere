import { useState, useEffect, useMemo, useCallback } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Wallet,
  Users,
  ListTodo,
  Filter,
  Clock,
  Sparkles,
} from 'lucide-react'
import {
  getCalendarEventsForMonth,
  type MasterCalendarEvent,
  type CalendarModule,
} from '@/services/masterCalendarService'
import { formatCurrency } from '@/utils/currency'
import { cn } from '@/lib/utils'

interface MasterCalendarProps {
  userId: string
  onEventClick?: (event: MasterCalendarEvent) => void
}

const MONTH_NAMES = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
]

const DAY_NAMES = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']

export function MasterCalendar({ userId, onEventClick }: MasterCalendarProps) {
  const [currentDate, setCurrentDate] = useState(() => new Date())
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  })
  const [events, setEvents] = useState<MasterCalendarEvent[]>([])
  const [moduleFilter, setModuleFilter] = useState<CalendarModule | 'all'>('all')

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth() + 1

  const loadEvents = useCallback(async () => {
    if (!userId) return
    try {
      const data = await getCalendarEventsForMonth(userId, year, month)
      setEvents(data)
    } catch {
      // Ignore
    }
  }, [userId, year, month])

  useEffect(() => {
    loadEvents()

    const handleSync = () => loadEvents()
    window.addEventListener('worksphere-data-synced', handleSync)
    return () => window.removeEventListener('worksphere-data-synced', handleSync)
  }, [loadEvents])

  // Calendar Grid Calculation
  const calendarDays = useMemo(() => {
    const firstDay = new Date(year, month - 1, 1).getDay() // 0 = Sun
    const daysInMonth = new Date(year, month, 0).getDate()
    const daysInPrevMonth = new Date(year, month - 1, 0).getDate()

    const days: Array<{
      dateStr: string
      dayNum: number
      isCurrentMonth: boolean
      isToday: boolean
      isSelected: boolean
    }> = []

    const todayStr = new Date().toISOString().slice(0, 10)

    // Previous month filler days
    for (let i = firstDay - 1; i >= 0; i--) {
      const d = daysInPrevMonth - i
      const prevMonth = month === 1 ? 12 : month - 1
      const prevYear = month === 1 ? year - 1 : year
      const dateStr = `${prevYear}-${String(prevMonth).padStart(2, '0')}-${String(d).padStart(2, '0')}`
      days.push({
        dateStr,
        dayNum: d,
        isCurrentMonth: false,
        isToday: dateStr === todayStr,
        isSelected: dateStr === selectedDate,
      })
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(i).padStart(2, '0')}`
      days.push({
        dateStr,
        dayNum: i,
        isCurrentMonth: true,
        isToday: dateStr === todayStr,
        isSelected: dateStr === selectedDate,
      })
    }

    // Next month filler days (fill up to 35 or 42 grid cells)
    const remaining = (days.length <= 35 ? 35 : 42) - days.length
    if (remaining > 0) {
      for (let i = 1; i <= remaining; i++) {
        const nextMonth = month === 12 ? 1 : month + 1
        const nextYear = month === 12 ? year + 1 : year
        const dateStr = `${nextYear}-${String(nextMonth).padStart(2, '0')}-${String(i).padStart(2, '0')}`
        days.push({
          dateStr,
          dayNum: i,
          isCurrentMonth: false,
          isToday: dateStr === todayStr,
          isSelected: dateStr === selectedDate,
        })
      }
    }

    return days
  }, [year, month, selectedDate])

  // Events map grouped by date
  const eventsByDate = useMemo(() => {
    const map = new Map<string, MasterCalendarEvent[]>()
    for (const ev of events) {
      if (moduleFilter !== 'all' && ev.module !== moduleFilter) continue
      const list = map.get(ev.date) || []
      list.push(ev)
      map.set(ev.date, list)
    }
    return map
  }, [events, moduleFilter])

  // Events for the selected date
  const selectedDateEvents = useMemo(() => {
    return eventsByDate.get(selectedDate) || []
  }, [eventsByDate, selectedDate])

  const formattedSelectedDate = useMemo(() => {
    try {
      const [y, m, d] = selectedDate.split('-').map(Number)
      const dateObj = new Date(y, m - 1, d)
      return dateObj.toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    } catch {
      return selectedDate
    }
  }, [selectedDate])

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 2, 1))
  }

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month, 1))
  }

  const handleToday = () => {
    const today = new Date()
    setCurrentDate(today)
    setSelectedDate(today.toISOString().slice(0, 10))
  }

  return (
    <div className="space-y-3.5">
      {/* Calendar Header & Month Switcher */}
      <div className="flex items-center justify-between p-3 sm:p-4 rounded-2xl bg-white/90 dark:bg-gray-800/90 border border-gray-200/80 dark:border-gray-700/80 shadow-xs backdrop-blur-md">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400 flex items-center justify-center shrink-0 shadow-2xs">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm sm:text-base font-black text-gray-900 dark:text-white truncate">
              {MONTH_NAMES[month - 1]} {year}
            </h3>
            <p className="text-[11px] text-gray-500 dark:text-gray-400">
              {events.length} Agenda Bulan Ini
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={handleToday}
            className="px-2.5 py-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/50 dark:hover:bg-indigo-900/50 rounded-lg transition-colors cursor-pointer"
          >
            Hari Ini
          </button>
          <button
            type="button"
            onClick={handlePrevMonth}
            className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700/60 transition-colors cursor-pointer"
            aria-label="Bulan sebelumnya"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleNextMonth}
            className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700/60 transition-colors cursor-pointer"
            aria-label="Bulan berikutnya"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Module Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {(
          [
            { id: 'all', label: 'Semua', icon: <Filter className="w-3.5 h-3.5" /> },
            { id: 'todo', label: 'Tugas', icon: <ListTodo className="w-3.5 h-3.5" /> },
            { id: 'finance', label: 'Keuangan', icon: <Wallet className="w-3.5 h-3.5" /> },
            { id: 'attendance', label: 'Presensi', icon: <Users className="w-3.5 h-3.5" /> },
          ] as const
        ).map(tab => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setModuleFilter(tab.id)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer',
              moduleFilter === tab.id
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white/80 dark:bg-gray-800/80 text-gray-600 dark:text-gray-400 border border-gray-200/80 dark:border-gray-700/60 hover:bg-gray-100'
            )}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* ─── Month Calendar Grid ─── */}
      <div className="p-3 sm:p-4 rounded-2xl bg-white/90 dark:bg-gray-800/90 border border-gray-200/80 dark:border-gray-700/80 shadow-xs backdrop-blur-md">
        {/* Weekday headers */}
        <div className="grid grid-cols-7 gap-1 text-center mb-2">
          {DAY_NAMES.map((day, idx) => (
            <span
              key={day}
              className={cn(
                'text-[11px] font-extrabold py-0.5',
                idx === 0 ? 'text-rose-500' : 'text-gray-400 dark:text-gray-500'
              )}
            >
              {day}
            </span>
          ))}
        </div>

        {/* Day Cells Grid */}
        <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
          {calendarDays.map(cell => {
            const dayEvents = eventsByDate.get(cell.dateStr) || []
            const hasEvents = dayEvents.length > 0

            return (
              <button
                key={cell.dateStr}
                type="button"
                onClick={() => setSelectedDate(cell.dateStr)}
                className={cn(
                  'min-h-[46px] sm:min-h-[52px] p-1 rounded-xl flex flex-col items-center justify-between transition-all cursor-pointer select-none',
                  cell.isCurrentMonth
                    ? 'text-gray-800 dark:text-gray-200 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/30'
                    : 'text-gray-300 dark:text-gray-600 opacity-30',
                  cell.isSelected &&
                    'ring-2 ring-indigo-600 dark:ring-indigo-400 bg-indigo-50/90 dark:bg-indigo-950/60 font-bold shadow-2xs',
                  cell.isToday && !cell.isSelected && 'bg-gray-100 dark:bg-gray-700/40 font-bold'
                )}
              >
                <span
                  className={cn(
                    'text-xs w-6 h-6 flex items-center justify-center rounded-full',
                    cell.isToday ? 'bg-indigo-600 text-white font-bold' : ''
                  )}
                >
                  {cell.dayNum}
                </span>

                {/* Event Dots Container */}
                <div className="flex items-center gap-0.5 max-w-full overflow-hidden px-0.5 pb-0.5 h-2">
                  {hasEvents &&
                    dayEvents.slice(0, 3).map(ev => (
                      <span
                        key={ev.id}
                        className="w-1.5 h-1.5 rounded-full shrink-0 shadow-2xs"
                        style={{ backgroundColor: ev.color }}
                      />
                    ))}
                  {dayEvents.length > 3 && (
                    <span className="text-[9px] font-black text-indigo-500 leading-none">
                      +
                    </span>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* ─── Selected Day Agenda Panel ─── */}
      <div className="p-3.5 sm:p-4 rounded-2xl bg-white/90 dark:bg-gray-800/90 border border-gray-200/80 dark:border-gray-700/80 shadow-xs backdrop-blur-md space-y-3">
        <div className="flex items-center justify-between pb-2.5 border-b border-gray-100 dark:border-gray-800">
          <div className="min-w-0 pr-2">
            <h4 className="text-xs sm:text-sm font-extrabold text-gray-900 dark:text-white capitalize truncate">
              {formattedSelectedDate}
            </h4>
            <p className="text-[11px] text-gray-500 dark:text-gray-400">
              {selectedDateEvents.length} Agenda Terdaftar
            </p>
          </div>
          {selectedDateEvents.length > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 shrink-0">
              {selectedDateEvents.length} Item
            </span>
          )}
        </div>

        {selectedDateEvents.length === 0 ? (
          <div className="py-6 text-center text-xs text-gray-400 dark:text-gray-500 flex flex-col items-center justify-center gap-1.5">
            <Sparkles className="w-5 h-5 text-gray-300 dark:text-gray-600" />
            <span>Tidak ada agenda atau jadwal jatuh tempo pada tanggal ini.</span>
          </div>
        ) : (
          <div className="space-y-2 max-h-[35vh] overflow-y-auto pr-0.5">
            {selectedDateEvents.map(ev => (
              <div
                key={ev.id}
                onClick={() => onEventClick?.(ev)}
                className="flex items-center justify-between p-2.5 sm:p-3 rounded-xl bg-gray-50/80 dark:bg-gray-900/40 border border-gray-100 dark:border-gray-800/80 hover:border-indigo-200 dark:hover:border-indigo-800 transition-all cursor-pointer shadow-2xs"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center text-sm shrink-0"
                    style={{ backgroundColor: `${ev.color}15` }}
                  >
                    <span>{ev.icon || '📌'}</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white truncate">
                      {ev.title}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5 text-[11px] text-gray-500 dark:text-gray-400">
                      <span className="capitalize font-semibold">{ev.type}</span>
                      {ev.time && (
                        <span className="flex items-center gap-0.5">
                          <Clock className="w-3 h-3 text-gray-400" />
                          <span>{ev.time}</span>
                        </span>
                      )}
                      {ev.amount !== undefined && (
                        <span className="font-bold text-gray-700 dark:text-gray-300">
                          • {formatCurrency(ev.amount)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="shrink-0 pl-2">
                  <span
                    className="inline-block w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: ev.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
