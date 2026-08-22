import { cn } from '@/lib/utils'

type Status = 'present' | 'absent' | 'holiday'

interface AttendanceStatusSelectorProps {
  value: Status
  onChange: (status: Status) => void
  disabled?: boolean
}

const statusConfig: Record<Status, { label: string; activeColor: string }> = {
  present: {
    label: 'Hadir',
    activeColor: 'bg-emerald-500 dark:bg-emerald-600 text-white shadow-xs font-semibold',
  },
  absent: {
    label: 'Absen',
    activeColor: 'bg-rose-500 dark:bg-rose-600 text-white shadow-xs font-semibold',
  },
  holiday: {
    label: 'Libur',
    activeColor: 'bg-amber-500 dark:bg-amber-600 text-white shadow-xs font-semibold',
  },
}

export function AttendanceStatusSelector({
  value,
  onChange,
  disabled,
}: AttendanceStatusSelectorProps) {
  return (
    <div className="inline-flex items-center p-0.5 rounded-full bg-gray-100 dark:bg-gray-800/90 border border-gray-200/80 dark:border-gray-700/80">
      {(Object.keys(statusConfig) as Status[]).map(status => {
        const config = statusConfig[status]
        const isActive = value === status
        return (
          <button
            key={status}
            onClick={() => onChange(status)}
            disabled={disabled}
            className={cn(
              'px-3 py-1 rounded-full text-xs font-medium transition-all duration-150 cursor-pointer select-none leading-none',
              isActive
                ? config.activeColor
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5',
              disabled && 'opacity-50 cursor-not-allowed'
            )}
            aria-label={`Status: ${config.label}`}
          >
            {config.label}
          </button>
        )
      })}
    </div>
  )
}
