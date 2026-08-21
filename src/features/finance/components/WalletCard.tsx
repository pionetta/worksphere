import { formatCurrency } from '@/utils/currency'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Wallet, Landmark, CreditCard, Banknote, HelpCircle, Trash2 } from 'lucide-react'
import { cn } from '@/utils/cn'
import type { WalletWithBalance, WalletType } from '@/types'

interface WalletCardProps {
  wallet: WalletWithBalance
  onSelect?: () => void
  onDeactivate?: (id: string) => void
  selected?: boolean
}

const walletTypeIcons: Record<WalletType, typeof Wallet> = {
  bank: Landmark,
  e_wallet: CreditCard,
  cash: Banknote,
  other: HelpCircle,
}

const walletTypeLabels: Record<WalletType, string> = {
  bank: 'Bank',
  e_wallet: 'E-Wallet',
  cash: 'Tunai',
  other: 'Lainnya',
}

export function WalletCard({ wallet, onSelect, onDeactivate, selected }: WalletCardProps) {
  const Icon = walletTypeIcons[wallet.type] || Wallet

  return (
    <Card
      className={cn(
        'cursor-pointer transition-all',
        selected && 'ring-2 ring-primary-500 border-primary-500'
      )}
      onClick={onSelect}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center">
            <Icon className="w-5 h-5 text-primary-500" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{wallet.name}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {walletTypeLabels[wallet.type]}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={wallet.is_active ? 'success' : 'default'}>
            {wallet.is_active ? 'Aktif' : 'Nonaktif'}
          </Badge>
          {onDeactivate && (
            <button
              type="button"
              onClick={e => {
                e.stopPropagation()
                onDeactivate(wallet.id)
              }}
              className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              aria-label={`Nonaktifkan dompet ${wallet.name}`}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
      <div className="mt-3">
        <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          {formatCurrency(wallet.balance)}
        </p>
      </div>
      {wallet.note && (
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{wallet.note}</p>
      )}
    </Card>
  )
}
