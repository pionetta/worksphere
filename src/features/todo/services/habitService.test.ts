import { describe, it, expect, beforeEach } from 'vitest'
import { db } from '@/lib/db'
import * as habitService from './habitService'

describe('habitService', () => {
  const userId = 'user-test-habit-1'

  beforeEach(async () => {
    await db.habits.clear()
    await db.habit_logs.clear()
  })

  it('calculates streaks accurately', () => {
    // 3 days streak up to today (2026-08-30)
    const dates = ['2026-08-30', '2026-08-29', '2026-08-28']
    const res = habitService.calculateHabitStreak(dates, '2026-08-30')
    expect(res.currentStreak).toBe(3)
    expect(res.bestStreak).toBe(3)

    // Completed yesterday (2026-08-29) and day before (2026-08-28), not today yet -> streak is maintained at 2
    const datesNotToday = ['2026-08-29', '2026-08-28']
    const resYesterday = habitService.calculateHabitStreak(datesNotToday, '2026-08-30')
    expect(resYesterday.currentStreak).toBe(2)
    expect(resYesterday.bestStreak).toBe(2)

    // Broken streak (last completed 2026-08-27, missed yesterday 2026-08-29) -> currentStreak = 0, bestStreak = 3
    const brokenDates = ['2026-08-27', '2026-08-26', '2026-08-25']
    const resBroken = habitService.calculateHabitStreak(brokenDates, '2026-08-30')
    expect(resBroken.currentStreak).toBe(0)
    expect(resBroken.bestStreak).toBe(3)
  })

  it('creates habit and toggles completion', async () => {
    const today = new Date().toISOString().slice(0, 10)
    const habitId = await habitService.createHabit(userId, {
      title: 'Membaca Buku',
      icon: '📚',
      color: '#10B981',
      frequency: 'daily',
    })

    expect(habitId).toBeDefined()

    // 1. Toggle ON for today
    const toggle1 = await habitService.toggleHabitCompletion(userId, habitId, today)
    expect(toggle1.completed).toBe(true)
    expect(toggle1.currentStreak).toBe(1)

    // 2. Toggle OFF for today
    const toggle2 = await habitService.toggleHabitCompletion(userId, habitId, today)
    expect(toggle2.completed).toBe(false)
    expect(toggle2.currentStreak).toBe(0)
  })

  it('gets weekly status correctly', () => {
    const refDate = new Date('2026-08-30T12:00:00Z')
    const logs = [
      {
        id: '1',
        user_id: userId,
        habit_id: 'h1',
        completed_date: '2026-08-30',
        count: 1,
        notes: null,
        created_at: '',
        updated_at: '',
      },
      {
        id: '2',
        user_id: userId,
        habit_id: 'h1',
        completed_date: '2026-08-28',
        count: 1,
        notes: null,
        created_at: '',
        updated_at: '',
      },
    ]

    const weekly = habitService.getHabitWeeklyStatus(logs, refDate)
    expect(weekly).toHaveLength(7)
    expect(weekly[6].isToday).toBe(true)
    expect(weekly[6].isCompleted).toBe(true)
    expect(weekly[4].isCompleted).toBe(true) // 2026-08-28
    expect(weekly[5].isCompleted).toBe(false) // 2026-08-29
  })
})
