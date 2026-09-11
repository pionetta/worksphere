import { TaskCard } from './TaskCard'
import type { Task, TaskStatus, Subtask } from '@/types'
import { CheckCircle2, Plus } from 'lucide-react'

interface TaskListProps {
  tasks: Task[]
  subtasksMap?: Map<string, Subtask[]>
  assigneeMap?: Map<string, string>
  onTaskClick?: (task: Task) => void
  onStatusChange?: (taskId: string, status: TaskStatus) => void
  emptyTitle?: string
  emptyDescription?: string
  onAddTask?: () => void
}

export function TaskList({
  tasks,
  subtasksMap = new Map(),
  assigneeMap = new Map(),
  onTaskClick,
  onStatusChange,
  emptyTitle = 'Belum ada tugas',
  emptyDescription = 'Tambahkan tugas untuk mulai mengatur pekerjaan Anda.',
  onAddTask,
}: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <div className="py-12 px-4 flex flex-col items-center justify-center text-center animate-fade-in-up">
        {/* Embossed Soft-Neumorphic Squircle Badge */}
        <div className="w-20 h-20 rounded-[28px] bg-[#EBF0F7] dark:bg-slate-800/90 border border-white dark:border-white/10 shadow-[6px_6px_16px_rgba(163,177,198,0.6),-6px_-6px_16px_rgba(255,255,255,0.9)] dark:shadow-[6px_6px_16px_rgba(0,0,0,0.6),-6px_-6px_16px_rgba(255,255,255,0.06)] flex items-center justify-center mb-4.5 transition-all duration-300 hover:scale-105">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50/90 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-[inset_2px_2px_5px_rgba(0,0,0,0.06),inset_-2px_-2px_5px_rgba(255,255,255,0.8)] dark:shadow-[inset_2px_2px_5px_rgba(0,0,0,0.3)] border border-indigo-100/60 dark:border-indigo-800/40">
            <CheckCircle2 className="w-6 h-6 stroke-[2]" />
          </div>
        </div>
        <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
          {emptyTitle}
        </h3>
        {emptyDescription && (
          <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400 max-w-xs leading-relaxed">
            {emptyDescription}
          </p>
        )}
        {onAddTask && (
          <button
            type="button"
            onClick={onAddTask}
            className="mt-5 inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-4 py-2 rounded-2xl shadow-sm active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Buat Tugas Baru</span>
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {tasks.map(task => (
        <TaskCard
          key={task.id}
          task={task}
          assigneeName={task.assignee_id ? assigneeMap.get(task.assignee_id) : undefined}
          subtasks={subtasksMap.get(task.id)}
          onClick={() => onTaskClick?.(task)}
          onStatusChange={status => onStatusChange?.(task.id, status)}
        />
      ))}
    </div>
  )
}
