import { db } from '@/lib/db'
import type { Wallet } from '@/types'
import { queueCreate, queueUpdate, queueDelete } from '@/lib/sync/syncHelper'

function now(): string {
  return new Date().toISOString()
}

export async function getWalletById(id: string): Promise<Wallet | undefined> {
  return db.wallets.get(id)
}

export async function listWallets(userId: string): Promise<Wallet[]> {
  return db.wallets.where('user_id').equals(userId).toArray()
}

export async function listActiveWallets(userId: string): Promise<Wallet[]> {
  return db.wallets
    .where('user_id')
    .equals(userId)
    .and(w => w.is_active)
    .toArray()
}

export async function createWallet(
  data: Omit<Wallet, 'id' | 'created_at' | 'updated_at'>
): Promise<string> {
  const id = crypto.randomUUID()
  const timestamp = now()
  await db.wallets.add({
    ...data,
    id,
    created_at: timestamp,
    updated_at: timestamp,
  })

  // Queue sync
  await queueCreate(data.user_id, 'wallet', id, {
    id,
    user_id: data.user_id,
    name: data.name,
    type: data.type,
    initial_balance: data.initial_balance,
    note: data.note,
    is_active: data.is_active,
    created_at: timestamp,
    updated_at: timestamp,
  })

  return id
}

export async function updateWallet(
  id: string,
  data: Partial<Pick<Wallet, 'name' | 'type' | 'initial_balance' | 'note' | 'is_active'>>
): Promise<void> {
  const wallet = await db.wallets.get(id)
  if (!wallet) return

  const timestamp = now()
  await db.wallets.update(id, { ...data, updated_at: timestamp })

  // Queue sync
  await queueUpdate(wallet.user_id, 'wallet', id, {
    ...wallet,
    ...data,
    updated_at: timestamp,
  })
}

export async function deleteWallet(id: string): Promise<void> {
  const wallet = await db.wallets.get(id)
  if (!wallet) return

  await db.wallets.delete(id)

  // Queue sync
  await queueDelete(wallet.user_id, 'wallet', id)
}
