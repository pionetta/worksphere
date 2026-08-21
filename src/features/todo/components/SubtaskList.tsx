import { useState } from 'react'
import { SubtaskItem } from './SubtaskItem'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import type { Subtask } from '@/types'
import { Plus } from 'lucide-react'

interface SubtaskListProps {
  subtasks: Subtask[]
  userId: string
  onAdd: (userId: string, title: string) => Promise<void>
  onToggle: (id: string) => Promise<void>
  onDelete: (id: string) => Promise<void>
  onEdit?: (id: string, data: { title: string }) => Promise<void>
}

export function SubtaskList({
  subtasks,
  userId,
  onAdd,
  onToggle,
  onDelete,
  onEdit,
}: SubtaskListProps) {
  const [newTitle, setNewTitle] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingTitle, setEditingTitle] = useState('')
  const [loading, setLoading] = useState(false)

  const handleAdd = async () => {
    if (!newTitle.trim()) return
    setLoading(true)
    try {
      await onAdd(userId, newTitle.trim())
      setNewTitle('')
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAdd()
    }
  }

  const handleEdit = (id: string, title: string) => {
    setEditingId(id)
    setEditingTitle(title)
  }

  const handleSaveEdit = async () => {
    if (!editingId || !editingTitle.trim() || !onEdit) return
    await onEdit(editingId, { title: editingTitle.trim() })
    setEditingId(null)
    setEditingTitle('')
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditingTitle('')
  }

  const sorted = [...subtasks].sort((a, b) => a.position - b.position)

  return (
    <div className="space-y-1">
      {sorted.map(subtask => (
        <div key={subtask.id}>
          {editingId === subtask.id ? (
            <div className="flex items-center gap-2 py-1 px-3">
              <Input
                value={editingTitle}
                onChange={e => setEditingTitle(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleSaveEdit()
                  }
                  if (e.key === 'Escape') handleCancelEdit()
                }}
                className="text-sm"
                autoFocus
              />
              <Button size="sm" onClick={handleSaveEdit}>
                Simpan
              </Button>
              <Button size="sm" variant="ghost" onClick={handleCancelEdit}>
                Batal
              </Button>
            </div>
          ) : (
            <SubtaskItem
              subtask={subtask}
              onToggle={onToggle}
              onDelete={onDelete}
              onEdit={handleEdit}
            />
          )}
        </div>
      ))}

      <div className="flex items-center gap-2 pt-2">
        <Input
          value={newTitle}
          onChange={e => setNewTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Tambah subtask..."
          className="text-sm"
        />
        <Button
          size="sm"
          variant="ghost"
          onClick={handleAdd}
          loading={loading}
          disabled={!newTitle.trim()}
          icon={<Plus className="w-4 h-4" />}
        >
          <span className="sr-only">Tambah</span>
        </Button>
      </div>
    </div>
  )
}
