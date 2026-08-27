import { db } from '@/lib/db'
import type { SyncOperationType } from '@/types'

// ─── Sync Queue Helper ────────────────────────────────────────────────────────
// This helper is used by repositories to add items to the sync queue
// after successful local writes.

export interface SyncQueueData {
  user_id: string
  operation: SyncOperationType
  entity: string
  entity_id: string
  payload: Record<string, unknown> | null
}

export async function addToSyncQueue(data: SyncQueueData): Promise<string> {
  const id = crypto.randomUUID()
  const timestamp = new Date().toISOString()

  await db.sync_queue.add({
    id,
    user_id: data.user_id,
    operation: data.operation,
    entity: data.entity,
    entity_id: data.entity_id,
    payload: data.payload,
    status: 'pending',
    retry_count: 0,
    last_error: null,
    created_at: timestamp,
    updated_at: timestamp,
  })

  // Trigger immediate push to Supabase Cloud if online
  if (typeof navigator !== 'undefined' && navigator.onLine) {
    import('@/lib/sync/syncEngine').then(({ processSyncQueue }) => {
      processSyncQueue(data.user_id).catch(() => {})
    })
  }

  return id
}

// ─── Entity Helpers ───────────────────────────────────────────────────────────
// Map entity names to their Supabase table names

export const ENTITY_NAMES = {
  member: 'member',
  attendance: 'attendance',
  wallet: 'wallet',
  category: 'category',
  transaction: 'transaction',
  budget: 'budget',
  savings_goal: 'savings_goal',
  debt: 'debt',
  task: 'task',
  subtask: 'subtask',
} as const

// ─── Convenience Functions ────────────────────────────────────────────────────

export function queueCreate(
  userId: string,
  entity: string,
  entityId: string,
  payload: Record<string, unknown>
): Promise<string> {
  return addToSyncQueue({
    user_id: userId,
    operation: 'create',
    entity,
    entity_id: entityId,
    payload,
  })
}

export function queueUpdate(
  userId: string,
  entity: string,
  entityId: string,
  payload: Record<string, unknown>
): Promise<string> {
  return addToSyncQueue({
    user_id: userId,
    operation: 'update',
    entity,
    entity_id: entityId,
    payload,
  })
}

export function queueDelete(userId: string, entity: string, entityId: string): Promise<string> {
  return addToSyncQueue({
    user_id: userId,
    operation: 'delete',
    entity,
    entity_id: entityId,
    payload: null,
  })
}
