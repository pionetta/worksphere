import { NavLink } from 'react-router-dom'
import { cn } from '@/utils/cn'
import { Home, Users, Wallet, ListTodo } from 'lucide-react'

interface NavItem {
  to: string
  label: string
  icon: React.ReactNode
}

const navItems: NavItem[] = [
  { to: '/app', label: 'Beranda', icon: <Home className="w-5 h-5" /> },
  { to: '/app/attendance', label: 'Absensi', icon: <Users className="w-5 h-5" /> },
  { to: '/app/finance', label: 'Keuangan', icon: <Wallet className="w-5 h-5" /> },
  { to: '/app/todo', label: 'To-Do', icon: <ListTodo className="w-5 h-5" /> },
]

export function BottomNavigation() {
  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-30 glass border-t border-white/10 dark:border-gray-700/50 safe-area-bottom md:hidden"
      aria-label="Navigasi utama"
    >
      <div className="flex items-center justify-around h-16">
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/app'}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center justify-center gap-0.5 w-full h-full',
                'text-xs font-medium transition-colors',
                isActive
                  ? 'text-primary-500'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              )
            }
          >
            {({ isActive }) => (
              <>
                <span className="relative">
                  {item.icon}
                  {isActive && (
                    <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary-500" />
                  )}
                </span>
                <span>{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}

// Desktop sidebar navigation
export function SidebarNavigation() {
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
                  ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400'
                  : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700/50'
              )
            }
          >
            {item.icon}
            {item.label}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
