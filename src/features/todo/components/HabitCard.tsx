import { useState } from 'react'
import { Flame, Check, Edit2, Trash2, Trophy, MoreVertical } from 'lucide-react'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import type { HabitItemWithStats } from '../hooks/useHabits'
import type { Habit } from '@/types'
import { cn } from '@/lib/utils'

interface HabitCardProps {
  item: HabitItemWithStats
  onToggle: (habitId: string, dateStr?: string) => Promise<void>
  onEdit: (habit: Habit) => void
  onDelete: (habitId: string) => Promise<void>
}

export function HabitCard({ item, onToggle, onEdit, onDelete }: HabitCardProps) {
  const { habit, currentStreak, bestStreak, isCompletedToday, weeklyStatus } = item
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [toggling, setToggling] = useState(false)
  const [showMenu, setShowMenu] = useState(false)

  const handleToggle = async (dateStr?: string) => {
    if (toggling) return
    setToggling(true)
    try {
      await onToggle(habit.id, dateStr)
    } finally {
      setToggling(false)
    }
  }

  return (
    <>
      <div
        className={cn(
          'relative p-4 sm:p-5 rounded-2xl border transition-all duration-200 shadow-sm backdrop-blur-md',
          isCompletedToday
            ? 'bg-white/95 dark:bg-gray-800/95 border-emerald-500/30 dark:border-emerald-500/20 shadow-emerald-500/5'
            : 'bg-white/85 dark:bg-gray-800/85 border-gray-200/80 dark:border-gray-700/80 hover:border-indigo-300 dark:hover:border-indigo-600/50'
        )}
      >
        {/* Header: Icon, Title, Streak Flame, Menu */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            {/* Custom Icon Box */}
            <div
              className="w-11 h-11 rounded-2xl flex items-center justify-center text-xl shrink-0 shadow-xs transition-transform active:scale-95"
              style={{
                backgroundColor: `${habit.color}18`,
                borderColor: `${habit.color}40`,
                borderWidth: '1px',
              }}
            >
              <span>{habit.icon || '🎯'}</span>
            </div>

            <div className="min-w-0">
              <h4 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white truncate">
                {habit.title}
              </h4>
              {habit.description && (
                <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1 mt-0.5">
                  {habit.description}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Streak Counter Badge */}
            <div
              className={cn(
                'flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-black transition-all',
                currentStreak > 0
                  ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800/60 shadow-xs'
                  : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
              )}
              title={`Streak Saat Ini: ${currentStreak} hari (Rekor Terbaik: ${bestStreak} hari)`}
            >
              <Flame
                className={cn(
                  'w-4 h-4',
                  currentStreak > 0 ? 'text-amber-500 fill-amber-500 animate-pulse' : 'text-gray-400'
                )}
              />
              <span>{currentStreak} hr</span>
            </div>

            {/* Quick Actions Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowMenu(!showMenu)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"
                aria-label="Menu kebiasaan"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {showMenu && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowMenu(false)}
                  />
                  <div className="absolute right-0 top-8 z-20 w-36 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 py-1 text-xs">
                    <button
                      type="button"
                      onClick={() => {
                        setShowMenu(false)
                        onEdit(habit)
                      }}
                      className="w-full px-3 py-2 text-left flex items-center gap-2 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowMenu(false)
                        setShowDeleteConfirm(true)
                      }}
                      className="w-full px-3 py-2 text-left flex items-center gap-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Hapus
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Weekly Progress Dots (7 Days) */}
        <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800/80 flex items-center justify-between gap-1 sm:gap-2">
          {weeklyStatus.map(day => (
            <button
              key={day.date}
              type="button"
              onClick={() => handleToggle(day.date)}
              className={cn(
                'flex flex-col items-center justify-center p-1.5 rounded-xl transition-all cursor-pointer select-none active:scale-90',
                day.isToday && 'ring-2 ring-indigo-500/50 dark:ring-indigo-400/50 bg-indigo-50/40 dark:bg-indigo-950/20',
                'hover:bg-gray-100 dark:hover:bg-gray-700/40'
              )}
              title={`${day.date} - ${day.isCompleted ? 'Selesai' : 'Belum selesai'}`}
            >
              <span className="text-[10px] font-semibold text-gray-400 dark:text-gray-500">
                {day.dayName}
              </span>
              <div
                className={cn(
                  'w-7 h-7 mt-1 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-2xs',
                  day.isCompleted
                    ? 'bg-emerald-500 text-white shadow-emerald-500/30 scale-105'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700'
                )}
              >
                {day.isCompleted ? <Check className="w-4 h-4 stroke-[3]" /> : day.dayNumber}
              </div>
            </button>
          ))}

          {/* Big Check-in Button for Today */}
          <button
            type="button"
            onClick={() => handleToggle()}
            disabled={toggling}
            className={cn(
              'ml-1 px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs shrink-0 cursor-pointer active:scale-95',
              isCompletedToday
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/20'
            )}
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>{isCompletedToday ? 'Selesai' : 'Check-in'}</span>
          </button>
        </div>

        {/* Footer info: Best Streak */}
        {bestStreak > 0 && (
          <div className="mt-2.5 flex items-center gap-1 text-[11px] text-gray-400 dark:text-gray-500">
            <Trophy className="w-3 h-3 text-amber-500" />
            <span>Rekor terbaik: {bestStreak} hari berturut-turut</span>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={showDeleteConfirm}
        title="Hapus Kebiasaan?"
        message={`Apakah Anda yakin ingin menghapus kebiasaan "${habit.title}"? Riwayat log penyelesaian untuk kebiasaan ini juga akan dihapus.`}
        confirmLabel="Hapus"
        cancelLabel="Batal"
        variant="danger"
        onConfirm={async () => {
          await onDelete(habit.id)
          setShowDeleteConfirm(false)
        }}
        onClose={() => setShowDeleteConfirm(false)}
      />
    </>
  )
}
