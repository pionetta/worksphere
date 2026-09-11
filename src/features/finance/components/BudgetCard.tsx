import { useState, useRef, useEffect } from 'react'
import { formatCurrency } from '@/utils/currency'
import { MoreVertical, Pencil, Trash2 } from 'lucide-react'
import type { Budget } from '@/types'

// ─── Thresholds ───────────────────────────────────────────────────────────────

const THRESHOLD_WARNING = 80

export type BudgetStatus = 'normal' | 'warning' | 'exceeded'

export function getBudgetStatus(spent: number, budget: number): BudgetStatus {
  if (budget <= 0) return 'normal'
  const percent = (spent / budget) * 100
  if (percent >= 100) return 'exceeded'
  if (percent >= THRESHOLD_WARNING) return 'warning'
  return 'normal'
}

export const STATUS_CONFIG: Record<
  BudgetStatus,
  { label: string; variant: 'success' | 'warning' | 'danger' }
> = {
  normal: { label: 'Normal', variant: 'success' },
  warning: { label: 'Hampir habis', variant: 'warning' },
  exceeded: { label: 'Terlampaui', variant: 'danger' },
}

// ─── Component ────────────────────────────────────────────────────────────────

interface BudgetCardProps {
  budget: Budget
  categoryName?: string
  spent?: number
  onEdit?: () => void
  onDelete?: (id: string) => void
}

export function BudgetCard({ budget, categoryName, spent = 0, onEdit, onDelete }: BudgetCardProps) {
  const [showMenu, setShowMenu] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const percent = budget.amount > 0 ? Math.round((spent / budget.amount) * 100) : 0
  const isOver = spent > budget.amount
  const remaining = budget.amount - spent
  const status = getBudgetStatus(spent, budget.amount)
  const statusConfig = STATUS_CONFIG[status]

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

  const initial = (categoryName || 'Tanpa kategori').charAt(0).toUpperCase()

  return (
    <div className="p-4 rounded-3xl bg-[#F0F3F8] dark:bg-slate-800 border border-white/80 dark:border-white/10 shadow-[-4px_-4px_9px_rgba(255,255,255,0.85),4px_4px_9px_rgba(163,177,198,0.25)] my-3 transition-all relative">
      {/* Baris Atas */}
      <div className="flex items-start justify-between gap-3">
        {/* Kiri */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400 flex items-center justify-center font-bold text-sm shrink-0 shadow-sm">
            {initial}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">
              {categoryName || 'Tanpa kategori'}
            </p>
            <p className="text-xs text-slate-400 truncate">
              Plafon: {formatCurrency(budget.amount)}
            </p>
          </div>
        </div>

        {/* Kanan */}
        <div className="flex items-center gap-2 shrink-0">
          <span
            className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
              isOver
                ? 'bg-rose-50 text-rose-600 border-rose-200/60 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800/40'
                : status === 'warning'
                  ? 'bg-amber-50 text-amber-600 border-amber-200/60 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800/40'
                  : 'bg-emerald-50 text-emerald-600 border-emerald-200/60 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/40'
            }`}
          >
            {percent}% {statusConfig.label}
          </span>

          {(onEdit || onDelete) && (
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setShowMenu(prev => !prev)}
                className="w-7 h-7 rounded-lg bg-white/70 dark:bg-slate-700 flex items-center justify-center text-slate-500 hover:text-indigo-600 shadow-sm active:scale-90 transition-transform cursor-pointer"
                aria-label="Menu aksi anggaran"
                title="Menu aksi anggaran"
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
                      aria-label="Edit anggaran"
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
                        onDelete(budget.id)
                      }}
                      className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                      aria-label="Hapus anggaran"
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
      </div>

      {/* Baris Tengah (Neumorphic Progress Bar) */}
      <div className="w-full h-3 rounded-full bg-slate-200/80 dark:bg-slate-700/80 shadow-[inset_1px_1px_3px_rgba(0,0,0,0.15)] overflow-hidden my-2.5">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            isOver
              ? 'bg-gradient-to-r from-rose-500 to-red-600'
              : status === 'warning'
                ? 'bg-gradient-to-r from-amber-400 to-orange-500'
                : 'bg-gradient-to-r from-emerald-400 to-teal-500'
          }`}
          style={{ width: `${Math.min(percent, 100)}%` }}
        />
      </div>

      {/* Baris Bawah */}
      <div className="flex items-center justify-between font-semibold text-xs text-slate-700 dark:text-slate-200">
        <span>Terpakai: {formatCurrency(spent)}</span>
        <span className={isOver ? 'text-rose-600 dark:text-rose-400 font-bold' : ''}>
          {isOver
            ? `Melebihi ${formatCurrency(Math.abs(remaining))}`
            : `Sisa: ${formatCurrency(remaining)}`}
        </span>
      </div>
    </div>
  )
}
