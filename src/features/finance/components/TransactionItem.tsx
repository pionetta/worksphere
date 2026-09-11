import { formatCurrency } from '@/utils/currency'
import { formatDate } from '@/utils/date'
import { Badge } from '@/components/ui/Badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  ArrowUpRight,
  ArrowDownLeft,
  ArrowLeftRight,
  Settings2,
  Trash2,
  Pencil,
  MoreVertical,
  Copy,
  Eye,
} from 'lucide-react'
import { toast } from 'sonner'
import type { Transaction } from '@/types'

interface TransactionItemProps {
  transaction: Transaction
  categoryName?: string | null
  walletName?: string
  onClick?: (transaction: Transaction) => void
  onEdit?: (transaction: Transaction) => void
  onDelete?: (id: string) => void
}

const typeConfig = {
  income: {
    icon: ArrowUpRight,
    label: 'Pemasukan',
    variant: 'success' as const,
    color: 'text-success',
    bg: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400',
  },
  expense: {
    icon: ArrowDownLeft,
    label: 'Pengeluaran',
    variant: 'danger' as const,
    color: 'text-danger',
    bg: 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400',
  },
  transfer_in: {
    icon: ArrowLeftRight,
    label: 'Transfer Masuk',
    variant: 'info' as const,
    color: 'text-blue-500',
    bg: 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400',
  },
  transfer_out: {
    icon: ArrowLeftRight,
    label: 'Transfer Keluar',
    variant: 'warning' as const,
    color: 'text-amber-500',
    bg: 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400',
  },
  adjustment: {
    icon: Settings2,
    label: 'Penyesuaian',
    variant: 'default' as const,
    color: 'text-gray-500',
    bg: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  },
}

export function TransactionItem({
  transaction,
  categoryName,
  walletName,
  onClick,
  onEdit,
  onDelete,
}: TransactionItemProps) {
  const config = typeConfig[transaction.type]
  const Icon = config.icon
  const isEditable = transaction.type === 'income' || transaction.type === 'expense'

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation()
    const text = `${config.label}: ${formatCurrency(transaction.amount)} (${categoryName || 'Tanpa Kategori'})${transaction.note ? ` - ${transaction.note}` : ''}`
    navigator.clipboard?.writeText(text)
    toast.success('Informasi transaksi disalin')
  }

  return (
    <div
      className={`group flex items-center justify-between gap-3 p-3 rounded-2xl bg-[#F0F3F8] dark:bg-slate-800 border border-white/90 dark:border-white/10 shadow-[-3px_-3px_7px_rgba(255,255,255,0.9),3px_3px_7px_rgba(163,177,198,0.25)] mb-2.5 active:scale-[0.99] transition-all ${
        onClick
          ? ' cursor-pointer hover:bg-white/90 dark:hover:bg-slate-750'
          : ''
      }`}
      onClick={onClick ? () => onClick(transaction) : undefined}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? e => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onClick(transaction)
              }
            }
          : undefined
      }
    >
      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
        <div
          className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-inner shrink-0 transition-transform group-hover:scale-105"
        >
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 truncate">
              {categoryName || config.label}
            </p>
            <Badge variant={config.variant} className="text-[9px] px-1.5 py-0">
              {config.label}
            </Badge>
          </div>
          {transaction.note && (
            <p className="text-[11px] sm:text-xs text-[#737373] dark:text-[#A3A3A3] truncate mt-0.5">
              {transaction.note}
            </p>
          )}
          <p className="text-[10px] sm:text-[11px] text-[#A3A3A3] dark:text-[#737373] mt-0.5">
            {walletName && (
              <span className="font-semibold text-[#737373] dark:text-[#A3A3A3]">{walletName} · </span>
            )}
            {formatDate(transaction.transaction_date)}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <p
          className={`text-xs sm:text-sm font-black tracking-tight text-right ${
            transaction.type === 'income' || transaction.type === 'transfer_in'
              ? 'text-emerald-600 dark:text-emerald-400'
              : 'text-rose-600 dark:text-rose-400'
          }`}
        >
          {transaction.type === 'income' || transaction.type === 'transfer_in' ? '+' : '-'}
          {formatCurrency(transaction.amount)}
        </p>

        {/* Direct Action Buttons for Fast Access & Accessibility */}
        <div className="flex items-center gap-0.5">
          {onEdit && isEditable && (
            <button
              type="button"
              onClick={e => {
                e.stopPropagation()
                onEdit(transaction)
              }}
              className="p-1.5 rounded-lg text-[#737373] hover:text-[#171717] dark:hover:text-[#F5F5F5] hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
              aria-label="Edit transaksi"
              title="Edit transaksi"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
          )}
          {onDelete && (
            <button
              type="button"
              onClick={e => {
                e.stopPropagation()
                onDelete(transaction.id)
              }}
              className="p-1.5 rounded-lg text-[#737373] hover:text-rose-600 hover:bg-rose-500/10 dark:hover:text-rose-400 transition-colors cursor-pointer"
              aria-label="Hapus transaksi"
              title="Hapus transaksi"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Dropdown Menu for extra actions */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                onClick={e => e.stopPropagation()}
                className="p-1.5 rounded-lg text-[#737373] hover:text-[#171717] dark:hover:text-[#F5F5F5] hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
                aria-label="Menu transaksi"
              >
                <MoreVertical className="w-3.5 h-3.5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              {onClick && (
                <DropdownMenuItem
                  onClick={e => {
                    e.stopPropagation()
                    onClick(transaction)
                  }}
                >
                  <Eye className="w-4 h-4 mr-2 text-gray-500" />
                  Lihat Detail
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={handleCopy}>
                <Copy className="w-4 h-4 mr-2 text-gray-500" />
                Salin Info
              </DropdownMenuItem>
              {onEdit && isEditable && (
                <DropdownMenuItem
                  onClick={e => {
                    e.stopPropagation()
                    onEdit(transaction)
                  }}
                >
                  <Pencil className="w-4 h-4 mr-2 text-[#2563EB]" />
                  Edit Transaksi
                </DropdownMenuItem>
              )}
              {onDelete && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={e => {
                      e.stopPropagation()
                      onDelete(transaction.id)
                    }}
                    className="text-danger focus:text-danger dark:focus:text-danger"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Hapus Transaksi
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  )
}
