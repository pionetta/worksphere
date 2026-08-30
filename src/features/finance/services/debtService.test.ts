import { describe, it, expect, beforeEach } from 'vitest'
import { db } from '@/lib/db'
import type { Debt } from '@/types'
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

    it('should create an installment debt with tenor and monthly due day', async () => {
      const id = await debtService.createDebt(userId, {
        type: 'debt',
        person_name: 'Pinjol Kredivo',
        amount: 3000000,
        is_installment: true,
        installment_count: 6,
        installment_amount: 550000,
        installment_due_day: 10,
        note: 'Beli laptop',
      })

      const debt = await db.debts.get(id)
      expect(debt).toBeDefined()
      expect(debt?.is_installment).toBe(true)
      expect(debt?.installment_count).toBe(6)
      expect(debt?.installment_amount).toBe(550000)
      expect(debt?.installment_due_day).toBe(10)
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

  describe('groupDebts', () => {
    it('should group debts by group_name or person_name and compute correct group totals', () => {
      const mockDebts = [
        {
          id: '1',
          user_id: 'user-1',
          type: 'debt' as const,
          person_name: 'Beli HP',
          group_name: 'Shopee Paylater',
          amount: 3000000,
          paid_amount: 1000000,
          due_date: '2026-10-10',
          status: 'partially_paid' as const,
          note: null,
          created_at: '2026-08-30T00:00:00Z',
          updated_at: '2026-08-30T00:00:00Z',
        },
        {
          id: '2',
          user_id: 'user-1',
          type: 'debt' as const,
          person_name: 'Beli Sepatu',
          group_name: 'Shopee Paylater',
          amount: 500000,
          paid_amount: 500000,
          due_date: '2026-09-10',
          status: 'paid' as const,
          note: null,
          created_at: '2026-08-30T00:00:00Z',
          updated_at: '2026-08-30T00:00:00Z',
        },
        {
          id: '3',
          user_id: 'user-1',
          type: 'debt' as const,
          person_name: 'BCA KTA',
          group_name: 'Bank BCA',
          amount: 10000000,
          paid_amount: 2000000,
          due_date: '2026-12-10',
          status: 'partially_paid' as const,
          note: null,
          created_at: '2026-08-30T00:00:00Z',
          updated_at: '2026-08-30T00:00:00Z',
        },
      ]

      const groups = debtService.groupDebts(mockDebts)
      expect(groups).toHaveLength(2)

      const bcaGroup = groups.find(g => g.groupName === 'Bank BCA')
      expect(bcaGroup).toBeDefined()
      expect(bcaGroup?.totalAmount).toBe(10000000)
      expect(bcaGroup?.totalPaid).toBe(2000000)
      expect(bcaGroup?.totalRemaining).toBe(8000000)
      expect(bcaGroup?.totalCount).toBe(1)
      expect(bcaGroup?.unpaidCount).toBe(1)

      const shopeeGroup = groups.find(g => g.groupName === 'Shopee Paylater')
      expect(shopeeGroup).toBeDefined()
      expect(shopeeGroup?.totalAmount).toBe(3500000)
      expect(shopeeGroup?.totalPaid).toBe(1500000)
      expect(shopeeGroup?.totalRemaining).toBe(2000000)
      expect(shopeeGroup?.totalCount).toBe(2)
      expect(shopeeGroup?.unpaidCount).toBe(1)
      expect(shopeeGroup?.paidCount).toBe(1)
    })
  })

  describe('getInstallmentProgress & Flexible Paylater', () => {
    it('should calculate correct completed and remaining installment counters', () => {
      const mockDebt: Debt = {
        id: '10',
        user_id: 'user-1',
        type: 'debt',
        person_name: 'Beli Kulkas',
        group_name: 'Shopee Paylater',
        amount: 6000000,
        paid_amount: 2000000,
        due_date: '2026-12-10',
        status: 'partially_paid',
        is_installment: true,
        is_flexible_installment: false,
        installment_count: 6,
        installment_paid_count: 2,
        installment_amount: 1000000,
        current_bill_amount: 1000000,
        installment_due_day: 10,
        note: null,
        created_at: '2026-08-30T00:00:00Z',
        updated_at: '2026-08-30T00:00:00Z',
      }

      const progress = debtService.getInstallmentProgress(mockDebt)
      expect(progress).not.toBeNull()
      expect(progress?.isInstallment).toBe(true)
      expect(progress?.isFlexible).toBe(false)
      expect(progress?.totalCount).toBe(6)
      expect(progress?.paidCount).toBe(2)
      expect(progress?.remainingCount).toBe(4)
      expect(progress?.currentInstallmentIndex).toBe(3)
      expect(progress?.progressPercent).toBe(33)
      expect(progress?.currentBillAmount).toBe(1000000)
    })

    it('should handle flexible paylater with custom variable bill amounts', () => {
      const mockPaylater: Debt = {
        id: '11',
        user_id: 'user-1',
        type: 'debt',
        person_name: 'Tagihan SPaylater',
        group_name: 'Shopee Paylater',
        amount: 2500000,
        paid_amount: 450000,
        due_date: '2026-11-10',
        status: 'partially_paid',
        is_installment: true,
        is_flexible_installment: true,
        installment_count: 5,
        installment_paid_count: 1,
        installment_amount: null,
        current_bill_amount: 320000,
        installment_due_day: 5,
        note: null,
        created_at: '2026-08-30T00:00:00Z',
        updated_at: '2026-08-30T00:00:00Z',
      }

      const progress = debtService.getInstallmentProgress(mockPaylater)
      expect(progress).not.toBeNull()
      expect(progress?.isFlexible).toBe(true)
      expect(progress?.paidCount).toBe(1)
      expect(progress?.remainingCount).toBe(4)
      expect(progress?.currentBillAmount).toBe(320000)
    })

    it('should increment installment_paid_count when paying installment debt', async () => {
      const debtId = await debtService.createDebt(userId, {
        type: 'debt',
        person_name: 'Pinjaman Modal',
        amount: 3000000,
        is_installment: true,
        is_flexible_installment: true,
        installment_count: 6,
        installment_paid_count: 0,
        current_bill_amount: 500000,
        installment_due_day: 15,
      })

      // Pay 1st installment
      await debtService.payDebt(debtId, 500000, true)
      let debt = await db.debts.get(debtId)
      expect(debt?.paid_amount).toBe(500000)
      expect(debt?.installment_paid_count).toBe(1)

      // Pay 2nd installment
      await debtService.payDebt(debtId, 500000, true)
      debt = await db.debts.get(debtId)
      expect(debt?.paid_amount).toBe(1000000)
      expect(debt?.installment_paid_count).toBe(2)
    })

    it('should correctly select active monthly nominal from installment_schedule', async () => {
      const schedule = [100000, 150000, 200000, 250000, 300000, 350000]
      const debtId = await debtService.createDebt(userId, {
        type: 'debt',
        person_name: 'Cicilan Laptop Custom',
        amount: 1350000,
        is_installment: true,
        installment_count: 6,
        installment_paid_count: 0,
        installment_schedule: schedule,
      })

      let debt = await db.debts.get(debtId)
      expect(debt).toBeDefined()
      expect(debt?.installment_schedule).toEqual(schedule)

      // 1st month (paidCount = 0 -> active is Month 1: 100.000)
      let progress = debtService.getInstallmentProgress(debt!)
      expect(progress?.currentInstallmentIndex).toBe(1)
      expect(progress?.currentBillAmount).toBe(100000)

      // Pay 1st month
      await debtService.payDebt(debtId, 100000, true)
      debt = await db.debts.get(debtId)

      // 2nd month (paidCount = 1 -> active is Month 2: 150.000)
      progress = debtService.getInstallmentProgress(debt!)
      expect(progress?.currentInstallmentIndex).toBe(2)
      expect(progress?.currentBillAmount).toBe(150000)
      expect(progress?.paidCount).toBe(1)
      expect(progress?.remainingCount).toBe(5)
    })
  })
})
