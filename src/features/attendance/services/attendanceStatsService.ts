import type { Attendance, Member } from '@/types'
import {
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  addWeeks,
  subWeeks,
  isSameDay,
} from 'date-fns'
import { id } from 'date-fns/locale'
import { toISODate } from '@/utils/date'

export interface MemberRecap {
  memberId: string
  memberName: string
  present: number
  absent: number
  holiday: number
}

export interface WeeklyRecap {
  startDate: string
  endDate: string
  days: string[]
  recaps: MemberRecap[]
  totalPresent: number
  totalAbsent: number
  totalHoliday: number
}

export function getWeekDays(date: Date): Date[] {
  const start = startOfWeek(date, { weekStartsOn: 1 })
  const end = endOfWeek(date, { weekStartsOn: 1 })
  return eachDayOfInterval({ start, end })
}

export function calculateWeeklyRecap(
  members: Member[],
  attendance: Attendance[],
  date: Date
): WeeklyRecap {
  const days = getWeekDays(date)
  const startDate = toISODate(days[0])
  const endDate = toISODate(days[6])

  const recaps: MemberRecap[] = members
    .filter(m => m.is_active)
    .map(member => {
      const memberAttendance = attendance.filter(a => a.member_id === member.id)

      let present = 0
      let absent = 0
      let holiday = 0

      for (const day of days) {
        const dayStr = toISODate(day)
        const record = memberAttendance.find(a => a.attendance_date === dayStr)
        if (record) {
          switch (record.status) {
            case 'present':
              present++
              break
            case 'absent':
              absent++
              break
            case 'holiday':
              holiday++
              break
          }
        }
      }

      return {
        memberId: member.id,
        memberName: member.name,
        present,
        absent,
        holiday,
      }
    })

  const totalPresent = recaps.reduce((sum, r) => sum + r.present, 0)
  const totalAbsent = recaps.reduce((sum, r) => sum + r.absent, 0)
  const totalHoliday = recaps.reduce((sum, r) => sum + r.holiday, 0)

  return {
    startDate,
    endDate,
    days: days.map(d => toISODate(d)),
    recaps,
    totalPresent,
    totalAbsent,
    totalHoliday,
  }
}

export function getNextWeek(date: Date): Date {
  return addWeeks(date, 1)
}

export function getPreviousWeek(date: Date): Date {
  return subWeeks(date, 1)
}

export function getToday(): Date {
  return new Date()
}

export function formatDayName(date: Date): string {
  return format(date, 'EEE', { locale: id })
}

export function formatDayNumber(date: Date): string {
  return format(date, 'd', { locale: id })
}

export function isToday(date: Date): boolean {
  return isSameDay(date, new Date())
}
