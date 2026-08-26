import { useState, useMemo } from 'react'
import { JournalCard } from './JournalCard'
import { JournalForm } from './JournalForm'
import { Button } from '@/components/ui/Button'
import { BottomSheet } from '@/components/ui/BottomSheet'
import { EmptyState } from '@/components/ui/EmptyState'
import { cn } from '@/lib/utils'
import { Trophy, FileText, Plus, Sparkles, Star, Calendar } from 'lucide-react'
import { toast } from 'sonner'
import type { JournalEntry, JournalPeriod, JournalType } from '@/types'

interface JournalSectionProps {
  entries: JournalEntry[]
  loading?: boolean
  onAdd: (data: {
    title: string
    content: string
    type?: JournalType
    period?: JournalPeriod
    category?: string
    icon_tag?: string
    entry_date?: string
  }) => Promise<JournalEntry | undefined>
  onEdit: (
    id: string,
    data: Partial<
      Pick<
        JournalEntry,
        'title' | 'content' | 'type' | 'period' | 'category' | 'icon_tag' | 'entry_date'
      >
    >
  ) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

type FilterScope = 'all' | 'notes' | 'daily' | 'weekly' | 'monthly'

export function JournalSection({
  entries,
  loading,
  onAdd,
  onEdit,
  onDelete,
}: JournalSectionProps) {
  const [filter, setFilter] = useState<FilterScope>('all')
  const [showForm, setShowForm] = useState(false)
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null)

  const summary = useMemo(() => {
    let notes = 0
    let dailyWins = 0
    let weeklyWins = 0
    let monthlyWins = 0

    for (const e of entries) {
      if (e.type === 'note') {
        notes++
      } else {
        if (e.period === 'daily') dailyWins++
        if (e.period === 'weekly') weeklyWins++
        if (e.period === 'monthly') monthlyWins++
      }
    }
    return { notes, dailyWins, weeklyWins, monthlyWins, totalWins: dailyWins + weeklyWins + monthlyWins }
  }, [entries])

  const filteredEntries = useMemo(() => {
    return entries.filter(e => {
      if (filter === 'all') return true
      if (filter === 'notes') return e.type === 'note'
      if (filter === 'daily') return e.type === 'achievement' && e.period === 'daily'
      if (filter === 'weekly') return e.type === 'achievement' && e.period === 'weekly'
      if (filter === 'monthly') return e.type === 'achievement' && e.period === 'monthly'
      return true
    })
  }, [entries, filter])

  const handleOpenAdd = () => {
    setEditingEntry(null)
    setShowForm(true)
  }

  const handleEdit = (entry: JournalEntry) => {
    setEditingEntry(entry)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    try {
      await onDelete(id)
      toast.success('Catatan berhasil dihapus')
    } catch {
      toast.error('Gagal menghapus catatan')
    }
  }

  const handleSubmit = async (data: {
    title: string
    content: string
    type?: JournalType
    period?: JournalPeriod
    category?: string
    icon_tag?: string
    entry_date?: string
  }) => {
    try {
      if (editingEntry) {
        await onEdit(editingEntry.id, data)
        toast.success('Catatan berhasil diperbarui!')
      } else {
        await onAdd(data)
        toast.success(
          data.type === 'achievement'
            ? 'Pencapaian berhasil dicatat! 🎉'
            : 'Catatan harian berhasil disimpan!'
        )
      }
      setShowForm(false)
      setEditingEntry(null)
    } catch {
      toast.error('Gagal menyimpan catatan')
    }
  }

