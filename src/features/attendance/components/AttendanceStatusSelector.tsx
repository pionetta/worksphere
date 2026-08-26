import { cn } from '@/lib/utils'
import { Check, X, Coffee, ChevronDown } from 'lucide-react'

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
    badgeClass: string
    dotClass: string
  }
> = {
  present: {
    label: 'Hadir',
    icon: Check,
    badgeClass:
      'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 dark:border-emerald-500/40 hover:bg-emerald-500/20',
    dotClass: 'bg-emerald-500',
  },
  absent: {
    label: 'Absen',
    icon: X,
    badgeClass:
      'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/30 dark:border-rose-500/40 hover:bg-rose-500/20',
    dotClass: 'bg-rose-500',
  },
  holiday: {
    label: 'Libur',
    icon: Coffee,
    badgeClass:
      'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30 dark:border-amber-500/40 hover:bg-amber-500/20',
    dotClass: 'bg-amber-500',
  },
}

export function AttendanceStatusSelector({
  value,
  onChange,
  disabled,
}: AttendanceStatusSelectorProps) {
  const currentConfig = value ? statusConfig[value] : null
  const Icon = currentConfig?.icon

  return (
    <div className="relative inline-flex items-center shrink-0">
      {/* Visual Badge Display */}
      <div
        className={cn(
          'flex items-center justify-between gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-extrabold transition-all duration-200 select-none pointer-events-none min-w-[110px] sm:min-w-[120px] h-9 shadow-xs backdrop-blur-xs',
          currentConfig
            ? currentConfig.badgeClass
            : 'bg-white/80 dark:bg-gray-800/80 text-gray-500 dark:text-gray-400 border-gray-200/80 dark:border-gray-700/80',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        <div className="flex items-center gap-1.5 truncate">
          {Icon ? (
            <Icon className="w-3.5 h-3.5 stroke-[2.5] shrink-0" />
          ) : (
            <span className="w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-500 shrink-0" />
          )}
          <span className="truncate">{currentConfig ? currentConfig.label : 'Pilih status'}</span>
        </div>
        <ChevronDown className="w-3.5 h-3.5 opacity-60 shrink-0" />
      </div>

      {/* Accessible Interactive Native Dropdown */}
      <select
        value={value ?? ''}
        onChange={e => {
          const val = e.target.value as Status
          if (val) onChange(val)
        }}
        disabled={disabled}
        aria-label="Pilih Status Kehadiran"
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed z-10"
      >
        <option value="" disabled>
          -- Pilih Status --
        </option>
        <option value="present">✓ Hadir</option>
        <option value="absent">✕ Absen</option>
        <option value="holiday">☕ Libur</option>
      </select>
    </div>
  )
}
