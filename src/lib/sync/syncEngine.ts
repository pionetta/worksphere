import { supabase } from '@/lib/supabase'
import type { Database } from '@/types'

// ─── Entity to Supabase table mapping ─────────────────────────────────────────

const ENTITY_TABLE_MAP: Record<string, keyof Database['public']['Tables']> = {
  member: 'members',
  attendance: 'attendance',
  wallet: 'wallets',
  category: 'categories',
  transaction: 'transactions',
  budget: 'budgets',
  savings_goal: 'savings_goals',
  debt: 'debts',
  task: 'tasks',
  subtask: 'subtasks',
  recurring_transaction: 'recurring_transactions' as any,
}

// ─── Dependency ordering ──────────────────────────────────────────────────────
// Parent entities must sync before children

const DEPENDENCY_ORDER = [
  'member',
  'wallet',
  'category',
  'task',
  'attendance',
  'transaction',
  'recurring_transaction',
  'budget',
  'savings_goal',
  'debt',
  'subtask',
]

// ─── Sync Queue Item Type ─────────────────────────────────────────────────────

interface SyncQueueItem {
  id: string
  user_id: string
  operation: 'create' | 'update' | 'delete'
  entity: string
  entity_id: string
  payload: Record<string, unknown> | null
  status: 'pending' | 'processing' | 'failed' | 'completed'
  retry_count: number
  last_error: string | null
  created_at: string
  updated_at: string
}

// ─── Concurrency Guard ────────────────────────────────────────────────────────

let isSyncing = false

export function isSyncInProgress(): boolean {
  return isSyncing
}

// ─── Exponential Backoff ──────────────────────────────────────────────────────

const MAX_RETRY_COUNT = 5
const BASE_DELAY_MS = 1000

export function calculateBackoffDelay(retryCount: number): number {
  return BASE_DELAY_MS * Math.pow(2, retryCount)
}

// ─── Conflict Resolution ──────────────────────────────────────────────────────

export function resolveConflict(localUpdated: string, remoteUpdated: string): 'local' | 'remote' {
  const localTime = new Date(localUpdated).getTime()
  const remoteTime = new Date(remoteUpdated).getTime()

  if (localTime >= remoteTime) {
    return 'local'
  }
  return 'remote'
}

// ─── Dependency Sorting ───────────────────────────────────────────────────────

export function sortByDependency(items: SyncQueueItem[]): SyncQueueItem[] {
  return [...items].sort((a, b) => {
    const aIndex = DEPENDENCY_ORDER.indexOf(a.entity)
    const bIndex = DEPENDENCY_ORDER.indexOf(b.entity)
    // Entities not in the list get a high index (processed last)
    const aPriority = aIndex === -1 ? DEPENDENCY_ORDER.length : aIndex
    const bPriority = bIndex === -1 ? DEPENDENCY_ORDER.length : bIndex
    return aPriority - bPriority
  })
}

// ─── Queue Read Operations ────────────────────────────────────────────────────

export async function listPendingItems(userId: string): Promise<SyncQueueItem[]> {
  const { db } = await import('@/lib/db')
  const items = await db.sync_queue
    .where('status')
    .equals('pending')
    .and(item => item.user_id === userId)
    .toArray()
  return sortByDependency(items)
}

export async function listProcessingItems(userId: string): Promise<SyncQueueItem[]> {
  const { db } = await import('@/lib/db')
  const items = await db.sync_queue
    .where('status')
    .equals('processing')
    .and(item => item.user_id === userId)
    .toArray()
  return sortByDependency(items)
}

export async function listFailedItems(userId: string): Promise<SyncQueueItem[]> {
  const { db } = await import('@/lib/db')
  return db.sync_queue
    .where('status')
    .equals('failed')
    .and(item => item.user_id === userId)
    .toArray()
}

export async function getPendingCount(userId: string): Promise<number> {
  const { db } = await import('@/lib/db')
  return db.sync_queue
    .where('status')
    .equals('pending')
    .and(item => item.user_id === userId)
    .count()
}

// ─── Queue Update Operations ──────────────────────────────────────────────────

async function markProcessing(id: string): Promise<void> {
  const { db } = await import('@/lib/db')
  await db.sync_queue.update(id, {
    status: 'processing',
    updated_at: new Date().toISOString(),
  })
}

async function markCompleted(id: string): Promise<void> {
  const { db } = await import('@/lib/db')
  await db.sync_queue.update(id, {
    status: 'completed',
    updated_at: new Date().toISOString(),
  })
}

async function markFailed(id: string, error: string): Promise<void> {
  const { db } = await import('@/lib/db')
  const item = await db.sync_queue.get(id)
  await db.sync_queue.update(id, {
    status: 'failed',
    last_error: error,
    retry_count: (item?.retry_count ?? 0) + 1,
    updated_at: new Date().toISOString(),
  })
}

