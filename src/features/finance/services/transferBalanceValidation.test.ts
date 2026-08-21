import { describe, it, expect, beforeEach } from 'vitest'
import { db } from '@/lib/db'
import * as walletService from './walletService'
import * as transferService from './transferService'

const userId = 'test-user-transfer-balance'
let sourceWalletId: string
let targetWalletId: string

beforeEach(async () => {
  await db.wallets.clear()
  await db.transactions.clear()
  await db.sync_queue.clear()

  sourceWalletId = await walletService.createWallet(userId, 'Source', 'bank', 500000)
  targetWalletId = await walletService.createWallet(userId, 'Target', 'e_wallet', 200000)
})

async function getBalance(walletId: string): Promise<number> {
  const wallets = await walletService.getWalletsWithBalance(userId)
  const wallet = wallets.find(w => w.id === walletId)
  return wallet!.balance
}

describe('transfer balance validation', () => {
  it('should allow transfer when balance is sufficient', async () => {
    await transferService.createTransfer(
      userId,
      sourceWalletId,
      targetWalletId,
      300000,
      '2026-08-20'
    )

    expect(await getBalance(sourceWalletId)).toBe(200000)
    expect(await getBalance(targetWalletId)).toBe(500000)
  })

  it('should allow transfer when balance equals amount exactly', async () => {
    await transferService.createTransfer(
      userId,
      sourceWalletId,
      targetWalletId,
      500000,
      '2026-08-20'
    )

    expect(await getBalance(sourceWalletId)).toBe(0)
  })

  it('should reject transfer when balance is insufficient', async () => {
    await expect(
      transferService.createTransfer(userId, sourceWalletId, targetWalletId, 600000, '2026-08-20')
    ).rejects.toThrow('Saldo dompet tidak mencukupi.')
  })

  it('should reject transfer when balance is zero', async () => {
    await db.transactions.add({
      id: 'zero-balance-expense',
      user_id: userId,
      wallet_id: sourceWalletId,
      type: 'expense',
      amount: 500000,
      category_id: null,
      transaction_date: '2026-08-20',
      note: null,
      transfer_group_id: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      deleted_at: null,
    })

    await expect(
      transferService.createTransfer(userId, sourceWalletId, targetWalletId, 1, '2026-08-20')
    ).rejects.toThrow('Saldo dompet tidak mencukupi.')
  })

  it('should reject transfer when source wallet is inactive', async () => {
    await walletService.deactivateWallet(sourceWalletId)

    await expect(
      transferService.createTransfer(userId, sourceWalletId, targetWalletId, 100000, '2026-08-20')
    ).rejects.toThrow('Dompet sumber tidak aktif.')
  })

  it('should reject transfer when target wallet is inactive', async () => {
    await walletService.deactivateWallet(targetWalletId)

    await expect(
      transferService.createTransfer(userId, sourceWalletId, targetWalletId, 100000, '2026-08-20')
    ).rejects.toThrow('Dompet tujuan tidak aktif.')
  })

  it('should not create any IndexedDB records on insufficient balance', async () => {
    const txCountBefore = await db.transactions.count()
    const queueCountBefore = await db.sync_queue.count()

    await expect(
      transferService.createTransfer(userId, sourceWalletId, targetWalletId, 600000, '2026-08-20')
    ).rejects.toThrow('Saldo dompet tidak mencukupi.')

    expect(await db.transactions.count()).toBe(txCountBefore)
    expect(await db.sync_queue.count()).toBe(queueCountBefore)
  })

  it('should not create any records on inactive wallet', async () => {
    await walletService.deactivateWallet(sourceWalletId)

    const txCountBefore = await db.transactions.count()
    const queueCountBefore = await db.sync_queue.count()

    await expect(
      transferService.createTransfer(userId, sourceWalletId, targetWalletId, 100000, '2026-08-20')
    ).rejects.toThrow('Dompet sumber tidak aktif.')

    expect(await db.transactions.count()).toBe(txCountBefore)
    expect(await db.sync_queue.count()).toBe(queueCountBefore)
  })

  it('should account for prior expenses when checking balance', async () => {
    await db.transactions.add({
      id: 'existing-expense',
      user_id: userId,
      wallet_id: sourceWalletId,
      type: 'expense',
      amount: 400000,
      category_id: null,
      transaction_date: '2026-08-20',
      note: null,
      transfer_group_id: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      deleted_at: null,
    })

    await transferService.createTransfer(
      userId,
      sourceWalletId,
      targetWalletId,
      100000,
      '2026-08-20'
    )
    expect(await getBalance(sourceWalletId)).toBe(0)

    await expect(
      transferService.createTransfer(userId, sourceWalletId, targetWalletId, 1, '2026-08-20')
    ).rejects.toThrow('Saldo dompet tidak mencukupi.')
  })

  it('should not count soft-deleted transactions in balance check', async () => {
    await db.transactions.add({
      id: 'deleted-income',
      user_id: userId,
      wallet_id: sourceWalletId,
      type: 'income',
      amount: 300000,
      category_id: null,
      transaction_date: '2026-08-20',
      note: null,
      transfer_group_id: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      deleted_at: new Date().toISOString(),
    })

    await expect(
      transferService.createTransfer(userId, sourceWalletId, targetWalletId, 600000, '2026-08-20')
    ).rejects.toThrow('Saldo dompet tidak mencukupi.')

    await transferService.createTransfer(
      userId,
      sourceWalletId,
      targetWalletId,
      500000,
      '2026-08-20'
    )
    expect(await getBalance(sourceWalletId)).toBe(0)
  })

  it('should maintain user isolation for balance check', async () => {
    const otherSource = await walletService.createWallet(
      'other-user',
      'Other Source',
      'bank',
      900000
    )
    const otherTarget = await walletService.createWallet(
      'other-user',
      'Other Target',
      'e_wallet',
      100000
    )

    await transferService.createTransfer(
      'other-user',
      otherSource,
      otherTarget,
      400000,
      '2026-08-20'
    )

    expect(await getBalance(sourceWalletId)).toBe(500000)
    expect(await getBalance(targetWalletId)).toBe(200000)
  })

  it('should not create partial mutation on failed balance check', async () => {
    const txCountBefore = await db.transactions.count()

    await expect(
      transferService.createTransfer(userId, sourceWalletId, targetWalletId, 999999, '2026-08-20')
    ).rejects.toThrow('Saldo dompet tidak mencukupi.')

    expect(await db.transactions.count()).toBe(txCountBefore)
    expect(await getBalance(sourceWalletId)).toBe(500000)
  })
})
