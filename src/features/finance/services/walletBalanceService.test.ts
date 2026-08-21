import { describe, it, expect, beforeEach } from 'vitest'
import { db } from '@/lib/db'
import * as walletService from '@/features/finance/services/walletService'
import * as walletBalanceService from '@/features/finance/services/walletBalanceService'

const userId = 'test-user-balance-service'
let walletId: string

beforeEach(async () => {
  await db.wallets.clear()
  await db.transactions.clear()
  await db.sync_queue.clear()

  walletId = await walletService.createWallet(userId, 'Test Wallet', 'bank', 1000000)
})

describe('walletBalanceService', () => {
  describe('calculateWalletBalance', () => {
    it('should return initial balance with no transactions', async () => {
      const wallet = await db.wallets.get(walletId)
      const balance = await walletBalanceService.calculateWalletBalance(wallet!)
      expect(balance).toBe(1000000)
    })

    it('should add income transactions', async () => {
      await db.transactions.add({
        id: 'tx-1',
        user_id: userId,
        wallet_id: walletId,
        type: 'income',
        amount: 500000,
        category_id: null,
        transaction_date: '2026-08-20',
        note: null,
        transfer_group_id: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        deleted_at: null,
      })
      const wallet = await db.wallets.get(walletId)
      const balance = await walletBalanceService.calculateWalletBalance(wallet!)
      expect(balance).toBe(1500000)
    })

    it('should subtract expense transactions', async () => {
      await db.transactions.add({
        id: 'tx-1',
        user_id: userId,
        wallet_id: walletId,
        type: 'expense',
        amount: 200000,
        category_id: null,
        transaction_date: '2026-08-20',
        note: null,
        transfer_group_id: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        deleted_at: null,
      })
      const wallet = await db.wallets.get(walletId)
      const balance = await walletBalanceService.calculateWalletBalance(wallet!)
      expect(balance).toBe(800000)
    })

    it('should handle mixed transaction types', async () => {
      await db.transactions.bulkAdd([
        {
          id: 'tx-1',
          user_id: userId,
          wallet_id: walletId,
          type: 'income',
          amount: 500000,
          category_id: null,
          transaction_date: '2026-08-20',
          note: null,
          transfer_group_id: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          deleted_at: null,
        },
        {
          id: 'tx-2',
          user_id: userId,
          wallet_id: walletId,
          type: 'expense',
          amount: 200000,
          category_id: null,
          transaction_date: '2026-08-20',
          note: null,
          transfer_group_id: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          deleted_at: null,
        },
        {
          id: 'tx-3',
          user_id: userId,
          wallet_id: walletId,
          type: 'transfer_in',
          amount: 100000,
          category_id: null,
          transaction_date: '2026-08-20',
          note: null,
          transfer_group_id: 'group-1',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          deleted_at: null,
        },
        {
          id: 'tx-4',
          user_id: userId,
          wallet_id: walletId,
          type: 'adjustment',
          amount: 50000,
          category_id: null,
          transaction_date: '2026-08-20',
          note: 'Koreksi',
          transfer_group_id: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          deleted_at: null,
        },
      ])
      const wallet = await db.wallets.get(walletId)
      const balance = await walletBalanceService.calculateWalletBalance(wallet!)
      // 1000000 + 500000 - 200000 + 100000 + 50000 = 1450000
      expect(balance).toBe(1450000)
    })

    it('should not include deleted transactions in balance', async () => {
      await db.transactions.add({
        id: 'tx-1',
        user_id: userId,
        wallet_id: walletId,
        type: 'income',
        amount: 500000,
        category_id: null,
        transaction_date: '2026-08-20',
        note: null,
        transfer_group_id: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        deleted_at: '2026-08-20T10:00:00.000Z',
      })
      const wallet = await db.wallets.get(walletId)
      const balance = await walletBalanceService.calculateWalletBalance(wallet!)
      expect(balance).toBe(1000000)
    })
  })

  describe('getTotalBalance', () => {
    it('should sum all active wallet balances', async () => {
      await walletService.createWallet(userId, 'Second Wallet', 'cash', 500000)
      const total = await walletBalanceService.getTotalBalance(userId)
      expect(total).toBe(1500000) // 1000000 + 500000
    })
  })
})
