import { describe, it, expect, beforeEach } from 'vitest'
import { db } from '@/lib/db'
import * as debtService from './debtService'

const userId = 'test-user-debt-service'

beforeEach(async () => {
  await db.debts.clear()
  await db.sync_queue.clear()
})

describe('debtService', () => {
  describe('createDebt', () => {
    it('should create a debt with unpaid status and 0 paid_amount', async () => {
      const id = await debtService.createDebt(userId, {
        type: 'debt',
        person_name: 'Pak Ahmad',
        amount: 1000000,
        due_date: '2026-10-01',
        note: 'Pinjaman renovasi',
      })

      expect(id).toBeTruthy()
      const debt = await db.debts.get(id)
      expect(debt).toBeDefined()
      expect(debt!.person_name).toBe('Pak Ahmad')
      expect(debt!.type).toBe('debt')
      expect(debt!.amount).toBe(1000000)
      expect(debt!.paid_amount).toBe(0)
      expect(debt!.status).toBe('unpaid')
    })

    it('should queue sync on creation', async () => {
      await debtService.createDebt(userId, {
        type: 'receivable',
        person_name: 'Budi',
        amount: 250000,
      })

      const queue = await db.sync_queue.where('entity').equals('debt').toArray()
      expect(queue).toHaveLength(1)
      expect(queue[0].operation).toBe('create')
    })
  })

  describe('payDebt', () => {
    it('should update paid_amount and set status to partially_paid', async () => {
      const id = await debtService.createDebt(userId, {
        type: 'debt',
        person_name: 'Pak Ahmad',
        amount: 1000000,
      })

      await debtService.payDebt(id, 400000)
      const debt = await db.debts.get(id)
      expect(debt!.paid_amount).toBe(400000)
      expect(debt!.status).toBe('partially_paid')
    })

    it('should set status to paid when fully paid', async () => {
      const id = await debtService.createDebt(userId, {
        type: 'debt',
        person_name: 'Pak Ahmad',
        amount: 1000000,
      })

      await debtService.payDebt(id, 600000)
      await debtService.payDebt(id, 400000)

      const debt = await db.debts.get(id)
      expect(debt!.paid_amount).toBe(1000000)
      expect(debt!.status).toBe('paid')
    })

    it('should reject payment exceeding remaining debt', async () => {
      const id = await debtService.createDebt(userId, {
        type: 'debt',
        person_name: 'Pak Ahmad',
        amount: 500000,
      })

      await expect(debtService.payDebt(id, 600000)).rejects.toThrow(
        'Nominal pembayaran melebihi sisa tagihan.'
      )
    })
  })

  describe('getDebtSummary', () => {
    it('should calculate correct summary totals and remaining amounts', async () => {
      // 1. Utang 1.000.000, paid 300.000 -> remaining 700.000
      const debtId = await debtService.createDebt(userId, {
        type: 'debt',
        person_name: 'Pemberi Pinjaman',
        amount: 1000000,
      })
      await debtService.payDebt(debtId, 300000)

      // 2. Utang 500.000, paid 500.000 -> remaining 0 (lunas)
      const debtId2 = await debtService.createDebt(userId, {
        type: 'debt',
        person_name: 'Bank',
        amount: 500000,
      })
      await debtService.payDebt(debtId2, 500000)

      // 3. Piutang 800.000, paid 200.000 -> remaining 600.000
      const recId = await debtService.createDebt(userId, {
        type: 'receivable',
        person_name: 'Teman',
        amount: 800000,
      })
      await debtService.payDebt(recId, 200000)

      const summary = await debtService.getDebtSummary(userId)

      expect(summary.totalDebt).toBe(1500000)
      expect(summary.totalDebtRemaining).toBe(700000)
      expect(summary.unpaidDebtCount).toBe(1)

      expect(summary.totalReceivable).toBe(800000)
      expect(summary.totalReceivableRemaining).toBe(600000)
      expect(summary.unpaidReceivableCount).toBe(1)
    })
  })
})
