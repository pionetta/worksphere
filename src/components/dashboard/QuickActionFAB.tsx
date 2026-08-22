import { Plus } from 'lucide-react'
import { cn } from '@/utils/cn'

interface QuickActionFABProps {
  onClick: () => void
  open?: boolean
}

export function QuickActionFAB({ onClick, open = false }: QuickActionFABProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'fixed z-40',
        'bottom-20 right-4 sm:bottom-6 sm:right-6',
        'w-14 h-14 rounded-full',
        'bg-primary-500 text-white',
        'hover:bg-primary-600 active:bg-primary-700',
        'shadow-lg hover:shadow-xl',
        'flex items-center justify-center',
        'transition-all duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
        'sm:bottom-6 sm:right-6',
        open && 'rotate-45 bg-danger hover:bg-danger/90'
      )}
      aria-label={open ? 'Tutup menu aksi cepat' : 'Buka menu aksi cepat'}
      aria-expanded={open}
    >
      <Plus
        className="w-6 h-6 transition-transform duration-200"
      />
    </button>
  )
}
