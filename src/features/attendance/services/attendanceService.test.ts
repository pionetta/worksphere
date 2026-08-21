import { describe, it, expect, beforeEach } from 'vitest'
import { db } from '@/lib/db'
import * as attendanceService from '@/features/attendance/services/attendanceService'

const userId = 'test-user-attendance-service'
const memberId = 'test-member-attendance'

beforeEach(async () => {
  await db.members.clear()
  await db.attendance.clear()
  await db.sync_queue.clear()
  await db.members.add({
    id: memberId,
    user_id: userId,
    name: 'Anggota Test',
    note: null,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  })
})

describe('attendanceService', () => {
  describe('saveAttendance', () => {
    it('should create attendance for a member on a date', async () => {
      const id = await attendanceService.saveAttendance(userId, memberId, '2026-08-20', 'present')
      expect(id).toBeTruthy()
      const record = await db.attendance.get(id)
      expect(record).toBeDefined()
      expect(record!.status).toBe('present')
      expect(record!.member_id).toBe(memberId)
      expect(record!.attendance_date).toBe('2026-08-20')
    })

    it('should queue sync operation', async () => {
      await attendanceService.saveAttendance(userId, memberId, '2026-08-20', 'present')
      const queue = await db.sync_queue.where('entity').equals('attendance').toArray()
      expect(queue.length).toBeGreaterThanOrEqual(1)
    })

    it('should update existing attendance for same member+date (upsert)', async () => {
      const id = await attendanceService.saveAttendance(userId, memberId, '2026-08-20', 'present')
      await attendanceService.saveAttendance(userId, memberId, '2026-08-20', 'absent')
      // Upsert: should update the existing record
      const record = await db.attendance.get(id)
      expect(record!.status).toBe('absent')

      const records = await db.attendance
        .where({ user_id: userId, member_id: memberId, attendance_date: '2026-08-20' })
        .toArray()
      expect(records).toHaveLength(1)
    })
  })

  describe('saveBulkAttendance', () => {
    it('should save attendance for multiple members', async () => {
      const member2Id = 'member-2-bulk'
      await db.members.add({
        id: member2Id,
        user_id: userId,
        name: 'Anggota 2',
        note: null,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })

      await attendanceService.saveBulkAttendance(userId, '2026-08-20', [
        { memberId, status: 'present' },
        { memberId: member2Id, status: 'absent' },
      ])

      const records = await attendanceService.getAttendanceForDate(userId, '2026-08-20')
      expect(records).toHaveLength(2)
    })
  })

  describe('getAttendanceForDate', () => {
    it('should return attendance records for a specific date', async () => {
      await attendanceService.saveAttendance(userId, memberId, '2026-08-20', 'present')
      const records = await attendanceService.getAttendanceForDate(userId, '2026-08-20')
      expect(records).toHaveLength(1)
      expect(records[0].status).toBe('present')
    })

    it('should return empty array for date with no records', async () => {
      const records = await attendanceService.getAttendanceForDate(userId, '2026-01-01')
      expect(records).toHaveLength(0)
    })
  })

  describe('getAttendanceForDateRange', () => {
    it('should return records within date range', async () => {
      await attendanceService.saveAttendance(userId, memberId, '2026-08-18', 'present')
      await attendanceService.saveAttendance(userId, memberId, '2026-08-19', 'absent')
      await attendanceService.saveAttendance(userId, memberId, '2026-08-20', 'holiday')
      await attendanceService.saveAttendance(userId, memberId, '2026-08-25', 'present')

      const records = await attendanceService.getAttendanceForDateRange(
        userId,
        '2026-08-18',
        '2026-08-20'
      )
      expect(records).toHaveLength(3)
    })
  })

  describe('updateAttendanceStatus', () => {
    it('should update attendance status', async () => {
      const id = await attendanceService.saveAttendance(userId, memberId, '2026-08-20', 'present')
      await attendanceService.updateAttendanceStatus(id, 'holiday')
      const record = await db.attendance.get(id)
      expect(record!.status).toBe('holiday')
    })
  })

  describe('removeAttendance', () => {
    it('should delete attendance record', async () => {
      const id = await attendanceService.saveAttendance(userId, memberId, '2026-08-20', 'present')
      await attendanceService.removeAttendance(id)
      const record = await db.attendance.get(id)
      expect(record).toBeUndefined()
    })
  })

  describe('uniqueness', () => {
    it('should enforce one record per member per date', async () => {
      await attendanceService.saveAttendance(userId, memberId, '2026-08-20', 'present')
      await attendanceService.saveAttendance(userId, memberId, '2026-08-20', 'absent')
      const records = await db.attendance
        .where({ user_id: userId, member_id: memberId, attendance_date: '2026-08-20' })
        .toArray()
      expect(records).toHaveLength(1)
      expect(records[0].status).toBe('absent')
    })
  })

  describe('previous date editing', () => {
    it('should allow editing attendance for past dates', async () => {
      const id = await attendanceService.saveAttendance(userId, memberId, '2026-08-15', 'present')
      await attendanceService.updateAttendanceStatus(id, 'absent')
      const record = await db.attendance.get(id)
      expect(record!.status).toBe('absent')
    })
  })

  describe('user isolation', () => {
    it('should not return attendance from other users', async () => {
      await attendanceService.saveAttendance(userId, memberId, '2026-08-20', 'present')
      await attendanceService.saveAttendance('other-user', memberId, '2026-08-20', 'absent')

      const mine = await attendanceService.getAttendanceForDate(userId, '2026-08-20')
      expect(mine).toHaveLength(1)
      expect(mine[0].user_id).toBe(userId)
    })
  })
})
