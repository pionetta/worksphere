import { describe, it, expect, beforeEach } from 'vitest'
import { db } from '@/lib/db'
import * as masterCalendarService from './masterCalendarService'

describe('masterCalendarService', () => {
  const userId = 'user-test-calendar-1'

  beforeEach(async () => {
    await db.tasks.clear()
    await db.recurring_transactions.clear()
    await db.debts.clear()
    await db.savings_goals.clear()
    await db.attendance.clear()
  })

  it('aggregates multi-module events for a target month', async () => {
    // 1. Task
    await db.tasks.put({
      id: 'task-1',
      user_id: userId,
      title: 'Kirim Laporan Bulanan',
      description: null,
      status: 'todo',
      priority: 'urgent',
      timeframe: 'daily',
      category: null,
      due_date: '2026-09-15T10:00:00Z',
      reminder_at: null,
      completed_at: null,
      deleted_at: null,
      created_at: '',
      updated_at: '',
    })

    // 2. Recurring Transaction
    await db.recurring_transactions.put({
      id: 'rec-1',
      user_id: userId,
      wallet_id: 'w-1',
      category_id: null,
      type: 'expense',
      amount: 100000,
      frequency: 'monthly',
      interval_count: 1,
      start_date: '2026-09-01',
      end_date: null,
      next_due_date: '2026-09-10',
      last_processed_date: null,
      is_active: true,
      auto_record: true,
      note: 'Internet Indihome',
      created_at: '',
      updated_at: '',
    })

    // 3. Debt
    await db.debts.put({
      id: 'debt-1',
      user_id: userId,
      type: 'debt',
      person_name: 'Budi',
      amount: 500000,
      paid_amount: 0,
      status: 'unpaid',
      due_date: '2026-09-20',
      note: null,
      created_at: '',
      updated_at: '',
    })

    // 4. Attendance
    await db.attendance.put({
      id: 'att-1',
      user_id: userId,
      member_id: 'm-1',
      attendance_date: '2026-09-05',
      status: 'present',
      note: null,
      created_at: '',
      updated_at: '',
    })

    const events = await masterCalendarService.getCalendarEventsForMonth(userId, 2026, 9)

    expect(events).toHaveLength(4)
    expect(events.map(e => e.type)).toEqual(
      expect.arrayContaining(['task', 'bill', 'debt', 'attendance'])
    )

    const billEvent = events.find(e => e.type === 'bill')
    expect(billEvent?.title).toBe('Internet Indihome')
    expect(billEvent?.date).toBe('2026-09-10')
  })
})
