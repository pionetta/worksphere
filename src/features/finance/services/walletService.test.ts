import { describe, it, expect, beforeEach } from 'vitest'
import { db } from '@/lib/db'
import * as walletService from '@/features/finance/services/walletService'

const userId = 'test-user-wallet-service'

beforeEach(async () => {
  await db.wallets.clear()
  await db.transactions.clear()
  await db.sync_queue.clear()
})

describe('walletService', () => {
  describe('createWallet', () => {
    it('should create a wallet with initial balance', async () => {
      const id = await walletService.createWallet(userId, 'BCA', 'bank', 1000000)
      expect(id).toBeTruthy()
      const wallet = await db.wallets.get(id)
      expect(wallet).toBeDefined()
      expect(wallet!.name).toBe('BCA')
      expect(wallet!.type).toBe('bank')
      expect(wallet!.initial_balance).toBe(1000000)
      expect(wallet!.is_active).toBe(true)
    })

    it('should queue sync operation', async () => {
      const id = await walletService.createWallet(userId, 'GoPay', 'e_wallet', 500000)
      const queue = await db.sync_queue.where('entity').equals('wallet').toArray()
      expect(queue).toHaveLength(1)
      expect(queue[0].operation).toBe('create')
      expect(queue[0].entity_id).toBe(id)
    })

    it('should reject empty name', async () => {
      await expect(walletService.createWallet(userId, '', 'bank', 0)).rejects.toThrow()
    })

    it('should reject negative initial balance', async () => {
      await expect(walletService.createWallet(userId, 'BCA', 'bank', -100)).rejects.toThrow()
    })

    it('should accept zero initial balance', async () => {
      const id = await walletService.createWallet(userId, 'Cash', 'cash', 0)
      const wallet = await db.wallets.get(id)
      expect(wallet!.initial_balance).toBe(0)
    })
  })

  describe('updateWallet', () => {
    it('should update wallet name', async () => {
      const id = await walletService.createWallet(userId, 'BCA', 'bank', 1000000)
      await walletService.updateWallet(id, { name: 'Mandiri' })
      const wallet = await db.wallets.get(id)
      expect(wallet!.name).toBe('Mandiri')
    })

    it('should reject empty name', async () => {
      const id = await walletService.createWallet(userId, 'BCA', 'bank', 1000000)
      await expect(walletService.updateWallet(id, { name: '' })).rejects.toThrow()
    })

    it('should reject negative initial balance on update', async () => {
      const id = await walletService.createWallet(userId, 'BCA', 'bank', 1000000)
      await expect(walletService.updateWallet(id, { initial_balance: -100 })).rejects.toThrow()
    })
  })

  describe('getWalletsWithBalance', () => {
    it('should return wallets with calculated balance', async () => {
      await walletService.createWallet(userId, 'BCA', 'bank', 1000000)
      const wallets = await walletService.getWalletsWithBalance(userId)
      expect(wallets).toHaveLength(1)
      expect(wallets[0].balance).toBe(1000000)
    })

    it('should calculate balance from transactions', async () => {
      const id = await walletService.createWallet(userId, 'BCA', 'bank', 1000000)
      await db.transactions.add({
        id: 'tx-1',
        user_id: userId,
        wallet_id: id,
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
      await db.transactions.add({
        id: 'tx-2',
        user_id: userId,
        wallet_id: id,
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

      const wallets = await walletService.getWalletsWithBalance(userId)
      expect(wallets[0].balance).toBe(1300000) // 1000000 + 500000 - 200000
    })
  })

  describe('removeWallet', () => {
    it('should delete wallet without transactions', async () => {
      const id = await walletService.createWallet(userId, 'To Delete', 'cash', 0)
      await walletService.removeWallet(id)
      const wallet = await db.wallets.get(id)
      expect(wallet).toBeUndefined()
    })

    it('should throw if wallet has non-transfer transactions', async () => {
      const id = await walletService.createWallet(userId, 'Has Tx', 'bank', 0)
      await db.transactions.add({
        id: 'tx-1',
        user_id: userId,
        wallet_id: id,
        type: 'income',
        amount: 100000,
        category_id: null,
        transaction_date: '2026-08-20',
        note: null,
        transfer_group_id: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        deleted_at: null,
      })
      await expect(walletService.removeWallet(id)).rejects.toThrow()
    })
  })

  describe('user isolation', () => {
    it('should not return wallets from other users', async () => {
      await walletService.createWallet(userId, 'My Wallet', 'bank', 1000000)
      await walletService.createWallet('other-user', 'Other Wallet', 'bank', 2000000)
      const wallets = await walletService.getWalletsWithBalance(userId)
      expect(wallets).toHaveLength(1)
      expect(wallets[0].name).toBe('My Wallet')
    })
  })
})
