import * as habitRepo from '../repositories/habitRepository'
import {
  createHabitSchema,
  updateHabitSchema,
  logHabitSchema,
  type CreateHabitInput,
  type UpdateHabitInput,
} from '../schemas/habitSchema'
import { validate } from '@/lib/validation'
import type { Habit, HabitLog } from '@/types'

function toISODate(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function parseISODate(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Date(y, m - 1, d)
}

// ─── Service CRUD ───────────────────────────────────────────────────────────

export async function createHabit(userId: string, input: CreateHabitInput): Promise<string> {
  const data = validate(createHabitSchema, input)
  const now = new Date().toISOString()

  const habit: Habit = {
    id: crypto.randomUUID(),
    user_id: userId,
    title: data.title,
    description: data.description ?? null,
    icon: data.icon,
    color: data.color,
    frequency: data.frequency,
    target_days: data.target_days,
    target_per_day: data.target_per_day,
    is_archived: false,
    created_at: now,
    updated_at: now,
  }

  return habitRepo.createHabit(habit)
}

export async function updateHabit(id: string, input: UpdateHabitInput): Promise<void> {
  const data = validate(updateHabitSchema, input)
  await habitRepo.updateHabit(id, data as Partial<Habit>)
}

export async function deleteHabit(id: string): Promise<void> {
  await habitRepo.deleteHabit(id)
}

export async function listHabits(userId: string, includeArchived = false): Promise<Habit[]> {
  return habitRepo.listHabits(userId, includeArchived)
}

// ─── Streak & Completion Calculation ────────────────────────────────────────

/**
 * Calculates current streak and all-time best streak from a list of completed dates
 */
export function calculateHabitStreak(
  completedDates: string[],
  todayStr?: string
): { currentStreak: number; bestStreak: number } {
  if (!completedDates || completedDates.length === 0) {
    return { currentStreak: 0, bestStreak: 0 }
  }

  const today = todayStr || toISODate(new Date())
  const todayDate = parseISODate(today)
  const yesterdayDate = new Date(todayDate)
  yesterdayDate.setDate(yesterdayDate.getDate() - 1)
  const yesterdayStr = toISODate(yesterdayDate)

  // Unique sorted dates descending
  const uniqueDates = Array.from(new Set(completedDates)).sort().reverse()
  const dateSet = new Set(uniqueDates)

  // 1. Calculate current streak
  let currentStreak = 0
  let checkDate: Date

  if (dateSet.has(today)) {
    // Started today
    checkDate = new Date(todayDate)
    while (dateSet.has(toISODate(checkDate))) {
      currentStreak++
      checkDate.setDate(checkDate.getDate() - 1)
    }
  } else if (dateSet.has(yesterdayStr)) {
    // Not done today yet, but maintained yesterday
    checkDate = new Date(yesterdayDate)
    while (dateSet.has(toISODate(checkDate))) {
      currentStreak++
      checkDate.setDate(checkDate.getDate() - 1)
    }
  } else {
    currentStreak = 0
  }

  // 2. Calculate best streak
  let bestStreak = 0
  let tempStreak = 0
  const sortedAsc = Array.from(new Set(completedDates)).sort()

  for (let i = 0; i < sortedAsc.length; i++) {
    if (i === 0) {
      tempStreak = 1
    } else {
      const prev = parseISODate(sortedAsc[i - 1])
      const curr = parseISODate(sortedAsc[i])
      const diffDays = Math.round((curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24))

      if (diffDays === 1) {
        tempStreak++
      } else if (diffDays > 1) {
        tempStreak = 1
      }
    }
    if (tempStreak > bestStreak) {
      bestStreak = tempStreak
    }
  }

  return { currentStreak, bestStreak }
}

/**
 * Toggles habit completion for a specific date (defaults to today)
 */
export async function toggleHabitCompletion(
  userId: string,
  habitId: string,
  dateStr?: string
): Promise<{ completed: boolean; currentStreak: number }> {
  const targetDate = dateStr || toISODate(new Date())
  const validated = validate(logHabitSchema, {
    habit_id: habitId,
    completed_date: targetDate,
  })

  const existing = await habitRepo.getHabitLog(userId, habitId, validated.completed_date)

  if (existing) {
    // Remove completion
    await habitRepo.removeHabitLog(userId, habitId, validated.completed_date)
    const logs = await habitRepo.listHabitLogs(userId, habitId)
    const { currentStreak } = calculateHabitStreak(logs.map(l => l.completed_date))
    return { completed: false, currentStreak }
  } else {
    // Add completion
    const log: HabitLog = {
      id: crypto.randomUUID(),
      user_id: userId,
      habit_id: habitId,
      completed_date: validated.completed_date,
      count: validated.count,
      notes: validated.notes ?? null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    await habitRepo.logHabitCompletion(log)
    const logs = await habitRepo.listHabitLogs(userId, habitId)
    const { currentStreak } = calculateHabitStreak(logs.map(l => l.completed_date))
    return { completed: true, currentStreak }
  }
}

/**
 * Gets weekly status for the last 7 days (e.g. Mon-Sun or past 7 days)
 */
export function getHabitWeeklyStatus(
  logs: HabitLog[],
  referenceDate = new Date()
): Array<{ date: string; dayName: string; dayNumber: number; isCompleted: boolean; isToday: boolean }> {
  const todayStr = toISODate(referenceDate)
  const completedSet = new Set(logs.map(l => l.completed_date))
  const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']

  const result = []

  // Past 6 days + today (7 days total)
  for (let i = 6; i >= 0; i--) {
    const d = new Date(referenceDate)
    d.setDate(d.getDate() - i)
    const dStr = toISODate(d)
    const dayOfWeek = d.getDay() // 0 = Sun

    result.push({
      date: dStr,
      dayName: dayNames[dayOfWeek],
      dayNumber: d.getDate(),
      isCompleted: completedSet.has(dStr),
      isToday: dStr === todayStr,
    })
  }

  return result
}

/**
 * Get full habit details with streaks and stats
 */
export async function getHabitWithStats(
  userId: string,
  habitId: string
): Promise<{
  habit: Habit
  logs: HabitLog[]
  currentStreak: number
  bestStreak: number
  isCompletedToday: boolean
  completionRateMonth: number
  weeklyStatus: ReturnType<typeof getHabitWeeklyStatus>
} | null> {
  const habit = await habitRepo.getHabitById(habitId)
  if (!habit) return null

  const logs = await habitRepo.listHabitLogs(userId, habitId)
  const todayStr = toISODate(new Date())
  const { currentStreak, bestStreak } = calculateHabitStreak(logs.map(l => l.completed_date), todayStr)
  const isCompletedToday = logs.some(l => l.completed_date === todayStr)

  // Last 30 days completion rate
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  const thirtyDaysAgoStr = toISODate(thirtyDaysAgo)

  const monthLogsCount = logs.filter(l => l.completed_date >= thirtyDaysAgoStr && l.completed_date <= todayStr).length
  const completionRateMonth = Math.round((monthLogsCount / 30) * 100)

  const weeklyStatus = getHabitWeeklyStatus(logs)

  return {
    habit,
    logs,
    currentStreak,
    bestStreak,
    isCompletedToday,
    completionRateMonth,
    weeklyStatus,
  }
}
