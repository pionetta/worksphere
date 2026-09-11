import { AttendanceStatusSelector } from './AttendanceStatusSelector'
import type { Attendance, AttendanceStatus, Member } from '@/types'

interface AttendanceRowProps {
  member: Member
  index?: number
  attendance?: Attendance
  status?: AttendanceStatus
  onStatusChange: (status: AttendanceStatus) => void
  disabled?: boolean
}

export function AttendanceRow({
  member,
  index,
  attendance,
  status,
  onStatusChange,
  disabled,
}: AttendanceRowProps) {
  const currentStatus = status ?? attendance?.status

  return (
    <div className="flex items-center justify-between py-3 px-2 rounded-2xl hover:bg-white/40 dark:hover:bg-slate-800/40 transition-colors border-b border-slate-200/60 dark:border-slate-800/60 last:border-0 gap-3">
      <div className="flex items-center gap-2.5 min-w-0 flex-1">
        {/* Avatar/Nomor: Bulatan timbul lembut */}
        <div className="w-8 h-8 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold flex items-center justify-center text-xs shadow-sm shrink-0">
          {index !== undefined ? index + 1 : member.name.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
            {member.name}
          </p>
          {member.note ? (
            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
              {member.note}
            </p>
          ) : (
            <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate">
              Anggota Tim
            </p>
          )}
        </div>
      </div>
      <AttendanceStatusSelector
        value={currentStatus}
        onChange={onStatusChange}
        disabled={disabled}
      />
    </div>
  )
}
