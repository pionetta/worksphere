import { Card } from '@/components/ui/Card'
import { cn } from '@/lib/utils'
import {
  Trophy,
  Sparkles,
  Star,
  Lightbulb,
  PartyPopper,
  Target,
  FileText,
  Calendar,
  Pencil,
  Trash2,
} from 'lucide-react'
import type { JournalEntry, JournalPeriod } from '@/types'

interface JournalCardProps {
  entry: JournalEntry
  onEdit: (entry: JournalEntry) => void
  onDelete: (id: string) => void
}

const iconMap: Record<string, typeof Trophy> = {
  trophy: Trophy,
  party: PartyPopper,
  star: Star,
  lightbulb: Lightbulb,
  sparkles: Sparkles,
  target: Target,
  note: FileText,
}

const categoryLabels: Record<string, { label: string; color: string }> = {
  work: { label: 'Pekerjaan', color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20' },
  finance: { label: 'Keuangan', color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' },
  personal: { label: 'Pribadi', color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20' },
  learning: { label: 'Belajar', color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20' },
  health: { label: 'Kesehatan', color: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20' },
  other: { label: 'Lainnya', color: 'bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20' },
}

const periodLabels: Record<JournalPeriod, string> = {
  daily: 'Harian',
  weekly: 'Mingguan',
  monthly: 'Bulanan',
}

export function JournalCard({ entry, onEdit, onDelete }: JournalCardProps) {
  const isAchievement = entry.type === 'achievement'
  const IconComponent = iconMap[entry.icon_tag] || (isAchievement ? Trophy : FileText)
  const categoryInfo = categoryLabels[entry.category] || categoryLabels.other

  return (
    <Card
      className={cn(
        'relative overflow-hidden transition-all duration-300',
        isAchievement
          ? 'border-amber-500/30 bg-gradient-to-br from-white via-amber-50/20 to-orange-50/10 dark:from-gray-800 dark:via-gray-800 dark:to-amber-950/20 shadow-sm'
          : 'border-white/80 dark:border-gray-700/50 bg-white/90 dark:bg-gray-800/90 shadow-xs'
      )}
    >
      <div className="flex items-start justify-between gap-3">
        {/* Left: Icon & Content */}
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div
            className={cn(
              'w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border shadow-xs',
              isAchievement
                ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 shadow-amber-500/10'
                : 'bg-blue-500/10 text-[#2563EB] dark:text-blue-400 border-blue-500/20'
            )}
          >
            <IconComponent className="w-5 h-5" />
          </div>

          <div className="space-y-1.5 flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span
                className={cn(
                  'px-2 py-0.5 rounded-lg text-[10px] font-extrabold border',
                  isAchievement
                    ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                    : 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20'
                )}
              >
                {isAchievement ? `Pencapaian ${periodLabels[entry.period]}` : 'Catatan Harian'}
              </span>

              <span
                className={cn(
                  'px-2 py-0.5 rounded-lg text-[10px] font-bold border',
                  categoryInfo.color
                )}
              >
                {categoryInfo.label}
              </span>
            </div>

            <h4 className="text-sm sm:text-base font-black text-gray-900 dark:text-gray-100">
              {entry.title}
            </h4>

            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
              {entry.content}
            </p>

            <div className="flex items-center gap-1.5 text-[11px] text-gray-400 dark:text-gray-500 pt-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>
                {new Date(entry.entry_date).toLocaleDateString('id-ID', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={() => onEdit(entry)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
            title="Edit Catatan"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(entry.id)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
            title="Hapus Catatan"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </Card>
  )
}
