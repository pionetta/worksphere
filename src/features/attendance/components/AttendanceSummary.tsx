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
    <div className="grid grid-cols-2 gap-3">
      {/* Kotak Hadir */}
      <div className="p-3.5 rounded-[22px] bg-[#F0F3F8] dark:bg-slate-800 border border-white/80 dark:border-white/10 shadow-[-4px_-4px_8px_rgba(255,255,255,0.85),4px_4px_8px_rgba(163,177,198,0.22)] flex items-center justify-between transition-all">
        <div>
          <span className="text-xs font-semibold tracking-wider uppercase block text-emerald-600 dark:text-emerald-400">
            Hadir
          </span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
              {present}
            </span>
            <span className="text-xs font-semibold text-emerald-600/70 dark:text-emerald-400/70">
              /{total}
            </span>
          </div>
        </div>
        <div className="w-9 h-9 rounded-2xl flex items-center justify-center shadow-[inset_-2px_-2px_4px_rgba(255,255,255,0.8),inset_2px_2px_4px_rgba(163,177,198,0.25)] dark:shadow-[inset_-2px_-2px_4px_rgba(255,255,255,0.05),inset_2px_2px_4px_rgba(0,0,0,0.5)] text-emerald-600 dark:text-emerald-400 shrink-0">
          <CheckCircle className="w-5 h-5" />
        </div>
      </div>

      {/* Kotak Absen */}
      <div className="p-3.5 rounded-[22px] bg-[#F0F3F8] dark:bg-slate-800 border border-white/80 dark:border-white/10 shadow-[-4px_-4px_8px_rgba(255,255,255,0.85),4px_4px_8px_rgba(163,177,198,0.22)] flex items-center justify-between transition-all">
        <div>
          <span className="text-xs font-semibold tracking-wider uppercase block text-rose-600 dark:text-rose-400">
            Absen
          </span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-xl font-bold text-rose-600 dark:text-rose-400">
              {absent}
            </span>
            <span className="text-xs font-semibold text-rose-600/70 dark:text-rose-400/70">
              /{total}
            </span>
          </div>
        </div>
        <div className="w-9 h-9 rounded-2xl flex items-center justify-center shadow-[inset_-2px_-2px_4px_rgba(255,255,255,0.8),inset_2px_2px_4px_rgba(163,177,198,0.25)] dark:shadow-[inset_-2px_-2px_4px_rgba(255,255,255,0.05),inset_2px_2px_4px_rgba(0,0,0,0.5)] text-rose-600 dark:text-rose-400 shrink-0">
          <XCircle className="w-5 h-5" />
        </div>
      </div>

      {/* Kotak Libur */}
      <div className="p-3.5 rounded-[22px] bg-[#F0F3F8] dark:bg-slate-800 border border-white/80 dark:border-white/10 shadow-[-4px_-4px_8px_rgba(255,255,255,0.85),4px_4px_8px_rgba(163,177,198,0.22)] flex items-center justify-between transition-all">
        <div>
          <span className="text-xs font-semibold tracking-wider uppercase block text-amber-600 dark:text-amber-400">
            Libur
          </span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-xl font-bold text-amber-600 dark:text-amber-400">
              {holiday}
            </span>
          </div>
        </div>
        <div className="w-9 h-9 rounded-2xl flex items-center justify-center shadow-[inset_-2px_-2px_4px_rgba(255,255,255,0.8),inset_2px_2px_4px_rgba(163,177,198,0.25)] dark:shadow-[inset_-2px_-2px_4px_rgba(255,255,255,0.05),inset_2px_2px_4px_rgba(0,0,0,0.5)] text-amber-600 dark:text-amber-400 shrink-0">
          <Moon className="w-5 h-5" />
        </div>
      </div>

      {/* Kotak Belum Absen */}
      <div className="p-3.5 rounded-[22px] bg-[#F0F3F8] dark:bg-slate-800 border border-white/80 dark:border-white/10 shadow-[-4px_-4px_8px_rgba(255,255,255,0.85),4px_4px_8px_rgba(163,177,198,0.22)] flex items-center justify-between transition-all">
        <div>
          <span className="text-xs font-semibold tracking-wider uppercase block text-indigo-600 dark:text-indigo-400">
            Belum Absen
          </span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
              {unrecorded}
            </span>
          </div>
        </div>
        <div className="w-9 h-9 rounded-2xl flex items-center justify-center shadow-[inset_-2px_-2px_4px_rgba(255,255,255,0.8),inset_2px_2px_4px_rgba(163,177,198,0.25)] dark:shadow-[inset_-2px_-2px_4px_rgba(255,255,255,0.05),inset_2px_2px_4px_rgba(0,0,0,0.5)] text-indigo-600 dark:text-indigo-400 shrink-0">
          <Clock className="w-5 h-5" />
        </div>
      </div>
    </div>
  )
}
