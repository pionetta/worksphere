import type { Attendance } from '@/types'
import type { Member } from '@/types'

interface AttendanceSummaryProps {
  attendance: Attendance[]
  members: Member[]
}

export function AttendanceSummary({ attendance, members }: AttendanceSummaryProps) {
  const activeMembers = members.filter(m => m.is_active)
  const activeMemberIds = new Set(activeMembers.map(m => m.id))
  const total = activeMembers.length

  const activeAttendance = attendance.filter(a => activeMemberIds.has(a.member_id))
  const present = activeAttendance.filter(a => a.status === 'present').length
  const absent = activeAttendance.filter(a => a.status === 'absent').length
  const holiday = activeAttendance.filter(a => a.status === 'holiday').length
  const unrecorded = Math.max(0, total - activeAttendance.length)

  if (total === 0) return null

  return (
    <div className="grid grid-cols-4 gap-2">
      <SummaryCard
        label="Hadir"
        value={present}
        color="text-success"
        bg="bg-success-light dark:bg-green-900/30"
      />
      <SummaryCard
        label="Absen"
        value={absent}
        color="text-danger"
        bg="bg-danger-light dark:bg-red-900/30"
      />
      <SummaryCard
        label="Libur"
        value={holiday}
        color="text-warning"
        bg="bg-warning-light dark:bg-amber-900/30"
      />
      <SummaryCard
        label="Belum"
        value={unrecorded}
        color="text-gray-500"
        bg="bg-gray-100 dark:bg-gray-800"
      />
    </div>
  )
}

function SummaryCard({
  label,
  value,
  color,
  bg,
}: {
  label: string
  value: number
  color: string
  bg: string
}) {
  return (
    <div className={`rounded-xl p-3 text-center ${bg}`}>
      <p className={`text-lg font-semibold ${color}`}>{value}</p>
      <p className="text-xs text-gray-600 dark:text-gray-400">{label}</p>
    </div>
  )
}
