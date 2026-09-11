import { useState, type ReactNode } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/lib/auth'
import type { Theme } from '@/hooks/useTheme'
import { useSyncStatus } from '@/hooks/useSyncStatus'
import { useNetworkStatus } from '@/hooks/useNetworkStatus'
import { AppHeader } from './AppHeader'
import { BottomNavigation, SidebarNavigation } from './Navigation'
import { OfflineBanner } from './SyncIndicator'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { ProfileModal } from '@/components/profile/ProfileModal'

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
  const location = useLocation()
  const navigate = useNavigate()
  const { user, signOut } = useAuth()
  const sync = useSyncStatus(user?.id ?? null)
  const network = useNetworkStatus()
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [showProfileModal, setShowProfileModal] = useState(false)

  const handleLogout = async () => {
    await signOut()
    setShowLogoutConfirm(false)
    navigate('/', { replace: true })
  }

  const isDashboard = location.pathname === '/app' || location.pathname === '/app/'

  return (
    <div className="relative flex h-dvh overflow-hidden bg-[#F0F3F8] dark:bg-[#1E232D] transition-colors duration-200">
      {/* Desktop sidebar */}
      <SidebarNavigation
        user={user}
        onOpenProfile={() => setShowProfileModal(true)}
        onLogout={() => setShowLogoutConfirm(true)}
      />

      <div
        className="relative z-10 flex flex-col flex-1 min-w-0 transition-colors duration-200"
      >
        {/* Offline banner */}
        <OfflineBanner isOnline={network === 'online'} />

        {/* Header */}
        <AppHeader
          title={title}
          subtitle={subtitle}
          theme={theme}
          onThemeChange={onThemeChange}
          user={user}
          isDashboard={isDashboard}
          onOpenProfile={() => setShowProfileModal(true)}
          onLogout={() => setShowLogoutConfirm(true)}
          syncStatus={sync.status}
          networkStatus={network}
          pendingCount={sync.pendingCount}
          onRetrySync={sync.retry}
          actions={headerActions}
        />

        {/* Main content area — renders child route via Outlet with page fade-in animation */}
        <main
          key={location.pathname}
          className="flex-1 overflow-y-auto px-4 py-4 animate-fade-in"
        >
          <Outlet />
        </main>

        {/* Mobile bottom navigation */}
        <BottomNavigation />
      </div>

      <ProfileModal open={showProfileModal} onClose={() => setShowProfileModal(false)} />

      <ConfirmDialog
        open={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={handleLogout}
        title="Keluar dari Akun"
        message="Apakah Anda yakin ingin keluar dari akun Worksphere?"
        confirmLabel="Keluar"
        variant="danger"
      />
    </div>
  )
}
