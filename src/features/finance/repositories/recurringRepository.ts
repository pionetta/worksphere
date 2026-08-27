import { db } from '@/lib/db'
import type { RecurringTransaction } from '@/types'
import { queueCreate, queueUpdate, queueDelete } from '@/lib/sync/syncHelper'

function now(): string {
  return new Date().toISOString()
}

export async function getRecurringById(id: string): Promise<RecurringTransaction | undefined> {
  return db.recurring_transactions.get(id)
}

export async function listRecurringByUserId(userId: string): Promise<RecurringTransaction[]> {
  const items = await db.recurring_transactions.where('user_id').equals(userId).toArray()
  return items.sort((a, b) => a.next_due_date.localeCompare(b.next_due_date))
}

export async function listActiveRecurringDue(
  userId: string,
  asOfDate: string
): Promise<RecurringTransaction[]> {
  const items = await db.recurring_transactions
    .where('user_id')
    .equals(userId)
    .and(r => r.is_active && r.next_due_date <= asOfDate)
    .toArray()
  return items
}

export async function createRecurring(
  data: Omit<RecurringTransaction, 'id' | 'created_at' | 'updated_at'>
): Promise<string> {
  const id = crypto.randomUUID()
  const timestamp = now()
  const record: RecurringTransaction = {
    ...data,
    id,
    created_at: timestamp,
    updated_at: timestamp,
  }

  await db.recurring_transactions.add(record)

  await queueCreate(data.user_id, 'recurring_transaction', id, record as any)
  return id
}

export async function updateRecurring(
  id: string,
  data: Partial<Omit<RecurringTransaction, 'id' | 'user_id' | 'created_at'>>
): Promise<void> {
  const existing = await db.recurring_transactions.get(id)
  if (!existing) return

  const timestamp = now()
  const updated = { ...existing, ...data, updated_at: timestamp }
  await db.recurring_transactions.update(id, { ...data, updated_at: timestamp })

  await queueUpdate(existing.user_id, 'recurring_transaction', id, updated as any)
}

export async function deleteRecurring(id: string): Promise<void> {
  const existing = await db.recurring_transactions.get(id)
  if (!existing) return

  await db.recurring_transactions.delete(id)
  await queueDelete(existing.user_id, 'recurring_transaction', id)
}
