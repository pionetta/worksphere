import { useState, useRef, useEffect } from 'react'
import { formatCurrency } from '@/utils/currency'
import { formatDate } from '@/utils/date'
import { calculateProgress } from '@/features/finance/services/savingsService'
import { calculateTargetBreakdown } from '@/features/finance/utils/paymentCalculator'
import {
  Target,
  MoreVertical,
  Pencil,
  Trash2,
  Calendar,
  Calculator,
  ChevronDown,
  PlusCircle,
  MinusCircle,
} from 'lucide-react'
import type { SavingsGoal } from '@/types'
import { cn } from '@/lib/utils'

interface SavingsGoalCardProps {
  goal: SavingsGoal
  onEdit?: () => void
  onAdd?: (id: string) => void
  onWithdraw?: (id: string) => void
  onDelete?: (id: string) => void
}

function getDeadlineInfo(deadline: string) {
  const targetDate = new Date(deadline)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  targetDate.setHours(0, 0, 0, 0)

  const diffTime = targetDate.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays < 0) {
    return { label: `Lewat ${Math.abs(diffDays)} hari`, variant: 'danger' as const }
  }
  if (diffDays === 0) {
    return { label: 'Hari ini', variant: 'warning' as const }
  }
  if (diffDays <= 7) {
    return { label: `${diffDays} hari lagi`, variant: 'warning' as const }
  }
  return { label: `${diffDays} hari lagi`, variant: 'default' as const }
}

