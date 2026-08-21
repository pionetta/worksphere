import { db } from '@/lib/db'
import type { SavingsGoal } from '@/types'
import { queueCreate, queueUpdate, queueDelete } from '@/lib/sync/syncHelper'

function now(): string {
  return new Date().toISOString()
}

export async function getSavingsGoalById(id: string): Promise<SavingsGoal | undefined> {
  return db.savings_goals.get(id)
}

export async function listSavingsGoals(userId: string): Promise<SavingsGoal[]> {
  return db.savings_goals.where('user_id').equals(userId).toArray()
}

export async function createSavingsGoal(
  data: Omit<SavingsGoal, 'id' | 'created_at' | 'updated_at'>
): Promise<string> {
  const id = crypto.randomUUID()
  const timestamp = now()
  await db.savings_goals.add({
    ...data,
    id,
    created_at: timestamp,
    updated_at: timestamp,
  })

  // Queue sync
  await queueCreate(data.user_id, 'savings_goal', id, {
    id,
    user_id: data.user_id,
    name: data.name,
    target_amount: data.target_amount,
    current_amount: data.current_amount,
    deadline: data.deadline,
    note: data.note,
    created_at: timestamp,
    updated_at: timestamp,
  })

  return id
}

export async function updateSavingsGoal(
  id: string,
  data: Partial<
    Pick<SavingsGoal, 'name' | 'target_amount' | 'current_amount' | 'deadline' | 'note'>
  >
): Promise<void> {
  const goal = await db.savings_goals.get(id)
  if (!goal) return

  const timestamp = now()
  await db.savings_goals.update(id, { ...data, updated_at: timestamp })

  // Queue sync
  await queueUpdate(goal.user_id, 'savings_goal', id, {
    ...goal,
    ...data,
    updated_at: timestamp,
  })
}

export async function deleteSavingsGoal(id: string): Promise<void> {
  const goal = await db.savings_goals.get(id)
  if (!goal) return

  await db.savings_goals.delete(id)

  // Queue sync
  await queueDelete(goal.user_id, 'savings_goal', id)
}
