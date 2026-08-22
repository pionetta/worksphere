import { db } from '@/lib/db'
import type { Transaction, TransactionType } from '@/types'
import { queueCreate, queueUpdate, queueDelete } from '@/lib/sync/syncHelper'

function now(): string {
  return new Date().toISOString()
}

export async function getTransactionById(id: string): Promise<Transaction | undefined> {
  return db.transactions.get(id)
}

export async function listTransactions(userId: string): Promise<Transaction[]> {
  return db.transactions
    .where('user_id')
    .equals(userId)
    .and(t => t.deleted_at === null)
    .toArray()
}

export async function listTransactionsByWallet(walletId: string): Promise<Transaction[]> {
  return db.transactions
    .where('wallet_id')
    .equals(walletId)
    .and(t => t.deleted_at === null)
    .toArray()
}

export async function listTransactionsByType(
  userId: string,
  type: TransactionType
): Promise<Transaction[]> {
  return db.transactions
    .where('user_id')
    .equals(userId)
    .and(t => t.type === type && t.deleted_at === null)
    .toArray()
}

export async function listTransactionsByDateRange(
  userId: string,
  startDate: string,
  endDate: string
): Promise<Transaction[]> {
  return db.transactions
    .where('user_id')
    .equals(userId)
    .and(t => {
      if (t.deleted_at !== null) return false
      const tDate = t.transaction_date.split('T')[0]
      return tDate >= startDate && tDate <= endDate
    })
    .toArray()
}

export async function listTransactionsByTransferGroup(groupId: string): Promise<Transaction[]> {
  return db.transactions.where('transfer_group_id').equals(groupId).toArray()
}

export async function createTransaction(
  data: Omit<Transaction, 'id' | 'created_at' | 'updated_at'>
): Promise<string> {
  const id = crypto.randomUUID()
  const timestamp = now()
  await db.transactions.add({
    ...data,
    id,
    created_at: timestamp,
    updated_at: timestamp,
  })

  // Queue sync
  await queueCreate(data.user_id, 'transaction', id, {
    id,
    user_id: data.user_id,
    wallet_id: data.wallet_id,
    type: data.type,
    amount: data.amount,
    category_id: data.category_id,
    transaction_date: data.transaction_date,
    note: data.note,
    transfer_group_id: data.transfer_group_id,
    deleted_at: data.deleted_at,
    created_at: timestamp,
    updated_at: timestamp,
  })

  return id
}

export async function updateTransaction(
  id: string,
  data: Partial<
    Pick<Transaction, 'wallet_id' | 'type' | 'amount' | 'category_id' | 'transaction_date' | 'note'>
  >
): Promise<void> {
  const transaction = await db.transactions.get(id)
  if (!transaction) return

  const timestamp = now()
  await db.transactions.update(id, { ...data, updated_at: timestamp })

  // Queue sync
  await queueUpdate(transaction.user_id, 'transaction', id, {
    ...transaction,
    ...data,
    updated_at: timestamp,
  })
}

export async function softDeleteTransaction(id: string): Promise<void> {
  const transaction = await db.transactions.get(id)
  if (!transaction) return

  const timestamp = now()
  await db.transactions.update(id, {
    deleted_at: timestamp,
    updated_at: timestamp,
  })

  // Queue sync
  await queueUpdate(transaction.user_id, 'transaction', id, {
    ...transaction,
    deleted_at: timestamp,
    updated_at: timestamp,
  })
}

export async function restoreTransaction(id: string): Promise<void> {
  const transaction = await db.transactions.get(id)
  if (!transaction) return

  const timestamp = now()
  await db.transactions.update(id, {
    deleted_at: null,
    updated_at: timestamp,
  })

  // Queue sync
  await queueUpdate(transaction.user_id, 'transaction', id, {
    ...transaction,
    deleted_at: null,
    updated_at: timestamp,
  })
}

export async function deleteTransaction(id: string): Promise<void> {
  const transaction = await db.transactions.get(id)
  if (!transaction) return

  await db.transactions.delete(id)

  // Queue sync
  await queueDelete(transaction.user_id, 'transaction', id)
}
