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
    <div className="flex items-center justify-between py-3 px-1.5 rounded-2xl hover:bg-white/60 dark:hover:bg-gray-800/40 transition-colors border-b border-gray-100 dark:border-gray-800/80 last:border-0 gap-2.5">
      <div className="flex items-center gap-2.5 min-w-0 flex-1">
        {/* Number Badge */}
        <div className="w-8 h-8 rounded-xl bg-blue-500/10 dark:bg-blue-900/30 text-[#2563EB] dark:text-blue-400 flex items-center justify-center text-xs font-black shrink-0">
          {index !== undefined ? index + 1 : member.name.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs sm:text-sm font-bold text-gray-900 dark:text-gray-100 truncate">
            {member.name}
          </p>
          {member.note ? (
            <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">
              {member.note}
            </p>
          ) : (
            <p className="text-[11px] text-gray-400 dark:text-gray-500 truncate">
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
