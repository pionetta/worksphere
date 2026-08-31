import { formatCurrency } from '@/utils/currency'
import { Badge } from '@/components/ui/Badge'
import { Wallet, Landmark, CreditCard, Banknote, HelpCircle, Trash2, Users, ArrowLeftRight, Pencil } from 'lucide-react'
import { cn } from '@/utils/cn'
import type { WalletWithBalance, WalletType } from '@/types'

interface WalletCardProps {
  wallet: WalletWithBalance
  onSelect?: () => void
  onTransfer?: (id: string) => void
  onDeactivate?: (id: string) => void
  onManageMembers?: () => void
  memberCount?: number
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

const walletTypeColors: Record<WalletType, { bg: string; text: string }> = {
  bank: { bg: 'bg-blue-500/10 dark:bg-blue-900/30', text: 'text-[#2563EB] dark:text-blue-400' },
  e_wallet: { bg: 'bg-sky-500/10 dark:bg-sky-900/30', text: 'text-sky-600 dark:text-sky-400' },
  cash: { bg: 'bg-emerald-500/10 dark:bg-emerald-900/30', text: 'text-emerald-600 dark:text-emerald-400' },
  other: { bg: 'bg-amber-500/10 dark:bg-amber-900/30', text: 'text-amber-600 dark:text-amber-400' },
}

export function WalletCard({
  wallet,
  onSelect,
  onTransfer,
  onDeactivate,
  onManageMembers,
  memberCount,
  selected,
}: WalletCardProps) {
  const Icon = walletTypeIcons[wallet.type] || Wallet
  const colors = walletTypeColors[wallet.type] || walletTypeColors.other

  return (
    <div
      role="button"
      tabIndex={0}
      className={cn(
        'rounded-[22px] bg-white/90 dark:bg-gray-800/90 border border-white/80 dark:border-gray-700/50 p-3.5 sm:p-4 shadow-sm backdrop-blur-md cursor-pointer transition-all hover:shadow-md active:scale-[0.99] space-y-2',
        selected && 'ring-2 ring-[#2563EB] border-[#2563EB]'
      )}
      onClick={onSelect}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onSelect?.()
        }
      }}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className={cn('w-9 h-9 sm:w-10 sm:h-10 rounded-2xl flex items-center justify-center shrink-0', colors.bg, colors.text)}>
            <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <p className="text-xs sm:text-sm font-bold text-gray-900 dark:text-gray-100 truncate">
                {wallet.name}
              </p>
              {memberCount !== undefined && memberCount > 0 && (
                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
                  <Users className="w-2.5 h-2.5" />
                  <span>{memberCount + 1}</span>
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[10px] sm:text-[11px] font-semibold text-gray-500 dark:text-gray-400">
                {walletTypeLabels[wallet.type]}
              </span>
              {wallet.note && (
                <>
                  <span className="text-[11px] text-gray-300 dark:text-gray-600">•</span>
                  <span className="text-[10px] sm:text-[11px] text-gray-400 dark:text-gray-500 truncate max-w-[120px] sm:max-w-[200px]">
                    {wallet.note}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="text-right">
            <p className="text-xs sm:text-sm font-black text-gray-900 dark:text-white tracking-tight">
              {formatCurrency(wallet.balance)}
            </p>
            <Badge variant={wallet.is_active ? 'success' : 'default'} className="mt-0.5 text-[9px] sm:text-[10px]">
              {wallet.is_active ? 'Aktif' : 'Nonaktif'}
            </Badge>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-0.5">
            {onTransfer && wallet.is_active && (
              <button
                type="button"
                onClick={e => {
                  e.stopPropagation()
                  onTransfer(wallet.id)
                }}
                className="p-1.5 rounded-xl text-gray-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-950/40 transition-colors cursor-pointer"
                title="Transfer Dana dari Dompet Ini"
                aria-label={`Transfer dana dari ${wallet.name}`}
              >
                <ArrowLeftRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            )}
            {onSelect && (
              <button
                type="button"
                onClick={e => {
                  e.stopPropagation()
                  onSelect()
                }}
                className="p-1.5 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 dark:hover:text-gray-300 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                title="Edit Dompet"
                aria-label={`Edit ${wallet.name}`}
              >
                <Pencil className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            )}
            {onManageMembers && (
              <button
                type="button"
                onClick={e => {
                  e.stopPropagation()
                  onManageMembers()
                }}
                className="p-1.5 rounded-xl text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors cursor-pointer"
                title="Kelola Anggota Dompet"
                aria-label={`Kelola anggota ${wallet.name}`}
              >
                <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            )}
            {onDeactivate && (
              <button
                type="button"
                onClick={e => {
                  e.stopPropagation()
                  onDeactivate(wallet.id)
                }}
                className="p-1.5 rounded-xl text-gray-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors cursor-pointer"
                aria-label={`Nonaktifkan dompet ${wallet.name}`}
                title="Nonaktifkan"
              >
                <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
