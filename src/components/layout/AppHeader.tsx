import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { Sun, Moon, Monitor, LogOut, CircleUserRound } from 'lucide-react'
import type { Theme } from '@/hooks/useTheme'
import type { User } from '@supabase/supabase-js'

interface AppHeaderProps {
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
}

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 11) return 'Selamat Pagi'
  if (hour < 15) return 'Selamat Siang'
  if (hour < 18) return 'Selamat Sore'
  return 'Selamat Malam'
}

function ThemeToggle({
  theme,
  onThemeChange,
}: {
  theme: Theme
  onThemeChange: (t: Theme) => void
}) {
  const next: Record<Theme, Theme> = { light: 'dark', dark: 'system', system: 'light' }
  const icons: Record<Theme, ReactNode> = {
    light: <Sun className="w-5 h-5 text-amber-500" />,
    dark: <Moon className="w-5 h-5 text-indigo-400" />,
    system: <Monitor className="w-5 h-5 text-primary-500" />,
  }
  const labels: Record<Theme, string> = { light: 'Terang', dark: 'Gelap', system: 'Sistem' }

  return (
    <button
      onClick={() => onThemeChange(next[theme])}
      className={cn(
        'p-2 rounded-xl transition-all duration-150',
        'text-gray-500 hover:text-gray-700 hover:bg-white/60 dark:hover:bg-gray-800/60',
        'dark:text-gray-400 dark:hover:text-gray-200',
        'active:scale-95 cursor-pointer'
      )}
      aria-label={`Tema: ${labels[theme]}. Klik untuk mengganti.`}
      title={`Tema: ${labels[theme]} (klik untuk beralih ke ${labels[next[theme]]})`}
    >
      {icons[theme]}
    </button>
  )
}

export function AppHeader({
  theme,
  onThemeChange,
  onLogout,
  onOpenProfile,
  user,
  actions,
  className,
}: AppHeaderProps) {
  const avatarUrl = user?.user_metadata?.avatar_url as string | undefined
  const fullName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.username ||
    user?.email?.split('@')[0] ||
    'Pengguna'
  const firstName = fullName.split(' ')[0]

  return (
    <header
      className={cn(
        'sticky top-0 z-30 bg-transparent border-transparent transition-colors duration-200 safe-area-top',
        className
      )}
    >
      <div className="flex items-center justify-between h-14 px-4 max-w-md mx-auto w-full">
        {/* Profile Button + Greeting matching Dashboard layout */}
        <div className="flex items-center gap-2.5 min-w-0">
          {onOpenProfile && (
            <button
              onClick={onOpenProfile}
              className="rounded-full transition-transform active:scale-95 hover:ring-2 hover:ring-primary-500/40 flex-shrink-0 cursor-pointer"
              aria-label="Buka Profil"
              title="Profil Pengguna"
            >
              <div className="w-8 h-8 rounded-full border border-gray-400/40 dark:border-gray-600 flex items-center justify-center bg-white/80 dark:bg-gray-800/80 text-gray-600 dark:text-gray-300">
                {avatarUrl ? (
                  <img src={avatarUrl} alt={firstName} className="w-full h-full rounded-full object-cover" />
                ) : (
                  <CircleUserRound className="w-6 h-6 stroke-[1.75]" />
                )}
              </div>
            </button>
          )}
          <h1 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 truncate tracking-tight">
            <span>{getGreeting()}, </span>
            <span className="text-[#2563EB] dark:text-blue-400 font-bold">{firstName}</span>
          </h1>
        </div>

        {/* Action icons on right */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {actions}

          <ThemeToggle theme={theme} onThemeChange={onThemeChange} />

          {onLogout && (
            <button
              onClick={onLogout}
              className={cn(
                'p-2 rounded-xl transition-all duration-150',
                'text-gray-500 hover:text-danger hover:bg-danger-light/30',
                'dark:text-gray-400 dark:hover:text-red-400 dark:hover:bg-red-900/30',
                'active:scale-95 cursor-pointer'
              )}
              aria-label="Keluar / Logout"
              title="Keluar"
            >
              <LogOut className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </header>
  )
}
