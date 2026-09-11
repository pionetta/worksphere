import { cn } from '@/lib/utils'
import { Check, X, Moon } from 'lucide-react'

type Status = 'present' | 'absent' | 'holiday'

interface AttendanceStatusSelectorProps {
  value?: Status | null
  onChange: (status: Status) => void
  disabled?: boolean
}

export function AttendanceStatusSelector({
  value,
  onChange,
  disabled,
}: AttendanceStatusSelectorProps) {
  return (
    <div className="flex items-center gap-2 shrink-0" role="group" aria-label="Status Kehadiran">
      {/* Tombol Hadir (Check) */}
      <button
        type="button"
        onClick={() => onChange('present')}
        disabled={disabled}
        aria-label="Hadir"
        title="Hadir"
        className={cn(
          'w-7 h-7 rounded-lg flex items-center justify-center transition-all active:scale-90 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed',
          value === 'present'
            ? 'bg-[#F0F3F8] dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-[inset_-2px_-2px_4px_rgba(255,255,255,0.8),inset_2px_2px_4px_rgba(163,177,198,0.3)] dark:shadow-[inset_-2px_-2px_4px_rgba(255,255,255,0.05),inset_2px_2px_4px_rgba(0,0,0,0.5)] font-bold'
            : 'bg-[#F0F3F8] dark:bg-slate-800 text-slate-400 dark:text-slate-500 shadow-[-2px_-2px_4px_rgba(255,255,255,0.9),2px_2px_4px_rgba(163,177,198,0.2)] dark:shadow-[-2px_-2px_4px_rgba(255,255,255,0.05),2px_2px_4px_rgba(0,0,0,0.4)] hover:text-emerald-600 dark:hover:text-emerald-400'
        )}
      >
        <Check className="w-3.5 h-3.5 stroke-[2.5]" />
        <span className="sr-only">Hadir</span>
      </button>

      {/* Tombol Absen (X) */}
      <button
        type="button"
        onClick={() => onChange('absent')}
        disabled={disabled}
        aria-label="Absen"
        title="Absen"
        className={cn(
          'w-7 h-7 rounded-lg flex items-center justify-center transition-all active:scale-90 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed',
          value === 'absent'
            ? 'bg-[#F0F3F8] dark:bg-slate-800 text-rose-600 dark:text-rose-400 shadow-[inset_-2px_-2px_4px_rgba(255,255,255,0.8),inset_2px_2px_4px_rgba(163,177,198,0.3)] dark:shadow-[inset_-2px_-2px_4px_rgba(255,255,255,0.05),inset_2px_2px_4px_rgba(0,0,0,0.5)] font-bold'
            : 'bg-[#F0F3F8] dark:bg-slate-800 text-slate-400 dark:text-slate-500 shadow-[-2px_-2px_4px_rgba(255,255,255,0.9),2px_2px_4px_rgba(163,177,198,0.2)] dark:shadow-[-2px_-2px_4px_rgba(255,255,255,0.05),2px_2px_4px_rgba(0,0,0,0.4)] hover:text-rose-600 dark:hover:text-rose-400'
        )}
      >
        <X className="w-3.5 h-3.5 stroke-[2.5]" />
        <span className="sr-only">Absen</span>
      </button>

      {/* Tombol Libur (Moon) */}
      <button
        type="button"
        onClick={() => onChange('holiday')}
        disabled={disabled}
        aria-label="Libur"
        title="Libur"
        className={cn(
          'w-7 h-7 rounded-lg flex items-center justify-center transition-all active:scale-90 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed',
          value === 'holiday'
            ? 'bg-[#F0F3F8] dark:bg-slate-800 text-amber-600 dark:text-amber-400 shadow-[inset_-2px_-2px_4px_rgba(255,255,255,0.8),inset_2px_2px_4px_rgba(163,177,198,0.3)] dark:shadow-[inset_-2px_-2px_4px_rgba(255,255,255,0.05),inset_2px_2px_4px_rgba(0,0,0,0.5)] font-bold'
            : 'bg-[#F0F3F8] dark:bg-slate-800 text-slate-400 dark:text-slate-500 shadow-[-2px_-2px_4px_rgba(255,255,255,0.9),2px_2px_4px_rgba(163,177,198,0.2)] dark:shadow-[-2px_-2px_4px_rgba(255,255,255,0.05),2px_2px_4px_rgba(0,0,0,0.4)] hover:text-amber-600 dark:hover:text-amber-400'
        )}
      >
        <Moon className="w-3.5 h-3.5 stroke-[2]" />
        <span className="sr-only">Libur</span>
      </button>
    </div>
  )
}
