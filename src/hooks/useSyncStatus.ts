import { useState, useEffect, useCallback, useRef } from 'react'
import {
  processSyncQueue,
  getPendingCount,
  isSyncInProgress,
  pullCloudData,
  subscribeToUserRealtime,
  type SyncResult,
} from '@/lib/sync/syncEngine'
import { isOnline, onNetworkChange } from '@/lib/sync/networkDetector'
import { toast } from 'sonner'

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
      // 1. Pull down any remote changes first
      await pullCloudData(userId)

      // 2. Process outbound sync queue
      const result = await processSyncQueue(userId)
      setLastSyncResult(result)

      if (result.failed > 0) {
        setStatus('error')
        toast.error('Gagal menyinkronkan beberapa data ke cloud')
      } else if (result.succeeded > 0 || result.processed === 0) {
        setStatus('synced')
        if (result.succeeded > 0) {
          toast.success(`${result.succeeded} data berhasil disinkronkan ke cloud`)
        }
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

  // Realtime multi-device subscription & Initial pull
  useEffect(() => {
    if (!userId) return

    // 1. Initial downsync
    if (isOnline()) {
      pullCloudData(userId)
      doSync()
    }

    // 2. Subscribe to live postgres changes for this user
    const unsubscribeRealtime = subscribeToUserRealtime(userId)

    // 3. Downsync on tab/window focus (when user switches back to this device)
    const handleFocus = () => {
      if (isOnline() && userId) {
        pullCloudData(userId)
        doSync()
      }
    }
    window.addEventListener('focus', handleFocus)

    return () => {
      unsubscribeRealtime()
      window.removeEventListener('focus', handleFocus)
    }
  }, [userId]) // eslint-disable-line react-hooks/exhaustive-deps

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

  // Auto-sync when online and new items are added to queue
  useEffect(() => {
    if (!userId || !isOnline() || pendingCount === 0 || syncInProgressRef.current) return

    const timer = setTimeout(() => {
      doSync()
    }, 1000)

    return () => clearTimeout(timer)
  }, [userId, pendingCount, doSync])

  // Check pending count periodically (every 30 seconds when online)
  useEffect(() => {
    if (!userId) return

    updatePendingCount()
    const interval = setInterval(() => {
      updatePendingCount()
    }, 30000)
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
