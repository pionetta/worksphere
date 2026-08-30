import { useState, useEffect } from 'react'
import { BottomSheet } from '@/components/ui/BottomSheet'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Sparkles } from 'lucide-react'
import type { Habit } from '@/types'
import type { CreateHabitInput, UpdateHabitInput } from '../schemas/habitSchema'
import { cn } from '@/lib/utils'

interface HabitFormModalProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: CreateHabitInput) => Promise<void>
  onUpdate?: (id: string, data: UpdateHabitInput) => Promise<void>
  initialData?: Habit | null
}

const EMOJI_PRESETS = ['🎯', '💧', '🏃', '📚', '🧘', '💻', '🥗', '💊', '✍️', '🎸', '🛌', '🎨', '🚴', '💪', '☀️']
const COLOR_PRESETS = [
  '#4F46E5', // Indigo
  '#059669', // Emerald
  '#D97706', // Amber
  '#E11D48', // Rose
  '#0891B2', // Cyan
  '#7C3AED', // Violet
  '#DB2777', // Pink
]

export function HabitFormModal({
  open,
  onClose,
  onSubmit,
  onUpdate,
  initialData,
}: HabitFormModalProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [icon, setIcon] = useState('🎯')
  const [color, setColor] = useState('#4F46E5')
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'custom'>('daily')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title)
      setDescription(initialData.description || '')
      setIcon(initialData.icon || '🎯')
      setColor(initialData.color || '#4F46E5')
      setFrequency(initialData.frequency)
    } else {
      setTitle('')
      setDescription('')
      setIcon('🎯')
      setColor('#4F46E5')
      setFrequency('daily')
    }
    setError(null)
  }, [initialData, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!title.trim()) {
      setError('Judul kebiasaan wajib diisi')
      return
    }

    setLoading(true)
    try {
      if (initialData && onUpdate) {
        await onUpdate(initialData.id, {
          title: title.trim(),
          description: description.trim() || null,
          icon,
          color,
          frequency,
        })
      } else {
        await onSubmit({
          title: title.trim(),
          description: description.trim() || null,
          icon,
          color,
          frequency,
          target_days: [1, 2, 3, 4, 5, 6, 7],
          target_per_day: 1,
        })
      }
      onClose()
    } catch (err: any) {
      setError(err.message || 'Gagal menyimpan kebiasaan')
    } finally {
      setLoading(false)
    }
  }

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title={initialData ? 'Edit Kebiasaan' : 'Tambah Kebiasaan Baru'}
    >
      <form onSubmit={handleSubmit} className="space-y-4 py-2">
        {error && (
          <div className="p-3 rounded-xl bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 text-xs font-medium border border-rose-200 dark:border-rose-800">
            {error}
          </div>
        )}

        {/* Emoji & Color Preview Header */}
        <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-gray-50/80 dark:bg-gray-900/40 border border-gray-100 dark:border-gray-800/80">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-xs transition-all"
            style={{
              backgroundColor: `${color}18`,
              borderColor: `${color}40`,
              borderWidth: '1px',
            }}
          >
            <span>{icon}</span>
          </div>
          <div>
            <p className="text-xs font-bold text-gray-900 dark:text-white">
              {title || 'Nama Kebiasaan'}
            </p>
            <p className="text-[11px] text-gray-500 dark:text-gray-400">
              {frequency === 'daily' ? 'Setiap Hari' : 'Mingguan'}
            </p>
          </div>
        </div>

        {/* Title */}
        <div>
          <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
            Nama Kebiasaan <span className="text-rose-500">*</span>
          </label>
          <Input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Contoh: Olahraga 30 Menit, Minum Air 2L, Baca Buku"
            required
            autoFocus
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
            Deskripsi / Motivasi (Opsional)
          </label>
          <Input
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Contoh: Minimal 10 halaman sebelum tidur"
          />
        </div>

        {/* Emoji Selector */}
        <div>
          <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
            Pilih Ikon
          </label>
          <div className="flex flex-wrap gap-2">
            {EMOJI_PRESETS.map(em => (
              <button
                key={em}
                type="button"
                onClick={() => setIcon(em)}
                className={cn(
                  'w-9 h-9 rounded-xl flex items-center justify-center text-lg transition-all cursor-pointer select-none',
                  icon === em
                    ? 'bg-indigo-100 dark:bg-indigo-900/60 ring-2 ring-indigo-500 scale-110 shadow-xs'
                    : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
                )}
              >
                {em}
              </button>
            ))}
          </div>
        </div>

        {/* Color Selector */}
        <div>
          <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
            Pilih Warna Tema
          </label>
          <div className="flex items-center gap-3">
            {COLOR_PRESETS.map(c => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={cn(
                  'w-7 h-7 rounded-full transition-all cursor-pointer select-none',
                  color === c ? 'ring-2 ring-offset-2 ring-indigo-500 scale-110 shadow-sm' : 'opacity-80 hover:opacity-100'
                )}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>

        {/* Frequency */}
        <div>
          <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
            Frekuensi
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setFrequency('daily')}
              className={cn(
                'py-2.5 px-3 rounded-xl text-xs font-bold border transition-all text-center',
                frequency === 'daily'
                  ? 'border-indigo-600 bg-indigo-50/80 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 shadow-xs'
                  : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50'
              )}
            >
              Setiap Hari (Harian)
            </button>
            <button
              type="button"
              onClick={() => setFrequency('weekly')}
              className={cn(
                'py-2.5 px-3 rounded-xl text-xs font-bold border transition-all text-center',
                frequency === 'weekly'
                  ? 'border-indigo-600 bg-indigo-50/80 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 shadow-xs'
                  : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50'
              )}
            >
              Mingguan
            </button>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex items-center justify-end gap-2.5 pt-3">
          <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>
            Batal
          </Button>
          <Button type="submit" loading={loading} icon={<Sparkles className="w-4 h-4" />}>
            {initialData ? 'Simpan Perubahan' : 'Buat Kebiasaan'}
          </Button>
        </div>
      </form>
    </BottomSheet>
  )
}
