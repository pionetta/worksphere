import { useMemo } from 'react'
import { NavLink } from 'react-router-dom'
import { cn } from '@/utils/cn'
import { usePermissions, useIsAdmin } from '@/lib/auth'
import { Home, Users, Wallet, ListTodo, ShieldCheck, LogOut } from 'lucide-react'
import type { User } from '@supabase/supabase-js'

interface NavItem {
  to: string
  label: string
  icon: React.ReactNode
}

export function useNavItems(): NavItem[] {
  const permissions = usePermissions()
  const isAdmin = useIsAdmin()

  return useMemo(() => {
    const items: NavItem[] = [
      { to: '/app', label: 'Beranda', icon: <Home className="w-5 h-5" /> },
    ]

    if (isAdmin || permissions.attendance) {
      items.push({ to: '/app/attendance', label: 'Absensi', icon: <Users className="w-5 h-5" /> })
    }

    if (isAdmin || permissions.finance) {
      items.push({ to: '/app/finance', label: 'Keuangan', icon: <Wallet className="w-5 h-5" /> })
    }

    if (isAdmin || permissions.todo) {
      items.push({ to: '/app/todo', label: 'To-Do', icon: <ListTodo className="w-5 h-5" /> })
    }

    if (isAdmin) {
      items.push({ to: '/app/admin', label: 'Admin', icon: <ShieldCheck className="w-5 h-5" /> })
    }

    return items
  }, [permissions, isAdmin])
}

export function BottomNavigation() {
  const navItems = useNavItems()

  return (
    <nav
      className="fixed bottom-3 inset-x-3 z-30 max-w-md mx-auto h-16 rounded-[26px] bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl border border-white/80 dark:border-gray-700/60 shadow-xl shadow-blue-500/10 flex items-center justify-around px-2 safe-area-bottom md:hidden transition-all duration-200"
      aria-label="Navigasi utama"
    >
      <div className="flex items-center justify-around w-full h-full">
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/app'}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center justify-center gap-1 w-full h-full rounded-2xl cursor-pointer',
                'text-xs transition-all duration-200 active:scale-90',
                isActive
                  ? 'text-[#2563EB] dark:text-blue-400 font-bold'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              )
            }
          >
            {({ isActive }) => (
              <>
                <span
                  className={cn(
                    'relative transition-transform duration-200',
                    isActive && 'scale-110 -translate-y-0.5'
                  )}
                >
                  {item.icon}
                </span>
                <span
                  className={cn(
                    'text-[11px] transition-all duration-200',
                    isActive ? 'font-bold' : 'font-medium'
                  )}
                >
                  {item.label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}

interface SidebarNavigationProps {
  user?: User | null
  onOpenProfile?: () => void
  onLogout?: () => void
}

// Desktop sidebar navigation
export function SidebarNavigation({ user, onOpenProfile, onLogout }: SidebarNavigationProps) {
  const navItems = useNavItems()
  const avatarUrl = user?.user_metadata?.avatar_url as string | undefined
  const displayName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.username ||
    user?.email?.split('@')[0] ||
    'Pengguna'
  const initial = displayName.charAt(0).toUpperCase()

  return (
    <nav
      className="hidden md:flex flex-col w-64 h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700"
      aria-label="Navigasi utama"
    >
      <div className="flex items-center gap-2 px-6 h-16 border-b border-gray-200 dark:border-gray-700">
        <div className="w-8 h-8 rounded-lg bg-primary-500 flex items-center justify-center">
          <span className="text-white font-bold text-sm">W</span>
        </div>
        <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">Worksphere</span>
      </div>
      <div className="flex-1 py-4 px-3">
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/app'}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors mb-1',
                isActive
                  ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400 font-bold'
                  : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700/50'
              )
            }
          >
            {item.icon}
            {item.label}
          </NavLink>
        ))}
      </div>

      <div className="p-3 border-t border-gray-200 dark:border-gray-700 space-y-1">
        {onOpenProfile && (
          <button
            onClick={onOpenProfile}
            className="flex items-center gap-3 w-full px-3 py-2 rounded-xl text-left hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 font-semibold text-xs flex-shrink-0 border border-gray-200 dark:border-gray-700">
              {avatarUrl ? (
                <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" />
              ) : (
                initial
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate group-hover:text-primary-600 dark:group-hover:text-primary-400">
                {displayName}
              </p>
              <p className="text-xs text-gray-400 truncate">Lihat profil</p>
            </div>
          </button>
        )}

        {onLogout && (
          <button
            onClick={onLogout}
            className="flex items-center gap-3 w-full px-3 py-2 rounded-xl text-sm font-medium text-danger hover:bg-danger-light/30 dark:hover:bg-red-900/30 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Keluar</span>
          </button>
        )}
      </div>
    </nav>
  )
}
