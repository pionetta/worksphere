import { cn } from '@/utils/cn'
import { AlertTriangle } from 'lucide-react'
import { Button } from './Button'

interface ErrorStateProps {
  message?: string
  onRetry?: () => void
  className?: string
}

export function ErrorState({ message = 'Terjadi kesalahan', onRetry, className }: ErrorStateProps) {
  return (
    <div
      role="alert"
      aria-live="assertive"
      className={cn('flex flex-col items-center justify-center py-12 px-4 text-center', className)}
    >
      <div className="w-12 h-12 rounded-full bg-danger-light dark:bg-red-900/30 flex items-center justify-center mb-4">
        <AlertTriangle className="w-6 h-6 text-danger" />
      </div>
      <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">{message}</h3>
      {onRetry && (
        <div className="mt-4">
          <Button variant="secondary" size="sm" onClick={onRetry}>
            Coba Lagi
          </Button>
        </div>
      )}
    </div>
  )
}
