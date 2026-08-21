import { TaskCard } from './TaskCard'
import { EmptyState } from '@/components/ui/EmptyState'
import type { Task, TaskStatus, Subtask } from '@/types'
import { ListTodo } from 'lucide-react'

interface TaskListProps {
  tasks: Task[]
  subtasksMap?: Map<string, Subtask[]>
  onTaskClick?: (task: Task) => void
  onStatusChange?: (taskId: string, status: TaskStatus) => void
  emptyTitle?: string
  emptyDescription?: string
}

export function TaskList({
  tasks,
  subtasksMap = new Map(),
  onTaskClick,
  onStatusChange,
  emptyTitle = 'Belum ada tugas',
  emptyDescription = 'Tambahkan tugas untuk mulai mengatur pekerjaan Anda.',
}: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <EmptyState
        icon={<ListTodo className="w-6 h-6 text-gray-400" />}
        title={emptyTitle}
        description={emptyDescription}
      />
    )
  }

  return (
    <div className="space-y-2">
      {tasks.map(task => (
        <TaskCard
          key={task.id}
          task={task}
          subtasks={subtasksMap.get(task.id)}
          onClick={() => onTaskClick?.(task)}
          onStatusChange={status => onStatusChange?.(task.id, status)}
        />
      ))}
    </div>
  )
}
