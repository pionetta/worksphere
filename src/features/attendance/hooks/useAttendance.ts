import { useState, useEffect, useCallback } from 'react'
import * as attendanceService from '@/features/attendance/services/attendanceService'
import type { Attendance, AttendanceStatus } from '@/types'
import { toISODate } from '@/utils/date'

export function useAttendance(userId: string | null, date: Date) {
  const [attendance, setAttendance] = useState<Attendance[]>([])
  const [loading, setLoading] = useState(true)

  const dateStr = toISODate(date)

  const refresh = useCallback(async () => {
    if (!userId) return
    setLoading(true)
    try {
      const data = await attendanceService.getAttendanceForDate(userId, dateStr)
      setAttendance(data)
    } finally {
      setLoading(false)
    }
  }, [userId, dateStr])

  useEffect(() => {
    refresh()
  }, [refresh])

  const saveAttendance = useCallback(
    async (memberId: string, status: AttendanceStatus, note?: string) => {
      if (!userId) return
      await attendanceService.saveAttendance(userId, memberId, dateStr, status, note)
      await refresh()
    },
    [userId, dateStr, refresh]
  )

  const saveBulk = useCallback(
    async (entries: Array<{ memberId: string; status: AttendanceStatus; note?: string }>) => {
      if (!userId) return
      await attendanceService.saveBulkAttendance(userId, dateStr, entries)
      await refresh()
    },
    [userId, dateStr, refresh]
  )

  return {
    attendance,
    loading,
    refresh,
    saveAttendance,
    saveBulk,
  }
}
