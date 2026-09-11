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
      className="fixed inset-x-3 z-30 max-w-md mx-auto bg-[#F0F3F8] dark:bg-[#1E232D] rounded-[30px] shadow-[-8px_-8px_16px_rgba(255,255,255,0.9),8px_8px_16px_rgba(163,177,198,0.35)] dark:shadow-[-6px_-6px_14px_rgba(255,255,255,0.03),6px_6px_14px_rgba(0,0,0,0.5)] border border-white/80 dark:border-white/5 flex items-center justify-around px-2 safe-area-bottom md:hidden transition-all duration-200"
      style={{ bottom: 'max(20px, calc(env(safe-area-inset-bottom, 0px) + 10px))', height: '64px' }}
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
                'flex flex-col items-center justify-center gap-0.5 w-full h-full rounded-2xl cursor-pointer min-h-[44px] min-w-[44px]',
                'text-xs transition-all duration-150 active:scale-95',
                isActive
                  ? 'text-indigo-600 dark:text-indigo-400 font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              )
            }
          >
            {({ isActive }) => (
              <>
                <span
                  className={cn(
                    'relative transition-all duration-150 p-1.5 rounded-xl flex items-center justify-center',
                    isActive &&
                      'bg-[#F0F3F8] dark:bg-[#1E232D] shadow-[inset_-2px_-2px_4px_rgba(255,255,255,0.9),inset_2px_2px_4px_rgba(163,177,198,0.35)] dark:shadow-[inset_-2px_-2px_4px_rgba(255,255,255,0.03),inset_2px_2px_4px_rgba(0,0,0,0.5)] border border-white/60 dark:border-white/5 scale-105'
                  )}
                >
                  {item.icon}
                  {isActive && (
                    <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-indigo-600 dark:bg-indigo-400 shadow-[0_0_8px_rgba(99,102,241,0.9)]" />
                  )}
                </span>
                <span
                  className={cn(
                    'text-[10px] leading-tight tracking-tight transition-all duration-150',
                    isActive ? 'font-bold text-indigo-600 dark:text-indigo-400 drop-shadow-xs' : 'font-medium'
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
      className="relative z-10 hidden md:flex flex-col w-64 h-full bg-[#F0F3F8] dark:bg-[#1E232D] border-r border-white/70 dark:border-white/5 transition-colors"
      aria-label="Navigasi utama"
    >
      <div className="flex items-center gap-2.5 px-6 h-16 border-b border-white/70 dark:border-white/5">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#6366F1] to-[#8B5CF6] text-white flex items-center justify-center font-bold text-xs shadow-xs">
          <span>W</span>
        </div>
        <span className="text-base font-semibold text-slate-800 dark:text-slate-100 tracking-tight">Worksphere</span>
      </div>
      <div className="flex-1 py-4 px-3 space-y-1">
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/app'}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-150',
                isActive
                  ? 'bg-[#F0F3F8] dark:bg-[#1E232D] text-indigo-600 dark:text-indigo-400 font-bold shadow-[inset_-2px_-2px_4px_rgba(255,255,255,0.9),inset_2px_2px_4px_rgba(163,177,198,0.3)] dark:shadow-[inset_-2px_-2px_4px_rgba(255,255,255,0.03),inset_2px_2px_4px_rgba(0,0,0,0.5)] border border-white/60 dark:border-white/5'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-white/40 dark:hover:bg-white/5 font-medium'
              )
            }
          >
            {item.icon}
            {item.label}
          </NavLink>
        ))}
      </div>

      <div className="p-3 border-t border-[#E6E6E3] dark:border-[#272727] space-y-1">
        {onOpenProfile && (
          <button
            onClick={onOpenProfile}
            className="flex items-center gap-3 w-full px-3 py-2 rounded-xl text-left hover:bg-[#F1F1EF] dark:hover:bg-[#1A1A1A] transition-colors group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center bg-[#E6E6E3] dark:bg-[#272727] text-[#171717] dark:text-[#F5F5F5] font-semibold text-xs flex-shrink-0 border border-[#E6E6E3] dark:border-[#272727]">
              {avatarUrl ? (
                <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" />
              ) : (
                initial
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-[#171717] dark:text-[#F5F5F5] truncate group-hover:text-primary-600 dark:group-hover:text-primary-400">
                {displayName}
              </p>
              <p className="text-xs text-[#737373] dark:text-[#A3A3A3] truncate">Lihat profil</p>
            </div>
          </button>
        )}

        {onLogout && (
          <button
            onClick={onLogout}
            className="flex items-center gap-3 w-full px-3 py-2 rounded-xl text-sm font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Keluar</span>
          </button>
        )}
      </div>
    </nav>
  )
}
