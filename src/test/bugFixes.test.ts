import { describe, it, expect, beforeEach } from 'vitest'
import { db } from '@/lib/db'
import * as walletService from '@/features/finance/services/walletService'
import * as transferService from '@/features/finance/services/transferService'
import * as taskService from '@/features/todo/services/taskService'
import { isOverdueDate, toISODate } from '@/utils/date'

const userId = 'test-user-bugfixes'

describe('Bug Fixes Verification', () => {
  beforeEach(async () => {
    await db.wallets.clear()
    await db.transactions.clear()
    await db.tasks.clear()
    await db.subtasks.clear()
    await db.sync_queue.clear()
  })

  describe('Bug 1.1: Atomic Transfer Deletion', () => {
    it('should delete both transfer_in and transfer_out legs when removeTransfer is called', async () => {
      const sourceWalletId = await walletService.createWallet(userId, 'Dompet A', 'bank', 100000)
      const targetWalletId = await walletService.createWallet(userId, 'Dompet B', 'cash', 50000)

      const groupId = await transferService.createTransfer(
        userId,
        sourceWalletId,
        targetWalletId,
        30000,
        '2026-08-22',
        'Transfer test'
      )

      // Verify initial transfer state
      let sourceWallet = await walletService.getWalletWithBalance(sourceWalletId)
      let targetWallet = await walletService.getWalletWithBalance(targetWalletId)
      expect(sourceWallet?.balance).toBe(70000)
      expect(targetWallet?.balance).toBe(80000)

      // Delete the transfer via group ID
      await transferService.removeTransfer(groupId)

      // Verify both legs are soft deleted
      const groupTx = await transferService.getTransferByGroupId(groupId)
      expect(groupTx.every(t => t.deleted_at !== null)).toBe(true)

      // Verify balances are restored to original values
      sourceWallet = await walletService.getWalletWithBalance(sourceWalletId)
      targetWallet = await walletService.getWalletWithBalance(targetWalletId)
      expect(sourceWallet?.balance).toBe(100000)
      expect(targetWallet?.balance).toBe(50000)
    })
  })

  describe('Bug 2.1: False Overdue on Today Tasks', () => {
    it('should not mark task with due date today as overdue', async () => {
      const todayStr = toISODate(new Date())
      const taskId = await taskService.createTask(userId, 'Tugas Hari Ini', {
        dueDate: todayStr,
      })

      const task = await taskService.getTaskById(taskId)
      expect(task).toBeDefined()
      expect(taskService.isOverdue(task!)).toBe(false)
      expect(isOverdueDate(todayStr)).toBe(false)
    })

    it('should mark task with yesterday due date as overdue', async () => {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      const yesterdayStr = toISODate(yesterday)

      const taskId = await taskService.createTask(userId, 'Tugas Kemarin', {
        dueDate: yesterdayStr,
      })

      const task = await taskService.getTaskById(taskId)
      expect(task).toBeDefined()
      expect(taskService.isOverdue(task!)).toBe(true)
      expect(isOverdueDate(yesterdayStr)).toBe(true)
    })
  })
})
