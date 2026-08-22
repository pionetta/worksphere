import { useEffect, useRef } from 'react'
import { UserCheck, TrendingUp, TrendingDown, ArrowLeftRight, ListTodo } from 'lucide-react'
import { cn } from '@/utils/cn'

export type QuickActionType = 'attendance' | 'income' | 'expense' | 'transfer' | 'task'

interface QuickActionItem {
  type: QuickActionType
  label: string
  icon: React.ElementType
  color: string
  bg: string
}

const quickActions: QuickActionItem[] = [
  {
    type: 'attendance',
    label: 'Absensi',
    icon: UserCheck,
    color: 'text-success',
    bg: 'bg-success-light dark:bg-green-900/30',
  },
  {
    type: 'income',
    label: 'Pemasukan',
    icon: TrendingUp,
    color: 'text-success',
    bg: 'bg-success-light dark:bg-green-900/30',
  },
  {
    type: 'expense',
    label: 'Pengeluaran',
    icon: TrendingDown,
    color: 'text-danger',
    bg: 'bg-danger-light dark:bg-red-900/30',
  },
  {
    type: 'transfer',
    label: 'Transfer',
    icon: ArrowLeftRight,
    color: 'text-primary-500',
    bg: 'bg-primary-50 dark:bg-primary-900/30',
  },
  {
    type: 'task',
    label: 'Task',
    icon: ListTodo,
    color: 'text-warning',
    bg: 'bg-warning-light dark:bg-amber-900/30',
  },
]

interface QuickActionMenuProps {
  open: boolean
  onSelect: (type: QuickActionType) => void
  onClose: () => void
}

export function QuickActionMenu({ open, onSelect, onClose }: QuickActionMenuProps) {
  const previousFocusRef = useRef<HTMLElement | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (open) {
      previousFocusRef.current = document.activeElement as HTMLElement
    }
  }, [open])

  // Return focus on close
  useEffect(() => {
    if (!open && previousFocusRef.current) {
      previousFocusRef.current.focus()
      previousFocusRef.current = null
    }
  }, [open])

  // Escape key
  useEffect(() => {
    if (!open) return
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      }
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [open, onClose])

  // Focus trap within the menu
  useEffect(() => {
    if (!open) return
    function handleTab(e: KeyboardEvent) {
      if (e.key !== 'Tab') return
      const container = menuRef.current
      if (!container) return
      const focusable = container.querySelectorAll<HTMLElement>('button')
      if (focusable.length === 0) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault()
          last.focus()
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }
    document.addEventListener('keydown', handleTab)
    return () => document.removeEventListener('keydown', handleTab)
  }, [open])

  // Focus first item on open
  useEffect(() => {
    if (!open) return
    const timer = setTimeout(() => {
      const first = menuRef.current?.querySelector<HTMLElement>('button')
      first?.focus()
    }, 50)
    return () => clearTimeout(timer)
  }, [open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-30" onClick={onClose}>
      <div className="absolute inset-0 bg-black/20 dark:bg-black/40" />
      <div
        ref={menuRef}
        role="menu"
        aria-label="Aksi cepat"
        className={cn(
          'fixed z-40',
          'bottom-40 right-4 sm:bottom-28 sm:right-6',
          'flex flex-col gap-2 items-end'
        )}
      >
        {quickActions.map((action, index) => (
          <button
            key={action.type}
            role="menuitem"
            onClick={e => {
              e.stopPropagation()
              onSelect(action.type)
            }}
            className={cn(
              'flex items-center gap-3',
              'pl-4 pr-3 py-2.5 rounded-full',
              'bg-white dark:bg-gray-800',
              'shadow-lg hover:shadow-xl',
              'transition-all duration-200',
              'hover:scale-105 active:scale-95',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
              'animate-[slideUp_0.15s_ease-out]'
            )}
            style={{ animationDelay: `${index * 50}ms` }}
            aria-label={`Tambah ${action.label}`}
          >
            <span className="text-sm font-medium text-gray-700 dark:text-gray-200 whitespace-nowrap">
              {action.label}
            </span>
            <div className={cn('p-2 rounded-full', action.bg)}>
              <action.icon className={cn('w-4 h-4', action.color)} />
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
