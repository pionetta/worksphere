import { Badge } from '@/components/ui/Badge'
import type { TaskPriority } from '@/types'

interface PriorityBadgeProps {
  priority: TaskPriority
}

const priorityConfig: Record<
  TaskPriority,
  { label: string; variant: 'danger' | 'warning' | 'info' | 'default' }
> = {
  urgent: { label: 'Mendesak', variant: 'danger' },
  high: { label: 'Tinggi', variant: 'warning' },
  medium: { label: 'Sedang', variant: 'info' },
  low: { label: 'Rendah', variant: 'default' },
}

export function PriorityBadge({ priority }: PriorityBadgeProps) {
  const config = priorityConfig[priority]
  return <Badge variant={config.variant}>{config.label}</Badge>
}
