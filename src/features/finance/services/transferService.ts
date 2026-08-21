import { db } from '@/lib/db'
import { createTransferSchema } from '@/features/finance/schemas/transferSchema'
import { validate } from '@/lib/validation'
import type { Transaction, Wallet } from '@/types'

/**
 * Hitung saldo wallet dari data IndexedDB.
 * Termasuk semua transaksi aktif (non-deleted) — sumber data of truth.
 * Dipanggil di dalam db.transaction() agar race-condition-safe.
 */
async function computeBalanceInsideTx(wallet: Wallet): Promise<number> {
  const transactions = await db.transactions
    .where('wallet_id')
    .equals(wallet.id)
    .and(t => t.deleted_at === null)
    .toArray()

  let balance = wallet.initial_balance
  for (const t of transactions) {
    switch (t.type) {
      case 'income':
        balance += t.amount
        break
      case 'expense':
        balance -= t.amount
        break
      case 'transfer_in':
        balance += t.amount
        break
      case 'transfer_out':
        balance -= t.amount
        break
      case 'adjustment':
        balance += t.amount
        break
    }
  }

  return balance
}

export async function createTransfer(
  userId: string,
  sourceWalletId: string,
  targetWalletId: string,
  amount: number,
  transactionDate: string,
  note?: string
): Promise<string> {
  // ── Schema validation (throws before any DB access) ──────────────────────
  const data = validate(createTransferSchema, {
    source_wallet_id: sourceWalletId,
    target_wallet_id: targetWalletId,
    amount,
    transaction_date: transactionDate,
    note,
  })

  const sourceId = crypto.randomUUID()
  const targetId = crypto.randomUUID()
  const groupId = crypto.randomUUID()
  const timestamp = new Date().toISOString()

  const sourceData: Omit<Transaction, 'id' | 'created_at' | 'updated_at'> = {
    user_id: userId,
    wallet_id: data.source_wallet_id,
    type: 'transfer_out',
    amount: data.amount,
    category_id: null,
    transaction_date: data.transaction_date,
    note: data.note ?? null,
    transfer_group_id: groupId,
    deleted_at: null,
  }

  const targetData: Omit<Transaction, 'id' | 'created_at' | 'updated_at'> = {
    user_id: userId,
    wallet_id: data.target_wallet_id,
    type: 'transfer_in',
    amount: data.amount,
    category_id: null,
    transaction_date: data.transaction_date,
    note: data.note ?? null,
    transfer_group_id: groupId,
    deleted_at: null,
  }

  // ── Atomic mutation with balance check inside Dexie transaction ──────────
  // Dexie 'rw' lock on object stores ensures that two concurrent transfers
  // from the same wallet are serialized. Balance is computed from the live
  // IndexedDB state (source of truth), so un-synced mutations are reflected.
  try {
    await db.transaction('rw', [db.wallets, db.transactions, db.sync_queue], async () => {
      // Validate source wallet exists and is active
      const sourceWallet = await db.wallets.get(data.source_wallet_id)
      if (!sourceWallet) {
        throw new Error('Dompet sumber tidak ditemukan.')
      }
      if (!sourceWallet.is_active) {
        throw new Error('Dompet sumber tidak aktif.')
      }

      // Validate target wallet exists and is active
      const targetWallet = await db.wallets.get(data.target_wallet_id)
      if (!targetWallet) {
        throw new Error('Dompet tujuan tidak ditemukan.')
      }
      if (!targetWallet.is_active) {
        throw new Error('Dompet tujuan tidak aktif.')
      }

      // Compute source balance from live IndexedDB data
      const sourceBalance = await computeBalanceInsideTx(sourceWallet)
      if (sourceBalance < data.amount) {
        throw new Error('Saldo dompet tidak mencukupi.')
      }

      // All validations passed — proceed with mutation
      await db.transactions.add({
        ...sourceData,
        id: sourceId,
        created_at: timestamp,
        updated_at: timestamp,
      })

      await db.transactions.add({
        ...targetData,
        id: targetId,
        created_at: timestamp,
        updated_at: timestamp,
      })

      await db.sync_queue.add({
        id: crypto.randomUUID(),
        user_id: userId,
        operation: 'create',
        entity: 'transaction',
        entity_id: sourceId,
        payload: { ...sourceData, id: sourceId, created_at: timestamp, updated_at: timestamp },
        status: 'pending',
        retry_count: 0,
        last_error: null,
        created_at: timestamp,
        updated_at: timestamp,
      })

      await db.sync_queue.add({
        id: crypto.randomUUID(),
        user_id: userId,
        operation: 'create',
        entity: 'transaction',
        entity_id: targetId,
        payload: { ...targetData, id: targetId, created_at: timestamp, updated_at: timestamp },
        status: 'pending',
        retry_count: 0,
        last_error: null,
        created_at: timestamp,
        updated_at: timestamp,
      })
    })
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }
    throw new Error('Transfer gagal. Perubahan dibatalkan.')
  }

  return groupId
}

export async function getTransferByGroupId(groupId: string): Promise<Transaction[]> {
  const { listTransactionsByTransferGroup } =
    await import('@/features/finance/repositories/transactionRepository')
  return listTransactionsByTransferGroup(groupId)
}

export async function removeTransfer(groupId: string): Promise<void> {
  const { softDeleteTransaction, listTransactionsByTransferGroup } =
    await import('@/features/finance/repositories/transactionRepository')
  const transactions = await listTransactionsByTransferGroup(groupId)
  for (const t of transactions) {
    await softDeleteTransaction(t.id)
  }
}
