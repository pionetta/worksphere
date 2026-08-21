import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { db } from '@/lib/db'

const mockUpsert = vi.fn()
const mockEq = vi.fn().mockImplementation(() => Promise.resolve({ error: null }))
const mockFrom = vi.fn(() => ({
  upsert: mockUpsert,
  delete: vi.fn().mockReturnValue({ eq: mockEq }),
  eq: vi.fn().mockReturnThis(),
  select: vi.fn().mockReturnThis(),
  single: vi.fn().mockReturnThis(),
}))

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: mockFrom,
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'test-user-id' } } }),
    },
  },
}))

function hoursAgo(hours: number): string {
  return new Date(Date.now() - hours * 60 * 60 * 1000).toISOString()
}

function now(): string {
  return new Date().toISOString()
}

async function addQueueItem(
  overrides: Partial<{
    user_id: string
    operation: 'create' | 'update' | 'delete'
    entity: string
    entity_id: string
    payload: Record<string, unknown> | null
    status: 'pending' | 'processing' | 'failed' | 'completed'
    retry_count: number
    last_error: string | null
    updated_at: string
  }> = {}
) {
  const id = crypto.randomUUID()
  const timestamp = now()
  const item = {
    user_id: overrides.user_id ?? 'user-1',
    operation: overrides.operation ?? ('create' as const),
    entity: overrides.entity ?? 'wallet',
    entity_id: overrides.entity_id ?? crypto.randomUUID(),
    payload: overrides.payload ?? { id: 'entity-1', name: 'Test' },
    status: overrides.status ?? ('pending' as const),
    retry_count: overrides.retry_count ?? 0,
    last_error: overrides.last_error ?? null,
    created_at: timestamp,
    updated_at: overrides.updated_at ?? timestamp,
  }
  await db.sync_queue.add({ ...item, id })
  return { ...item, id }
}

