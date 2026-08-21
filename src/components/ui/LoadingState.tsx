import { cn } from '@/utils/cn'
import { Loader2 } from 'lucide-react'

interface LoadingStateProps {
  text?: string
  className?: string
}

export function LoadingState({ text = 'Memuat...', className }: LoadingStateProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn('flex flex-col items-center justify-center py-12 gap-3', className)}
    >
      <Loader2 className="h-6 w-6 animate-spin text-primary-500" />
      <p className="text-sm text-gray-500 dark:text-gray-400">{text}</p>
    </div>
  )
}
