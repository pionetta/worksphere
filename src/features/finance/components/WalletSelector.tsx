import { Wallet } from 'lucide-react'
import { cn } from '@/utils/cn'
import { formatCurrency } from '@/utils/currency'
import type { WalletWithBalance } from '@/types'

interface WalletSelectorProps {
  wallets: WalletWithBalance[]
  selectedId: string | null
  onSelect: (id: string) => void
}

export function WalletSelector({ wallets, selectedId, onSelect }: WalletSelectorProps) {
  if (wallets.length === 0) {
    return (
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Tidak ada dompet aktif. Buat dompet terlebih dahulu.
      </p>
    )
  }

  return (
    <div className="space-y-2">
      {wallets.map(wallet => (
        <button
          key={wallet.id}
          type="button"
          onClick={() => onSelect(wallet.id)}
          className={cn(
            'w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-colors',
            selectedId === wallet.id
              ? 'bg-primary-50 border-primary-500 dark:bg-primary-900/30 dark:border-primary-500'
              : 'bg-white border-gray-200 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700'
          )}
        >
          <div className="w-8 h-8 rounded-lg bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center">
            <Wallet className="w-4 h-4 text-primary-500" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
              {wallet.name}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {formatCurrency(wallet.balance)}
            </p>
          </div>
          {selectedId === wallet.id && (
            <div className="w-5 h-5 rounded-full bg-primary-500 flex items-center justify-center">
              <svg
                className="w-3 h-3 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          )}
        </button>
      ))}
    </div>
  )
}
