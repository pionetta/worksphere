import { useState, useRef, useEffect } from 'react'
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import {
  Sun,
  Moon,
  LogOut,
  User as UserIcon,
  RefreshCw,
  Cloud,
  CloudOff,
  Calendar,
  SlidersHorizontal,
} from 'lucide-react'
import type { Theme } from '@/hooks/useTheme'
import type { User } from '@supabase/supabase-js'
import type { SyncStatus } from '@/hooks/useSyncStatus'
import type { NetworkStatus } from '@/lib/sync/networkDetector'

function getGreeting(): string {
  const hour = new Date().getHours()
  const min = new Date().getMinutes()
  const time = hour * 60 + min
  // 04:00 - 10:59: Selamat Pagi
  if (time >= 240 && time < 660) return 'Selamat Pagi'
  // 11:00 - 14:59: Selamat Siang
  if (time >= 660 && time < 900) return 'Selamat Siang'
  // 15:00 - 18:29: Selamat Sore
  if (time >= 900 && time < 1110) return 'Selamat Sore'
  // 18:30 - 03:59: Selamat Malam
  return 'Selamat Malam'
}

export interface AppHeaderProps {
  title?: string
  subtitle?: string
  theme: Theme
  onThemeChange: (theme: Theme) => void
  onLogout?: () => void
  onOpenProfile?: () => void
  user?: User | null
  actions?: ReactNode
  className?: string
  isDashboard?: boolean
  syncStatus?: SyncStatus
  networkStatus?: NetworkStatus
  pendingCount?: number
  onRetrySync?: () => void
  onOpenCalendar?: () => void
  onOpenCustomizer?: () => void
}

