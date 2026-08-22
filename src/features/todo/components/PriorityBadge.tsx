import { Badge } from '@/components/ui/Badge'
import type { TaskPriority } from '@/types'
import { cn } from '@/lib/utils'

interface PriorityBadgeProps {
  priority: TaskPriority
  className?: string
}

const priorityConfig: Record<
  TaskPriority,
  { label: string; variant: 'danger' | 'warning' | 'info' | 'default'; dotColor: string }
> = {
  urgent: { label: 'Mendesak', variant: 'danger', dotColor: 'bg-rose-500' },
  high: { label: 'Tinggi', variant: 'warning', dotColor: 'bg-amber-500' },
  medium: { label: 'Sedang', variant: 'info', dotColor: 'bg-blue-500' },
  low: { label: 'Rendah', variant: 'default', dotColor: 'bg-gray-400' },
}

export function PriorityBadge({ priority, className }: PriorityBadgeProps) {
  const config = priorityConfig[priority]
  return (
    <Badge variant={config.variant} className={cn('inline-flex items-center gap-1.5', className)}>
      <span className={cn('w-1.5 h-1.5 rounded-full', config.dotColor)} />
      {config.label}
    </Badge>
  )
}
