import { useState } from 'react'
import { KanbanCard } from './KanbanCard'
import { Plus, Circle, Clock, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Task, TaskStatus, Subtask } from '@/types'

interface KanbanBoardProps {
  tasks: Task[]
  subtasksMap: Map<string, Subtask[]>
  onSelectTask: (task: Task) => void
  onChangeStatus: (id: string, status: TaskStatus) => void
  onAddTask?: (defaultStatus?: TaskStatus) => void
}

interface ColumnConfig {
  id: TaskStatus
  title: string
  icon: typeof Circle
  badgeColor: string
  bgHover: string
  headerBg: string
}

const COLUMNS: ColumnConfig[] = [
  {
    id: 'todo',
    title: 'Belum Dimulai',
    icon: Circle,
    badgeColor: 'bg-blue-500/15 text-[#2563EB] dark:text-blue-400',
    bgHover: 'border-blue-500/50 bg-blue-50/20 dark:bg-blue-950/10',
    headerBg: 'bg-blue-50/80 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300',
  },
  {
    id: 'in_progress',
    title: 'Sedang Dikerjakan',
    icon: Clock,
    badgeColor: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
    bgHover: 'border-amber-500/50 bg-amber-50/20 dark:bg-amber-950/10',
    headerBg: 'bg-amber-50/80 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300',
  },
  {
    id: 'completed',
    title: 'Selesai',
    icon: CheckCircle2,
    badgeColor: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
    bgHover: 'border-emerald-500/50 bg-emerald-50/20 dark:bg-emerald-950/10',
    headerBg: 'bg-emerald-50/80 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300',
  },
]

export function KanbanBoard({
  tasks,
  subtasksMap,
  onSelectTask,
  onChangeStatus,
  onAddTask,
}: KanbanBoardProps) {
  const [dragOverCol, setDragOverCol] = useState<TaskStatus | null>(null)

  const handleDragOver = (e: React.DragEvent, colId: TaskStatus) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    if (dragOverCol !== colId) {
      setDragOverCol(colId)
    }
  }

  const handleDragLeave = (colId: TaskStatus) => {
    if (dragOverCol === colId) {
      setDragOverCol(null)
    }
  }

  const handleDrop = (e: React.DragEvent, targetStatus: TaskStatus) => {
    e.preventDefault()
    setDragOverCol(null)
    const taskId = e.dataTransfer.getData('text/plain')
    if (taskId) {
      onChangeStatus(taskId, targetStatus)
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 overflow-x-auto pb-4 pt-1 snap-x snap-mandatory">
      {COLUMNS.map(col => {
        const colTasks = tasks.filter(t => t.status === col.id)
        const isDraggingOver = dragOverCol === col.id
        const Icon = col.icon

        return (
          <div
            key={col.id}
            onDragOver={e => handleDragOver(e, col.id)}
            onDragLeave={() => handleDragLeave(col.id)}
            onDrop={e => handleDrop(e, col.id)}
            className={cn(
              'flex flex-col min-w-[280px] sm:min-w-[300px] rounded-[24px] bg-white/70 dark:bg-gray-800/60 backdrop-blur-md border border-white/80 dark:border-gray-700/60 p-3 sm:p-4 shadow-sm transition-all duration-200 snap-center min-h-[420px]',
              isDraggingOver && col.bgHover
            )}
          >
            {/* Column Header */}
            <div className="flex items-center justify-between pb-3 mb-2 border-b border-gray-100 dark:border-gray-700/60">
              <div className="flex items-center gap-2">
                <span className={cn('p-1.5 rounded-xl', col.headerBg)}>
                  <Icon className="w-4 h-4" />
                </span>
                <h3 className="text-xs sm:text-sm font-extrabold text-gray-900 dark:text-gray-100">
                  {col.title}
                </h3>
              </div>
              <div className="flex items-center gap-1.5">
                <span className={cn('text-xs font-black px-2 py-0.5 rounded-full', col.badgeColor)}>
                  {colTasks.length}
                </span>
                {onAddTask && (
                  <button
                    type="button"
                    onClick={() => onAddTask(col.id)}
                    className="p-1 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700/60 transition-colors"
                    title={`Tambah tugas ${col.title}`}
                    aria-label={`Tambah tugas ${col.title}`}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Column Cards Container */}
            <div className="flex-1 space-y-2.5 overflow-y-auto max-h-[60vh] pr-0.5">
              {colTasks.length === 0 ? (
                <div className="h-32 flex flex-col items-center justify-center border-2 border-dashed border-gray-200 dark:border-gray-700/80 rounded-2xl p-4 text-center">
                  <p className="text-xs font-semibold text-gray-400 dark:text-gray-500">
                    Tidak ada tugas
                  </p>
                  <p className="text-[10px] text-gray-400/80 dark:text-gray-500/80 mt-0.5">
                    Tarik tugas ke sini
                  </p>
                </div>
              ) : (
                colTasks.map(task => (
                  <KanbanCard
                    key={task.id}
                    task={task}
                    subtasks={subtasksMap.get(task.id) || []}
                    onSelect={onSelectTask}
                    onChangeStatus={onChangeStatus}
                  />
                ))
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
