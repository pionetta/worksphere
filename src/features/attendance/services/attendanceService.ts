import * as attendanceRepo from '@/features/attendance/repositories/attendanceRepository'
import {
  createAttendanceSchema,
  updateAttendanceSchema,
  bulkAttendanceSchema,
} from '@/features/attendance/schemas/attendanceSchema'
import { validate } from '@/lib/validation'
import type { Attendance, AttendanceStatus } from '@/types'

export async function getAttendanceForDate(userId: string, date: string): Promise<Attendance[]> {
  return attendanceRepo.listAttendanceByDate(userId, date)
}

export async function getAttendanceForDateRange(
  userId: string,
  startDate: string,
  endDate: string
): Promise<Attendance[]> {
  return attendanceRepo.listAttendanceByDateRange(userId, startDate, endDate)
}

export async function saveAttendance(
  userId: string,
  memberId: string,
  date: string,
  status: AttendanceStatus,
  note?: string
): Promise<string> {
  validate(createAttendanceSchema, {
    member_id: memberId,
    attendance_date: date,
    status,
    note,
  })

  return attendanceRepo.upsertAttendance(userId, memberId, date, status, note)
}

export async function saveBulkAttendance(
  userId: string,
  date: string,
  entries: Array<{ memberId: string; status: AttendanceStatus; note?: string }>
): Promise<void> {
  validate(bulkAttendanceSchema, {
    date,
    entries: entries.map(e => ({
      member_id: e.memberId,
      status: e.status,
      note: e.note,
    })),
  })

  for (const entry of entries) {
    await attendanceRepo.upsertAttendance(userId, entry.memberId, date, entry.status, entry.note)
  }
}

export async function updateAttendanceStatus(
  id: string,
  status: AttendanceStatus,
  note?: string
): Promise<void> {
  validate(updateAttendanceSchema, { status, note })
  return attendanceRepo.updateAttendance(id, { status, note: note ?? undefined })
}

export async function removeAttendance(id: string): Promise<void> {
  return attendanceRepo.deleteAttendance(id)
}

export async function getAttendanceForMember(
  userId: string,
  memberId: string
): Promise<Attendance[]> {
  return attendanceRepo.listAttendanceByMember(userId, memberId)
}
