import { useState, useEffect, useCallback } from 'react'
import * as attendanceService from '@/features/attendance/services/attendanceService'
import {
  calculateWeeklyRecap,
  getNextWeek,
  getPreviousWeek,
  getToday,
  type WeeklyRecap,
} from '@/features/attendance/services/attendanceStatsService'
import type { Attendance, Member } from '@/types'

export function useWeeklyAttendance(userId: string | null, members: Member[]) {
  const [currentDate, setCurrentDate] = useState<Date>(getToday)
  const [attendance, setAttendance] = useState<Attendance[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    if (!userId) return
    setLoading(true)
    try {
      const recap = calculateWeeklyRecap(members, [], currentDate)
      const data = await attendanceService.getAttendanceForDateRange(
        userId,
        recap.startDate,
        recap.endDate
      )
      setAttendance(data)
    } finally {
      setLoading(false)
    }
  }, [userId, members, currentDate])

  useEffect(() => {
    refresh()
  }, [refresh])

  const recap: WeeklyRecap = calculateWeeklyRecap(members, attendance, currentDate)

  const goNext = useCallback(() => {
    setCurrentDate(d => getNextWeek(d))
  }, [])

  const goPrev = useCallback(() => {
    setCurrentDate(d => getPreviousWeek(d))
  }, [])

  const goToday = useCallback(() => {
    setCurrentDate(getToday())
  }, [])

  return {
    currentDate,
    recap,
    attendance,
    loading,
    refresh,
    goNext,
    goPrev,
    goToday,
  }
}
