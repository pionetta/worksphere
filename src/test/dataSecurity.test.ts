import { describe, it, expect, beforeEach } from 'vitest'
import { db } from '@/lib/db'
import { validate } from '@/lib/validation'
import { createIncomeSchema, createExpenseSchema } from '@/features/finance/schemas/transactionSchema'
import * as taskService from '@/features/todo/services/taskService'
import * as walletService from '@/features/finance/services/walletService'
import * as memberService from '@/features/attendance/services/memberService'
import * as attendanceService from '@/features/attendance/services/attendanceService'
import * as habitService from '@/features/todo/services/habitService'
import * as debtService from '@/features/finance/services/debtService'
import * as workspaceService from '@/features/workspace/services/workspaceService'
import * as sharedWalletService from '@/features/finance/services/sharedWalletService'
import * as transferService from '@/features/finance/services/transferService'

describe('Data Security & Multi-Tenant Isolation Suite', () => {
  const userAlpha = 'a0000000-0000-0000-0000-000000000001'
  const userBeta = 'b0000000-0000-0000-0000-000000000002'

  beforeEach(async () => {
    // Clear in-memory Dexie DB tables
    await db.tasks.clear()
    await db.subtasks.clear()
    await db.wallets.clear()
    await db.transactions.clear()
    await db.members.clear()
    await db.attendance.clear()
    await db.habits.clear()
    await db.habit_logs.clear()
    await db.debts.clear()
    await db.workspaces.clear()
    await db.workspace_members.clear()
    await db.wallet_members.clear()
    await db.sync_queue.clear()
  })

  describe('1. Multi-Tenant User Data Isolation', () => {
    it('strictly isolates tasks between users', async () => {
      const taskId1 = await taskService.createTask(userAlpha, 'Alpha Secret Task 1')
      const taskId2 = await taskService.createTask(userBeta, 'Beta Private Task 2')

      const alphaTasks = await taskService.listTasks(userAlpha)
      const betaTasks = await taskService.listTasks(userBeta)

      expect(alphaTasks.map(t => t.id)).toContain(taskId1)
      expect(alphaTasks.some(t => t.user_id === userBeta)).toBe(false)

      expect(betaTasks.map(t => t.id)).toContain(taskId2)
      expect(betaTasks.some(t => t.user_id === userAlpha)).toBe(false)
    })

    it('strictly isolates wallets and financial balances', async () => {
      const alphaWalletId = await walletService.createWallet(userAlpha, 'Alpha Bank', 'bank', 5000000)
      const betaWalletId = await walletService.createWallet(userBeta, 'Beta Cash', 'cash', 100000)

      const alphaWallets = await walletService.getWalletsWithBalance(userAlpha)
      const betaWallets = await walletService.getWalletsWithBalance(userBeta)

      expect(alphaWallets.map(w => w.id)).toContain(alphaWalletId)
      expect(alphaWallets.map(w => w.id)).not.toContain(betaWalletId)

      expect(betaWallets.map(w => w.id)).toContain(betaWalletId)
      expect(betaWallets.map(w => w.id)).not.toContain(alphaWalletId)
    })

    it('strictly isolates attendance records and member rosters', async () => {
      const memberIdAlpha = await memberService.addMember(userAlpha, 'Karyawan Alpha', 'Tim 1')
      const memberIdBeta = await memberService.addMember(userBeta, 'Karyawan Beta', 'Tim 2')

      await attendanceService.saveAttendance(userAlpha, memberIdAlpha, '2026-08-30', 'present')
      await attendanceService.saveAttendance(userBeta, memberIdBeta, '2026-08-30', 'absent')

      const alphaAttendance = await attendanceService.getAttendanceForDate(userAlpha, '2026-08-30')
      const betaAttendance = await attendanceService.getAttendanceForDate(userBeta, '2026-08-30')

      expect(alphaAttendance.map(a => a.member_id)).toEqual([memberIdAlpha])
      expect(alphaAttendance.map(a => a.member_id)).not.toContain(memberIdBeta)

      expect(betaAttendance.map(a => a.member_id)).toEqual([memberIdBeta])
      expect(betaAttendance.map(a => a.member_id)).not.toContain(memberIdAlpha)
    })

    it('strictly isolates habits and streak logs', async () => {
      const habitIdAlpha = await habitService.createHabit(userAlpha, { title: 'Meditasi Alpha', target_days_per_week: 7 })
      const habitIdBeta = await habitService.createHabit(userBeta, { title: 'Coding Beta', target_days_per_week: 5 })

      const alphaHabits = await habitService.listHabits(userAlpha)
      const betaHabits = await habitService.listHabits(userBeta)

      expect(alphaHabits.map(h => h.id)).toContain(habitIdAlpha)
      expect(alphaHabits.map(h => h.id)).not.toContain(habitIdBeta)

      expect(betaHabits.map(h => h.id)).toContain(habitIdBeta)
      expect(betaHabits.map(h => h.id)).not.toContain(habitIdAlpha)
    })

    it('strictly isolates debts and receivables', async () => {
      const debtIdAlpha = await debtService.createDebt(userAlpha, {
        person_name: 'Budi (Alpha)',
        amount: 250000,
        type: 'debt',
        due_date: '2026-09-01'
      })
      const debtIdBeta = await debtService.createDebt(userBeta, {
        person_name: 'Siti (Beta)',
        amount: 500000,
        type: 'receivable',
        due_date: '2026-09-05'
      })

      const alphaDebts = await debtService.getDebts(userAlpha)
      const betaDebts = await debtService.getDebts(userBeta)

      expect(alphaDebts.map(d => d.id)).toContain(debtIdAlpha)
      expect(alphaDebts.map(d => d.id)).not.toContain(debtIdBeta)

      expect(betaDebts.map(d => d.id)).toContain(debtIdBeta)
      expect(betaDebts.map(d => d.id)).not.toContain(debtIdAlpha)
    })
  })

  describe('2. Input Validation & Defense Against Malicious Payloads', () => {
    it('safely stores and retrieves SQL injection vectors as plain literals without corruption', async () => {
      const sqlInjectionTitle = "Robert'); DROP TABLE tasks; -- <script>alert('xss')</script>"
      
      const taskId = await taskService.createTask(userAlpha, sqlInjectionTitle)
      const fetched = await db.tasks.get(taskId)

      expect(fetched?.title).toBe(sqlInjectionTitle)
      // Verify database table remains intact and functional
      const count = await db.tasks.count()
      expect(count).toBeGreaterThanOrEqual(1)
    })

    it('rejects negative numbers and invalid financial amounts via Zod schemas', () => {
      const dummyId = 'c0000000-0000-0000-0000-000000000003'
      
      expect(() =>
        validate(createExpenseSchema, {
          wallet_id: dummyId,
          category_id: dummyId,
          amount: -50000,
          transaction_date: '2026-08-30'
        })
      ).toThrow()

      expect(() =>
        validate(createIncomeSchema, {
          wallet_id: dummyId,
          category_id: null,
          amount: 0,
          transaction_date: '2026-08-30'
        })
      ).toThrow()
    })

    it('prevents illegal cross-wallet transfers with insufficient balance', async () => {
      const w1 = await walletService.createWallet(userAlpha, 'Dompet Kecil', 'cash', 50000)
      const w2 = await walletService.createWallet(userAlpha, 'Dompet Besar', 'bank', 1000000)

      // Attempt transfer of 200,000 when only 50,000 is available
      await expect(
        transferService.createTransfer(userAlpha, w1, w2, 200000, '2026-08-30', 'Illegal Transfer')
      ).rejects.toThrow(/tidak mencukupi/i)
    })
  })

  describe('3. Collaboration & Role-Based Authorization Enforcement', () => {
    it('enforces workspace membership creation and role attribution', async () => {
      const wsId = await workspaceService.createWorkspace(userAlpha, {
        name: 'Alpha Enterprise',
        description: 'Secure Company Workspace'
      })

      const ws = await db.workspaces.get(wsId)
      expect(ws?.owner_id).toBe(userAlpha)

      // Invite userBeta as member
      const memberId = await workspaceService.inviteMember(userAlpha, {
        workspace_id: wsId,
        invited_email: 'beta@company.id',
        role: 'member'
      })

      const memberRecord = await db.workspace_members.get(memberId)
      expect(memberRecord?.role).toBe('member')
      expect(memberRecord?.status).toBe('pending')

      // Accept invitation
      await workspaceService.respondToInvitation(memberId, userBeta, true)
      const members = await workspaceService.listWorkspaceMembers(wsId)
      const betaMember = members.find(m => m.user_id === userBeta)
      expect(betaMember?.status).toBe('accepted')
    })

    it('enforces shared wallet invitation boundaries', async () => {
      const walletId = await walletService.createWallet(userAlpha, 'Shared Project Fund', 'bank', 10000000)
      
      const inviteId = await sharedWalletService.inviteMember(userAlpha, {
        wallet_id: walletId,
        invited_email: 'partner@worksphere.id',
        role: 'editor'
      })

      const invite = await db.wallet_members.get(inviteId)
      expect(invite?.wallet_id).toBe(walletId)
      expect(invite?.status).toBe('pending')
      expect(invite?.role).toBe('editor')

      // List invitations for invitee
      const pendingList = await sharedWalletService.listPendingInvitations(userBeta, 'partner@worksphere.id')
      expect(pendingList.some(p => p.membership.id === inviteId)).toBe(true)
    })
  })
})