  return (
    <div className="space-y-4">
      {/* Header & Quick Action */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Trophy className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-black text-gray-900 dark:text-gray-100">
              Catatan & Pencapaian
            </h3>
            <p className="text-[11px] text-gray-500 dark:text-gray-400">
              Dokumentasikan ide dan kemenangan harian, mingguan, & bulanan
            </p>
          </div>
        </div>

        <Button
          size="sm"
          onClick={handleOpenAdd}
          icon={<Plus className="w-3.5 h-3.5" />}
          className="bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs h-8 px-2.5 sm:px-3 whitespace-nowrap shrink-0"
        >
          Catat Baru
        </Button>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="p-3 rounded-2xl bg-white/80 dark:bg-gray-800/80 border border-white/80 dark:border-gray-700/50 shadow-xs">
          <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 text-xs font-bold mb-1">
            <FileText className="w-3.5 h-3.5" />
            <span>Catatan</span>
          </div>
          <p className="text-lg font-black text-gray-900 dark:text-gray-100">{summary.notes}</p>
        </div>

        <div className="p-3 rounded-2xl bg-white/80 dark:bg-gray-800/80 border border-white/80 dark:border-gray-700/50 shadow-xs">
          <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 text-xs font-bold mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Win Harian</span>
          </div>
          <p className="text-lg font-black text-gray-900 dark:text-gray-100">{summary.dailyWins}</p>
        </div>

        <div className="p-3 rounded-2xl bg-white/80 dark:bg-gray-800/80 border border-white/80 dark:border-gray-700/50 shadow-xs">
          <div className="flex items-center gap-1.5 text-purple-600 dark:text-purple-400 text-xs font-bold mb-1">
            <Star className="w-3.5 h-3.5" />
            <span>Win Mingguan</span>
          </div>
          <p className="text-lg font-black text-gray-900 dark:text-gray-100">{summary.weeklyWins}</p>
        </div>

        <div className="p-3 rounded-2xl bg-white/80 dark:bg-gray-800/80 border border-white/80 dark:border-gray-700/50 shadow-xs">
          <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 text-xs font-bold mb-1">
            <Trophy className="w-3.5 h-3.5" />
            <span>Win Bulanan</span>
          </div>
          <p className="text-lg font-black text-gray-900 dark:text-gray-100">{summary.monthlyWins}</p>
        </div>
      </div>

      {/* Scope Filter Tabs */}
      <div className="overflow-x-auto pb-1 no-scrollbar">
        <div className="inline-flex gap-1.5 p-1 rounded-2xl bg-white/70 dark:bg-gray-800/70 border border-white/80 dark:border-gray-700/50 shadow-xs min-w-full sm:min-w-0">
          {(
            [
              { id: 'all', label: 'Semua' },
              { id: 'notes', label: '📝 Catatan' },
              { id: 'daily', label: '⚡ Win Harian' },
              { id: 'weekly', label: '⭐ Win Mingguan' },
              { id: 'monthly', label: '🏆 Win Bulanan' },
            ] as const
          ).map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilter(tab.id)}
              className={cn(
                'py-1.5 px-3 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer whitespace-nowrap',
                filter === tab.id
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Entry Feed List */}
      {loading ? (
        <div className="space-y-3 animate-pulse">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-28 rounded-2xl bg-white/60 dark:bg-gray-800/60 border border-white/60 dark:border-gray-700/40" />
          ))}
        </div>
      ) : filteredEntries.length === 0 ? (
        <EmptyState
          icon={<Calendar className="w-8 h-8 text-gray-400" />}
          title="Belum ada catatan atau pencapaian"
          description="Mulai catat ide, refleksi harian, atau kemenangan kecil Anda hari ini."
          action={
            <Button
              size="sm"
              onClick={handleOpenAdd}
              icon={<Plus className="w-4 h-4" />}
              className="bg-amber-500 hover:bg-amber-600 text-white"
            >
              Tambah Catatan Pertama
            </Button>
          }
        />
      ) : (
        <div className="space-y-3">
          {filteredEntries.map(entry => (
            <JournalCard
              key={entry.id}
              entry={entry}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Modal Form Popup */}
      <BottomSheet
        open={showForm}
        onClose={() => {
          setShowForm(false)
          setEditingEntry(null)
        }}
        title={editingEntry ? 'Edit Catatan / Pencapaian' : 'Catat Refleksi & Pencapaian'}
      >
        <div className="pb-4">
          <JournalForm
            initialData={editingEntry ?? undefined}
            onSubmit={handleSubmit}
            onCancel={() => {
              setShowForm(false)
              setEditingEntry(null)
            }}
            submitLabel={editingEntry ? 'Perbarui' : 'Simpan'}
          />
        </div>
      </BottomSheet>
    </div>
  )
}
