import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { format, parseISO } from 'date-fns'
import { id } from 'date-fns/locale'
import type { WeeklyAttendanceRecap, Attendance } from '@/types'
import { TrendingUp, Award } from 'lucide-react'

interface AttendanceTrendChartProps {
  recap: WeeklyAttendanceRecap
  attendance: Attendance[]
}

interface DailyAttendanceStat {
  dateStr: string
  dayLabel: string
  Hadir: number
  Absen: number
  Libur: number
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload || !payload.length) return null
  return (
    <div className="rounded-2xl border border-white/80 dark:border-gray-700/80 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md p-3 shadow-xl text-xs space-y-1.5">
      <p className="font-bold text-gray-900 dark:text-gray-100">{label}</p>
      {payload.map((entry: any) => (
        <div key={entry.dataKey} className="flex items-center justify-between gap-3 text-[11px]">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-gray-600 dark:text-gray-400 font-medium">{entry.name}:</span>
          </div>
          <span className="font-extrabold text-gray-900 dark:text-white">{entry.value} orang</span>
        </div>
      ))}
    </div>
  )
}

export function AttendanceTrendChart({ recap, attendance }: AttendanceTrendChartProps) {
  // Aggregate daily counts across the 7 days of the week
  const dailyData: DailyAttendanceStat[] = recap.days.map(dayStr => {
    const dayAttendance = attendance.filter(a => a.attendance_date === dayStr)
    const present = dayAttendance.filter(a => a.status === 'present').length
    const absent = dayAttendance.filter(a => a.status === 'absent').length
    const holiday = dayAttendance.filter(a => a.status === 'holiday').length

    let dayLabel = dayStr
    try {
      dayLabel = format(parseISO(dayStr), 'EEE, d', { locale: id })
    } catch {
      // fallback
    }

    return {
      dateStr: dayStr,
      dayLabel,
      Hadir: present,
      Absen: absent,
      Libur: holiday,
    }
  })

  // Calculate overall weekly rate
  const totalRecorded = recap.totalPresent + recap.totalAbsent
  const attendanceRate = totalRecorded > 0 ? Math.round((recap.totalPresent / totalRecorded) * 100) : 100

  return (
    <div className="rounded-[26px] bg-white/90 dark:bg-gray-800/90 border border-white/80 dark:border-gray-700/50 p-4 sm:p-5 shadow-sm backdrop-blur-md space-y-4">
      {/* Header with Rate Badge */}
      <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-extrabold text-gray-900 dark:text-gray-100">
              Tren Kehadiran Mingguan
            </h3>
            <p className="text-[10px] text-gray-500 dark:text-gray-400">
              Statistik per hari (Senin - Minggu)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50">
          <Award className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span className="text-xs font-black text-emerald-700 dark:text-emerald-300">
            {attendanceRate}% Hadir
          </span>
        </div>
      </div>

      {/* Bar Chart */}
      <div className="h-52 w-full pt-1">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={dailyData} margin={{ top: 10, right: 0, left: -25, bottom: 0 }}>
            <XAxis
              dataKey="dayLabel"
              stroke="#94a3b8"
              fontSize={10}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#94a3b8"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
              iconSize={8}
              iconType="circle"
            />
            <Bar dataKey="Hadir" fill="#10B981" radius={[4, 4, 0, 0]} maxBarSize={18} />
            <Bar dataKey="Absen" fill="#EF4444" radius={[4, 4, 0, 0]} maxBarSize={18} />
            <Bar dataKey="Libur" fill="#F59E0B" radius={[4, 4, 0, 0]} maxBarSize={18} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
