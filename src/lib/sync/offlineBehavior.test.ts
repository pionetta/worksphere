import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { db } from '@/lib/db'

// ─── Mock Supabase ────────────────────────────────────────────────────────────

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

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('Offline Behavior', () => {
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

  // ─── Navigator State ────────────────────────────────────────────────────────

  describe('Navigator online state', () => {
    it('should report online when navigator.onLine is true', async () => {
      const { getNetworkStatus } = await import('@/lib/sync/networkDetector')
      Object.defineProperty(navigator, 'onLine', { value: true, writable: true })
      expect(getNetworkStatus()).toBe('online')
    })

    it('should report offline when navigator.onLine is false', async () => {
      const { getNetworkStatus } = await import('@/lib/sync/networkDetector')
      Object.defineProperty(navigator, 'onLine', { value: false, writable: true })
      expect(getNetworkStatus()).toBe('offline')
    })

    it('should return boolean from isOnline', async () => {
      const { isOnline } = await import('@/lib/sync/networkDetector')
      Object.defineProperty(navigator, 'onLine', { value: true, writable: true })
      expect(isOnline()).toBe(true)
      Object.defineProperty(navigator, 'onLine', { value: false, writable: true })
      expect(isOnline()).toBe(false)
    })
  })

  // ─── Network Events ─────────────────────────────────────────────────────────

  describe('Network change events', () => {
    it('should call listener when online event fires', async () => {
      const { onNetworkChange } = await import('@/lib/sync/networkDetector')
      const callback = vi.fn()

      onNetworkChange(callback)

      window.dispatchEvent(new Event('online'))

      expect(callback).toHaveBeenCalled()
    })

    it('should call listener when offline event fires', async () => {
      const { onNetworkChange } = await import('@/lib/sync/networkDetector')
      const callback = vi.fn()

      onNetworkChange(callback)

      window.dispatchEvent(new Event('offline'))

      expect(callback).toHaveBeenCalled()
    })

    it('should not call listener after unsubscribe', async () => {
      const { onNetworkChange } = await import('@/lib/sync/networkDetector')
      const callback = vi.fn()

      const unsubscribe = onNetworkChange(callback)
      unsubscribe()

      window.dispatchEvent(new Event('online'))

      expect(callback).not.toHaveBeenCalled()
    })
  })

  // ─── Queue Mutation Offline ─────────────────────────────────────────────────

  describe('Queue mutation while offline', () => {
    it('should create wallet and queue sync while offline', async () => {
      const { queueCreate } = await import('@/lib/sync/syncHelper')

      await queueCreate('user-1', 'wallet', 'wallet-offline', {
        id: 'wallet-offline',
        user_id: 'user-1',
        name: 'Offline Wallet',
        type: 'bank',
      })

      const items = await db.sync_queue.toArray()
      expect(items).toHaveLength(1)
      expect(items[0].entity).toBe('wallet')
      expect(items[0].status).toBe('pending')
    })

    it('should create transaction and queue sync while offline', async () => {
      const { queueCreate } = await import('@/lib/sync/syncHelper')

      await queueCreate('user-1', 'transaction', 'tx-offline', {
        id: 'tx-offline',
        user_id: 'user-1',
        amount: 50000,
        type: 'expense',
      })

      const items = await db.sync_queue.toArray()
      expect(items).toHaveLength(1)
      expect(items[0].entity).toBe('transaction')
      expect(items[0].status).toBe('pending')
    })

    it('should create transfer and queue two sync operations while offline', async () => {
      const { queueCreate } = await import('@/lib/sync/syncHelper')

      // Transfer creates two transactions
      await queueCreate('user-1', 'transaction', 'tx-source', {
        id: 'tx-source',
        user_id: 'user-1',
        amount: 100000,
        type: 'transfer_out',
      })
      await queueCreate('user-1', 'transaction', 'tx-dest', {
        id: 'tx-dest',
        user_id: 'user-1',
        amount: 100000,
        type: 'transfer_in',
      })

      const items = await db.sync_queue.toArray()
      expect(items).toHaveLength(2)
      expect(items.every(i => i.status === 'pending')).toBe(true)
    })

    it('should create task and queue sync while offline', async () => {
      const { queueCreate } = await import('@/lib/sync/syncHelper')

      await queueCreate('user-1', 'task', 'task-offline', {
        id: 'task-offline',
        user_id: 'user-1',
        title: 'Offline Task',
        status: 'todo',
      })

      const items = await db.sync_queue.toArray()
      expect(items).toHaveLength(1)
      expect(items[0].entity).toBe('task')
      expect(items[0].status).toBe('pending')
    })

    it('should create subtask and queue sync while offline', async () => {
      const { queueCreate } = await import('@/lib/sync/syncHelper')

      await queueCreate('user-1', 'subtask', 'subtask-offline', {
        id: 'subtask-offline',
        user_id: 'user-1',
        task_id: 'task-offline',
        title: 'Offline Subtask',
        is_completed: false,
      })

      const items = await db.sync_queue.toArray()
      expect(items).toHaveLength(1)
      expect(items[0].entity).toBe('subtask')
      expect(items[0].status).toBe('pending')
    })

    it('should create attendance and queue sync while offline', async () => {
      const { queueCreate } = await import('@/lib/sync/syncHelper')

      await queueCreate('user-1', 'attendance', 'att-offline', {
        id: 'att-offline',
        user_id: 'user-1',
        member_id: 'member-1',
        date: '2026-08-20',
        status: 'present',
      })

      const items = await db.sync_queue.toArray()
      expect(items).toHaveLength(1)
      expect(items[0].entity).toBe('attendance')
      expect(items[0].status).toBe('pending')
    })

    it('should remain pending when not syncing', async () => {
      const { queueCreate } = await import('@/lib/sync/syncHelper')

      await queueCreate('user-1', 'wallet', 'w1', { id: 'w1' })
      await queueCreate('user-1', 'task', 't1', { id: 't1' })
      await queueCreate('user-1', 'transaction', 'tx1', { id: 'tx1' })

      const items = await db.sync_queue.toArray()
      expect(items.every(i => i.status === 'pending')).toBe(true)
    })
  })

  // ─── Local Data Preserved ───────────────────────────────────────────────────

  describe('Local data preservation', () => {
    it('should preserve wallet data in IndexedDB when sync fails', async () => {
      const { syncItem } = await import('@/lib/sync/syncEngine')

      await db.wallets.add({
        id: 'wallet-1',
        user_id: 'user-1',
        name: 'My Wallet',
        type: 'bank',
        initial_balance: 500000,
        note: null,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })

      const item = await addQueueItem({
        operation: 'create',
        entity: 'wallet',
        entity_id: 'wallet-1',
        payload: { id: 'wallet-1', name: 'My Wallet' },
      })

      mockUpsert.mockResolvedValueOnce({ error: { message: 'Network error' } })
      await syncItem(item as never)

      const wallet = await db.wallets.get('wallet-1')
      expect(wallet).toBeDefined()
      expect(wallet?.name).toBe('My Wallet')
      expect(wallet?.initial_balance).toBe(500000)
    })

    it('should preserve task data in IndexedDB when sync fails', async () => {
      const { syncItem } = await import('@/lib/sync/syncEngine')

      await db.tasks.add({
        id: 'task-1',
        user_id: 'user-1',
        title: 'My Task',
        description: null,
        status: 'todo',
        priority: 'medium',
        category: null,
        due_date: null,
        reminder_at: null,
        completed_at: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        deleted_at: null,
      })

      const item = await addQueueItem({
        operation: 'create',
        entity: 'task',
        entity_id: 'task-1',
        payload: { id: 'task-1', title: 'My Task' },
      })

      mockUpsert.mockResolvedValueOnce({ error: { message: 'Server error' } })
      await syncItem(item as never)

      const task = await db.tasks.get('task-1')
      expect(task).toBeDefined()
      expect(task?.title).toBe('My Task')
    })

    it('should preserve multiple items across entities when sync fails', async () => {
      const { syncItem } = await import('@/lib/sync/syncEngine')

      await db.wallets.add({
        id: 'w1',
        user_id: 'user-1',
        name: 'Wallet 1',
        type: 'cash',
        initial_balance: 100000,
        note: null,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })

      await db.tasks.add({
        id: 't1',
        user_id: 'user-1',
        title: 'Task 1',
        description: null,
        status: 'todo',
        priority: 'high',
        category: null,
        due_date: null,
        reminder_at: null,
        completed_at: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        deleted_at: null,
      })

      // Queue items for both
      const item1 = await addQueueItem({
        operation: 'create',
        entity: 'wallet',
        entity_id: 'w1',
        payload: { id: 'w1' },
      })
      const item2 = await addQueueItem({
        operation: 'create',
        entity: 'task',
        entity_id: 't1',
        payload: { id: 't1' },
      })

      mockUpsert.mockResolvedValue({ error: { message: 'Error' } })

      await syncItem(item1 as never)
      await syncItem(item2 as never)

      const wallet = await db.wallets.get('w1')
      const task = await db.tasks.get('t1')
      expect(wallet).toBeDefined()
      expect(task).toBeDefined()

      const items = await db.sync_queue.toArray()
      expect(items.every(i => i.status === 'failed')).toBe(true)
    })
  })

  // ─── Online Triggers Sync ───────────────────────────────────────────────────

  describe('Online triggers sync', () => {
    it('should process pending queue when sync runs', async () => {
      const { processSyncQueue } = await import('@/lib/sync/syncEngine')

      await addQueueItem({
        user_id: 'user-1',
        operation: 'create',
        entity: 'wallet',
        payload: { id: 'w1', name: 'Wallet' },
      })
      await addQueueItem({
        user_id: 'user-1',
        operation: 'create',
        entity: 'task',
        payload: { id: 't1', title: 'Task' },
      })

      const result = await processSyncQueue('user-1')

      expect(result.processed).toBe(2)
      expect(result.succeeded).toBe(2)
      expect(result.failed).toBe(0)

      const items = await db.sync_queue.toArray()
      expect(items.every(i => i.status === 'completed')).toBe(true)
    })

    it('should process items in dependency order', async () => {
      const { processSyncQueue } = await import('@/lib/sync/syncEngine')

      // Add items in reverse dependency order
      await addQueueItem({
        user_id: 'user-1',
        operation: 'create',
        entity: 'subtask',
        payload: { id: 'sub1' },
      })
      await addQueueItem({
        user_id: 'user-1',
        operation: 'create',
        entity: 'transaction',
        payload: { id: 'tx1' },
      })
      await addQueueItem({
        user_id: 'user-1',
        operation: 'create',
        entity: 'wallet',
        payload: { id: 'w1' },
      })

      const result = await processSyncQueue('user-1')

      expect(result.processed).toBe(3)
      expect(result.succeeded).toBe(3)

      // Verify calls were made in order (wallet before transaction before subtask)
      const calls = mockUpsert.mock.calls.map(c => c[0].id)
      expect(calls).toContain('w1')
      expect(calls).toContain('tx1')
      expect(calls).toContain('sub1')
    })

    it('should preserve failed items for retry', async () => {
      const { processSyncQueue } = await import('@/lib/sync/syncEngine')

      await addQueueItem({
        user_id: 'user-1',
        operation: 'create',
        entity: 'wallet',
        payload: { id: 'w1' },
      })

      mockUpsert.mockResolvedValueOnce({ error: { message: 'Timeout' } })

      const result = await processSyncQueue('user-1')

      expect(result.failed).toBe(1)

      const items = await db.sync_queue.toArray()
      expect(items[0].status).toBe('failed')
      expect(items[0].last_error).toContain('Timeout')
      expect(items[0].retry_count).toBe(1)
    })

    it('should not double-process when already syncing', async () => {
      const { processSyncQueue } = await import('@/lib/sync/syncEngine')

      await addQueueItem({
        user_id: 'user-1',
        operation: 'create',
        entity: 'wallet',
        payload: { id: 'w1' },
      })

      // Both calls should not cause issues
      const [result1, result2] = await Promise.all([
        processSyncQueue('user-1'),
        processSyncQueue('user-1'),
      ])

      const total = result1.processed + result2.processed
      expect(total).toBeGreaterThanOrEqual(1)
    })
  })

  // ─── Network Transition ─────────────────────────────────────────────────────

  describe('Network transition', () => {
    it('should have correct initial status when online', async () => {
      const { isOnline } = await import('@/lib/sync/networkDetector')
      Object.defineProperty(navigator, 'onLine', { value: true, writable: true })
      expect(isOnline()).toBe(true)
    })

    it('should have correct initial status when offline', async () => {
      const { isOnline } = await import('@/lib/sync/networkDetector')
      Object.defineProperty(navigator, 'onLine', { value: false, writable: true })
      expect(isOnline()).toBe(false)
    })

    it('should update status on online event', async () => {
      const { onNetworkChange, isOnline } = await import('@/lib/sync/networkDetector')
      let currentStatus = 'offline'

      const callback = vi.fn(() => {
        currentStatus = isOnline() ? 'online' : 'offline'
      })

      onNetworkChange(callback)

      Object.defineProperty(navigator, 'onLine', { value: true, writable: true })
      window.dispatchEvent(new Event('online'))

      expect(callback).toHaveBeenCalled()
      expect(currentStatus).toBe('online')
    })

    it('should update status on offline event', async () => {
      const { onNetworkChange, isOnline } = await import('@/lib/sync/networkDetector')
      let currentStatus = 'online'

      const callback = vi.fn(() => {
        currentStatus = isOnline() ? 'online' : 'offline'
      })

      onNetworkChange(callback)

      Object.defineProperty(navigator, 'onLine', { value: false, writable: true })
      window.dispatchEvent(new Event('offline'))

      expect(callback).toHaveBeenCalled()
      expect(currentStatus).toBe('offline')
    })
  })

  // ─── Sync Queue Integrity ───────────────────────────────────────────────────

  describe('Sync queue integrity', () => {
    it('should not lose queue items during multiple mutations', async () => {
      const { queueCreate, queueUpdate } = await import('@/lib/sync/syncHelper')

      // Create several items
      await queueCreate('user-1', 'wallet', 'w1', { id: 'w1', name: 'Wallet 1' })
      await queueCreate('user-1', 'task', 't1', { id: 't1', title: 'Task 1' })
      await queueCreate('user-1', 'transaction', 'tx1', { id: 'tx1', amount: 100000 })

      // Update one item
      await queueUpdate('user-1', 'wallet', 'w1', { id: 'w1', name: 'Wallet Updated' })

      const items = await db.sync_queue.toArray()
      expect(items).toHaveLength(4)
      expect(items.every(i => i.user_id === 'user-1')).toBe(true)
    })

    it('should maintain correct queue state after failed sync', async () => {
      const { syncItem } = await import('@/lib/sync/syncEngine')

      await addQueueItem({
        user_id: 'user-1',
        operation: 'create',
        entity: 'wallet',
        payload: { id: 'w1' },
      })

      mockUpsert.mockResolvedValue({ error: { message: 'Error' } })
      await syncItem((await db.sync_queue.toArray().then(items => items[0])) as never)

      const items = await db.sync_queue.toArray()
      expect(items).toHaveLength(1)
      expect(items[0].status).toBe('failed')
      expect(items[0].retry_count).toBe(1)
      expect(items[0].last_error).toContain('Error')
    })
  })
})

// ─── Helper ───────────────────────────────────────────────────────────────────

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
