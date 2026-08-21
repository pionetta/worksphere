import { db } from '@/lib/db'
import type { Member } from '@/types'
import { queueCreate, queueUpdate, queueDelete } from '@/lib/sync/syncHelper'

function now(): string {
  return new Date().toISOString()
}

export async function getMemberById(id: string): Promise<Member | undefined> {
  return db.members.get(id)
}

export async function listMembers(userId: string): Promise<Member[]> {
  return db.members.where('user_id').equals(userId).toArray()
}

export async function listActiveMembers(userId: string): Promise<Member[]> {
  return db.members
    .where('user_id')
    .equals(userId)
    .and(m => m.is_active)
    .toArray()
}

export async function createMember(
  data: Omit<Member, 'id' | 'created_at' | 'updated_at'>
): Promise<string> {
  const id = crypto.randomUUID()
  const timestamp = now()
  await db.members.add({
    ...data,
    id,
    created_at: timestamp,
    updated_at: timestamp,
  })

  // Queue sync
  await queueCreate(data.user_id, 'member', id, {
    id,
    user_id: data.user_id,
    name: data.name,
    note: data.note,
    is_active: data.is_active,
    created_at: timestamp,
    updated_at: timestamp,
  })

  return id
}

export async function updateMember(
  id: string,
  data: Partial<Pick<Member, 'name' | 'note' | 'is_active'>>
): Promise<void> {
  const member = await db.members.get(id)
  if (!member) return

  const timestamp = now()
  await db.members.update(id, { ...data, updated_at: timestamp })

  // Queue sync
  await queueUpdate(member.user_id, 'member', id, {
    ...member,
    ...data,
    updated_at: timestamp,
  })
}

export async function deleteMember(id: string): Promise<void> {
  const member = await db.members.get(id)
  if (!member) return

  await db.members.delete(id)

  // Queue sync
  await queueDelete(member.user_id, 'member', id)
}
