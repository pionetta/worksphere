import { formatCurrency } from '@/utils/currency'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { cn } from '@/lib/utils'
import {
  Gift,
  Calendar,
  ExternalLink,
  CheckCircle2,
  RotateCcw,
  Pencil,
  Trash2,
  ShoppingCart,
} from 'lucide-react'
import type { WishlistItem, WishlistPeriod, WishlistPriority } from '@/types'

interface WishlistCardProps {
  item: WishlistItem
  onToggleAchieved: (id: string, currentStatus: WishlistItem['status']) => void
  onEdit: (item: WishlistItem) => void
  onDelete: (id: string) => void
  onRealizeTransaction?: (item: WishlistItem) => void
}

const periodLabels: Record<WishlistPeriod, { label: string; badgeColor: string }> = {
  weekly: {
    label: 'Mingguan',
    badgeColor: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20',
  },
  monthly: {
    label: 'Bulanan',
    badgeColor: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
  },
  yearly: {
    label: 'Tahunan',
    badgeColor: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
  },
}

const priorityBadges: Record<WishlistPriority, { label: string; color: string }> = {
  high: { label: 'Prioritas Tinggi', color: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20' },
  medium: { label: 'Sedang', color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20' },
  low: { label: 'Rendah', color: 'bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20' },
}

export function WishlistCard({
  item,
  onToggleAchieved,
  onEdit,
  onDelete,
  onRealizeTransaction,
}: WishlistCardProps) {
  const isAchieved = item.status === 'achieved'
  const periodInfo = periodLabels[item.period]
  const priorityInfo = priorityBadges[item.priority]

  return (
    <Card
      className={cn(
        'relative overflow-hidden transition-all duration-300',
        isAchieved
          ? 'border-emerald-500/40 bg-emerald-50/30 dark:bg-emerald-950/20 shadow-xs'
          : 'hover:border-primary-300 dark:hover:border-primary-700 shadow-sm'
      )}
    >
      <div className="flex items-start justify-between gap-3">
        {/* Left: Icon & Main Content */}
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div
            className={cn(
              'w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border transition-all',
              isAchieved
                ? 'bg-emerald-500 text-white border-emerald-500 shadow-md shadow-emerald-500/25'
                : 'bg-white dark:bg-gray-800 text-[#2563EB] dark:text-blue-400 border-gray-200 dark:border-gray-700'
            )}
          >
            <Gift className="w-5 h-5" />
          </div>

          <div className="space-y-1 flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span
                className={cn(
                  'px-2 py-0.5 rounded-lg text-[10px] font-extrabold border',
                  periodInfo.badgeColor
                )}
              >
                {periodInfo.label}
              </span>
              <span
                className={cn(
                  'px-2 py-0.5 rounded-lg text-[10px] font-bold border',
                  priorityInfo.color
                )}
              >
                {priorityInfo.label}
              </span>
              {isAchieved && (
                <Badge variant="success" className="text-[10px]">
                  Tercapai ✓
                </Badge>
              )}
            </div>

            <h4
              className={cn(
                'text-sm sm:text-base font-black text-gray-900 dark:text-gray-100 truncate',
                isAchieved && 'line-through text-gray-500 dark:text-gray-400'
              )}
            >
              {item.title}
            </h4>

            <p className="text-base sm:text-lg font-black text-emerald-600 dark:text-emerald-400">
              {formatCurrency(item.estimated_price)}
            </p>

            {item.note && (
              <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed">
                {item.note}
              </p>
            )}

            {item.target_date && (
              <div className="flex items-center gap-1.5 text-[11px] text-gray-500 dark:text-gray-400 pt-0.5">
                <Calendar className="w-3.5 h-3.5" />
                <span>Target: {new Date(item.target_date).toLocaleDateString('id-ID', { dateStyle: 'medium' })}</span>
              </div>
            )}

            {item.url && (
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs font-bold text-[#2563EB] dark:text-blue-400 hover:underline pt-1"
              >
                <ExternalLink className="w-3 h-3" />
                <span>Buka Link Produk</span>
              </a>
            )}
          </div>
        </div>

        {/* Right: Quick Action Controls */}
        <div className="flex flex-col items-end gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => onToggleAchieved(item.id, item.status)}
            className={cn(
              'p-2 rounded-xl border transition-all cursor-pointer shadow-xs active:scale-95',
              isAchieved
                ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border-amber-300 dark:border-amber-700'
                : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-300 dark:border-emerald-700'
            )}
            title={isAchieved ? 'Batalkan Status Tercapai' : 'Tandai Sudah Terbeli / Tercapai'}
          >
            {isAchieved ? <RotateCcw className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
          </button>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => onEdit(item)}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
              title="Edit Wishlist"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onDelete(item.id)}
              className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
              title="Hapus Wishlist"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Realize as Expense Button if not achieved yet */}
      {!isAchieved && onRealizeTransaction && (
        <div className="mt-3 pt-2.5 border-t border-gray-100 dark:border-gray-800/80 flex justify-end">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onRealizeTransaction(item)}
            icon={<ShoppingCart className="w-3.5 h-3.5" />}
            className="text-xs font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
          >
            Beli & Catat Transaksi
          </Button>
        </div>
      )}
    </Card>
  )
}