export function AppHeader({
  title,
  subtitle,
  theme,
  onThemeChange,
  onLogout,
  onOpenProfile,
  user,
  actions,
  className,
  isDashboard,
  syncStatus = 'synced',
  networkStatus = 'online',
  pendingCount = 0,
  onRetrySync,
  onOpenCalendar,
  onOpenCustomizer,
}: AppHeaderProps) {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const avatarUrl = user?.user_metadata?.avatar_url as string | undefined
  const fullName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.username ||
    user?.email?.split('@')[0] ||
    'Pengguna'
  const firstName = fullName.trim().split(' ')[0] || 'Pengguna'
  const initial = (firstName || 'P').charAt(0).toUpperCase()

  const isCustomPage = !isDashboard && title && title !== 'Worksphere'

  // Close dropdown on click outside or Escape key
  useEffect(() => {
    if (!isOpen) return

    function handleClickOutside(event: MouseEvent | TouchEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('touchstart', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('touchstart', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  // Sync dot color indicator
  const getSyncDotColor = () => {
    if (networkStatus === 'offline') return 'bg-amber-500'
    if (syncStatus === 'error') return 'bg-rose-500'
    if (syncStatus === 'pending' || (pendingCount ?? 0) > 0) return 'bg-amber-500'
    if (syncStatus === 'syncing') return 'bg-sky-500 animate-pulse'
    return 'bg-emerald-500'
  }

  return (
    <header
      className={cn(
        'sticky top-0 z-40 w-full bg-[#F0F3F8] dark:bg-[#1E232D] border-b border-white/70 dark:border-white/5 shadow-[-4px_-4px_10px_rgba(255,255,255,0.8),4px_4px_10px_rgba(163,177,198,0.25)] dark:shadow-[-3px_-3px_8px_rgba(255,255,255,0.02),3px_3px_8px_rgba(0,0,0,0.4)] px-4 pt-5 pb-3 safe-area-top flex items-center justify-between transition-colors duration-200',
        className
      )}
      style={{
        paddingTop: 'max(1.25rem, env(safe-area-inset-top, 20px))',
      }}
    >
      <div className="relative flex items-center justify-between max-w-6xl mx-auto w-full">
        {/* Sisi Kiri: Avatar dengan sync dot & Teks Sapaan Bertumpuk */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative shrink-0">
            <button
              type="button"
              onClick={() => setIsOpen(prev => !prev)}
              className="w-9 h-9 flex items-center justify-center rounded-full bg-gradient-to-tr from-[#6366F1] to-[#8B5CF6] text-white font-bold text-sm shadow-[0_4px_12px_rgba(99,102,241,0.35)] ring-2 ring-white/80 dark:ring-white/10 relative cursor-pointer active:scale-95 transition-transform overflow-hidden"
              aria-label="Menu Akun Pengguna"
              aria-expanded={isOpen}
              title="Menu Akun"
            >
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={fullName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span>{initial}</span>
              )}
            </button>
            <span
              className={cn(
                'absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full ring-2 ring-white dark:ring-slate-900 pointer-events-none transition-colors',
                getSyncDotColor()
              )}
              aria-hidden="true"
            />
          </div>

          <div className="flex flex-col min-w-0 leading-tight">
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
              {isCustomPage ? subtitle || 'Worksphere' : `${getGreeting()},`}
            </span>
            <span className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-100 tracking-tight truncate">
              {isCustomPage ? title : firstName}
            </span>
          </div>
        </div>

        {/* Sisi Kanan: Tombol Aksi Neumorphic (Kalender & Slider/Filter) */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => {
              if (onOpenCalendar) {
                onOpenCalendar()
              } else {
                window.dispatchEvent(new CustomEvent('worksphere:open-calendar'))
              }
            }}
            className="w-9 h-9 rounded-full bg-[#F0F3F8] dark:bg-[#1E232D] border border-white/70 dark:border-white/5 shadow-[-3px_-3px_6px_rgba(255,255,255,0.9),3px_3px_6px_rgba(163,177,198,0.35)] dark:shadow-[-2px_-2px_5px_rgba(255,255,255,0.03),2px_2px_5px_rgba(0,0,0,0.4)] active:shadow-[inset_-2px_-2px_4px_rgba(255,255,255,0.9),inset_2px_2px_4px_rgba(163,177,198,0.35)] flex items-center justify-center text-slate-700 dark:text-slate-200 hover:scale-105 active:scale-95 transition-all cursor-pointer"
            aria-label="Kalender"
            title="Buka Kalender"
          >
            <Calendar className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => {
              if (onOpenCustomizer) {
                onOpenCustomizer()
              } else {
                window.dispatchEvent(new CustomEvent('worksphere:open-customizer'))
              }
            }}
            className="w-9 h-9 rounded-full bg-[#F0F3F8] dark:bg-[#1E232D] border border-white/70 dark:border-white/5 shadow-[-3px_-3px_6px_rgba(255,255,255,0.9),3px_3px_6px_rgba(163,177,198,0.35)] dark:shadow-[-2px_-2px_5px_rgba(255,255,255,0.03),2px_2px_5px_rgba(0,0,0,0.4)] active:shadow-[inset_-2px_-2px_4px_rgba(255,255,255,0.9),inset_2px_2px_4px_rgba(163,177,198,0.35)] flex items-center justify-center text-slate-700 dark:text-slate-200 hover:scale-105 active:scale-95 transition-all cursor-pointer"
            aria-label="Atur Widget"
            title="Atur Widget"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>

          {actions}
        </div>

        {/* Floating Neumorphic Dropdown Menu */}
        {isOpen && (
          <div
            ref={menuRef}
            className="absolute top-12 left-0 z-50 w-64 rounded-2xl bg-[#F0F3F8] dark:bg-[#1E232D] border border-white/70 dark:border-white/5 shadow-[-8px_-8px_16px_rgba(255,255,255,0.9),8px_8px_16px_rgba(163,177,198,0.35)] dark:shadow-[-6px_-6px_14px_rgba(255,255,255,0.03),6px_6px_14px_rgba(0,0,0,0.5)] p-2 animate-in fade-in zoom-in-95 duration-150"
          >
            {/* Header Akun */}
            <div className="flex items-center gap-2.5 p-2 pb-2.5">
              <div className="w-9 h-9 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0 overflow-hidden shadow-xs ring-1 ring-white/60 dark:ring-white/10">
                {avatarUrl ? (
                  <img src={avatarUrl} alt={fullName} className="w-full h-full object-cover" />
                ) : (
                  <span>{initial}</span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                  {fullName}
                </p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                  {user?.email || 'user@worksphere.id'}
                </p>
              </div>
            </div>

            <div className="border-t border-slate-200/60 dark:border-slate-700/60 my-1" />

            {/* Item 1 - Profil */}
            <button
              type="button"
              onClick={() => {
                setIsOpen(false)
                onOpenProfile?.()
              }}
              className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-white/60 dark:hover:bg-slate-800/60 transition-colors cursor-pointer"
            >
              <UserIcon className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400 shrink-0" />
              <span>Profil Saya</span>
            </button>

            {/* Item 2 - Ganti Tema */}
            <div className="flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-200">
              <div className="flex items-center gap-2.5">
                {theme === 'dark' ? (
                  <Moon className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                ) : (
                  <Sun className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                )}
                <span>Tema {theme === 'dark' ? 'Gelap' : 'Terang'}</span>
              </div>
              <button
                type="button"
                onClick={() => onThemeChange(theme === 'dark' ? 'light' : 'dark')}
                className={cn(
                  'relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden',
                  theme === 'dark' ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'
                )}
                aria-label="Ganti Tema"
              >
                <span
                  className={cn(
                    'pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out',
                    theme === 'dark' ? 'translate-x-4' : 'translate-x-0'
                  )}
                />
              </button>
            </div>

            {/* Item 3 - Status Sinkronisasi */}
            <div
              onClick={() => {
                if (onRetrySync && (syncStatus === 'error' || networkStatus === 'offline')) {
                  onRetrySync()
                }
              }}
              className={cn(
                'flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-200',
                onRetrySync && (syncStatus === 'error' || networkStatus === 'offline')
                  ? 'hover:bg-white/60 dark:hover:bg-slate-800/60 cursor-pointer'
                  : ''
              )}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                {syncStatus === 'syncing' ? (
                  <RefreshCw className="w-3.5 h-3.5 text-indigo-500 animate-spin shrink-0" />
                ) : networkStatus === 'offline' ? (
                  <CloudOff className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                ) : syncStatus === 'error' ? (
                  <CloudOff className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                ) : (
                  <Cloud className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                )}
                <span className="truncate">
                  {networkStatus === 'offline'
                    ? 'Mode Offline'
                    : syncStatus === 'syncing'
                    ? 'Menyinkronkan...'
                    : syncStatus === 'error'
                    ? 'Gagal sinkron (Coba lagi)'
                    : 'Tersinkronisasi'}
                </span>
              </div>
              {(pendingCount ?? 0) > 0 && (
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 shrink-0">
                  {pendingCount} tertunda
                </span>
              )}
            </div>

            <div className="border-t border-slate-200/60 dark:border-slate-700/60 my-1" />

            {/* Item 4 - Keluar */}
            <button
              type="button"
              onClick={() => {
                setIsOpen(false)
                onLogout?.()
              }}
              className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-500 shrink-0" />
              <span>Keluar</span>
            </button>
          </div>
        )}
      </div>
    </header>
  )
}

