import { db } from '@/lib/db'
import type { Habit, HabitLog } from '@/types'
import { queueCreate, queueUpdate, queueDelete, ENTITY_NAMES } from '@/lib/sync/syncHelper'

// ─── Habit CRUD ─────────────────────────────────────────────────────────────

export async function createHabit(habit: Habit): Promise<string> {
  await db.habits.put(habit)
  await queueCreate(habit.user_id, ENTITY_NAMES.habit, habit.id, habit as any)
  return habit.id
}

export async function getHabitById(id: string): Promise<Habit | undefined> {
  return db.habits.get(id)
}

export async function listHabits(userId: string, includeArchived = false): Promise<Habit[]> {
  const all = await db.habits.where('user_id').equals(userId).toArray()
  if (includeArchived) return all
  return all.filter(h => !h.is_archived)
}

export async function updateHabit(id: string, updates: Partial<Habit>): Promise<void> {
  const existing = await db.habits.get(id)
  if (!existing) return

  const updated: Habit = {
    ...existing,
    ...updates,
    updated_at: new Date().toISOString(),
  }

  await db.habits.put(updated)
  await queueUpdate(updated.user_id, ENTITY_NAMES.habit, updated.id, updated as any)
}

export async function deleteHabit(id: string): Promise<void> {
  const existing = await db.habits.get(id)
  if (!existing) return

  // Delete all associated logs locally
  await db.habit_logs.where('habit_id').equals(id).delete()

  await db.habits.delete(id)
  await queueDelete(existing.user_id, ENTITY_NAMES.habit, existing.id)
}

// ─── Habit Log Operations ───────────────────────────────────────────────────

export async function logHabitCompletion(log: HabitLog): Promise<string> {
  await db.habit_logs.put(log)
  await queueCreate(log.user_id, ENTITY_NAMES.habit_log, log.id, log as any)
  return log.id
}

export async function removeHabitLog(
  userId: string,
  habitId: string,
  completedDate: string
): Promise<void> {
  const existing = await db.habit_logs
    .where('[user_id+habit_id+completed_date]')
    .equals([userId, habitId, completedDate])
    .first()

  if (!existing) return

  await db.habit_logs.delete(existing.id)
  await queueDelete(userId, ENTITY_NAMES.habit_log, existing.id)
}

export async function getHabitLog(
  userId: string,
  habitId: string,
  completedDate: string
): Promise<HabitLog | undefined> {
  return db.habit_logs
    .where('[user_id+habit_id+completed_date]')
    .equals([userId, habitId, completedDate])
    .first()
}

export async function listHabitLogs(
  userId: string,
  habitId?: string,
  startDate?: string,
  endDate?: string
): Promise<HabitLog[]> {
  let logs: HabitLog[]

  if (habitId) {
    logs = await db.habit_logs.where('habit_id').equals(habitId).toArray()
  } else {
    logs = await db.habit_logs.where('user_id').equals(userId).toArray()
  }

  return logs.filter(log => {
    if (startDate && log.completed_date < startDate) return false
    if (endDate && log.completed_date > endDate) return false
    return true
  })
}
