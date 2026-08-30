import { PriorityBadge } from './PriorityBadge'
import { Calendar, Circle, ArrowLeft, ArrowRight, Check, ListChecks, User } from 'lucide-react'
import { formatDate } from '@/utils/date'
import { cn } from '@/lib/utils'
import type { Task, TaskStatus, Subtask } from '@/types'

interface KanbanCardProps {
  task: Task
  subtasks?: Subtask[]
  assigneeName?: string
  onSelect: (task: Task) => void
  onChangeStatus: (id: string, status: TaskStatus) => void
}

export function KanbanCard({
  task,
  subtasks = [],
  assigneeName,
  onSelect,
  onChangeStatus,
}: KanbanCardProps) {
  const isCompleted = task.status === 'completed'
  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && !isCompleted

  // Subtask progress
  const totalSubtasks = subtasks.length
  const completedSubtasks = subtasks.filter(s => s.is_completed).length
  const subtaskPercent = totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('text/plain', task.id)
    e.dataTransfer.effectAllowed = 'move'
  }

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onClick={() => onSelect(task)}
      className={cn(
        'group relative p-3 rounded-2xl bg-white dark:bg-gray-800/90 border border-gray-200/80 dark:border-gray-700/80 shadow-xs hover:shadow-md transition-all duration-200 cursor-grab active:cursor-grabbing space-y-2.5 active:scale-[0.99]',
        isCompleted && 'opacity-75 bg-gray-50/80 dark:bg-gray-800/50'
      )}
    >
      {/* Top row: Priority, Timeframe & Category */}
      <div className="flex items-center justify-between gap-1.5 flex-wrap">
        <div className="flex items-center gap-1.5 flex-wrap">
          <PriorityBadge priority={task.priority} />
          {task.timeframe && task.timeframe !== 'daily' && (
            <span
              className={cn(
                'text-[10px] font-bold px-1.5 py-0.5 rounded-md border',
                task.timeframe === 'weekly'
                  ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20'
                  : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
              )}
            >
              {task.timeframe === 'weekly' ? 'Mingguan' : 'Tahunan'}
            </span>
          )}
          {assigneeName && (
            <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 px-1.5 py-0.5 rounded-md">
              <User className="w-2.5 h-2.5" />
              <span className="truncate max-w-[80px]">{assigneeName}</span>
            </span>
          )}
        </div>
        {task.category && (
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 truncate max-w-[110px]">
            {task.category}
          </span>
        )}
      </div>

      {/* Task Title & Description */}
      <div>
        <h4 className={cn(
          'text-xs sm:text-sm font-bold text-gray-900 dark:text-gray-100 leading-snug line-clamp-2',
          isCompleted && 'line-through text-gray-500 dark:text-gray-400'
        )}>
          {task.title}
        </h4>
        {task.description && (
          <p className="text-[11px] text-gray-500 dark:text-gray-400 line-clamp-2 mt-1">
            {task.description}
          </p>
        )}
      </div>

      {/* Subtasks Progress Bar (if any) */}
      {totalSubtasks > 0 && (
        <div className="space-y-1 pt-0.5">
          <div className="flex items-center justify-between text-[10px] text-gray-500 dark:text-gray-400 font-medium">
            <span className="flex items-center gap-1">
              <ListChecks className="w-3 h-3 text-primary-500" />
              <span>Sub-tugas</span>
            </span>
            <span>{completedSubtasks}/{totalSubtasks} ({subtaskPercent}%)</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden">
            <div
              className={cn(
                'h-full rounded-full transition-all duration-300',
                subtaskPercent === 100 ? 'bg-emerald-500' : 'bg-primary-500'
              )}
              style={{ width: `${subtaskPercent}%` }}
            />
          </div>
        </div>
      )}

      {/* Bottom Row: Due date & Quick Move buttons */}
      <div className="flex items-center justify-between pt-1 border-t border-gray-100 dark:border-gray-700/60">
        {task.due_date ? (
          <span className={cn(
            'text-[10px] flex items-center gap-1 font-medium',
            isOverdue
              ? 'text-rose-600 dark:text-rose-400 font-bold'
              : 'text-gray-500 dark:text-gray-400'
          )}>
            <Calendar className="w-3 h-3" />
            {formatDate(task.due_date)}
          </span>
        ) : (
          <span className="text-[10px] text-gray-400">Tanpa batas</span>
        )}

        {/* Touch-friendly Quick Move buttons */}
        <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
          {task.status === 'in_progress' && (
            <button
              type="button"
              onClick={() => onChangeStatus(task.id, 'todo')}
              className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors"
              title="Pindahkan ke Belum Dimulai"
              aria-label="Pindahkan ke Belum Dimulai"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>
          )}

          {task.status === 'todo' && (
            <button
              type="button"
              onClick={() => onChangeStatus(task.id, 'in_progress')}
              className="p-1 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-950/40 text-amber-600 dark:text-amber-400 transition-colors"
              title="Mulai Kerjakan"
              aria-label="Mulai Kerjakan"
            >
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}

          {task.status !== 'completed' ? (
            <button
              type="button"
              onClick={() => onChangeStatus(task.id, 'completed')}
              className="p-1 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 transition-colors"
              title="Tandai Selesai"
              aria-label="Tandai Selesai"
            >
              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onChangeStatus(task.id, 'in_progress')}
              className="p-1 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/40 text-blue-600 dark:text-blue-400 transition-colors"
              title="Buka Kembali"
              aria-label="Buka Kembali"
            >
              <Circle className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
