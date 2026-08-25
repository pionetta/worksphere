import type { Attendance, AttendanceStatus, Member } from '@/types'
import { CheckCircle, XCircle, Moon, Clock } from 'lucide-react'

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
    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
      <div className="rounded-2xl p-3.5 bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/40 flex items-center justify-between">
        <div>
          <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
            HADIR
          </span>
          <p className="text-lg sm:text-xl font-black text-emerald-700 dark:text-emerald-400 mt-0.5">
            {present}<span className="text-xs font-semibold text-emerald-600/75">/{total}</span>
          </p>
        </div>
        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-xs shrink-0">
          <CheckCircle className="w-4 h-4" />
        </div>
      </div>

      <div className="rounded-2xl p-3.5 bg-rose-50/80 dark:bg-rose-950/40 border border-rose-200/60 dark:border-rose-800/40 flex items-center justify-between">
        <div>
          <span className="text-[10px] font-bold text-rose-800 dark:text-rose-300 uppercase tracking-wider">
            ABSEN
          </span>
          <p className="text-lg sm:text-xl font-black text-rose-700 dark:text-rose-400 mt-0.5">
            {absent}<span className="text-xs font-semibold text-rose-600/75">/{total}</span>
          </p>
        </div>
        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-rose-500 text-white flex items-center justify-center shadow-xs shrink-0">
          <XCircle className="w-4 h-4" />
        </div>
      </div>

      <div className="rounded-2xl p-3.5 bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-800/40 flex items-center justify-between">
        <div>
          <span className="text-[10px] font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider">
            LIBUR
          </span>
          <p className="text-lg sm:text-xl font-black text-amber-700 dark:text-amber-400 mt-0.5">
            {holiday}
          </p>
        </div>
        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs shrink-0">
          <Moon className="w-4 h-4" />
        </div>
      </div>

      {unrecorded > 0 && (
        <div className="col-span-3 sm:col-span-1 rounded-2xl p-3.5 bg-gray-100/80 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
              BELUM
            </span>
            <p className="text-lg sm:text-xl font-black text-gray-700 dark:text-gray-300 mt-0.5">
              {unrecorded}
            </p>
          </div>
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-gray-400 dark:bg-gray-600 text-white flex items-center justify-center shadow-xs shrink-0">
            <Clock className="w-4 h-4" />
          </div>
        </div>
      )}
    </div>
  )
}
