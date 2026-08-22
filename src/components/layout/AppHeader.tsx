import type { ReactNode } from 'react'
import { cn } from '@/utils/cn'
import { Sun, Moon, Monitor, LogOut } from 'lucide-react'
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
  const next: Record<Theme, Theme> = { light: 'dark', dark: 'system', system: 'dark' }
  const icons: Record<Theme, ReactNode> = {
    light: <Sun className="w-5 h-5" />,
    dark: <Moon className="w-5 h-5" />,
    system: <Monitor className="w-5 h-5" />,
  }
  const labels: Record<Theme, string> = { light: 'Terang', dark: 'Gelap', system: 'Sistem' }

  return (
    <button
      onClick={() => onThemeChange(next[theme])}
      className={cn(
        'p-2 rounded-lg transition-colors',
        'text-gray-500 hover:text-gray-700 hover:bg-gray-100',
        'dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700'
      )}
      aria-label={`Tema: ${labels[theme]}. Klik untuk mengganti.`}
      title={`Tema: ${labels[theme]}`}
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
    user?.user_metadata?.full_name ||
    user?.user_metadata?.username ||
    user?.email ||
    'U'
  const initial = displayName.charAt(0).toUpperCase()

  return (
    <header
      className={cn(
        'sticky top-0 z-30 glass border-b border-white/10 dark:border-gray-700/50',
        'safe-area-top',
        className
      )}
    >
      <div className="flex items-center justify-between h-14 px-4">
        <div className="min-w-0">
          <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate">
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
              className={cn(
                'flex items-center justify-center w-8 h-8 rounded-full overflow-hidden transition-transform active:scale-95 border border-gray-200 dark:border-gray-700 hover:ring-2 hover:ring-primary-500/50 flex-shrink-0',
                'bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 font-semibold text-xs'
              )}
              aria-label="Buka Profil"
              title="Profil Pengguna"
            >
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={displayName}
                  className="w-full h-full object-cover"
                />
              ) : (
                initial
              )}
            </button>
          )}

          {onLogout && (
            <button
              onClick={onLogout}
              className={cn(
                'p-2 rounded-lg transition-colors',
                'text-gray-500 hover:text-danger hover:bg-danger-light/30',
                'dark:text-gray-400 dark:hover:text-red-400 dark:hover:bg-red-900/30'
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
