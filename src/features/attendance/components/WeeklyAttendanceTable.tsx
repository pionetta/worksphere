import type { WeeklyRecap } from '@/features/attendance/services/attendanceStatsService'
import {
  formatDayName,
  formatDayNumber,
  isToday,
} from '@/features/attendance/services/attendanceStatsService'
import { EmptyState } from '@/components/ui/EmptyState'
import { LoadingState } from '@/components/ui/LoadingState'
import { Users } from 'lucide-react'
import { cn } from '@/utils/cn'
import { parseISO } from 'date-fns'
import type { Attendance } from '@/types'

const STATUS_STYLES: Record<string, string> = {
  present: 'bg-success text-white',
  absent: 'bg-danger text-white',
  holiday: 'bg-warning text-white',
}

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
        icon={<Users className="w-6 h-6 text-gray-400" />}
        title="Belum ada data absensi"
        description="Tambahkan anggota dan isi absensi untuk melihat rekap mingguan."
      />
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 dark:border-gray-700">
            <th className="text-left py-2 px-2 font-medium text-gray-600 dark:text-gray-400">
              Nama
            </th>
            {recap.days.map(day => {
              const d = parseISO(day)
              const today = isToday(d)
              return (
                <th
                  key={day}
                  className={cn(
                    'text-center py-2 px-1 font-medium text-xs',
                    today ? 'text-primary-500' : 'text-gray-600 dark:text-gray-400'
                  )}
                >
                  <div>{formatDayName(d)}</div>
                  <div>{formatDayNumber(d)}</div>
                </th>
              )
            })}
            <th className="text-center py-2 px-1 font-medium text-xs text-gray-600 dark:text-gray-400">
              Hadir
            </th>
            <th className="text-center py-2 px-1 font-medium text-xs text-gray-600 dark:text-gray-400">
              Absen
            </th>
            <th className="text-center py-2 px-1 font-medium text-xs text-gray-600 dark:text-gray-400">
              Libur
            </th>
          </tr>
        </thead>
        <tbody>
          {recap.recaps.map(r => (
            <tr
              key={r.memberId}
              className="border-b border-gray-100 dark:border-gray-700/50 last:border-0"
            >
              <td className="py-2 px-2 font-medium text-gray-900 dark:text-gray-100 truncate max-w-[100px]">
                {r.memberName}
              </td>
              {recap.days.map(day => {
                const record = attendance.find(
                  a => a.member_id === r.memberId && a.attendance_date === day
                )
                return (
                  <td key={day} className="text-center py-2 px-1">
                    <span
                      className={cn(
                        'inline-block w-2 h-2 rounded-full',
                        record
                          ? STATUS_STYLES[record.status]
                          : 'bg-gray-300 dark:bg-gray-600'
                      )}
                      title={
                        record
                          ? record.status === 'present'
                            ? 'Hadir'
                            : record.status === 'holiday'
                              ? 'Libur'
                              : 'Absen'
                          : 'Belum diisi'
                      }
                    />
                  </td>
                )
              })}
              <td className="text-center py-2 px-1">
                <span className="text-success font-medium">{r.present}</span>
              </td>
              <td className="text-center py-2 px-1">
                <span className="text-danger font-medium">{r.absent}</span>
              </td>
              <td className="text-center py-2 px-1">
                <span className="text-warning font-medium">{r.holiday}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
