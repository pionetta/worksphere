import { cn } from '@/utils/cn'
import { WifiOff, RefreshCw, CheckCircle2 } from 'lucide-react'
import type { SyncStatus } from '@/hooks/useSyncStatus'
import type { NetworkStatus } from '@/lib/sync/networkDetector'
import { formatDistanceToNow } from 'date-fns'
import { id } from 'date-fns/locale'

interface SyncIndicatorProps {
  syncStatus: SyncStatus
  networkStatus: NetworkStatus
  pendingCount: number
  lastSyncTime?: Date | null
  onRetry?: () => void
  className?: string
}

export function SyncIndicator({
  syncStatus,
  networkStatus,
  pendingCount,
  lastSyncTime,
  onRetry,
  className,
}: SyncIndicatorProps) {
  // Always render something to show status, even when synced
  const timeAgo = lastSyncTime
    ? formatDistanceToNow(lastSyncTime, { addSuffix: true, locale: id })
    : ''

  return (
    <div
      className={cn(
        'flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium',
        'transition-colors',
        className
      )}
    >
      {networkStatus === 'offline' ? (
        <>
          <WifiOff className="w-3.5 h-3.5 text-gray-400" />
          <span className="text-gray-500 dark:text-gray-400">Offline</span>
        </>
      ) : syncStatus === 'syncing' ? (
        <>
          <RefreshCw className="w-3.5 h-3.5 animate-spin text-primary-500" />
          <span className="text-primary-600 dark:text-primary-400">Menyinkronkan...</span>
        </>
      ) : syncStatus === 'error' ? (
        <>
          <WifiOff className="w-3.5 h-3.5 text-danger" />
          <span className="text-danger">Gagal sinkron</span>
          {onRetry && (
            <button
              onClick={onRetry}
              className="ml-1 text-primary-500 hover:text-primary-600 underline"
            >
              Coba
            </button>
          )}
        </>
      ) : syncStatus === 'pending' && pendingCount > 0 ? (
        <>
          <RefreshCw className="w-3.5 h-3.5 text-warning" />
          <span className="text-gray-500 dark:text-gray-400">{pendingCount} antrian</span>
        </>
      ) : syncStatus === 'synced' && networkStatus === 'online' ? (
        <div
          className="flex items-center gap-1.5 opacity-70 hover:opacity-100 transition-opacity"
          title={timeAgo ? `Tersinkronisasi ${timeAgo}` : 'Tersinkronisasi'}
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-success" />
          <span className="text-gray-500 dark:text-gray-400 hidden sm:inline">Tersinkron</span>
        </div>
      ) : null}
    </div>
  )
}

// Offline banner for full-width notification
interface OfflineBannerProps {
  isOnline: boolean
}

export function OfflineBanner({ isOnline }: OfflineBannerProps) {
  if (isOnline) return null

  return (
    <div className="bg-warning-light dark:bg-amber-900/30 px-4 py-2 text-center">
      <p className="text-xs text-amber-700 dark:text-amber-400">
        Offline — perubahan akan disinkronkan saat online.
      </p>
    </div>
  )
}
