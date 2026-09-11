import type { WeeklyRecap } from '@/features/attendance/services/attendanceStatsService'
import {
  formatDayName,
  formatDayNumber,
  isToday,
} from '@/features/attendance/services/attendanceStatsService'
import { EmptyState } from '@/components/ui/EmptyState'
import { LoadingState } from '@/components/ui/LoadingState'
import { Users } from 'lucide-react'
import { parseISO } from 'date-fns'
import type { Attendance } from '@/types'

interface WeeklyAttendanceTableProps {
  recap: WeeklyRecap
  attendance: Attendance[]
  loading?: boolean
  hasMembers?: boolean
}

export function WeeklyAttendanceTable({
  recap,
  attendance,
  loading,
  hasMembers = true,
}: WeeklyAttendanceTableProps) {
  if (loading) {
    return <LoadingState text="Memuat rekap..." />
  }

  if (!hasMembers || recap.recaps.length === 0) {
    return (
      <EmptyState
        icon={<Users className="w-6 h-6 text-slate-400" />}
        title="Belum ada data absensi"
        description="Tambahkan anggota dan isi absensi untuk melihat rekap mingguan."
      />
    )
  }

  return (
    <div className="space-y-2">
      {/* 2. Wrapper Anti-Cutoff dengan horizontal scroll yang halus */}
      <div className="overflow-x-auto no-scrollbar rounded-2xl border border-slate-200/60 dark:border-white/10 bg-white/40 dark:bg-slate-800/40 p-1">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-200/60 dark:border-white/10">
              {/* Kolom Nama (Sticky Left) */}
              <th className="sticky left-0 bg-[#F0F3F8]/95 dark:bg-slate-800/95 backdrop-blur-sm z-10 px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 min-w-[90px] text-left">
                Nama
              </th>

              {/* Kolom Hari (Sen - Min) */}
              {recap.days.map(day => {
                const d = parseISO(day)
                const today = isToday(d)
                return (
                  <th
                    key={day}
                    className="min-w-[34px] text-center py-2 px-1 text-xs"
                  >
                    {today ? (
                      <div className="bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200/60 dark:border-indigo-800/60 text-indigo-600 dark:text-indigo-400 rounded-lg py-0.5 px-1 font-bold shadow-xs">
                        <div className="text-[10px] leading-tight">{formatDayName(d)}</div>
                        <div className="text-[11px] font-extrabold">{formatDayNumber(d)}</div>
                      </div>
                    ) : (
                      <div className="text-slate-600 dark:text-slate-400">
                        <div className="text-[10px] leading-tight font-medium">{formatDayName(d)}</div>
                        <div className="text-[11px] font-semibold">{formatDayNumber(d)}</div>
                      </div>
                    )}
                  </th>
                )
              })}

              {/* Kolom Total / Summary (Kanan) */}
              <th
                className="min-w-[30px] text-center py-2 px-1 text-xs font-bold text-emerald-600 dark:text-emerald-400"
                title="Total Hadir"
              >
                H
              </th>
              <th
                className="min-w-[30px] text-center py-2 px-1 text-xs font-bold text-rose-600 dark:text-rose-400"
                title="Total Absen"
              >
                A
              </th>
              <th
                className="min-w-[30px] text-center py-2 px-1 text-xs font-bold text-amber-600 dark:text-amber-400"
                title="Total Libur"
              >
                L
              </th>
            </tr>
          </thead>
          <tbody>
            {recap.recaps.map(r => (
              <tr
                key={r.memberId}
                className="border-b border-slate-100 dark:border-white/5 last:border-0 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              >
                {/* Kolom Nama (Sticky Left) */}
                <td className="sticky left-0 bg-[#F0F3F8]/95 dark:bg-slate-800/95 backdrop-blur-sm z-10 px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 min-w-[90px] truncate max-w-[130px]">
                  {r.memberName}
                </td>

                {/* Kolom Hari */}
                {recap.days.map(day => {
                  const record = attendance.find(
                    a => a.member_id === r.memberId && a.attendance_date === day
                  )
                  return (
                    <td key={day} className="text-center py-2 px-1 min-w-[34px]">
                      {record?.status === 'present' && (
                        <span
                          className="block w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm mx-auto"
                          title="Hadir"
                        />
                      )}
                      {record?.status === 'absent' && (
                        <span
                          className="block w-2.5 h-2.5 rounded-full bg-rose-500 shadow-sm mx-auto"
                          title="Absen"
                        />
                      )}
                      {record?.status === 'holiday' && (
                        <span
                          className="block w-2.5 h-2.5 rounded-full bg-amber-400 mx-auto"
                          title="Libur"
                        />
                      )}
                      {!record && (
                        <span
                          className="block w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600 mx-auto"
                          title="Belum diisi"
                        />
                      )}
                    </td>
                  )
                })}

                {/* Kolom Total / Summary (Kanan) */}
                <td className="text-center py-2 px-1 min-w-[30px]">
                  <span className="inline-block px-1.5 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 font-bold text-[11px]">
                    {r.present}
                  </span>
                </td>
                <td className="text-center py-2 px-1 min-w-[30px]">
                  <span className="inline-block px-1.5 py-0.5 rounded-md bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 font-bold text-[11px]">
                    {r.absent}
                  </span>
                </td>
                <td className="text-center py-2 px-1 min-w-[30px]">
                  <span className="inline-block px-1.5 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 font-bold text-[11px]">
                    {r.holiday}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 3. Tambahkan Baris Legenda (Keterangan Simbol) */}
      <div className="flex items-center justify-around pt-3 text-[11px] text-slate-500 dark:text-slate-400 flex-wrap gap-2">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm" />
          <span>Hadir</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-sm" />
          <span>Absen</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
          <span>Libur</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600" />
          <span>Kosong</span>
        </div>
      </div>
    </div>
  )
}

