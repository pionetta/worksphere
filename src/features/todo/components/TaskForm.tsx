import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import type { TaskPriority } from '@/types'

interface TaskFormProps {
  initialTitle?: string
  initialDescription?: string
  initialPriority?: TaskPriority
  initialCategory?: string
  initialDueDate?: string
  initialReminderAt?: string
  categories?: string[]
  onSubmit: (data: {
    title: string
    description?: string
    priority: TaskPriority
    category?: string
    dueDate?: string
    reminderAt?: string
  }) => Promise<void>
  onCancel?: () => void
  submitLabel?: string
}

export function TaskForm({
  initialTitle = '',
  initialDescription = '',
  initialPriority = 'medium',
  initialCategory = '',
  initialDueDate = '',
  initialReminderAt = '',
  categories = [],
  onSubmit,
  onCancel,
  submitLabel = 'Simpan',
}: TaskFormProps) {
  const [title, setTitle] = useState(initialTitle)
  const [description, setDescription] = useState(initialDescription)
  const [priority, setPriority] = useState<TaskPriority>(initialPriority)
  const [category, setCategory] = useState(initialCategory)
  const [dueDate, setDueDate] = useState(initialDueDate)
  const [reminderAt, setReminderAt] = useState(initialReminderAt)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!title.trim()) {
      setError('Judul tugas wajib diisi.')
      return
    }

    setLoading(true)
    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim() || undefined,
        priority,
        category: category.trim() || undefined,
        dueDate: dueDate || undefined,
        reminderAt: reminderAt || undefined,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Judul Tugas"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Masukkan judul tugas..."
          error={error && !title.trim() ? error : undefined}
          required
        />

        <div className="w-full">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Deskripsi
          </label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Tambahkan deskripsi (opsional)..."
            rows={3}
            className="block w-full px-3 py-2.5 text-sm rounded-xl bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors resize-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Prioritas
            </label>
            <select
              value={priority}
              onChange={e => setPriority(e.target.value as TaskPriority)}
              className="block w-full px-3 py-2.5 text-sm rounded-xl bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
            >
              <option value="urgent">Mendesak</option>
              <option value="high">Tinggi</option>
              <option value="medium">Sedang</option>
              <option value="low">Rendah</option>
            </select>
          </div>

          <Input
            label="Kategori"
            value={category}
            onChange={e => setCategory(e.target.value)}
            placeholder="Opsional"
            list={categories.length > 0 ? 'category-list' : undefined}
          />
          {categories.length > 0 && (
            <datalist id="category-list">
              {categories.map(c => (
                <option key={c} value={c} />
              ))}
            </datalist>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Deadline"
            type="date"
            value={dueDate}
            onChange={e => setDueDate(e.target.value)}
          />

          <Input
            label="Pengingat"
            type="datetime-local"
            value={reminderAt}
            onChange={e => setReminderAt(e.target.value)}
          />
        </div>

        {error && title.trim() && <p className="text-xs text-danger">{error}</p>}

        <div className="flex items-center gap-2 justify-end">
          {onCancel && (
            <Button type="button" variant="ghost" onClick={onCancel}>
              Batal
            </Button>
          )}
          <Button type="submit" loading={loading}>
            {submitLabel}
          </Button>
        </div>
      </form>
    </Card>
  )
}
