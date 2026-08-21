import { cn } from '@/utils/cn'
import type { TaskStatus } from '@/types'
import { Circle, PlayCircle, CheckCircle2, XCircle } from 'lucide-react'

interface TaskStatusSelectorProps {
  value: TaskStatus
  onChange: (status: TaskStatus) => void
  size?: 'sm' | 'md'
}

const statusConfig: Record<
  TaskStatus,
  { label: string; icon: typeof Circle; activeClass: string }
> = {
  todo: {
    label: 'Todo',
    icon: Circle,
    activeClass: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300',
  },
  in_progress: {
    label: 'Sedang Dikerjakan',
    icon: PlayCircle,
    activeClass: 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
  },
  completed: {
    label: 'Selesai',
    icon: CheckCircle2,
    activeClass: 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400',
  },
  cancelled: {
    label: 'Dibatalkan',
    icon: XCircle,
    activeClass: 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',
  },
}

export function TaskStatusSelector({ value, onChange, size = 'md' }: TaskStatusSelectorProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {(Object.keys(statusConfig) as TaskStatus[]).map(status => {
        const config = statusConfig[status]
        const Icon = config.icon
        const isActive = value === status
        return (
          <button
            key={status}
            type="button"
            onClick={() => onChange(status)}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full border font-medium transition-colors',
              'focus:outline-none focus:ring-2 focus:ring-primary-500',
              size === 'sm' ? 'px-2 py-1 text-xs' : 'px-3 py-1.5 text-sm',
              isActive
                ? `${config.activeClass} border-transparent`
                : 'border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
            )}
          >
            <Icon className={size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} />
            {config.label}
          </button>
        )
      })}
    </div>
  )
}
