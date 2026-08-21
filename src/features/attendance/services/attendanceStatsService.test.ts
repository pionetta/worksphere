import { describe, it, expect } from 'vitest'
import {
  calculateWeeklyRecap,
  getNextWeek,
  getPreviousWeek,
  formatDayName,
  formatDayNumber,
  isToday,
  getWeekDays,
} from '@/features/attendance/services/attendanceStatsService'
import type { Attendance, Member } from '@/types'

function makeMember(id: string, name: string, isActive = true): Member {
  return {
    id,
    user_id: 'test-user',
    name,
    note: null,
    is_active: isActive,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
}

function makeAttendance(
  memberId: string,
  date: string,
  status: 'present' | 'absent' | 'holiday'
): Attendance {
  return {
    id: `att-${memberId}-${date}`,
    user_id: 'test-user',
    member_id: memberId,
    attendance_date: date,
    status,
    note: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
}

describe('attendanceStatsService', () => {
  describe('getWeekDays', () => {
    it('should return 7 days from Monday to Sunday', () => {
      const date = new Date('2026-08-20') // Thursday
      const days = getWeekDays(date)
      expect(days).toHaveLength(7)
      expect(days[0].getDay()).toBe(1) // Monday
      expect(days[6].getDay()).toBe(0) // Sunday
    })
  })

  describe('calculateWeeklyRecap', () => {
    it('should calculate correct counts per member', () => {
      const members = [makeMember('m1', 'Anggota 1')]
      // Week of Aug 17-23, 2026 (Mon-Sun)
      const attendance: Attendance[] = [
        makeAttendance('m1', '2026-08-17', 'present'), // Mon
        makeAttendance('m1', '2026-08-18', 'present'), // Tue
        makeAttendance('m1', '2026-08-19', 'absent'), // Wed
        makeAttendance('m1', '2026-08-20', 'holiday'), // Thu
        // Fri-Sun: no records
      ]

      const recap = calculateWeeklyRecap(members, attendance, new Date('2026-08-20'))

      expect(recap.recaps).toHaveLength(1)
      expect(recap.recaps[0].present).toBe(2)
      expect(recap.recaps[0].absent).toBe(1)
      expect(recap.recaps[0].holiday).toBe(1)
    })

    it('should only include active members', () => {
      const members = [makeMember('m1', 'Active', true), makeMember('m2', 'Inactive', false)]
      const recap = calculateWeeklyRecap(members, [], new Date('2026-08-20'))
      expect(recap.recaps).toHaveLength(1)
      expect(recap.recaps[0].memberName).toBe('Active')
    })

    it('should calculate totals', () => {
      const members = [makeMember('m1', 'Anggota 1'), makeMember('m2', 'Anggota 2')]
      const attendance: Attendance[] = [
        makeAttendance('m1', '2026-08-17', 'present'),
        makeAttendance('m2', '2026-08-17', 'absent'),
        makeAttendance('m1', '2026-08-18', 'holiday'),
      ]

      const recap = calculateWeeklyRecap(members, attendance, new Date('2026-08-20'))
      expect(recap.totalPresent).toBe(1)
      expect(recap.totalAbsent).toBe(1)
      expect(recap.totalHoliday).toBe(1)
    })

    it('should return correct date range', () => {
      const recap = calculateWeeklyRecap([], [], new Date('2026-08-20'))
      expect(recap.startDate).toBe('2026-08-17')
      expect(recap.endDate).toBe('2026-08-23')
    })
  })

  describe('week navigation', () => {
    it('getNextWeek should return next Monday', () => {
      const date = new Date('2026-08-17')
      const next = getNextWeek(date)
      expect(next.getDate()).toBe(24)
    })

    it('getPreviousWeek should return previous Monday', () => {
      const date = new Date('2026-08-17')
      const prev = getPreviousWeek(date)
      expect(prev.getDate()).toBe(10)
    })
  })

  describe('format helpers', () => {
    it('formatDayName should return Indonesian day name', () => {
      const monday = new Date('2026-08-17')
      expect(formatDayName(monday)).toBe('Sen')
    })

    it('formatDayNumber should return day number', () => {
      const date = new Date('2026-08-20')
      expect(formatDayNumber(date)).toBe('20')
    })
  })

  describe('isToday', () => {
    it('should return true for today', () => {
      expect(isToday(new Date())).toBe(true)
    })

    it('should return false for other date', () => {
      expect(isToday(new Date('2020-01-01'))).toBe(false)
    })
  })
})
