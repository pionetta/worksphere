import { cn } from '@/utils/cn'

interface LoadingStateProps {
  text?: string
  className?: string
  variant?: 'card' | 'list' | 'detail'
}

export function LoadingState({
  text = 'Memuat...',
  className,
  variant = 'card',
}: LoadingStateProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn('w-full space-y-3 py-2 animate-fade-in', className)}
    >
      <span className="sr-only">{text}</span>

      {variant === 'card' && (
        <div className="space-y-3">
          {/* Skeleton Card 1 */}
          <div className="rounded-[24px] bg-white/75 dark:bg-gray-800/75 p-5 border border-white/80 dark:border-gray-700/50 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-24 h-4 rounded-full bg-gray-200/80 dark:bg-gray-700/70 animate-pulse" />
              <div className="w-12 h-4 rounded-full bg-gray-200/80 dark:bg-gray-700/70 animate-pulse" />
            </div>
            <div className="w-36 h-7 rounded-xl bg-gray-200/80 dark:bg-gray-700/70 animate-pulse" />
            <div className="w-full h-2 rounded-full bg-gray-100 dark:bg-gray-700/50 overflow-hidden">
              <div className="w-2/3 h-full rounded-full bg-gray-200 dark:bg-gray-600 animate-pulse" />
            </div>
          </div>

          {/* Skeleton List Items */}
          <div className="rounded-[24px] bg-white/75 dark:bg-gray-800/75 p-4 border border-white/80 dark:border-gray-700/50 shadow-xs space-y-2.5">
            {[1, 2, 3].map(i => (
              <div
                key={i}
                className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50/80 dark:bg-gray-900/40 border border-gray-100 dark:border-gray-800"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-gray-200/80 dark:bg-gray-700/70 animate-pulse shrink-0" />
                  <div className="space-y-1.5">
                    <div className="w-28 h-3.5 rounded-full bg-gray-200/80 dark:bg-gray-700/70 animate-pulse" />
                    <div className="w-16 h-2.5 rounded-full bg-gray-200/60 dark:bg-gray-700/50 animate-pulse" />
                  </div>
                </div>
                <div className="w-14 h-4 rounded-full bg-gray-200/80 dark:bg-gray-700/70 animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
