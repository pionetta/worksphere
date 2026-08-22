import type { Attendance, AttendanceStatus, Member } from '@/types'

interface AttendanceSummaryProps {
  attendance: Attendance[]
  members: Member[]
  pendingStatuses?: Map<string, AttendanceStatus>
}

export function AttendanceSummary({
  attendance,
  members,
  pendingStatuses,
}: AttendanceSummaryProps) {
  const activeMembers = members.filter(m => m.is_active)
  const total = activeMembers.length

  if (total === 0) return null

  let present = 0
  let absent = 0
  let holiday = 0
  let unrecorded = 0

  activeMembers.forEach(m => {
    const pending = pendingStatuses?.get(m.id)
    if (pending) {
      if (pending === 'present') present++
      else if (pending === 'absent') absent++
      else if (pending === 'holiday') holiday++
    } else {
      const record = attendance.find(a => a.member_id === m.id)
      if (!record) {
        unrecorded++
      } else if (record.status === 'present') {
        present++
      } else if (record.status === 'absent') {
        absent++
      } else if (record.status === 'holiday') {
        holiday++
      }
    }
  })

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
