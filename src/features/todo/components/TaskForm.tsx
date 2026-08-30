import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { cn } from '@/lib/utils'
import { Sun, Calendar, Target } from 'lucide-react'
import type { TaskPriority, TaskTimeframe, WorkspaceMember } from '@/types'

interface TaskFormProps {
  initialTitle?: string
  initialDescription?: string
  initialPriority?: TaskPriority
  initialTimeframe?: TaskTimeframe
  initialCategory?: string
  initialDueDate?: string
  initialReminderAt?: string
  initialAssigneeId?: string | null
  workspaceMembers?: WorkspaceMember[]
  categories?: string[]
  onSubmit: (data: {
    title: string
    description?: string
    priority: TaskPriority
    timeframe?: TaskTimeframe
    category?: string
    dueDate?: string
    reminderAt?: string
    assigneeId?: string | null
  }) => Promise<void>
  onCancel?: () => void
  submitLabel?: string
}

export function TaskForm({
  initialTitle = '',
  initialDescription = '',
  initialPriority = 'medium',
  initialTimeframe = 'daily',
  initialCategory = '',
  initialDueDate = '',
  initialReminderAt = '',
  initialAssigneeId = null,
  workspaceMembers = [],
  categories = [],
  onSubmit,
  onCancel,
  submitLabel = 'Simpan',
}: TaskFormProps) {
  const [title, setTitle] = useState(initialTitle)
  const [description, setDescription] = useState(initialDescription)
  const [priority, setPriority] = useState<TaskPriority>(initialPriority)
  const [timeframe, setTimeframe] = useState<TaskTimeframe>(initialTimeframe)
  const [category, setCategory] = useState(initialCategory)
  const [dueDate, setDueDate] = useState(initialDueDate)
  const [reminderAt, setReminderAt] = useState(initialReminderAt)
  const [assigneeId, setAssigneeId] = useState<string | null>(initialAssigneeId)
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
        timeframe,
        category: category.trim() || undefined,
        dueDate: dueDate || undefined,
        reminderAt: reminderAt || undefined,
        assigneeId: assigneeId || undefined,
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
        {/* Timeframe Scope Selector */}
        <div>
          <label className="block text-xs sm:text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">
            Cakupan Waktu Tugas
          </label>
          <div className="grid grid-cols-3 gap-1.5 p-1 bg-gray-100 dark:bg-gray-800 rounded-2xl border border-gray-200/80 dark:border-gray-700/80">
            {(
              [
                { value: 'daily', label: 'Harian', icon: Sun },
                { value: 'weekly', label: 'Mingguan', icon: Calendar },
                { value: 'yearly', label: 'Tahunan', icon: Target },
              ] as const
            ).map(tf => {
              const Icon = tf.icon
              const isSelected = timeframe === tf.value
              return (
                <button
                  key={tf.value}
                  type="button"
                  onClick={() => setTimeframe(tf.value)}
                  className={cn(
                    'py-2 px-2 rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer',
                    isSelected
                      ? 'bg-[#2563EB] text-white shadow-xs'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                  )}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tf.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        <Input
          label="Judul Tugas"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Masukkan judul tugas..."
          error={error && !title.trim() ? error : undefined}
          required
        />

        {/* Assignee Selector (Team Workspace) */}
        {workspaceMembers.length > 0 && (
          <div>
            <label className="block text-xs sm:text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">
              Penugasan Anggota Tim (Assignee)
            </label>
            <select
              value={assigneeId || ''}
              onChange={e => setAssigneeId(e.target.value || null)}
              className="block w-full px-3 py-2.5 text-sm rounded-xl bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors cursor-pointer"
            >
              <option value="">Belum Ditugaskan (Umum)</option>
              {workspaceMembers.map(m => (
                <option key={m.id} value={m.user_id || m.id}>
                  {m.invited_email || 'Anggota Tim'} ({m.role})
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="w-full">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Deskripsi
          </label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Tambahkan deskripsi (opsional)..."
            rows={3}
            className="block w-full px-3 py-2.5 text-sm rounded-xl bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors resize-none font-normal"
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
              className="block w-full px-3 py-2.5 text-sm rounded-xl bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors cursor-pointer"
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
            type="datetime-local"
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
