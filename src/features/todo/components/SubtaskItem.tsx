import { cn } from '@/lib/utils'
import type { Subtask } from '@/types'
import { GripVertical, Check, Square, Trash2 } from 'lucide-react'

interface SubtaskItemProps {
  subtask: Subtask
  onToggle: (id: string) => void
  onDelete: (id: string) => void
  onEdit?: (id: string, title: string) => void
}

export function SubtaskItem({ subtask, onToggle, onDelete, onEdit }: SubtaskItemProps) {
  const handleToggle = () => onToggle(subtask.id)
  const handleDelete = () => onDelete(subtask.id)

  return (
    <div
      className={cn(
        'flex items-center gap-2.5 py-2 px-3 rounded-xl group transition-all duration-200',
        'hover:bg-gray-50 dark:hover:bg-gray-800/50',
        subtask.is_completed && 'bg-gray-50/50 dark:bg-gray-800/30'
      )}
    >
      <GripVertical className="w-4 h-4 text-gray-300 dark:text-gray-600 shrink-0 cursor-grab" />

      <button
        onClick={handleToggle}
        className="shrink-0 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded p-0.5 cursor-pointer transition-transform active:scale-90"
        aria-label={subtask.is_completed ? 'Tandai belum selesai' : 'Tandai selesai'}
      >
        {subtask.is_completed ? (
          <div className="w-4 h-4 rounded bg-emerald-500 flex items-center justify-center text-white shadow-xs">
            <Check className="w-3 h-3 stroke-[3]" />
          </div>
        ) : (
          <Square className="w-4 h-4 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300" />
        )}
      </button>

      <span
        className={cn(
          'flex-1 text-sm transition-all duration-200',
          subtask.is_completed
            ? 'line-through text-gray-400 dark:text-gray-500'
            : 'text-gray-700 dark:text-gray-300'
        )}
        onClick={onEdit ? () => onEdit(subtask.id, subtask.title) : undefined}
      >
        {subtask.title}
      </span>

      <button
        onClick={handleDelete}
        className="shrink-0 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-danger hover:bg-danger-light/30 dark:hover:bg-red-900/30 p-1 rounded-md transition-all focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer"
        aria-label="Hapus subtask"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}
