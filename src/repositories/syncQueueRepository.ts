import { db } from '@/lib/db'
import type { SyncQueueRow, SyncStatusType } from '@/types'

function now(): string {
  return new Date().toISOString()
}

export async function getSyncQueueItemById(id: string): Promise<SyncQueueRow | undefined> {
  return db.sync_queue.get(id)
}

export async function listPendingItems(): Promise<SyncQueueRow[]> {
  return db.sync_queue.where('status').equals('pending').toArray()
}

export async function listItemsByStatus(status: SyncStatusType): Promise<SyncQueueRow[]> {
  return db.sync_queue.where('status').equals(status).toArray()
}

export async function addSyncItem(
  data: Omit<SyncQueueRow, 'id' | 'created_at' | 'updated_at'>
): Promise<string> {
  const id = crypto.randomUUID()
  const timestamp = now()
  await db.sync_queue.add({
    ...data,
    id,
    created_at: timestamp,
    updated_at: timestamp,
  })
  return id
}

export async function updateSyncItemStatus(
  id: string,
  status: SyncStatusType,
  error?: string
): Promise<void> {
  const update: Partial<SyncQueueRow> = { status, updated_at: now() }
  if (error !== undefined) {
    update.last_error = error
  }
  await db.sync_queue.update(id, update)
}

export async function incrementRetryCount(id: string): Promise<void> {
  const item = await db.sync_queue.get(id)
  if (item) {
    await db.sync_queue.update(id, {
      retry_count: item.retry_count + 1,
      updated_at: now(),
    })
  }
}

export async function markCompleted(id: string): Promise<void> {
  await db.sync_queue.update(id, {
    status: 'completed',
    updated_at: now(),
  })
}

export async function markFailed(id: string, error: string): Promise<void> {
  const item = await db.sync_queue.get(id)
  await db.sync_queue.update(id, {
    status: 'failed',
    last_error: error,
    retry_count: (item?.retry_count ?? 0) + 1,
    updated_at: now(),
  })
}

export async function deleteCompletedItems(): Promise<number> {
  return db.sync_queue.where('status').equals('completed').delete()
}

export async function deleteItem(id: string): Promise<void> {
  await db.sync_queue.delete(id)
}

export async function getPendingCount(): Promise<number> {
  return db.sync_queue.where('status').equals('pending').count()
}

export async function getItemsByEntity(entity: string, entityId: string): Promise<SyncQueueRow[]> {
  return db.sync_queue
    .where('entity_id')
    .equals(entityId)
    .and(item => item.entity === entity)
    .toArray()
}