async function markPending(id: string): Promise<void> {
  const { db } = await import('@/lib/db')
  await db.sync_queue.update(id, {
    status: 'pending',
    updated_at: new Date().toISOString(),
  })
}

// ─── Recovery: Reset stuck processing items ───────────────────────────────────

export async function recoverStuckItems(userId: string): Promise<number> {
  const items = await listProcessingItems(userId)
  for (const item of items) {
    await markPending(item.id)
  }
  return items.length
}

// ─── Supabase Operations ──────────────────────────────────────────────────────

type SupabaseTable = keyof Database['public']['Tables']

async function upsertToSupabase(
  table: SupabaseTable,
  data: Record<string, unknown>
): Promise<{ error: string | null }> {
  const { error } = await supabase.from(table).upsert(data as never, { onConflict: 'id' })

  if (error) {
    return { error: error.message }
  }
  return { error: null }
}

async function deleteFromSupabase(
  table: SupabaseTable,
  entityId: string
): Promise<{ error: string | null }> {
  const { error } = await supabase.from(table).delete().eq('id', entityId)

  if (error) {
    return { error: error.message }
  }
  return { error: null }
}

// ─── Single Item Sync ─────────────────────────────────────────────────────────

export async function syncItem(item: SyncQueueItem): Promise<boolean> {
  const tableName = ENTITY_TABLE_MAP[item.entity]
  if (!tableName) {
    await markFailed(item.id, `Entity tidak dikenal: ${item.entity}`)
    return false
  }

  await markProcessing(item.id)

  try {
    let result: { error: string | null }

    switch (item.operation) {
      case 'create':
      case 'update':
        if (!item.payload) {
          await markFailed(item.id, 'Payload kosong untuk operasi create/update')
          return false
        }
        result = await upsertToSupabase(tableName, item.payload)
        break
      case 'delete':
        result = await deleteFromSupabase(tableName, item.entity_id)
        break
      default:
        await markFailed(item.id, `Operasi tidak dikenal: ${item.operation}`)
        return false
    }

    if (result.error) {
      const retryCount = (item.retry_count ?? 0) + 1
      if (retryCount >= MAX_RETRY_COUNT) {
        await markFailed(item.id, `Max retry tercapai: ${result.error}`)
      } else {
        await markFailed(item.id, result.error)
      }
      return false
    }

    await markCompleted(item.id)
    return true
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    await markFailed(item.id, `Sync error: ${errorMessage}`)
    return false
  }
}

// ─── Full Sync Process ────────────────────────────────────────────────────────

export interface SyncResult {
  processed: number
  succeeded: number
  failed: number
  errors: string[]
}

async function executeSyncQueue(userId: string): Promise<SyncResult> {
  isSyncing = true
  const result: SyncResult = { processed: 0, succeeded: 0, failed: 0, errors: [] }

  try {
    // Recovery: reset any stuck processing items
    await recoverStuckItems(userId)

    // Get pending items (already sorted by dependency)
    const items = await listPendingItems(userId)

    for (const item of items) {
      // Re-check status in case it changed during processing
      const { db } = await import('@/lib/db')
      const current = await db.sync_queue.get(item.id)
      if (!current || current.status !== 'pending') {
        continue
      }

      const success = await syncItem(item)
      result.processed++
      if (success) {
        result.succeeded++
      } else {
        result.failed++
        const updated = await db.sync_queue.get(item.id)
        if (updated?.last_error) {
          result.errors.push(updated.last_error)
        }
      }
    }

    // Cleanup old completed items after successful sync
    if (result.succeeded > 0) {
      await cleanupOldCompletedItems(userId)
    }
  } finally {
    isSyncing = false
  }

  return result
}

export async function processSyncQueue(userId: string): Promise<SyncResult> {
  // In-memory concurrency guard
  if (isSyncing) {
    return { processed: 0, succeeded: 0, failed: 0, errors: [] }
  }

  // Cross-tab mutex guard via Web Locks API when available in browser
  if (typeof navigator !== 'undefined' && 'locks' in navigator) {
    try {
      return await navigator.locks.request(
        `worksphere_sync_${userId}`,
        { ifAvailable: true },
        async lock => {
          if (!lock) {
            // Another tab is currently processing the sync queue
            return { processed: 0, succeeded: 0, failed: 0, errors: [] }
          }
          return await executeSyncQueue(userId)
        }
      )
    } catch {
      return await executeSyncQueue(userId)
    }
  }

  return await executeSyncQueue(userId)
}

// ─── Retry Failed Items ───────────────────────────────────────────────────────

