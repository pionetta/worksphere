import { describe, it, expect, beforeEach } from 'vitest'
import { db } from '@/lib/db'
import * as transferService from './transferService'
import * as transactionService from './transactionService'
import * as budgetService from './budgetService'
import * as savingsService from './savingsService'

const userId = 'test-user-service-validation'

beforeEach(async () => {
  await db.transactions.clear()
  await db.wallets.clear()
  await db.categories.clear()
  await db.budgets.clear()
  await db.savings_goals.clear()
  await db.sync_queue.clear()
})

describe('Transfer Service — Validation', () => {
  it('should reject same source and destination wallet', async () => {
    const walletId = '550e8400-e29b-41d4-a716-446655440000'
    await expect(
      transferService.createTransfer(userId, walletId, walletId, 100000, '2026-08-20')
    ).rejects.toThrow('Dompet sumber dan tujuan tidak boleh sama.')
  })

  it('should reject zero amount', async () => {
    const w1 = '550e8400-e29b-41d4-a716-446655440000'
    const w2 = '660e8400-e29b-41d4-a716-446655440001'
    await expect(transferService.createTransfer(userId, w1, w2, 0, '2026-08-20')).rejects.toThrow()
  })

  it('should reject negative amount', async () => {
    const w1 = '550e8400-e29b-41d4-a716-446655440000'
    const w2 = '660e8400-e29b-41d4-a716-446655440001'
    await expect(
      transferService.createTransfer(userId, w1, w2, -100000, '2026-08-20')
    ).rejects.toThrow()
  })

  it('should reject invalid date format', async () => {
    const w1 = '550e8400-e29b-41d4-a716-446655440000'
    const w2 = '660e8400-e29b-41d4-a716-446655440001'
    await expect(
      transferService.createTransfer(userId, w1, w2, 100000, '20-08-2026')
    ).rejects.toThrow()
  })

  it('should reject invalid wallet ID', async () => {
    await expect(
      transferService.createTransfer(userId, '', '', 100000, '2026-08-20')
    ).rejects.toThrow()
  })

  it('should not create any IndexedDB records on invalid input', async () => {
    const walletId = '550e8400-e29b-41d4-a716-446655440000'
    const countBefore = await db.transactions.count()
    try {
      await transferService.createTransfer(userId, walletId, walletId, 100000, '2026-08-20')
    } catch {
      // expected
    }
    expect(await db.transactions.count()).toBe(countBefore)
    expect(await db.sync_queue.where('entity').equals('transaction').count()).toBe(0)
  })
})

describe('Transaction Service — Validation', () => {
  it('should reject zero amount income', async () => {
    await expect(
      transactionService.createIncome(userId, 'wallet-1', 0, null, '2026-08-20')
    ).rejects.toThrow('Nominal harus lebih dari 0.')
  })

  it('should reject negative amount expense', async () => {
    await expect(
      transactionService.createExpense(userId, 'wallet-1', -50000, null, '2026-08-20')
    ).rejects.toThrow()
  })

  it('should reject zero adjustment', async () => {
    await expect(
      transactionService.createAdjustment(userId, 'wallet-1', 0, '2026-08-20')
    ).rejects.toThrow()
  })

  it('should reject invalid wallet ID', async () => {
    await expect(
      transactionService.createIncome(userId, '', 100000, null, '2026-08-20')
    ).rejects.toThrow()
  })

  it('should reject invalid date', async () => {
    await expect(
      transactionService.createIncome(userId, 'wallet-1', 100000, null, 'not-a-date')
    ).rejects.toThrow()
  })

  it('should reject non-existent date', async () => {
    await expect(
      transactionService.createIncome(userId, 'wallet-1', 100000, null, '2026-02-30')
    ).rejects.toThrow()
  })

  it('should reject non-integer amount', async () => {
    await expect(
      transactionService.createIncome(userId, 'wallet-1', 100.5, null, '2026-08-20')
    ).rejects.toThrow()
  })

  it('should not create any IndexedDB records on invalid input', async () => {
    const countBefore = await db.transactions.count()
    try {
      await transactionService.createIncome(userId, '', 0, null, '2026-08-20')
    } catch {
      // expected
    }
    expect(await db.transactions.count()).toBe(countBefore)
  })
})

describe('Budget Service — Validation', () => {
  it('should reject zero budget amount', async () => {
    await expect(
      budgetService.createBudget(userId, '550e8400-e29b-41d4-a716-446655440000', 0, 8, 2026)
    ).rejects.toThrow()
  })

  it('should reject invalid month', async () => {
    await expect(
      budgetService.createBudget(userId, '550e8400-e29b-41d4-a716-446655440000', 1000000, 13, 2026)
    ).rejects.toThrow('Bulan harus antara 1–12.')
  })

  it('should reject invalid category ID', async () => {
    await expect(budgetService.createBudget(userId, '', 1000000, 8, 2026)).rejects.toThrow()
  })

  it('should not create any IndexedDB records on invalid input', async () => {
    const countBefore = await db.budgets.count()
    try {
      await budgetService.createBudget(userId, '', 0, 13, 2026)
    } catch {
      // expected
    }
    expect(await db.budgets.count()).toBe(countBefore)
  })
})

describe('Savings Service — Validation', () => {
  it('should reject empty name', async () => {
    await expect(savingsService.createSavingsGoal(userId, '', 10000000)).rejects.toThrow(
      'Nama target tabungan wajib diisi.'
    )
  })

  it('should reject zero target', async () => {
    await expect(savingsService.createSavingsGoal(userId, 'Dana Darurat', 0)).rejects.toThrow()
  })

  it('should reject negative target', async () => {
    await expect(savingsService.createSavingsGoal(userId, 'Dana Darurat', -1000)).rejects.toThrow()
  })

  it('should reject non-integer target', async () => {
    await expect(savingsService.createSavingsGoal(userId, 'Dana Darurat', 1000.5)).rejects.toThrow()
  })

  it('should reject adding zero to savings', async () => {
    const id = await savingsService.createSavingsGoal(userId, 'Dana Darurat', 10000000)
    await expect(savingsService.addToSavings(id, 0)).rejects.toThrow()
  })

  it('should reject adding negative to savings', async () => {
    const id = await savingsService.createSavingsGoal(userId, 'Dana Darurat', 10000000)
    await expect(savingsService.addToSavings(id, -1000)).rejects.toThrow()
  })

  it('should not create IndexedDB records on invalid input', async () => {
    const countBefore = await db.savings_goals.count()
    try {
      await savingsService.createSavingsGoal(userId, '', 0)
    } catch {
      // expected
    }
    expect(await db.savings_goals.count()).toBe(countBefore)
  })
})
