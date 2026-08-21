import { db } from '@/lib/db'
import type { Budget } from '@/types'
import { queueCreate, queueUpdate, queueDelete } from '@/lib/sync/syncHelper'

function now(): string {
  return new Date().toISOString()
}

export async function getBudgetById(id: string): Promise<Budget | undefined> {
  return db.budgets.get(id)
}

export async function listBudgets(userId: string): Promise<Budget[]> {
  return db.budgets.where('user_id').equals(userId).toArray()
}

export async function listBudgetsByMonth(
  userId: string,
  month: number,
  year: number
): Promise<Budget[]> {
  return db.budgets
    .where('user_id')
    .equals(userId)
    .and(b => b.month === month && b.year === year)
    .toArray()
}

export async function getBudgetByCategoryAndMonth(
  userId: string,
  categoryId: string,
  month: number,
  year: number
): Promise<Budget | undefined> {
  return db.budgets
    .where('user_id')
    .equals(userId)
    .and(b => b.category_id === categoryId && b.month === month && b.year === year)
    .first()
}

export async function createBudget(
  data: Omit<Budget, 'id' | 'created_at' | 'updated_at'>
): Promise<string> {
  const id = crypto.randomUUID()
  const timestamp = now()
  await db.budgets.add({
    ...data,
    id,
    created_at: timestamp,
    updated_at: timestamp,
  })

  // Queue sync
  await queueCreate(data.user_id, 'budget', id, {
    id,
    user_id: data.user_id,
    category_id: data.category_id,
    amount: data.amount,
    month: data.month,
    year: data.year,
    note: data.note,
    created_at: timestamp,
    updated_at: timestamp,
  })

  return id
}

export async function updateBudget(
  id: string,
  data: Partial<Pick<Budget, 'amount' | 'note'>>
): Promise<void> {
  const budget = await db.budgets.get(id)
  if (!budget) return

  const timestamp = now()
  await db.budgets.update(id, { ...data, updated_at: timestamp })

  // Queue sync
  await queueUpdate(budget.user_id, 'budget', id, {
    ...budget,
    ...data,
    updated_at: timestamp,
  })
}

export async function deleteBudget(id: string): Promise<void> {
  const budget = await db.budgets.get(id)
  if (!budget) return

  await db.budgets.delete(id)

  // Queue sync
  await queueDelete(budget.user_id, 'budget', id)
}
