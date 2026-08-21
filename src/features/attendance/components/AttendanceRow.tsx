import { AttendanceStatusSelector } from './AttendanceStatusSelector'
import type { Attendance, AttendanceStatus, Member } from '@/types'

interface AttendanceRowProps {
  member: Member
  attendance?: Attendance
  onStatusChange: (status: AttendanceStatus) => void
  disabled?: boolean
}

export function AttendanceRow({
  member,
  attendance,
  onStatusChange,
  disabled,
}: AttendanceRowProps) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700/50 last:border-0">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
          {member.name}
        </p>
        {member.note && (
          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{member.note}</p>
        )}
      </div>
      <AttendanceStatusSelector
        value={attendance?.status ?? 'present'}
        onChange={onStatusChange}
        disabled={disabled}
      />
    </div>
  )
}
