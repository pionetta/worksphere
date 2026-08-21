import { describe, it, expect, beforeEach } from 'vitest'
import { db } from '@/lib/db'
import * as memberService from '@/features/attendance/services/memberService'
import * as attendanceService from '@/features/attendance/services/attendanceService'

const userId = 'test-sync-queue-attendance'

beforeEach(async () => {
  await db.members.clear()
  await db.attendance.clear()
  await db.sync_queue.clear()
})

describe('Attendance sync queue', () => {
  it('should queue create attendance', async () => {
    const memberId = await memberService.addMember(userId, 'Sync Member', null)
    await attendanceService.saveAttendance(userId, memberId, '2026-08-20', 'present')

    const queue = await db.sync_queue.where('entity').equals('attendance').toArray()
    expect(queue.length).toBeGreaterThanOrEqual(1)
    expect(queue[0].operation).toBe('create')
  })

  it('should queue update attendance', async () => {
    const memberId = await memberService.addMember(userId, 'Sync Member', null)
    const id = await attendanceService.saveAttendance(userId, memberId, '2026-08-20', 'present')
    await attendanceService.updateAttendanceStatus(id, 'absent')

    const queue = await db.sync_queue.where('entity').equals('attendance').toArray()
    const updates = queue.filter(q => q.operation === 'update')
    expect(updates.length).toBeGreaterThanOrEqual(1)
  })

  it('should queue delete attendance', async () => {
    const memberId = await memberService.addMember(userId, 'Sync Member', null)
    const id = await attendanceService.saveAttendance(userId, memberId, '2026-08-20', 'present')
    await attendanceService.removeAttendance(id)

    const queue = await db.sync_queue.where('entity').equals('attendance').toArray()
    const deletes = queue.filter(q => q.operation === 'delete')
    expect(deletes.length).toBeGreaterThanOrEqual(1)
  })

  it('should queue create member', async () => {
    await memberService.addMember(userId, 'New Member', null)

    const queue = await db.sync_queue.where('entity').equals('member').toArray()
    expect(queue).toHaveLength(1)
    expect(queue[0].operation).toBe('create')
  })

  it('should queue update member (deactivate)', async () => {
    const id = await memberService.addMember(userId, 'To Update', null)
    await memberService.deactivateMember(id)

    const queue = await db.sync_queue.where('entity').equals('member').toArray()
    const updates = queue.filter(q => q.operation === 'update')
    expect(updates.length).toBeGreaterThanOrEqual(1)
  })

  it('should queue delete member', async () => {
    const id = await memberService.addMember(userId, 'To Delete', null)
    await memberService.removeMember(id)

    const queue = await db.sync_queue.where('entity').equals('member').toArray()
    const deletes = queue.filter(q => q.operation === 'delete')
    expect(deletes.length).toBeGreaterThanOrEqual(1)
  })
})
