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
      className={`group flex items-center justify-between gap-3 p-3.5 rounded-xl bg-white dark:bg-gray-800/90 border border-gray-100 dark:border-gray-700/60 shadow-xs hover:shadow-sm transition-all duration-200 ${
        onClick
          ? ' cursor-pointer hover:border-primary-200 dark:hover:border-primary-800/80 hover:bg-gray-50/80 dark:hover:bg-gray-750/70'
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
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${config.bg}`}
        >
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
              {categoryName || config.label}
            </p>
            <Badge variant={config.variant} className="text-[10px] px-1.5 py-0">
              {config.label}
            </Badge>
          </div>
          {transaction.note && (
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
              {transaction.note}
            </p>
          )}
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
            {walletName && (
              <span className="font-medium text-gray-600 dark:text-gray-300">{walletName} · </span>
            )}
            {formatDate(transaction.transaction_date)}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <p
          className={`text-sm font-bold tracking-tight text-right ${
            transaction.type === 'income' || transaction.type === 'transfer_in'
              ? 'text-emerald-600 dark:text-emerald-400'
              : 'text-rose-600 dark:text-rose-400'
          }`}
        >
          {transaction.type === 'income' || transaction.type === 'transfer_in' ? '+' : '-'}
          {formatCurrency(transaction.amount)}
        </p>

        {/* Direct Action Buttons for Fast Access & Accessibility */}
        <div className="flex items-center gap-1">
          {onEdit && isEditable && (
            <button
              onClick={e => {
                e.stopPropagation()
                onEdit(transaction)
              }}
              className="p-1.5 rounded-lg text-gray-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/30 transition-colors"
              aria-label="Edit transaksi"
              title="Edit transaksi"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
          )}
          {onDelete && (
            <button
              onClick={e => {
                e.stopPropagation()
                onDelete(transaction.id)
              }}
              className="p-1.5 rounded-lg text-gray-400 hover:text-danger hover:bg-danger-light dark:hover:bg-red-900/30 transition-colors"
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
                onClick={e => e.stopPropagation()}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 dark:hover:text-gray-200 dark:hover:bg-gray-700 transition-colors"
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
                  <Pencil className="w-4 h-4 mr-2 text-primary-500" />
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
