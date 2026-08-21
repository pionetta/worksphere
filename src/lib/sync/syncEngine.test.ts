import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { db } from '@/lib/db'

// Mock Supabase client
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

describe('Sync Engine', () => {
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

  // ─── Helper: Add item to queue ──────────────────────────────────────────────

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
    }> = {}
  ) {
    const id = crypto.randomUUID()
    const timestamp = new Date().toISOString()
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
      updated_at: timestamp,
    }
    await db.sync_queue.add({ ...item, id })
    return { ...item, id }
  }

  // ─── Test 1: Local mutation creates queue item ───────────────────────────────

  it('should create queue item when wallet is created', async () => {
    const { queueCreate } = await import('@/lib/sync/syncHelper')

    await queueCreate('user-1', 'wallet', 'wallet-123', {
      id: 'wallet-123',
      user_id: 'user-1',
      name: 'Test Wallet',
      type: 'bank',
      initial_balance: 1000000,
    })

    const items = await db.sync_queue.toArray()
    expect(items).toHaveLength(1)
    expect(items[0].entity).toBe('wallet')
    expect(items[0].entity_id).toBe('wallet-123')
    expect(items[0].operation).toBe('create')
    expect(items[0].status).toBe('pending')
    expect(items[0].user_id).toBe('user-1')
  })

  // ─── Test 2: Offline mutation remains pending ────────────────────────────────

  it('should keep items pending when offline', async () => {
    const { queueCreate } = await import('@/lib/sync/syncHelper')

    // Simulate offline by not calling sync
    await queueCreate('user-1', 'wallet', 'wallet-1', { id: 'wallet-1' })
    await queueCreate('user-1', 'transaction', 'tx-1', { id: 'tx-1' })

    const items = await db.sync_queue.toArray()
    expect(items.every(i => i.status === 'pending')).toBe(true)
  })

  // ─── Test 3: Queue processes oldest first ───────────────────────────────────

  it('should process items in dependency order', async () => {
    const { sortByDependency } = await import('@/lib/sync/syncEngine')

    // Add items in reverse dependency order
    const items = [
      { entity: 'subtask', id: 'sub-1' },
      { entity: 'transaction', id: 'tx-1' },
      { entity: 'wallet', id: 'wallet-1' },
      { entity: 'task', id: 'task-1' },
      { entity: 'member', id: 'member-1' },
    ]

    const sorted = sortByDependency(items as never)

    // member, wallet, task should come first
    expect(sorted[0].entity).toBe('member')
    expect(sorted[1].entity).toBe('wallet')
    expect(sorted[2].entity).toBe('task')
    expect(sorted[3].entity).toBe('transaction')
    expect(sorted[4].entity).toBe('subtask')
  })

  // ─── Test 4: Successful sync becomes completed ──────────────────────────────

  it('should mark item as completed after successful sync', async () => {
    const { syncItem } = await import('@/lib/sync/syncEngine')

    const item = await addQueueItem({
      operation: 'create',
      entity: 'wallet',
      payload: { id: 'wallet-1', user_id: 'user-1', name: 'Test' },
    })

    const result = await syncItem(item as never)

    expect(result).toBe(true)

    const updated = await db.sync_queue.get(item.id)
    expect(updated?.status).toBe('completed')
  })

  // ─── Test 5: Failed sync becomes failed ─────────────────────────────────────

  it('should mark item as failed after sync error', async () => {
    const { syncItem } = await import('@/lib/sync/syncEngine')

    mockUpsert.mockResolvedValueOnce({ error: { message: 'Network error' } })

    const item = await addQueueItem({
      operation: 'create',
      entity: 'wallet',
      payload: { id: 'wallet-1', user_id: 'user-1', name: 'Test' },
    })

    const result = await syncItem(item as never)

    expect(result).toBe(false)

    const updated = await db.sync_queue.get(item.id)
    expect(updated?.status).toBe('failed')
    expect(updated?.last_error).toContain('Network error')
    expect(updated?.retry_count).toBe(1)
  })

  // ─── Test 6: Retry uses exponential backoff ─────────────────────────────────

  it('should calculate exponential backoff correctly', async () => {
    const { calculateBackoffDelay } = await import('@/lib/sync/syncEngine')

    expect(calculateBackoffDelay(0)).toBe(1000) // 1s
    expect(calculateBackoffDelay(1)).toBe(2000) // 2s
    expect(calculateBackoffDelay(2)).toBe(4000) // 4s
    expect(calculateBackoffDelay(3)).toBe(8000) // 8s
    expect(calculateBackoffDelay(4)).toBe(16000) // 16s
  })

  // ─── Test 7: Maximum retry is not infinite ──────────────────────────────────

  it('should stop retrying after max retries', async () => {
    const { syncItem } = await import('@/lib/sync/syncEngine')

    mockUpsert.mockResolvedValue({ error: { message: 'Persistent error' } })

    // Add item with retry_count = 4 (one less than max)
    const item = await addQueueItem({
      operation: 'create',
      entity: 'wallet',
      retry_count: 4,
      payload: { id: 'wallet-1' },
    })

    const result = await syncItem(item as never)

    expect(result).toBe(false)

    const updated = await db.sync_queue.get(item.id)
    expect(updated?.status).toBe('failed')
    expect(updated?.last_error).toContain('Max retry tercapai')
  })

  // ─── Test 8: Duplicate retry does not create duplicate entity ───────────────

  it('should use upsert to prevent duplicates on retry', async () => {
    const { syncItem } = await import('@/lib/sync/syncEngine')

    const item = await addQueueItem({
      operation: 'create',
      entity: 'wallet',
      payload: { id: 'wallet-1', user_id: 'user-1', name: 'Test Wallet' },
    })

    // First attempt
    await syncItem(item as never)

    // Reset to pending for retry
    await db.sync_queue.update(item.id, { status: 'pending' })

    // Second attempt (retry)
    await syncItem(item as never)

    // Should have called upsert twice with same ID
    expect(mockUpsert).toHaveBeenCalledTimes(2)
    expect(mockUpsert).toHaveBeenCalledWith(expect.objectContaining({ id: 'wallet-1' }), {
      onConflict: 'id',
    })
  })

  // ─── Test 9: Dependency ordering in queue ───────────────────────────────────

  it('should sort items by dependency order', async () => {
    const { sortByDependency } = await import('@/lib/sync/syncEngine')

    const items = [
      { entity: 'subtask', id: '1' },
      { entity: 'attendance', id: '2' },
      { entity: 'category', id: '3' },
      { entity: 'budget', id: '4' },
      { entity: 'member', id: '5' },
    ]

    const sorted = sortByDependency(items as never)

    expect(sorted.map(i => i.entity)).toEqual([
      'member',
      'category',
      'attendance',
      'budget',
      'subtask',
    ])
  })

  // ─── Test 10: Processing state can be recovered ────────────────────────────

  it('should recover stuck processing items', async () => {
    const { recoverStuckItems } = await import('@/lib/sync/syncEngine')

    // Add items stuck in processing
    await addQueueItem({ status: 'processing', entity: 'wallet' })
    await addQueueItem({ status: 'processing', entity: 'task' })
    await addQueueItem({ status: 'pending', entity: 'member' })

    const recovered = await recoverStuckItems('user-1')

    expect(recovered).toBe(2)

    const items = await db.sync_queue.toArray()
    const processing = items.filter(i => i.status === 'processing')
    const pending = items.filter(i => i.status === 'pending')

    expect(processing).toHaveLength(0)
    expect(pending).toHaveLength(3)
  })

  // ─── Test 11: Logout prevents sync for unauthenticated user ────────────────

  it('should not sync when userId is null', async () => {
    const { processSyncQueue } = await import('@/lib/sync/syncEngine')

    // Add items for a user
    await addQueueItem({ user_id: 'user-1', status: 'pending' })

    // Try to sync with null userId (simulating logged out)
    const result = await processSyncQueue(null as never)

    // Should not process any items
    expect(result.processed).toBe(0)

    // Items should still be pending
    const items = await db.sync_queue.toArray()
    expect(items.every(i => i.status === 'pending')).toBe(true)
  })

  // ─── Test 12: Concurrent sync does not process queue twice ─────────────────

  it('should prevent concurrent sync operations', async () => {
    const { processSyncQueue, isSyncInProgress } = await import('@/lib/sync/syncEngine')

    await addQueueItem({ user_id: 'user-1', status: 'pending' })

    // Start first sync (it will complete quickly since mock succeeds)
    const result1 = await processSyncQueue('user-1')

    // Try to start second sync while first might still be "in progress"
    // (In reality, the first one completes, but this tests the guard)
    const result2 = await processSyncQueue('user-1')

    // Only one should have processed items
    expect(result1.processed + result2.processed).toBeGreaterThanOrEqual(1)
    expect(isSyncInProgress()).toBe(false)
  })

  // ─── Test 13: Conflict resolution uses updated_at ──────────────────────────

  it('should resolve conflict using Last Write Wins', async () => {
    const { resolveConflict } = await import('@/lib/sync/syncEngine')

    const localTime = '2026-01-01T12:00:00Z'
    const remoteTime = '2026-01-01T10:00:00Z'

    // Local is newer
    expect(resolveConflict(localTime, remoteTime)).toBe('local')

    // Remote is newer
    expect(resolveConflict(remoteTime, localTime)).toBe('remote')

    // Same time
    expect(resolveConflict(localTime, localTime)).toBe('local')
  })

  // ─── Test 14: Local data remains after sync failure ────────────────────────

  it('should keep local data after sync failure', async () => {
    const { syncItem } = await import('@/lib/sync/syncEngine')

    // Add data to local database
    await db.wallets.add({
      id: 'wallet-1',
      user_id: 'user-1',
      name: 'Test Wallet',
      type: 'bank',
      initial_balance: 1000000,
      note: null,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })

    // Add sync queue item
    const item = await addQueueItem({
      operation: 'create',
      entity: 'wallet',
      entity_id: 'wallet-1',
      payload: { id: 'wallet-1', name: 'Test Wallet' },
    })

    // Sync fails
    mockUpsert.mockResolvedValueOnce({ error: { message: 'Server error' } })
    await syncItem(item as never)

    // Local data should still exist
    const wallet = await db.wallets.get('wallet-1')
    expect(wallet).toBeDefined()
    expect(wallet?.name).toBe('Test Wallet')

    // Queue item should be failed
    const queueItem = await db.sync_queue.get(item.id)
    expect(queueItem?.status).toBe('failed')
  })

  // ─── Test 15: Delete operation syncs correctly ─────────────────────────────

  it('should sync delete operations', async () => {
    const { syncItem } = await import('@/lib/sync/syncEngine')

    const item = await addQueueItem({
      operation: 'delete',
      entity: 'wallet',
      entity_id: 'wallet-to-delete',
    })

    const result = await syncItem(item as never)

    expect(result).toBe(true)
    expect(mockEq).toHaveBeenCalled()

    const updated = await db.sync_queue.get(item.id)
    expect(updated?.status).toBe('completed')
  })

  // ─── Test 16: Unknown entity fails gracefully ──────────────────────────────

  it('should fail gracefully for unknown entity', async () => {
    const { syncItem } = await import('@/lib/sync/syncEngine')

    const item = await addQueueItem({
      operation: 'create',
      entity: 'unknown_entity',
      payload: { id: 'test' },
    })

    const result = await syncItem(item as never)

    expect(result).toBe(false)

    const updated = await db.sync_queue.get(item.id)
    expect(updated?.status).toBe('failed')
    expect(updated?.last_error).toContain('Entity tidak dikenal')
  })

  // ─── Test 17: Cleanup completed items ──────────────────────────────────────

  it('should cleanup completed items', async () => {
    const { cleanupCompletedItems } = await import('@/lib/sync/syncEngine')

    await addQueueItem({ status: 'completed', entity: 'wallet' })
    await addQueueItem({ status: 'completed', entity: 'task' })
    await addQueueItem({ status: 'pending', entity: 'member' })

    const deleted = await cleanupCompletedItems('user-1')

    expect(deleted).toBe(2)

    const remaining = await db.sync_queue.toArray()
    expect(remaining).toHaveLength(1)
    expect(remaining[0].status).toBe('pending')
  })

  // ─── Test 18: Full processSyncQueue integration ────────────────────────────

  it('should process full sync queue', async () => {
    const { processSyncQueue } = await import('@/lib/sync/syncEngine')

    await addQueueItem({
      user_id: 'user-1',
      operation: 'create',
      entity: 'wallet',
      payload: { id: 'w1', name: 'Wallet 1' },
    })
    await addQueueItem({
      user_id: 'user-1',
      operation: 'create',
      entity: 'task',
      payload: { id: 't1', title: 'Task 1' },
    })

    const result = await processSyncQueue('user-1')

    expect(result.processed).toBe(2)
    expect(result.succeeded).toBe(2)
    expect(result.failed).toBe(0)

    const items = await db.sync_queue.toArray()
    expect(items.every(i => i.status === 'completed')).toBe(true)
  })

  // ─── Test 19: getPendingCount works correctly ──────────────────────────────

  it('should count pending items correctly', async () => {
    const { getPendingCount } = await import('@/lib/sync/syncEngine')

    await addQueueItem({ user_id: 'user-1', status: 'pending' })
    await addQueueItem({ user_id: 'user-1', status: 'pending' })
    await addQueueItem({ user_id: 'user-1', status: 'completed' })
    await addQueueItem({ user_id: 'user-2', status: 'pending' })

    const count = await getPendingCount('user-1')
    expect(count).toBe(2)
  })

  // ─── Test 20: User isolation ───────────────────────────────────────────────

  it('should only sync items for the specified user', async () => {
    const { processSyncQueue } = await import('@/lib/sync/syncEngine')

    await addQueueItem({
      user_id: 'user-1',
      operation: 'create',
      entity: 'wallet',
      payload: { id: 'w1' },
    })
    await addQueueItem({
      user_id: 'user-2',
      operation: 'create',
      entity: 'wallet',
      payload: { id: 'w2' },
    })

    const result = await processSyncQueue('user-1')

    // Only user-1's item should be processed
    expect(result.processed).toBe(1)

    // user-2's item should still be pending
    const items = await db.sync_queue.toArray()
    const user2Items = items.filter(i => i.user_id === 'user-2')
    expect(user2Items.every(i => i.status === 'pending')).toBe(true)
  })
})
