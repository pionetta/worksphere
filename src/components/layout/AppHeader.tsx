import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { Sun, Moon, Monitor, LogOut } from 'lucide-react'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import type { Theme } from '@/hooks/useTheme'
import type { User } from '@supabase/supabase-js'

interface AppHeaderProps {
  title: string
  subtitle?: string
  theme: Theme
  onThemeChange: (theme: Theme) => void
  onLogout?: () => void
  onOpenProfile?: () => void
  user?: User | null
  actions?: ReactNode
  className?: string
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
        'text-gray-500 hover:text-gray-700 hover:bg-gray-100',
        'dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700/80',
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
  title,
  subtitle,
  theme,
  onThemeChange,
  onLogout,
  onOpenProfile,
  user,
  actions,
  className,
}: AppHeaderProps) {
  const avatarUrl = user?.user_metadata?.avatar_url as string | undefined
  const displayName =
    user?.user_metadata?.full_name || user?.user_metadata?.username || user?.email || 'U'
  const initial = displayName.charAt(0).toUpperCase()

  return (
    <header
      className={cn(
        'sticky top-0 z-30 glass border-b border-white/10 dark:border-gray-700/50',
        'safe-area-top backdrop-blur-md',
        className
      )}
    >
      <div className="flex items-center justify-between h-14 px-4">
        <div className="min-w-0">
          <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100 truncate tracking-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{subtitle}</p>
          )}
        </div>
        <div className="flex items-center gap-1 sm:gap-2">
          {actions}
          <ThemeToggle theme={theme} onThemeChange={onThemeChange} />

          {onOpenProfile && (
            <button
              onClick={onOpenProfile}
              className="rounded-full transition-transform active:scale-95 hover:ring-2 hover:ring-primary-500/50 flex-shrink-0 cursor-pointer"
              aria-label="Buka Profil"
              title="Profil Pengguna"
            >
              <Avatar className="w-8 h-8 border border-gray-200 dark:border-gray-700">
                {avatarUrl && <AvatarImage src={avatarUrl} alt={displayName} />}
                <AvatarFallback className="bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 font-semibold text-xs">
                  {initial}
                </AvatarFallback>
              </Avatar>
            </button>
          )}

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
