import { describe, it, expect, beforeEach } from 'vitest'
import { db } from '@/lib/db'
import * as memberService from '@/features/attendance/services/memberService'
import * as attendanceService from '@/features/attendance/services/attendanceService'

const userId = 'test-offline-attendance'
const memberId = 'member-offline-1'

beforeEach(async () => {
  await db.members.clear()
  await db.attendance.clear()
  await db.sync_queue.clear()
  await db.members.add({
    id: memberId,
    user_id: userId,
    name: 'Anggota Offline',
    note: null,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  })
})

describe('Offline attendance operations', () => {
  it('should save attendance to IndexedDB (offline-first)', async () => {
    const id = await attendanceService.saveAttendance(userId, memberId, '2026-08-20', 'present')
    expect(id).toBeTruthy()

    const stored = await db.attendance.get(id)
    expect(stored).toBeDefined()
    expect(stored!.status).toBe('present')
  })

  it('should read attendance from IndexedDB', async () => {
    await attendanceService.saveAttendance(userId, memberId, '2026-08-20', 'absent')
    const records = await attendanceService.getAttendanceForDate(userId, '2026-08-20')
    expect(records).toHaveLength(1)
    expect(records[0].status).toBe('absent')
  })

  it('should edit attendance offline', async () => {
    const id = await attendanceService.saveAttendance(userId, memberId, '2026-08-20', 'present')
    await attendanceService.updateAttendanceStatus(id, 'holiday')
    const stored = await db.attendance.get(id)
    expect(stored!.status).toBe('holiday')
  })

  it('should save bulk attendance offline', async () => {
    const member2Id = 'member-offline-2'
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

  it('should save members offline', async () => {
    const id = await memberService.addMember(userId, 'New Member', null)
    const member = await db.members.get(id)
    expect(member).toBeDefined()
    expect(member!.name).toBe('New Member')
  })

  it('should deactivate member offline', async () => {
    const id = await memberService.addMember(userId, 'To Deactivate', null)
    await memberService.deactivateMember(id)
    const member = await db.members.get(id)
    expect(member!.is_active).toBe(false)
  })

  it('should queue all operations for sync', async () => {
    await attendanceService.saveAttendance(userId, memberId, '2026-08-20', 'present')
    await memberService.addMember(userId, 'Another', null)

    const queue = await db.sync_queue.toArray()
    expect(queue.length).toBeGreaterThanOrEqual(2)
  })
})
