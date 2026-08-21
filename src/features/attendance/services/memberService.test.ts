import { describe, it, expect, beforeEach } from 'vitest'
import { db } from '@/lib/db'
import * as memberService from '@/features/attendance/services/memberService'

const userId = 'test-user-member-service'

beforeEach(async () => {
  await db.members.clear()
  await db.sync_queue.clear()
})

describe('memberService', () => {
  describe('addMember', () => {
    it('should create a member', async () => {
      const id = await memberService.addMember(userId, 'Anggota Test', null)
      expect(id).toBeTruthy()
      const member = await db.members.get(id)
      expect(member).toBeDefined()
      expect(member!.name).toBe('Anggota Test')
      expect(member!.user_id).toBe(userId)
      expect(member!.is_active).toBe(true)
    })

    it('should queue sync operation', async () => {
      await memberService.addMember(userId, 'Anggota Test', null)
      const queue = await db.sync_queue.where('entity').equals('member').toArray()
      expect(queue).toHaveLength(1)
      expect(queue[0].operation).toBe('create')
    })

    it('should reject empty name', async () => {
      await expect(memberService.addMember(userId, '', null)).rejects.toThrow()
    })

    it('should reject whitespace-only name', async () => {
      await expect(memberService.addMember(userId, '   ', null)).rejects.toThrow()
    })
  })

  describe('editMember', () => {
    it('should update member name', async () => {
      const id = await memberService.addMember(userId, 'Original Name', null)
      await memberService.editMember(id, { name: 'Nama Baru' })
      const member = await db.members.get(id)
      expect(member!.name).toBe('Nama Baru')
    })

    it('should update member note', async () => {
      const id = await memberService.addMember(userId, 'Anggota', null)
      await memberService.editMember(id, { note: 'Keterangan baru' })
      const member = await db.members.get(id)
      expect(member!.note).toBe('Keterangan baru')
    })

    it('should not throw if member not found (updates 0 rows)', async () => {
      // editMember doesn't throw — it just updates nothing
      await memberService.editMember('non-existent', { name: 'X' })
    })
  })

  describe('activate/deactivate', () => {
    it('should deactivate a member', async () => {
      const id = await memberService.addMember(userId, 'To Deactivate', null)
      await memberService.deactivateMember(id)
      const member = await db.members.get(id)
      expect(member!.is_active).toBe(false)
    })

    it('should activate a member', async () => {
      const id = await memberService.addMember(userId, 'To Activate', null)
      await memberService.deactivateMember(id)
      await memberService.activateMember(id)
      const member = await db.members.get(id)
      expect(member!.is_active).toBe(true)
    })
  })

  describe('getActiveMembers', () => {
    it('should return only active members', async () => {
      await memberService.addMember(userId, 'Active 1', null)
      const id2 = await memberService.addMember(userId, 'Active 2', null)
      await memberService.deactivateMember(id2)

      const active = await memberService.getActiveMembers(userId)
      expect(active).toHaveLength(1)
      expect(active[0].name).toBe('Active 1')
    })
  })

  describe('getAllMembers', () => {
    it('should return all members including inactive', async () => {
      await memberService.addMember(userId, 'Active', null)
      const id2 = await memberService.addMember(userId, 'Inactive', null)
      await memberService.deactivateMember(id2)

      const all = await memberService.getAllMembers(userId)
      expect(all).toHaveLength(2)
    })
  })

  describe('removeMember', () => {
    it('should delete a member without attendance history', async () => {
      const id = await memberService.addMember(userId, 'To Delete', null)
      await memberService.removeMember(id)
      const member = await db.members.get(id)
      expect(member).toBeUndefined()
    })

    it('should throw if member has attendance history', async () => {
      const id = await memberService.addMember(userId, 'With History', null)
      await db.attendance.add({
        id: 'att-history',
        user_id: userId,
        member_id: id,
        attendance_date: '2026-08-20',
        status: 'present',
        note: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      await expect(memberService.removeMember(id)).rejects.toThrow()
    })
  })

  describe('user isolation', () => {
    it('should not return members from other users', async () => {
      await memberService.addMember(userId, 'My Member', null)
      await memberService.addMember('other-user', 'Other Member', null)

      const mine = await memberService.getAllMembers(userId)
      expect(mine).toHaveLength(1)
      expect(mine[0].name).toBe('My Member')
    })
  })
})
