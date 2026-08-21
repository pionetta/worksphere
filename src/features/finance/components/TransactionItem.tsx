import { formatCurrency } from '@/utils/currency'
import { formatDate } from '@/utils/date'
import { Badge } from '@/components/ui/Badge'
import {
  ArrowUpCircle,
  ArrowDownCircle,
  ArrowLeftRight,
  Settings2,
  Trash2,
  Pencil,
} from 'lucide-react'
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
    icon: ArrowUpCircle,
    label: 'Pemasukan',
    variant: 'success' as const,
    color: 'text-success',
  },
  expense: {
    icon: ArrowDownCircle,
    label: 'Pengeluaran',
    variant: 'danger' as const,
    color: 'text-danger',
  },
  transfer_in: {
    icon: ArrowLeftRight,
    label: 'Transfer Masuk',
    variant: 'info' as const,
    color: 'text-blue-500',
  },
  transfer_out: {
    icon: ArrowLeftRight,
    label: 'Transfer Keluar',
    variant: 'warning' as const,
    color: 'text-amber-500',
  },
  adjustment: {
    icon: Settings2,
    label: 'Penyesuaian',
    variant: 'default' as const,
    color: 'text-gray-500',
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

  return (
    <div
      className={`flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700${onClick ? ' cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors' : ''}`}
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
      <div
        className={`w-9 h-9 rounded-lg flex items-center justify-center ${
          transaction.type === 'income'
            ? 'bg-success-light dark:bg-green-900/30'
            : transaction.type === 'expense'
              ? 'bg-danger-light dark:bg-red-900/30'
              : 'bg-gray-100 dark:bg-gray-700'
        }`}
      >
        <Icon className={`w-4 h-4 ${config.color}`} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
            {categoryName || config.label}
          </p>
          <Badge variant={config.variant}>{config.label}</Badge>
        </div>
        {transaction.note && (
          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{transaction.note}</p>
        )}
        <p className="text-xs text-gray-400 dark:text-gray-500">
          {walletName && <span>{walletName} · </span>}
          {formatDate(transaction.transaction_date)}
        </p>
      </div>
      <p
        className={`text-sm font-semibold ${
          transaction.type === 'income' || transaction.type === 'transfer_in'
            ? 'text-success'
            : 'text-danger'
        }`}
      >
        {transaction.type === 'income' || transaction.type === 'transfer_in' ? '+' : '-'}
        {formatCurrency(transaction.amount)}
      </p>
      {onEdit && isEditable && (
        <button
          onClick={e => {
            e.stopPropagation()
            onEdit(transaction)
          }}
          className="p-1.5 rounded-lg text-gray-400 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/30 transition-colors"
          aria-label="Edit transaksi"
        >
          <Pencil className="w-4 h-4" />
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
        >
          <Trash2 className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}
