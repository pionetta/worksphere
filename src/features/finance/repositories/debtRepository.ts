import { db } from '@/lib/db'
import type { Debt, DebtType, DebtStatus } from '@/types'
import { queueCreate, queueUpdate, queueDelete } from '@/lib/sync/syncHelper'

function now(): string {
  return new Date().toISOString()
}

export async function getDebtById(id: string): Promise<Debt | undefined> {
  return db.debts.get(id)
}

export async function listDebts(
  userId: string,
  filters?: {
    type?: DebtType
    status?: DebtStatus
  }
): Promise<Debt[]> {
  let collection = db.debts.where('user_id').equals(userId)

  const debts = await collection.toArray()

  return debts.filter(d => {
    if (filters?.type && d.type !== filters.type) return false
    if (filters?.status && d.status !== filters.status) return false
    return true
  })
}

export async function createDebt(
  data: Omit<Debt, 'id' | 'created_at' | 'updated_at'>
): Promise<string> {
  const id = crypto.randomUUID()
  const timestamp = now()
  const debt: Debt = {
    ...data,
    id,
    created_at: timestamp,
    updated_at: timestamp,
  }

  await db.debts.add(debt)

  // Queue sync
  await queueCreate(data.user_id, 'debt', id, {
    id,
    user_id: data.user_id,
    type: data.type,
    person_name: data.person_name,
    group_name: data.group_name ?? null,
    amount: data.amount,
    paid_amount: data.paid_amount,
    due_date: data.due_date,
    status: data.status,
    is_installment: data.is_installment ?? false,
    is_flexible_installment: data.is_flexible_installment ?? false,
    installment_count: data.installment_count ?? null,
    installment_paid_count: data.installment_paid_count ?? null,
    installment_amount: data.installment_amount ?? null,
    installment_schedule: data.installment_schedule ?? null,
    current_bill_amount: data.current_bill_amount ?? null,
    installment_due_day: data.installment_due_day ?? null,
    note: data.note,
    created_at: timestamp,
    updated_at: timestamp,
  })

  return id
}

export async function updateDebt(
  id: string,
  data: Partial<
    Pick<
      Debt,
      | 'type'
      | 'person_name'
      | 'group_name'
      | 'amount'
      | 'paid_amount'
      | 'due_date'
      | 'status'
      | 'is_installment'
      | 'is_flexible_installment'
      | 'installment_count'
      | 'installment_paid_count'
      | 'installment_amount'
      | 'installment_schedule'
      | 'current_bill_amount'
      | 'installment_due_day'
      | 'note'
    >
  >
): Promise<void> {
  const debt = await db.debts.get(id)
  if (!debt) return

  const timestamp = now()
  await db.debts.update(id, { ...data, updated_at: timestamp })

  // Queue sync
  await queueUpdate(debt.user_id, 'debt', id, {
    ...debt,
    ...data,
    updated_at: timestamp,
  })
}

export async function deleteDebt(id: string): Promise<void> {
  const debt = await db.debts.get(id)
  if (!debt) return

  await db.debts.delete(id)

  // Queue sync
  await queueDelete(debt.user_id, 'debt', id)
}
