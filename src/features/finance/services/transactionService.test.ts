import { describe, it, expect, beforeEach } from 'vitest'
import { db } from '@/lib/db'
import * as walletService from '@/features/finance/services/walletService'
import * as categoryService from '@/features/finance/services/categoryService'
import * as transactionService from '@/features/finance/services/transactionService'

const userId = 'test-user-transaction-service'
let walletId: string
let incomeCategoryId: string
let expenseCategoryId: string

beforeEach(async () => {
  await db.wallets.clear()
  await db.categories.clear()
  await db.transactions.clear()
  await db.sync_queue.clear()

  walletId = await walletService.createWallet(userId, 'Test Wallet', 'bank', 1000000)
  incomeCategoryId = await categoryService.createCategory(userId, 'Gaji', 'income')
  expenseCategoryId = await categoryService.createCategory(userId, 'Makanan', 'expense')
})

describe('transactionService', () => {
  describe('createIncome', () => {
    it('should create income transaction', async () => {
      const id = await transactionService.createIncome(
        userId,
        walletId,
        500000,
        incomeCategoryId,
        '2026-08-20'
      )
      expect(id).toBeTruthy()
      const tx = await db.transactions.get(id)
      expect(tx).toBeDefined()
      expect(tx!.type).toBe('income')
      expect(tx!.amount).toBe(500000)
    })

    it('should queue sync', async () => {
      await transactionService.createIncome(userId, walletId, 500000, null, '2026-08-20')
      const queue = await db.sync_queue.where('entity').equals('transaction').toArray()
      expect(queue).toHaveLength(1)
      expect(queue[0].operation).toBe('create')
    })

    it('should reject amount <= 0', async () => {
      await expect(
        transactionService.createIncome(userId, walletId, 0, null, '2026-08-20')
      ).rejects.toThrow()
    })

    it('should allow any category for income', async () => {
      const id = await transactionService.createIncome(
        userId,
        walletId,
        100000,
        expenseCategoryId,
        '2026-08-20'
      )
      const tx = await db.transactions.get(id)
      expect(tx?.category_id).toBe(expenseCategoryId)
    })

    it('should reject non-existent category', async () => {
      await expect(
        transactionService.createIncome(userId, walletId, 100000, 'fake-id', '2026-08-20')
      ).rejects.toThrow()
    })
  })

  describe('createExpense', () => {
    it('should create expense transaction', async () => {
      const id = await transactionService.createExpense(
        userId,
        walletId,
        50000,
        expenseCategoryId,
        '2026-08-20'
      )
      const tx = await db.transactions.get(id)
      expect(tx!.type).toBe('expense')
      expect(tx!.amount).toBe(50000)
    })

    it('should allow any category for expense', async () => {
      const id = await transactionService.createExpense(
        userId,
        walletId,
        50000,
        incomeCategoryId,
        '2026-08-20'
      )
      const tx = await db.transactions.get(id)
      expect(tx?.category_id).toBe(incomeCategoryId)
    })
  })

  describe('createAdjustment', () => {
    it('should create adjustment transaction', async () => {
      const id = await transactionService.createAdjustment(
        userId,
        walletId,
        100000,
        '2026-08-20',
        'Koreksi saldo'
      )
      const tx = await db.transactions.get(id)
      expect(tx!.type).toBe('adjustment')
      expect(tx!.amount).toBe(100000)
      expect(tx!.note).toBe('Koreksi saldo')
    })

    it('should reject zero amount adjustment', async () => {
      await expect(
        transactionService.createAdjustment(userId, walletId, 0, '2026-08-20')
      ).rejects.toThrow()
    })
  })

  describe('softDelete', () => {
    it('should soft delete a transaction', async () => {
      const id = await transactionService.createIncome(userId, walletId, 100000, null, '2026-08-20')
      await transactionService.removeTransaction(id)
      const tx = await db.transactions.get(id)
      expect(tx).toBeDefined()
      expect(tx!.deleted_at).not.toBeNull()
    })

    it('should not include soft deleted in list', async () => {
      const id = await transactionService.createIncome(userId, walletId, 100000, null, '2026-08-20')
      await transactionService.removeTransaction(id)
      const txs = await transactionService.getTransactions(userId)
      expect(txs).toHaveLength(0)
    })
  })

  describe('balance impact', () => {
    it('income should increase wallet balance', async () => {
      await transactionService.createIncome(userId, walletId, 500000, null, '2026-08-20')
      const wallets = await walletService.getWalletsWithBalance(userId)
      expect(wallets[0].balance).toBe(1500000) // 1000000 + 500000
    })

    it('expense should decrease wallet balance', async () => {
      await transactionService.createExpense(userId, walletId, 300000, null, '2026-08-20')
      const wallets = await walletService.getWalletsWithBalance(userId)
      expect(wallets[0].balance).toBe(700000) // 1000000 - 300000
    })

    it('deleted transaction should not affect balance', async () => {
      const id = await transactionService.createIncome(userId, walletId, 500000, null, '2026-08-20')
      await transactionService.removeTransaction(id)
      const wallets = await walletService.getWalletsWithBalance(userId)
      expect(wallets[0].balance).toBe(1000000)
    })
  })

  describe('updateIncome', () => {
    it('should update income amount', async () => {
      const id = await transactionService.createIncome(
        userId,
        walletId,
        500000,
        incomeCategoryId,
        '2026-08-20',
        'Gaji bulan ini'
      )
      await transactionService.updateIncome(
        id,
        walletId,
        600000,
        incomeCategoryId,
        '2026-08-21',
        'Gaji revisi'
      )
      const tx = await db.transactions.get(id)
      expect(tx!.amount).toBe(600000)
      expect(tx!.transaction_date).toBe('2026-08-21')
      expect(tx!.note).toBe('Gaji revisi')
    })

    it('should update income wallet', async () => {
      const wallet2 = await walletService.createWallet(userId, 'Wallet 2', 'cash', 0)
      const id = await transactionService.createIncome(userId, walletId, 500000, null, '2026-08-20')
      await transactionService.updateIncome(id, wallet2, 500000, null, '2026-08-20')
      const tx = await db.transactions.get(id)
      expect(tx!.wallet_id).toBe(wallet2)
    })

    it('should update income category', async () => {
      const id = await transactionService.createIncome(userId, walletId, 500000, null, '2026-08-20')
      await transactionService.updateIncome(id, walletId, 500000, incomeCategoryId, '2026-08-20')
      const tx = await db.transactions.get(id)
      expect(tx!.category_id).toBe(incomeCategoryId)
    })

    it('should reject updating non-existent transaction', async () => {
      await expect(
        transactionService.updateIncome('fake-id', walletId, 500000, null, '2026-08-20')
      ).rejects.toThrow('Transaksi tidak ditemukan.')
    })

    it('should reject updating expense as income', async () => {
      const id = await transactionService.createExpense(userId, walletId, 50000, null, '2026-08-20')
      await expect(
        transactionService.updateIncome(id, walletId, 50000, null, '2026-08-20')
      ).rejects.toThrow('Transaksi ini bukan pemasukan.')
    })

    it('should allow updating income with any category', async () => {
      const id = await transactionService.createIncome(userId, walletId, 500000, null, '2026-08-20')
      await transactionService.updateIncome(id, walletId, 500000, expenseCategoryId, '2026-08-20')
      const tx = await db.transactions.get(id)
      expect(tx?.category_id).toBe(expenseCategoryId)
    })

    it('should reject amount <= 0', async () => {
      const id = await transactionService.createIncome(userId, walletId, 500000, null, '2026-08-20')
      await expect(
        transactionService.updateIncome(id, walletId, 0, null, '2026-08-20')
      ).rejects.toThrow()
    })

    it('should queue sync on update', async () => {
      const id = await transactionService.createIncome(userId, walletId, 500000, null, '2026-08-20')
      await transactionService.updateIncome(id, walletId, 600000, null, '2026-08-20')
      const queue = await db.sync_queue.where('entity').equals('transaction').toArray()
      const updateOps = queue.filter(q => q.operation === 'update')
      expect(updateOps.length).toBeGreaterThanOrEqual(1)
    })
  })

  describe('updateExpense', () => {
    it('should update expense amount', async () => {
      const id = await transactionService.createExpense(
        userId,
        walletId,
        50000,
        expenseCategoryId,
        '2026-08-20',
        'Makan siang'
      )
      await transactionService.updateExpense(
        id,
        walletId,
        75000,
        expenseCategoryId,
        '2026-08-21',
        'Makan malam'
      )
      const tx = await db.transactions.get(id)
      expect(tx!.amount).toBe(75000)
      expect(tx!.transaction_date).toBe('2026-08-21')
      expect(tx!.note).toBe('Makan malam')
    })

    it('should reject updating income as expense', async () => {
      const id = await transactionService.createIncome(userId, walletId, 500000, null, '2026-08-20')
      await expect(
        transactionService.updateExpense(id, walletId, 500000, null, '2026-08-20')
      ).rejects.toThrow('Transaksi ini bukan pengeluaran.')
    })

    it('should allow updating expense with any category', async () => {
      const id = await transactionService.createExpense(userId, walletId, 50000, null, '2026-08-20')
      await transactionService.updateExpense(id, walletId, 50000, incomeCategoryId, '2026-08-20')
      const tx = await db.transactions.get(id)
      expect(tx?.category_id).toBe(incomeCategoryId)
    })

    it('should update balance correctly after edit', async () => {
      const id = await transactionService.createExpense(
        userId,
        walletId,
        300000,
        null,
        '2026-08-20'
      )
      let wallets = await walletService.getWalletsWithBalance(userId)
      expect(wallets[0].balance).toBe(700000)

      await transactionService.updateExpense(id, walletId, 200000, null, '2026-08-20')
      wallets = await walletService.getWalletsWithBalance(userId)
      expect(wallets[0].balance).toBe(800000)
    })
  })
})
