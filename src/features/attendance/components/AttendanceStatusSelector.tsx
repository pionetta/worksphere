import { cn } from '@/utils/cn'

type Status = 'present' | 'absent' | 'holiday'

interface AttendanceStatusSelectorProps {
  value: Status
  onChange: (status: Status) => void
  disabled?: boolean
}

const statusConfig: Record<Status, { label: string; color: string; activeColor: string }> = {
  present: {
    label: 'Hadir',
    color: 'text-gray-400 dark:text-gray-500',
    activeColor: 'bg-success text-white',
  },
  absent: {
    label: 'Absen',
    color: 'text-gray-400 dark:text-gray-500',
    activeColor: 'bg-danger text-white',
  },
  holiday: {
    label: 'Libur',
    color: 'text-gray-400 dark:text-gray-500',
    activeColor: 'bg-warning text-white',
  },
}

export function AttendanceStatusSelector({
  value,
  onChange,
  disabled,
}: AttendanceStatusSelectorProps) {
  return (
    <div className="flex gap-1.5">
      {(Object.keys(statusConfig) as Status[]).map(status => {
        const config = statusConfig[status]
        const isActive = value === status
        return (
          <button
            key={status}
            onClick={() => onChange(status)}
            disabled={disabled}
            className={cn(
              'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
              isActive
                ? config.activeColor
                : cn(
                    'bg-gray-100 dark:bg-gray-700',
                    config.color,
                    'hover:bg-gray-200 dark:hover:bg-gray-600'
                  ),
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
