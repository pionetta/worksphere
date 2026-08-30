import { db } from '@/lib/db'
import type { WalletMember } from '@/types'
import { queueCreate, queueUpdate, queueDelete, ENTITY_NAMES } from '@/lib/sync/syncHelper'

export async function getWalletMembers(walletId: string): Promise<WalletMember[]> {
  return db.wallet_members.where('wallet_id').equals(walletId).toArray()
}

export async function getMembershipsForUser(
  userId: string,
  email?: string
): Promise<WalletMember[]> {
  const byUser = await db.wallet_members.where('user_id').equals(userId).toArray()
  if (!email) return byUser

  const byEmail = await db.wallet_members
    .filter(m => m.invited_email?.toLowerCase() === email.toLowerCase())
    .toArray()

  const combinedMap = new Map<string, WalletMember>()
  byUser.forEach(m => combinedMap.set(m.id, m))
  byEmail.forEach(m => combinedMap.set(m.id, m))

  return Array.from(combinedMap.values())
}

export async function getWalletMemberById(id: string): Promise<WalletMember | undefined> {
  return db.wallet_members.get(id)
}

export async function createWalletMember(member: WalletMember, operatorUserId: string): Promise<string> {
  await db.wallet_members.put(member)

  await queueCreate(
    operatorUserId,
    ENTITY_NAMES.wallet_member,
    member.id,
    member as unknown as Record<string, unknown>
  )

  return member.id
}

export async function updateWalletMember(
  id: string,
  data: Partial<WalletMember>,
  operatorUserId: string
): Promise<void> {
  const existing = await db.wallet_members.get(id)
  if (!existing) return

  const updated: WalletMember = {
    ...existing,
    ...data,
    updated_at: new Date().toISOString(),
  }

  await db.wallet_members.put(updated)

  await queueUpdate(
    operatorUserId,
    ENTITY_NAMES.wallet_member,
    id,
    data as Record<string, unknown>
  )
}

export async function deleteWalletMember(id: string, operatorUserId: string): Promise<void> {
  await db.wallet_members.delete(id)
  await queueDelete(operatorUserId, ENTITY_NAMES.wallet_member, id)
}
