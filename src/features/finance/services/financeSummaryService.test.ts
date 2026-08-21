import { describe, it, expect, beforeEach } from 'vitest'
import { db } from '@/lib/db'
import * as walletService from '@/features/finance/services/walletService'
import * as transactionService from '@/features/finance/services/transactionService'
import * as financeSummaryService from '@/features/finance/services/financeSummaryService'

const userId = 'test-user-finance-summary'
let walletId: string

beforeEach(async () => {
  await db.wallets.clear()
  await db.categories.clear()
  await db.transactions.clear()
  await db.sync_queue.clear()

  walletId = await walletService.createWallet(userId, 'Main Wallet', 'bank', 1000000)
})

describe('financeSummaryService', () => {
  describe('getFinanceSummary', () => {
    it('should return empty summary with no transactions', async () => {
      const summary = await financeSummaryService.getFinanceSummary(userId)
      expect(summary.totalBalance).toBe(1000000)
      expect(summary.totalIncome).toBe(0)
      expect(summary.totalExpense).toBe(0)
      expect(summary.netIncome).toBe(0)
      expect(summary.transactionCount).toBe(0)
    })

    it('should calculate income and expense', async () => {
      await transactionService.createIncome(userId, walletId, 500000, null, '2026-08-20')
      await transactionService.createExpense(userId, walletId, 200000, null, '2026-08-20')

      const summary = await financeSummaryService.getFinanceSummary(userId)
      expect(summary.totalIncome).toBe(500000)
      expect(summary.totalExpense).toBe(200000)
      expect(summary.netIncome).toBe(300000)
      expect(summary.transactionCount).toBe(2)
    })

    it('should not count deleted transactions', async () => {
      const id = await transactionService.createIncome(userId, walletId, 500000, null, '2026-08-20')
      await transactionService.removeTransaction(id)

      const summary = await financeSummaryService.getFinanceSummary(userId)
      expect(summary.totalIncome).toBe(0)
      expect(summary.transactionCount).toBe(0)
    })
  })

  describe('getFinanceSummaryByMonth', () => {
    it('should filter transactions by month', async () => {
      await transactionService.createIncome(userId, walletId, 500000, null, '2026-08-15')
      await transactionService.createIncome(userId, walletId, 300000, null, '2026-09-01')

      const summary = await financeSummaryService.getFinanceSummaryByMonth(userId, 8, 2026)
      expect(summary.totalIncome).toBe(500000)
      expect(summary.transactionCount).toBe(1)
    })
  })

  describe('user isolation', () => {
    it('should not include other user transactions in summary', async () => {
      await transactionService.createIncome(userId, walletId, 500000, null, '2026-08-20')

      const otherWalletId2 = await walletService.createWallet(
        'other-user',
        'Other',
        'bank',
        2000000
      )
      await transactionService.createIncome(
        'other-user',
        otherWalletId2,
        1000000,
        null,
        '2026-08-20'
      )

      const summary = await financeSummaryService.getFinanceSummary(userId)
      expect(summary.totalIncome).toBe(500000)
      expect(summary.transactionCount).toBe(1)
    })
  })
})