export function SavingsGoalCard({
  goal,
  onEdit,
  onAdd,
  onWithdraw,
  onDelete,
}: SavingsGoalCardProps) {
  const [showMenu, setShowMenu] = useState(false)
  const [showBreakdown, setShowBreakdown] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const progress = calculateProgress(goal.current_amount, goal.target_amount)
  const isCompleted = goal.current_amount >= goal.target_amount
  const deadlineInfo = goal.deadline ? getDeadlineInfo(goal.deadline) : null
  const remaining = Math.max(0, goal.target_amount - goal.current_amount)
  const breakdown =
    goal.deadline && remaining > 0 ? calculateTargetBreakdown(remaining, goal.deadline) : null

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false)
      }
    }
    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showMenu])

  return (
    <div className="p-4 rounded-3xl bg-[#F0F3F8] dark:bg-slate-800 border border-white/80 dark:border-white/10 shadow-[-4px_-4px_9px_rgba(255,255,255,0.85),4px_4px_9px_rgba(163,177,198,0.25)] my-3 transition-all relative">
      {/* Baris Atas */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400 flex items-center justify-center font-bold text-sm shrink-0 shadow-sm">
            <Target className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">
                {goal.name}
              </p>
              {isCompleted && (
                <span className="bg-emerald-50 text-emerald-600 border border-emerald-200/60 text-[10px] font-semibold px-2 py-0.5 rounded-full dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/40">
                  Tercapai
                </span>
              )}
            </div>

            {goal.deadline && (
              <div className="mt-1">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-200/70 dark:bg-slate-700/60 text-[11px] font-medium text-slate-600 dark:text-slate-300">
                  <Calendar className="w-3 h-3 text-slate-400" />
                  <span>
                    {deadlineInfo ? `${deadlineInfo.label} • ` : ''}
                    {formatDate(goal.deadline)}
                  </span>
                </span>
              </div>
            )}
          </div>
        </div>

        {/* MoreVertical Menu Titik Tiga */}
        {(onEdit || onDelete) && (
          <div className="relative shrink-0" ref={menuRef}>
            <button
              type="button"
              onClick={() => setShowMenu(prev => !prev)}
              className="w-7 h-7 rounded-lg bg-white/70 dark:bg-slate-700 flex items-center justify-center text-slate-500 hover:text-indigo-600 shadow-sm active:scale-90 transition-transform cursor-pointer"
              aria-label="Menu aksi tabungan"
              title="Menu aksi tabungan"
            >
              <MoreVertical className="w-3.5 h-3.5" />
            </button>

            {showMenu && (
              <div className="absolute right-0 top-full mt-1.5 w-28 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-white/10 shadow-lg py-1 z-20">
                {onEdit && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowMenu(false)
                      onEdit()
                    }}
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/60 transition-colors cursor-pointer"
                    aria-label="Edit tabungan"
                  >
                    <Pencil className="w-3.5 h-3.5 text-slate-400" />
                    <span>Edit</span>
                  </button>
                )}
                {onDelete && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowMenu(false)
                      onDelete(goal.id)
                    }}
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                    aria-label="Hapus tabungan"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Hapus</span>
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Hirarki Visual Nominal */}
      <div className="my-2">
        <div className="flex items-baseline justify-between gap-2 flex-wrap mb-1">
          <p className="text-base font-extrabold text-slate-800 dark:text-slate-100">
            {formatCurrency(goal.current_amount)}{' '}
            <span className="text-xs font-normal text-slate-400">
              dari target {formatCurrency(goal.target_amount)}
            </span>
          </p>
          <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
            {progress}%
          </span>
        </div>

        {/* Neumorphic Progress Bar */}
        <div className="w-full h-3 rounded-full bg-slate-200/80 dark:bg-slate-700/80 shadow-[inset_1px_1px_3px_rgba(0,0,0,0.15)] overflow-hidden my-2">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isCompleted
                ? 'bg-gradient-to-r from-emerald-400 to-teal-500'
                : 'bg-gradient-to-r from-indigo-500 to-purple-600'
            }`}
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
      </div>

      {/* Tombol Cepat Setor / Tarik */}
      <div className="flex items-center gap-2 my-2.5">
        {onAdd && (
          <button
            type="button"
            onClick={() => onAdd(goal.id)}
            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl text-xs font-semibold bg-white/80 dark:bg-slate-700/80 border border-slate-200/60 dark:border-white/10 text-emerald-600 dark:text-emerald-400 shadow-xs hover:bg-emerald-50 dark:hover:bg-emerald-950/30 active:scale-95 transition-all cursor-pointer"
            aria-label="Setor tabungan"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Setor</span>
          </button>
        )}
        {onWithdraw && goal.current_amount > 0 && (
          <button
            type="button"
            onClick={() => onWithdraw(goal.id)}
            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl text-xs font-semibold bg-white/80 dark:bg-slate-700/80 border border-slate-200/60 dark:border-white/10 text-amber-600 dark:text-amber-400 shadow-xs hover:bg-amber-50 dark:hover:bg-amber-950/30 active:scale-95 transition-all cursor-pointer"
            aria-label="Tarik tabungan"
          >
            <MinusCircle className="w-3.5 h-3.5" />
            <span>Tarik</span>
          </button>
        )}
      </div>

      {/* Accordion Simulasi Rincian */}
      {breakdown && !breakdown.isExpired && !isCompleted && (
        <div className="pt-2 border-t border-slate-200/60 dark:border-white/5">
          <button
            type="button"
            onClick={() => setShowBreakdown(prev => !prev)}
            className="w-full flex items-center justify-between text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer py-1"
          >
            <span className="flex items-center gap-1.5">
              <Calculator className="w-3.5 h-3.5" />
              <span>
                {showBreakdown ? 'Tutup Rekomendasi Nabung' : 'Lihat Rekomendasi Nabung'}
              </span>
            </span>
            <ChevronDown
              className={cn(
                'w-3.5 h-3.5 transition-transform duration-200',
                showBreakdown && 'rotate-180'
              )}
            />
          </button>

          {showBreakdown && (
            <div className="mt-2 space-y-2 animate-fade-in">
              <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                <span>Target tersisa:</span>
                <span className="font-bold text-slate-700 dark:text-slate-200">
                  {formatCurrency(remaining)}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2 rounded-xl bg-white/70 dark:bg-slate-700/60 border border-slate-200/50 dark:border-white/5 shadow-xs">
                  <p className="text-[10px] text-slate-400">Harian</p>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-100 mt-0.5">
                    {formatCurrency(breakdown.perDay)}
                  </p>
                </div>
                <div className="p-2 rounded-xl bg-white/70 dark:bg-slate-700/60 border border-slate-200/50 dark:border-white/5 shadow-xs">
                  <p className="text-[10px] text-slate-400">Mingguan</p>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-100 mt-0.5">
                    {formatCurrency(breakdown.perWeek)}
                  </p>
                </div>
                <div className="p-2 rounded-xl bg-indigo-50/80 dark:bg-indigo-950/50 border border-indigo-200/60 dark:border-indigo-900/40 shadow-xs">
                  <p className="text-[10px] text-indigo-500 dark:text-indigo-400 font-medium">
                    Bulanan
                  </p>
                  <p className="text-xs font-bold text-indigo-700 dark:text-indigo-300 mt-0.5">
                    {formatCurrency(breakdown.perMonth)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {goal.note && (
        <p className="pt-2 text-xs text-slate-400 border-t border-slate-200/60 dark:border-white/5 truncate mt-2">
          {goal.note}
        </p>
      )}
    </div>
  )
}

