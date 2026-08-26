import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { cn } from '@/lib/utils'
import { Trophy, FileText, Star, PartyPopper, Lightbulb, Sparkles, Target } from 'lucide-react'
import type { JournalEntry, JournalPeriod, JournalType } from '@/types'

interface JournalFormProps {
  initialData?: JournalEntry
  onSubmit: (data: {
    title: string
    content: string
    type?: JournalType
    period?: JournalPeriod
    category?: string
    icon_tag?: string
    entry_date?: string
  }) => Promise<void>
  onCancel: () => void
  submitLabel?: string
}

const iconsList = [
  { id: 'trophy', label: 'Piala', icon: Trophy },
  { id: 'party', label: 'Perayaan', icon: PartyPopper },
  { id: 'star', label: 'Bintang', icon: Star },
  { id: 'lightbulb', label: 'Ide', icon: Lightbulb },
  { id: 'sparkles', label: 'Kilau', icon: Sparkles },
  { id: 'target', label: 'Target', icon: Target },
]

export function JournalForm({
  initialData,
  onSubmit,
  onCancel,
  submitLabel = 'Simpan Jurnal',
}: JournalFormProps) {
  const [type, setType] = useState<JournalType>(initialData?.type ?? 'note')
  const [period, setPeriod] = useState<JournalPeriod>(initialData?.period ?? 'daily')
  const [title, setTitle] = useState(initialData?.title ?? '')
  const [content, setContent] = useState(initialData?.content ?? '')
  const [category, setCategory] = useState(initialData?.category ?? 'work')
  const [iconTag, setIconTag] = useState(initialData?.icon_tag ?? 'trophy')
  const [entryDate, setEntryDate] = useState(
    initialData?.entry_date ?? new Date().toISOString().split('T')[0]
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!title.trim()) {
      setError('Judul catatan/pencapaian wajib diisi.')
      return
    }
    if (!content.trim()) {
      setError('Isi catatan/refleksi wajib diisi.')
      return
    }

    setLoading(true)
    try {
      await onSubmit({
        title: title.trim(),
        content: content.trim(),
        type,
        period,
        category,
        icon_tag: iconTag,
        entry_date: entryDate,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menyimpan catatan.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3.5">
      {/* Type Switcher: Catatan Harian vs Pencapaian */}
      <div>
        <label className="block text-xs sm:text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">
          Tipe Entri
        </label>
        <div className="grid grid-cols-2 gap-1.5 p-1 bg-gray-100 dark:bg-gray-800 rounded-2xl border border-gray-200/80 dark:border-gray-700/80">
          <button
            type="button"
            onClick={() => setType('note')}
            className={cn(
              'py-2 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all duration-200 cursor-pointer',
              type === 'note'
                ? 'bg-[#2563EB] text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            )}
          >
            <FileText className="w-4 h-4" />
            <span>Catatan Harian</span>
          </button>
          <button
            type="button"
            onClick={() => setType('achievement')}
            className={cn(
              'py-2 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all duration-200 cursor-pointer',
              type === 'achievement'
                ? 'bg-amber-500 text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            )}
          >
            <Trophy className="w-4 h-4" />
            <span>Pencapaian (Win)</span>
          </button>
        </div>
      </div>

      {/* Period Selection (for Achievements) */}
      {type === 'achievement' && (
        <div>
          <label className="block text-xs sm:text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">
            Cakupan Pencapaian
          </label>
          <div className="grid grid-cols-3 gap-1.5 p-1 bg-gray-100 dark:bg-gray-800 rounded-2xl border border-gray-200/80 dark:border-gray-700/80">
            {(
              [
                { value: 'daily', label: 'Harian' },
                { value: 'weekly', label: 'Mingguan' },
                { value: 'monthly', label: 'Bulanan' },
              ] as const
            ).map(p => (
              <button
                key={p.value}
                type="button"
                onClick={() => setPeriod(p.value)}
                className={cn(
                  'py-2 px-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer text-center',
                  period === p.value
                    ? 'bg-amber-500 text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                )}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <Input
        label="Judul Catatan / Kemenangan"
        value={title}
        onChange={e => setTitle(e.target.value)}
        placeholder={
          type === 'achievement'
            ? 'Contoh: Menyelesaikan sprint tepat waktu, tabungan 5jt tercapai...'
            : 'Contoh: Rangkuman rapat, ide fitur baru, refleksi hari ini...'
        }
        error={error}
      />

      <div>
        <label className="block text-xs sm:text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">
          Isi Detail & Refleksi
        </label>
        <textarea
          rows={3}
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder="Tuliskan cerita, detail pencapaian, atau hal yang dipelajari..."
          className="w-full px-3 py-2.5 text-xs sm:text-sm rounded-xl bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-colors resize-none font-normal leading-relaxed"
        />
      </div>

      {/* Category Selection */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs sm:text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">
            Kategori
          </label>
          <select
            value={category}
            onChange={e => setCategory(e.target.value)}
            className="w-full px-3 py-2.5 text-xs sm:text-sm rounded-xl bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#2563EB] transition-colors font-medium"
          >
            <option value="work">Pekerjaan</option>
            <option value="finance">Keuangan</option>
            <option value="personal">Pribadi</option>
            <option value="learning">Belajar</option>
            <option value="health">Kesehatan</option>
            <option value="other">Lainnya</option>
          </select>
        </div>

        <Input
          label="Tanggal"
          type="date"
          value={entryDate}
          onChange={e => setEntryDate(e.target.value)}
        />
      </div>

      {/* Icon Selector for Achievements */}
      {type === 'achievement' && (
        <div>
          <label className="block text-xs sm:text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">
            Pilih Ikon Selebrasi
          </label>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            {iconsList.map(item => {
              const Icon = item.icon
              const isSelected = iconTag === item.id
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setIconTag(item.id)}
                  className={cn(
                    'p-2.5 rounded-xl border flex items-center gap-1.5 text-xs font-bold shrink-0 transition-all cursor-pointer',
                    isSelected
                      ? 'bg-amber-500 text-white border-amber-500 shadow-sm'
                      : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-amber-400'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      )}

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Batal
        </Button>
        <Button
          type="submit"
          loading={loading}
          className={cn(type === 'achievement' && 'bg-amber-500 hover:bg-amber-600 text-white')}
        >
          {submitLabel}
        </Button>
      </div>
    </form>
  )
}
