import { TransactionItem } from './TransactionItem'
import { EmptyState } from '@/components/ui/EmptyState'
import { Receipt } from 'lucide-react'
import type { Transaction } from '@/types'

interface TransactionListProps {
  transactions: Transaction[]
  categoryMap?: Record<string, string>
  walletMap?: Record<string, string>
  onClick?: (transaction: Transaction) => void
  onEdit?: (transaction: Transaction) => void
  onDelete?: (id: string) => void
  emptyTitle?: string
  emptyDescription?: string
}

export function TransactionList({
  transactions,
  categoryMap = {},
  walletMap = {},
  onClick,
  onEdit,
  onDelete,
  emptyTitle = 'Belum ada transaksi',
  emptyDescription = 'Transaksi yang Anda catat akan muncul di sini.',
}: TransactionListProps) {
  if (transactions.length === 0) {
    return (
      <EmptyState
        icon={<Receipt className="w-6 h-6 text-gray-400" />}
        title={emptyTitle}
        description={emptyDescription}
      />
    )
  }

  return (
    <div className="space-y-2">
      {transactions.map(t => (
        <TransactionItem
          key={t.id}
          transaction={t}
          categoryName={t.category_id ? categoryMap[t.category_id] : null}
          walletName={t.wallet_id ? walletMap[t.wallet_id] : undefined}
          onClick={onClick}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  )
}
