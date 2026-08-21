import { useState, useEffect, useCallback, useRef } from 'react'
import {
  processSyncQueue,
  getPendingCount,
  isSyncInProgress,
  type SyncResult,
} from '@/lib/sync/syncEngine'
import { isOnline, onNetworkChange } from '@/lib/sync/networkDetector'

// ─── Sync Status ──────────────────────────────────────────────────────────────

export type SyncStatus = 'synced' | 'syncing' | 'offline' | 'error' | 'pending'

export interface SyncState {
  status: SyncStatus
  pendingCount: number
  lastSyncResult: SyncResult | null
  lastSyncTime: Date | null
  sync: () => Promise<void>
  retry: () => Promise<void>
}

export function useSyncStatus(userId: string | null): SyncState {
  const [status, setStatus] = useState<SyncStatus>(isOnline() ? 'synced' : 'offline')
  const [pendingCount, setPendingCount] = useState(0)
  const [lastSyncResult, setLastSyncResult] = useState<SyncResult | null>(null)
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(() => {
    const saved = localStorage.getItem('worksphere-last-sync')
    return saved ? new Date(saved) : null
  })
  const syncInProgressRef = useRef(false)

  const updatePendingCount = useCallback(async () => {
    if (!userId) return
    const count = await getPendingCount(userId)
    setPendingCount(count)
  }, [userId])

  const doSync = useCallback(async () => {
    if (!userId || !isOnline() || syncInProgressRef.current) return

    syncInProgressRef.current = true
    setStatus('syncing')

    try {
      const result = await processSyncQueue(userId)
      setLastSyncResult(result)

      if (result.failed > 0) {
        setStatus('error')
      } else if (result.succeeded > 0 || result.processed === 0) {
        setStatus('synced')
        const now = new Date()
        setLastSyncTime(now)
        localStorage.setItem('worksphere-last-sync', now.toISOString())
      }

      await updatePendingCount()
    } catch {
      setStatus('error')
    } finally {
      syncInProgressRef.current = false
    }
  }, [userId, updatePendingCount])

  const retry = useCallback(async () => {
    if (!userId || isSyncInProgress()) return

    syncInProgressRef.current = true
    setStatus('syncing')

    try {
      const { retryFailedItems } = await import('@/lib/sync/syncEngine')
      const result = await retryFailedItems(userId)
      setLastSyncResult(result)

      if (result.failed > 0) {
        setStatus('error')
      } else {
        setStatus('synced')
        const now = new Date()
        setLastSyncTime(now)
        localStorage.setItem('worksphere-last-sync', now.toISOString())
      }

      await updatePendingCount()
    } catch {
      setStatus('error')
    } finally {
      syncInProgressRef.current = false
    }
  }, [userId, updatePendingCount])

  // Network change listener
  useEffect(() => {
    if (!userId) return

    const unsubscribe = onNetworkChange(() => {
      if (isOnline()) {
        doSync()
      } else {
        setStatus('offline')
      }
    })

    return unsubscribe
  }, [userId, doSync])

  // Initial sync on mount if online
  useEffect(() => {
    if (!userId) return

    updatePendingCount()

    if (isOnline() && pendingCount > 0) {
      doSync()
    }
  }, [userId]) // eslint-disable-line react-hooks/exhaustive-deps

  // Check pending count periodically (to update UI)
  useEffect(() => {
    if (!userId) return

    const interval = setInterval(updatePendingCount, 5000)
    return () => clearInterval(interval)
  }, [userId, updatePendingCount])

  return {
    status,
    pendingCount,
    lastSyncResult,
    lastSyncTime,
    sync: doSync,
    retry,
  }
}
