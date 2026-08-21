import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { cn } from '@/utils/cn'
import { formatDeadline, formatOverdue } from '@/utils/date'
import { isOverdue } from '@/features/todo/services/taskService'
import { getSubtaskProgress } from '@/features/todo/services/subtaskService'
import type { Task, TaskStatus, TaskPriority, Subtask } from '@/types'
import {
  AlertTriangle,
  Clock,
  CalendarDays,
  CheckCircle2,
  Circle,
  PlayCircle,
  XCircle,
} from 'lucide-react'

interface TaskCardProps {
  task: Task
  subtasks?: Subtask[]
  onClick?: () => void
  onStatusChange?: (status: TaskStatus) => void
}

const statusIcons: Record<TaskStatus, typeof Circle> = {
  todo: Circle,
  in_progress: PlayCircle,
  completed: CheckCircle2,
  cancelled: XCircle,
}

const statusLabels: Record<TaskStatus, string> = {
  todo: 'Todo',
  in_progress: 'Sedang Dikerjakan',
  completed: 'Selesai',
  cancelled: 'Dibatalkan',
}

const statusBadge: Record<TaskStatus, 'default' | 'info' | 'success' | 'warning'> = {
  todo: 'default',
  in_progress: 'info',
  completed: 'success',
  cancelled: 'warning',
}

const priorityLabels: Record<TaskPriority, string> = {
  urgent: 'Mendesak',
  high: 'Tinggi',
  medium: 'Sedang',
  low: 'Rendah',
}

const priorityBadge: Record<TaskPriority, 'danger' | 'warning' | 'info' | 'default'> = {
  urgent: 'danger',
  high: 'warning',
  medium: 'info',
  low: 'default',
}

export function TaskCard({ task, subtasks = [], onClick, onStatusChange }: TaskCardProps) {
  const StatusIcon = statusIcons[task.status]
  const overdue = isOverdue(task)
  const progress = getSubtaskProgress(subtasks)

  const handleStatusToggle = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!onStatusChange) return
    if (task.status === 'completed') {
      onStatusChange('todo')
    } else if (task.status === 'todo') {
      onStatusChange('in_progress')
    } else if (task.status === 'in_progress') {
      onStatusChange('completed')
    } else {
      onStatusChange('todo')
    }
  }

  return (
    <Card
      className={cn(
        'cursor-pointer transition-all hover:shadow-md',
        overdue && 'border-l-4 border-l-danger',
        task.status === 'completed' && 'opacity-60'
      )}
      onClick={onClick}
    >
      <div className="flex items-start gap-3">
        <button
          onClick={handleStatusToggle}
          className="mt-0.5 shrink-0 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded"
          aria-label={`Ubah status: ${statusLabels[task.status]}`}
        >
          <StatusIcon
            className={cn(
              'w-5 h-5',
              task.status === 'completed'
                ? 'text-success'
                : task.status === 'in_progress'
                  ? 'text-blue-500'
                  : 'text-gray-400 dark:text-gray-500'
            )}
          />
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3
              className={cn(
                'text-sm font-medium text-gray-900 dark:text-gray-100',
                task.status === 'completed' && 'line-through text-gray-500 dark:text-gray-400'
              )}
            >
              {task.title}
            </h3>
            <Badge variant={priorityBadge[task.priority]}>{priorityLabels[task.priority]}</Badge>
            <Badge variant={statusBadge[task.status]}>{statusLabels[task.status]}</Badge>
          </div>

          {task.description && (
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
              {task.description}
            </p>
          )}

          <div className="mt-2 flex items-center gap-3 flex-wrap">
            {task.category && (
              <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full">
                {task.category}
              </span>
            )}

            {task.due_date && (
              <span
                className={cn(
                  'flex items-center gap-1 text-xs',
                  overdue ? 'text-danger font-medium' : 'text-gray-500 dark:text-gray-400'
                )}
              >
                <CalendarDays className="w-3 h-3" />
                {overdue ? formatOverdue(task.due_date) : formatDeadline(task.due_date)}
              </span>
            )}

            {task.reminder_at && (
              <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                <Clock className="w-3 h-3" />
                Pengingat aktif
              </span>
            )}

            {progress.total > 0 && (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {progress.completed}/{progress.total} selesai
              </span>
            )}
          </div>
        </div>

        {overdue && (
          <AlertTriangle className="w-4 h-4 text-danger shrink-0 mt-1" aria-label="Terlambat" />
        )}
      </div>
    </Card>
  )
}
