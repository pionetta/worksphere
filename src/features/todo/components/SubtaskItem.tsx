import { cn } from '@/utils/cn'
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
        'flex items-center gap-2 py-2 px-3 rounded-lg group',
        'hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors'
      )}
    >
      <GripVertical className="w-4 h-4 text-gray-300 dark:text-gray-600 shrink-0 cursor-grab" />

      <button
        onClick={handleToggle}
        className="shrink-0 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded"
        aria-label={subtask.is_completed ? 'Tandai belum selesai' : 'Tandai selesai'}
      >
        {subtask.is_completed ? (
          <Check className="w-4 h-4 text-success" />
        ) : (
          <Square className="w-4 h-4 text-gray-400 dark:text-gray-500" />
        )}
      </button>

      <span
        className={cn(
          'flex-1 text-sm',
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
        className="shrink-0 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-danger transition-opacity focus:outline-none focus:ring-2 focus:ring-primary-500 rounded"
        aria-label="Hapus subtask"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}