describe('Sync Queue Cleanup', () => {
  beforeEach(async () => {
    vi.clearAllMocks()
    await db.delete()
    await db.open()
    mockUpsert.mockResolvedValue({ error: null })
    mockEq.mockResolvedValue({ error: null })
  })

  afterEach(async () => {
    await db.delete()
  })

  // ─── cleanupOldCompletedItems ──────────────────────────────────────────────

  describe('cleanupOldCompletedItems', () => {
    it('should delete completed items older than retention period', async () => {
      const { cleanupOldCompletedItems } = await import('@/lib/sync/syncEngine')

      await addQueueItem({
        status: 'completed',
        updated_at: hoursAgo(25),
      })
      await addQueueItem({
        status: 'completed',
        updated_at: hoursAgo(30),
      })

      const deleted = await cleanupOldCompletedItems('user-1')

      expect(deleted).toBe(2)
      const remaining = await db.sync_queue.toArray()
      expect(remaining).toHaveLength(0)
    })

    it('should keep completed items within retention period', async () => {
      const { cleanupOldCompletedItems } = await import('@/lib/sync/syncEngine')

      await addQueueItem({
        status: 'completed',
        updated_at: hoursAgo(1),
      })
      await addQueueItem({
        status: 'completed',
        updated_at: hoursAgo(12),
      })

      const deleted = await cleanupOldCompletedItems('user-1')

      expect(deleted).toBe(0)
      const remaining = await db.sync_queue.toArray()
      expect(remaining).toHaveLength(2)
    })

    it('should not delete pending items regardless of age', async () => {
      const { cleanupOldCompletedItems } = await import('@/lib/sync/syncEngine')

      await addQueueItem({
        status: 'pending',
        updated_at: hoursAgo(48),
      })
      await addQueueItem({
        status: 'pending',
        updated_at: hoursAgo(100),
      })

      const deleted = await cleanupOldCompletedItems('user-1')

      expect(deleted).toBe(0)
      const remaining = await db.sync_queue.toArray()
      expect(remaining).toHaveLength(2)
      expect(remaining.every(i => i.status === 'pending')).toBe(true)
    })

    it('should not delete processing items regardless of age', async () => {
      const { cleanupOldCompletedItems } = await import('@/lib/sync/syncEngine')

      await addQueueItem({
        status: 'processing',
        updated_at: hoursAgo(48),
      })

      const deleted = await cleanupOldCompletedItems('user-1')

      expect(deleted).toBe(0)
      const remaining = await db.sync_queue.toArray()
      expect(remaining).toHaveLength(1)
      expect(remaining[0].status).toBe('processing')
    })

    it('should not delete failed items regardless of age', async () => {
      const { cleanupOldCompletedItems } = await import('@/lib/sync/syncEngine')

      await addQueueItem({
        status: 'failed',
        updated_at: hoursAgo(100),
        last_error: 'Network error',
      })

      const deleted = await cleanupOldCompletedItems('user-1')

      expect(deleted).toBe(0)
      const remaining = await db.sync_queue.toArray()
      expect(remaining).toHaveLength(1)
      expect(remaining[0].status).toBe('failed')
    })

    it('should handle empty queue gracefully', async () => {
      const { cleanupOldCompletedItems } = await import('@/lib/sync/syncEngine')

      const deleted = await cleanupOldCompletedItems('user-1')

      expect(deleted).toBe(0)
    })

    it('should only delete items for the specified user', async () => {
      const { cleanupOldCompletedItems } = await import('@/lib/sync/syncEngine')

      await addQueueItem({
        user_id: 'user-1',
        status: 'completed',
        updated_at: hoursAgo(25),
      })
      await addQueueItem({
        user_id: 'user-2',
        status: 'completed',
        updated_at: hoursAgo(25),
      })

      const deleted = await cleanupOldCompletedItems('user-1')

      expect(deleted).toBe(1)
      const remaining = await db.sync_queue.toArray()
      expect(remaining).toHaveLength(1)
      expect(remaining[0].user_id).toBe('user-2')
    })

    it('should respect custom retention period', async () => {
      const { cleanupOldCompletedItems } = await import('@/lib/sync/syncEngine')

      // 1 hour retention
      await addQueueItem({
        status: 'completed',
        updated_at: hoursAgo(2),
      })
      await addQueueItem({
        status: 'completed',
        updated_at: hoursAgo(0.5),
      })

      const deleted = await cleanupOldCompletedItems('user-1', 60 * 60 * 1000)

      expect(deleted).toBe(1)
      const remaining = await db.sync_queue.toArray()
      expect(remaining).toHaveLength(1)
    })

    it('should be idempotent — calling twice does not error', async () => {
      const { cleanupOldCompletedItems } = await import('@/lib/sync/syncEngine')

      await addQueueItem({
        status: 'completed',
        updated_at: hoursAgo(25),
      })

      const first = await cleanupOldCompletedItems('user-1')
      const second = await cleanupOldCompletedItems('user-1')

      expect(first).toBe(1)
      expect(second).toBe(0)
    })

    it('should mix of old/new and different statuses correctly', async () => {
      const { cleanupOldCompletedItems } = await import('@/lib/sync/syncEngine')

      // Old completed — should be deleted
      await addQueueItem({ status: 'completed', updated_at: hoursAgo(30) })
      // New completed — should stay
      await addQueueItem({ status: 'completed', updated_at: hoursAgo(1) })
      // Old pending — should stay
      await addQueueItem({ status: 'pending', updated_at: hoursAgo(30) })
      // Old failed — should stay
      await addQueueItem({ status: 'failed', updated_at: hoursAgo(30) })
      // Old processing — should stay
      await addQueueItem({ status: 'processing', updated_at: hoursAgo(30) })

      const deleted = await cleanupOldCompletedItems('user-1')

      expect(deleted).toBe(1)
      const remaining = await db.sync_queue.toArray()
      expect(remaining).toHaveLength(4)
    })
  })

  // ─── Cleanup integrated into processSyncQueue ─────────────────────────────

  describe('processSyncQueue triggers cleanup', () => {
    it('should cleanup old completed items after successful sync', async () => {
      const { processSyncQueue } = await import('@/lib/sync/syncEngine')

      // Add old completed item
      await addQueueItem({
        user_id: 'user-1',
        status: 'completed',
        updated_at: hoursAgo(25),
      })

      // Add pending item to trigger sync
      await addQueueItem({
        user_id: 'user-1',
        status: 'pending',
        entity: 'wallet',
        payload: { id: 'w1', name: 'Wallet' },
      })

      const result = await processSyncQueue('user-1')

      expect(result.succeeded).toBe(1)

      // Old completed item should be cleaned up
      const remaining = await db.sync_queue.toArray()
      expect(remaining).toHaveLength(1)
      expect(remaining[0].status).toBe('completed')
    })

    it('should not cleanup if no items succeeded', async () => {
      const { processSyncQueue } = await import('@/lib/sync/syncEngine')

      // Add old completed item
      await addQueueItem({
        user_id: 'user-1',
        status: 'completed',
        updated_at: hoursAgo(25),
      })

      // Add pending item that will fail
      mockUpsert.mockResolvedValueOnce({ error: { message: 'Network error' } })
      await addQueueItem({
        user_id: 'user-1',
        status: 'pending',
        entity: 'wallet',
        payload: { id: 'w1' },
      })

      const result = await processSyncQueue('user-1')

      expect(result.failed).toBe(1)

      // Old completed item should still be there (no cleanup on failure)
      const remaining = await db.sync_queue.toArray()
      expect(remaining).toHaveLength(2)
    })

    it('should not cleanup new completed items', async () => {
      const { processSyncQueue } = await import('@/lib/sync/syncEngine')

      // Add pending items
      await addQueueItem({
        user_id: 'user-1',
        status: 'pending',
        entity: 'wallet',
        payload: { id: 'w1', name: 'Wallet' },
      })

      await processSyncQueue('user-1')

      // The newly completed item should still be there (it's not old)
      const remaining = await db.sync_queue.toArray()
      expect(remaining).toHaveLength(1)
      expect(remaining[0].status).toBe('completed')
    })
  })

  // ─── cleanupCompletedItems (force cleanup) ────────────────────────────────

  describe('cleanupCompletedItems (force)', () => {
    it('should delete all completed items regardless of age', async () => {
      const { cleanupCompletedItems } = await import('@/lib/sync/syncEngine')

      await addQueueItem({ status: 'completed', updated_at: hoursAgo(1) })
      await addQueueItem({ status: 'completed', updated_at: hoursAgo(25) })

      const deleted = await cleanupCompletedItems('user-1')

      expect(deleted).toBe(2)
    })
  })
})