export async function retryFailedItems(userId: string): Promise<SyncResult> {
  const { db } = await import('@/lib/db')
  const items = await listFailedItems(userId)

  // Reset failed items to pending
  for (const item of items) {
    await db.sync_queue.update(item.id, {
      status: 'pending',
      updated_at: new Date().toISOString(),
    })
  }

  return processSyncQueue(userId)
}

// ─── Cleanup Completed Items ──────────────────────────────────────────────────

const DEFAULT_RETENTION_MS = 24 * 60 * 60 * 1000 // 24 hours

export async function cleanupOldCompletedItems(
  userId: string,
  retentionMs: number = DEFAULT_RETENTION_MS
): Promise<number> {
  const { db } = await import('@/lib/db')
  const cutoff = new Date(Date.now() - retentionMs).toISOString()

  const items = await db.sync_queue
    .where('status')
    .equals('completed')
    .and(item => item.user_id === userId && item.updated_at < cutoff)
    .toArray()

  if (items.length === 0) return 0

  const ids = items.map(item => item.id)
  await db.sync_queue.bulkDelete(ids)
  return ids.length
}

export async function cleanupCompletedItems(userId: string): Promise<number> {
  const { db } = await import('@/lib/db')
  return db.sync_queue
    .where('status')
    .equals('completed')
    .and(item => item.user_id === userId)
    .delete()
}

// ─── Cloud Pull & Realtime Multi-Device Sync ─────────────────────────────────

/**
 * Pull all cloud data for a user into local Dexie (Downsync)
 */
export async function pullCloudData(userId: string): Promise<void> {
  if (typeof navigator !== 'undefined' && !navigator.onLine) return
  if (!userId) return

  const { db } = await import('@/lib/db')

  const tablesToSync = [
    { table: 'members', dexieKey: 'members' as const },
    { table: 'wallets', dexieKey: 'wallets' as const },
    { table: 'categories', dexieKey: 'categories' as const },
    { table: 'tasks', dexieKey: 'tasks' as const },
    { table: 'subtasks', dexieKey: 'subtasks' as const },
    { table: 'attendance', dexieKey: 'attendance' as const },
    { table: 'transactions', dexieKey: 'transactions' as const },
    { table: 'recurring_transactions', dexieKey: 'recurring_transactions' as const },
    { table: 'budgets', dexieKey: 'budgets' as const },
    { table: 'savings_goals', dexieKey: 'savings_goals' as const },
    { table: 'debts', dexieKey: 'debts' as const },
  ]

  let hasUpdates = false

  for (const { table, dexieKey } of tablesToSync) {
    try {
      const { data, error } = await (supabase.from(table) as any)
        .select('*')
        .eq('user_id', userId)

      if (!error && data && Array.isArray(data) && data.length > 0) {
        for (const item of data) {
          const local = await (db[dexieKey] as any).get(item.id)
          if (
            !local ||
            !local.updated_at ||
            new Date(item.updated_at).getTime() >= new Date(local.updated_at).getTime()
          ) {
            await (db[dexieKey] as any).put(item)
            hasUpdates = true
          }
        }
      }
    } catch {
      // Continue to next table
    }
  }

  if (hasUpdates && typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('worksphere-data-synced', { detail: { type: 'full-pull' } })
    )
  }
}

/**
 * Subscribe to realtime changes from other devices for this user
 */
export function subscribeToUserRealtime(userId: string): () => void {
  if (typeof window === 'undefined' || !userId) return () => {}

  const tables = [
    'tasks',
    'subtasks',
    'wallets',
    'categories',
    'transactions',
    'recurring_transactions',
    'budgets',
    'savings_goals',
    'debts',
    'members',
    'attendance',
  ]

  let channel = supabase.channel(`user-sync-all-${userId}`)

  for (const table of tables) {
    channel = channel.on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table,
      },
      async payload => {
        try {
          const record = (payload.new || payload.old) as any
          if (record && record.user_id && record.user_id !== userId) {
            return
          }

          const { db } = await import('@/lib/db')
          const targetDexieKey = (table in db ? table : null) as keyof typeof db | null

          if (targetDexieKey && (db as any)[targetDexieKey]) {
            if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
              if (payload.new && (payload.new as any).id) {
                await (db as any)[targetDexieKey].put(payload.new)
              }
            } else if (payload.eventType === 'DELETE') {
              if (payload.old && (payload.old as any).id) {
                await (db as any)[targetDexieKey].delete((payload.old as any).id)
              }
            }

            window.dispatchEvent(
              new CustomEvent('worksphere-data-synced', {
                detail: { table, eventType: payload.eventType, record: payload.new || payload.old },
              })
            )
          }
        } catch (err) {
          console.warn('Realtime sync handler error:', err)
        }
      }
    )
  }

  channel.subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}

