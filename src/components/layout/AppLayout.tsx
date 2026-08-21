import type { ReactNode } from 'react'
import { Outlet } from 'react-router-dom'
import { useAuth } from '@/lib/auth'
import type { Theme } from '@/hooks/useTheme'
import { useSyncStatus } from '@/hooks/useSyncStatus'
import { useNetworkStatus } from '@/hooks/useNetworkStatus'
import { AppHeader } from './AppHeader'
import { BottomNavigation, SidebarNavigation } from './Navigation'
import { SyncIndicator, OfflineBanner } from './SyncIndicator'

interface AppLayoutProps {
  theme: Theme
  onThemeChange: (theme: Theme) => void
  title: string
  subtitle?: string
  headerActions?: ReactNode
}

export function AppLayout({
  theme,
  onThemeChange,
  title,
  subtitle,
  headerActions,
}: AppLayoutProps) {
  const { user } = useAuth()
  const sync = useSyncStatus(user?.id ?? null)
  const network = useNetworkStatus()

  return (
    <div className="flex h-dvh bg-background">
      {/* Desktop sidebar */}
      <SidebarNavigation />

      <div className="flex flex-col flex-1 min-w-0">
        {/* Offline banner */}
        <OfflineBanner isOnline={network === 'online'} />

        {/* Header */}
        <AppHeader
          title={title}
          subtitle={subtitle}
          theme={theme}
          onThemeChange={onThemeChange}
          actions={
            <>
              <SyncIndicator
                syncStatus={sync.status}
                networkStatus={network}
                pendingCount={sync.pendingCount}
                lastSyncTime={sync.lastSyncTime}
                onRetry={sync.retry}
              />
              {headerActions}
            </>
          }
        />

        {/* Main content area — renders child route via Outlet */}
        <main className="flex-1 overflow-y-auto px-4 py-4 pb-20 md:pb-4">
          <Outlet />
        </main>

        {/* Mobile bottom navigation */}
        <BottomNavigation />
      </div>
    </div>
  )
}
