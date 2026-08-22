import { AttendanceStatusSelector } from './AttendanceStatusSelector'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import type { Attendance, AttendanceStatus, Member } from '@/types'
import { cn } from '@/lib/utils'

interface AttendanceRowProps {
  member: Member
  attendance?: Attendance
  status?: AttendanceStatus
  onStatusChange: (status: AttendanceStatus) => void
  disabled?: boolean
}

function getAvatarBg(name: string) {
  const colors = [
    'bg-indigo-500 text-white',
    'bg-sky-500 text-white',
    'bg-emerald-500 text-white',
    'bg-violet-500 text-white',
    'bg-amber-500 text-white',
    'bg-rose-500 text-white',
    'bg-teal-500 text-white',
    'bg-pink-500 text-white',
  ]
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return colors[Math.abs(hash) % colors.length]
}

export function AttendanceRow({
  member,
  attendance,
  status,
  onStatusChange,
  disabled,
}: AttendanceRowProps) {
  const currentStatus = status ?? attendance?.status ?? 'present'

  return (
    <div className="flex items-center justify-between py-3.5 border-b border-gray-100 dark:border-gray-800/80 last:border-0 gap-3">
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <Avatar className="h-9 w-9 shrink-0 shadow-xs ring-1 ring-black/5 dark:ring-white/10">
          <AvatarFallback className={cn('text-xs font-bold', getAvatarBg(member.name))}>
            {member.name.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
            {member.name}
          </p>
          {member.note && (
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
              {member.note}
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
