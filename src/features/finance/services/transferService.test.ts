import { describe, it, expect, beforeEach } from 'vitest'
import { db } from '@/lib/db'
import * as walletService from '@/features/finance/services/walletService'
import * as transferService from '@/features/finance/services/transferService'

const userId = 'test-user-transfer-service'
let sourceWalletId: string
let targetWalletId: string

beforeEach(async () => {
  await db.wallets.clear()
  await db.transactions.clear()
  await db.sync_queue.clear()

  sourceWalletId = await walletService.createWallet(userId, 'Source', 'bank', 1000000)
  targetWalletId = await walletService.createWallet(userId, 'Target', 'e_wallet', 500000)
})

describe('transferService', () => {
  describe('createTransfer', () => {
    it('should create transfer between wallets', async () => {
      const groupId = await transferService.createTransfer(
        userId,
        sourceWalletId,
        targetWalletId,
        200000,
        '2026-08-20'
      )
      expect(groupId).toBeTruthy()

      const txs = await transferService.getTransferByGroupId(groupId)
      expect(txs).toHaveLength(2)

      const outTx = txs.find(t => t.type === 'transfer_out')
      const inTx = txs.find(t => t.type === 'transfer_in')

      expect(outTx).toBeDefined()
      expect(inTx).toBeDefined()
      expect(outTx!.wallet_id).toBe(sourceWalletId)
      expect(inTx!.wallet_id).toBe(targetWalletId)
      expect(outTx!.amount).toBe(200000)
      expect(inTx!.amount).toBe(200000)
    })

    it('should update wallet balances atomically', async () => {
      await transferService.createTransfer(
        userId,
        sourceWalletId,
        targetWalletId,
        200000,
        '2026-08-20'
      )
      const sourceWallets = await walletService.getWalletsWithBalance(userId)
      const source = sourceWallets.find(w => w.id === sourceWalletId)
      const target = sourceWallets.find(w => w.id === targetWalletId)

      expect(source!.balance).toBe(800000) // 1000000 - 200000
      expect(target!.balance).toBe(700000) // 500000 + 200000
    })

    it('should queue two sync operations', async () => {
      await transferService.createTransfer(
        userId,
        sourceWalletId,
        targetWalletId,
        100000,
        '2026-08-20'
      )
      const queue = await db.sync_queue.where('entity').equals('transaction').toArray()
      expect(queue).toHaveLength(2)
    })

    it('should reject same wallet transfer', async () => {
      await expect(
        transferService.createTransfer(userId, sourceWalletId, sourceWalletId, 100000, '2026-08-20')
      ).rejects.toThrow()
    })

    it('should reject amount <= 0', async () => {
      await expect(
        transferService.createTransfer(userId, sourceWalletId, targetWalletId, 0, '2026-08-20')
      ).rejects.toThrow()
    })
  })

  describe('removeTransfer', () => {
    it('should soft delete both sides of transfer', async () => {
      const groupId = await transferService.createTransfer(
        userId,
        sourceWalletId,
        targetWalletId,
        100000,
        '2026-08-20'
      )
      await transferService.removeTransfer(groupId)
      const txs = await transferService.getTransferByGroupId(groupId)
      expect(txs.every(t => t.deleted_at !== null)).toBe(true)
    })
  })

  describe('user isolation', () => {
    it('should not include transfer from other users in balance', async () => {
      const otherSource = await walletService.createWallet(
        'other-user',
        'Other Source',
        'bank',
        2000000
      )
      const otherTarget = await walletService.createWallet(
        'other-user',
        'Other Target',
        'e_wallet',
        1000000
      )

      await transferService.createTransfer(
        'other-user',
        otherSource,
        otherTarget,
        500000,
        '2026-08-20'
      )

      const myWallets = await walletService.getWalletsWithBalance(userId)
      const mySource = myWallets.find(w => w.id === sourceWalletId)
      expect(mySource!.balance).toBe(1000000) // Unchanged
    })
  })
})
