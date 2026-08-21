import { formatCurrency } from '@/utils/currency'
import { formatDate } from '@/utils/date'
import { Badge } from '@/components/ui/Badge'
import { BottomSheet } from '@/components/ui/BottomSheet'
import { Button } from '@/components/ui/Button'
import {
  ArrowUpCircle,
  ArrowDownCircle,
  ArrowLeftRight,
  Settings2,
  Pencil,
  Trash2,
} from 'lucide-react'
import type { Transaction } from '@/types'

interface TransactionDetailProps {
  transaction: Transaction | null
  categoryName?: string | null
  walletName?: string
  onClose: () => void
  onEdit?: (transaction: Transaction) => void
  onDelete?: (id: string) => void
}

const typeConfig = {
  income: {
    icon: ArrowUpCircle,
    label: 'Pemasukan',
    variant: 'success' as const,
    color: 'text-success',
    bgColor: 'bg-success-light dark:bg-green-900/30',
  },
  expense: {
    icon: ArrowDownCircle,
    label: 'Pengeluaran',
    variant: 'danger' as const,
    color: 'text-danger',
    bgColor: 'bg-danger-light dark:bg-red-900/30',
  },
  transfer_in: {
    icon: ArrowLeftRight,
    label: 'Transfer Masuk',
    variant: 'info' as const,
    color: 'text-blue-500',
    bgColor: 'bg-blue-50 dark:bg-blue-900/30',
  },
  transfer_out: {
    icon: ArrowLeftRight,
    label: 'Transfer Keluar',
    variant: 'warning' as const,
    color: 'text-amber-500',
    bgColor: 'bg-amber-50 dark:bg-amber-900/30',
  },
  adjustment: {
    icon: Settings2,
    label: 'Penyesuaian',
    variant: 'default' as const,
    color: 'text-gray-500',
    bgColor: 'bg-gray-100 dark:bg-gray-700',
  },
}

function DetailRow({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null
  return (
    <div className="flex justify-between py-2.5 border-b border-gray-100 dark:border-gray-800 last:border-b-0">
      <span className="text-sm text-gray-500 dark:text-gray-400">{label}</span>
      <span className="text-sm font-medium text-gray-900 dark:text-gray-100 text-right max-w-[60%] break-words">
        {value}
      </span>
    </div>
  )
}

export function TransactionDetail({
  transaction,
  categoryName,
  walletName,
  onClose,
  onEdit,
  onDelete,
}: TransactionDetailProps) {
  if (!transaction) return null

  const config = typeConfig[transaction.type]
  const Icon = config.icon
  const isEditable = transaction.type === 'income' || transaction.type === 'expense'
  const isPositive = transaction.type === 'income' || transaction.type === 'transfer_in'

  return (
    <BottomSheet open={!!transaction} onClose={onClose} title="Detail Transaksi">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center ${config.bgColor}`}
          >
            <Icon className={`w-6 h-6 ${config.color}`} />
          </div>
          <div className="flex-1">
            <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {isPositive ? '+' : '-'}
              {formatCurrency(transaction.amount)}
            </p>
            <Badge variant={config.variant}>{config.label}</Badge>
          </div>
        </div>

        <div className="rounded-xl bg-gray-50 dark:bg-gray-800/50 px-4">
          <DetailRow label="Tanggal" value={formatDate(transaction.transaction_date)} />
          <DetailRow label="Dompet" value={walletName} />
          <DetailRow label="Kategori" value={categoryName || undefined} />
          <DetailRow label="Catatan" value={transaction.note} />
          <DetailRow label="ID Transaksi" value={transaction.id.slice(0, 8) + '...'} />
        </div>

        {(onEdit || onDelete) && (
          <div className="flex gap-2 pt-2">
            {onEdit && isEditable && (
              <Button
                variant="secondary"
                className="flex-1"
                icon={<Pencil className="w-4 h-4" />}
                onClick={() => {
                  onClose()
                  onEdit(transaction)
                }}
              >
                Edit
              </Button>
            )}
            {onDelete && (
              <Button
                variant="danger"
                className="flex-1"
                icon={<Trash2 className="w-4 h-4" />}
                onClick={() => {
                  onClose()
                  onDelete(transaction.id)
                }}
              >
                Hapus
              </Button>
            )}
          </div>
        )}
      </div>
    </BottomSheet>
  )
}
