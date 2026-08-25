import { cn } from '@/lib/utils'
import { Check, X, Coffee } from 'lucide-react'

type Status = 'present' | 'absent' | 'holiday'

interface AttendanceStatusSelectorProps {
  value?: Status | null
  onChange: (status: Status) => void
  disabled?: boolean
}

const statusConfig: Record<
  Status,
  {
    label: string
    icon: typeof Check
    activeBg: string
    hoverBg: string
    inactiveBorder: string
    inactiveText: string
  }
> = {
  present: {
    label: 'Hadir',
    icon: Check,
    activeBg: 'bg-emerald-500 text-white border-emerald-500 shadow-md shadow-emerald-500/25 font-bold',
    hoverBg: 'bg-emerald-500',
    inactiveBorder: 'border-gray-200 dark:border-gray-700/80 hover:border-emerald-500 dark:hover:border-emerald-500',
    inactiveText: 'text-gray-700 dark:text-gray-300',
  },
  absent: {
    label: 'Absen',
    icon: X,
    activeBg: 'bg-rose-500 text-white border-rose-500 shadow-md shadow-rose-500/25 font-bold',
    hoverBg: 'bg-rose-500',
    inactiveBorder: 'border-gray-200 dark:border-gray-700/80 hover:border-rose-500 dark:hover:border-rose-500',
    inactiveText: 'text-gray-700 dark:text-gray-300',
  },
  holiday: {
    label: 'Libur',
    icon: Coffee,
    activeBg: 'bg-amber-500 text-white border-amber-500 shadow-md shadow-amber-500/25 font-bold',
    hoverBg: 'bg-amber-500',
    inactiveBorder: 'border-gray-200 dark:border-gray-700/80 hover:border-amber-500 dark:hover:border-amber-500',
    inactiveText: 'text-gray-700 dark:text-gray-300',
  },
}

export function AttendanceStatusSelector({
  value,
  onChange,
  disabled,
}: AttendanceStatusSelectorProps) {
  return (
    <div className="inline-flex items-center gap-1.5 p-1 rounded-xl bg-gray-100/90 dark:bg-gray-800/90 border border-gray-200/80 dark:border-gray-700/80 shadow-xs">
      {(Object.keys(statusConfig) as Status[]).map(status => {
        const config = statusConfig[status]
        const isActive = value === status
        const Icon = config.icon

        return (
          <button
            key={status}
            type="button"
            onClick={() => onChange(status)}
            disabled={disabled}
            className={cn(
              'group relative overflow-hidden px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-300 cursor-pointer select-none leading-none border flex items-center justify-center min-w-[66px] h-8',
              isActive
                ? cn(config.activeBg, 'scale-[1.02]')
                : cn(
                    'bg-white dark:bg-gray-900/70',
                    config.inactiveBorder,
                    config.inactiveText,
                    'active:scale-95'
                  ),
              disabled && 'opacity-50 cursor-not-allowed'
            )}
            aria-label={`Status: ${config.label}`}
          >
            {/* Active Content (Directly Rendered When Selected) */}
            {isActive ? (
              <div className="relative z-10 flex items-center justify-center gap-1.5">
                <Icon className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>{config.label}</span>
              </div>
            ) : (
              <>
                {/* Default Text (Slides Right and Fades on Hover) */}
                <span className="relative z-10 inline-block transition-all duration-300 group-hover:translate-x-8 group-hover:opacity-0">
                  {config.label}
                </span>

                {/* Hover Reveal with Icon and White Text (Slides in From Left) */}
                <div className="absolute inset-0 z-10 flex h-full w-full -translate-x-8 items-center justify-center gap-1.5 text-white opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100">
                  <Icon className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>{config.label}</span>
                </div>

                {/* Smooth Expanding Background on Hover */}
                <div
                  className={cn(
                    'absolute inset-0 z-0 h-full w-0 transition-all duration-300 ease-out group-hover:w-full pointer-events-none',
                    config.hoverBg
                  )}
                />
              </>
            )}
          </button>
        )
      })}
    </div>
  )
}
