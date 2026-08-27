import { describe, it, expect, beforeEach } from 'vitest'
import { db } from '@/lib/db'
import * as recurringService from './recurringService'
import * as walletService from './walletService'

describe('recurringService', () => {
  const userId = 'user-test-recurring-1'
  let walletId: string

  beforeEach(async () => {
    await db.recurring_transactions.clear()
    await db.transactions.clear()
    await db.wallets.clear()

    walletId = await walletService.createWallet(userId, 'Dompet Utama', 'bank', 1000000)
  })

  it('calculates next due dates accurately for different frequencies', () => {
    expect(recurringService.calculateNextDueDate('2026-09-01', 'daily', 1)).toBe('2026-09-02')
    expect(recurringService.calculateNextDueDate('2026-09-01', 'weekly', 1)).toBe('2026-09-08')
    expect(recurringService.calculateNextDueDate('2026-09-01', 'monthly', 1)).toBe('2026-10-01')
    expect(recurringService.calculateNextDueDate('2026-09-01', 'yearly', 1)).toBe('2027-09-01')
  })

  it('creates and lists recurring transactions', async () => {
    const id = await recurringService.createRecurringTransaction(userId, {
      wallet_id: walletId,
      type: 'expense',
      amount: 150000,
      frequency: 'monthly',
      start_date: '2026-09-05',
      auto_record: true,
      note: 'Spotify Family',
    })

    expect(id).toBeDefined()

    const list = await recurringService.getAllRecurring(userId)
    expect(list).toHaveLength(1)
    expect(list[0].amount).toBe(150000)
    expect(list[0].next_due_date).toBe('2026-09-05')
  })

  it('processes due auto_record recurring transactions and updates wallet', async () => {
    await recurringService.createRecurringTransaction(userId, {
      wallet_id: walletId,
      type: 'expense',
      amount: 200000,
      frequency: 'monthly',
      start_date: '2026-08-20',
      auto_record: true,
      note: 'Tagihan Listrik',
    })

    // Process as of today 2026-08-27 (due date 2026-08-20 is due)
    const processed = await recurringService.processDueRecurringTransactions(userId, '2026-08-27')
    expect(processed).toBe(1)

    // Check transaction created
    const txs = await db.transactions.where('wallet_id').equals(walletId).toArray()
    expect(txs).toHaveLength(1)
    expect(txs[0].amount).toBe(200000)
    expect(txs[0].type).toBe('expense')

    // Check recurring transaction next_due_date advanced to next month (2026-09-20)
    const list = await recurringService.getAllRecurring(userId)
    expect(list[0].next_due_date).toBe('2026-09-20')
    expect(list[0].last_processed_date).toBe('2026-08-20')
  })

  it('manually executes recurring transaction on demand', async () => {
    const id = await recurringService.createRecurringTransaction(userId, {
      wallet_id: walletId,
      type: 'income',
      amount: 5000000,
      frequency: 'monthly',
      start_date: '2026-09-01',
      auto_record: false,
      note: 'Gaji Bulanan',
    })

    await recurringService.executeRecurringTransaction(id, '2026-08-27')

    const txs = await db.transactions.where('wallet_id').equals(walletId).toArray()
    expect(txs).toHaveLength(1)
    expect(txs[0].amount).toBe(5000000)
    expect(txs[0].type).toBe('income')

    const list = await recurringService.getAllRecurring(userId)
    expect(list[0].next_due_date).toBe('2026-10-01')
  })
})
