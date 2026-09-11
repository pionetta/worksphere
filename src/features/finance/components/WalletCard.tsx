import { formatCurrency } from '@/utils/currency'
import { Badge } from '@/components/ui/Badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Wallet,
  Landmark,
  CreditCard,
  Banknote,
  HelpCircle,
  Trash2,
  Users,
  ArrowLeftRight,
  Pencil,
  MoreVertical,
} from 'lucide-react'
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

  return (
    <div
      role="button"
      tabIndex={0}
      className={cn(
        'group flex items-center justify-between gap-3 p-3 rounded-2xl bg-[#F0F3F8] dark:bg-slate-800 border border-white/90 dark:border-white/10 shadow-[-3px_-3px_7px_rgba(255,255,255,0.9),3px_3px_7px_rgba(163,177,198,0.25)] hover:border-indigo-300 dark:hover:border-indigo-500/30 cursor-pointer transition-all active:scale-[0.99] mb-2.5',
        selected && 'ring-2 ring-indigo-500 border-indigo-500'
      )}
      onClick={onSelect}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onSelect?.()
        }
      }}
    >
      {/* Left: Icon Bank + Nama Dompet & Jenis Akun */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-inner shrink-0 transition-transform group-hover:scale-105">
          <Icon className="w-5 h-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 truncate">
              {wallet.name}
            </p>
            {memberCount !== undefined && memberCount > 0 && (
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-md text-[9px] font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                <Users className="w-2.5 h-2.5" />
                <span>{memberCount + 1}</span>
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-[10px] sm:text-[11px] font-medium text-slate-500 dark:text-slate-400">
              {walletTypeLabels[wallet.type]}
            </span>
            {wallet.note && (
              <>
                <span className="text-[10px] text-slate-400 dark:text-slate-500">•</span>
                <span className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[120px] sm:max-w-[200px]">
                  {wallet.note}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Right: Nominal Saldo (bold) & Badge Status "Aktif" + Menu Titik Tiga */}
      <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
        <div className="text-right">
          <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 tracking-tight">
            {formatCurrency(wallet.balance)}
          </p>
          <div className="flex justify-end mt-0.5">
            <Badge variant={wallet.is_active ? 'success' : 'default'} className="text-[9px] py-0 px-1.5">
              {wallet.is_active ? 'Aktif' : 'Nonaktif'}
            </Badge>
          </div>
        </div>

        {/* Desktop Direct Actions (layar sm ke atas) */}
        <div className="hidden sm:flex items-center gap-0.5 ml-0.5">
          {onTransfer && wallet.is_active && (
            <button
              type="button"
              onClick={e => {
                e.stopPropagation()
                onTransfer(wallet.id)
              }}
              className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:text-slate-400 dark:hover:text-indigo-400 dark:hover:bg-indigo-950/30 transition-colors cursor-pointer"
              title="Transfer Dana dari Dompet Ini"
              aria-label={`Transfer dana dari ${wallet.name}`}
            >
              <ArrowLeftRight className="w-3.5 h-3.5" />
            </button>
          )}
          {onSelect && (
            <button
              type="button"
              onClick={e => {
                e.stopPropagation()
                onSelect()
              }}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-700/50 transition-colors cursor-pointer"
              title="Edit Dompet"
              aria-label={`Edit ${wallet.name}`}
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
          )}
          {onManageMembers && (
            <button
              type="button"
              onClick={e => {
                e.stopPropagation()
                onManageMembers()
              }}
              className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:text-slate-400 dark:hover:text-indigo-400 dark:hover:bg-indigo-950/30 transition-colors cursor-pointer"
              title="Kelola Anggota Dompet"
              aria-label={`Kelola anggota ${wallet.name}`}
            >
              <Users className="w-3.5 h-3.5" />
            </button>
          )}
          {onDeactivate && (
            <button
              type="button"
              onClick={e => {
                e.stopPropagation()
                onDeactivate(wallet.id)
              }}
              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:text-slate-400 dark:hover:text-rose-400 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
              aria-label={`Nonaktifkan dompet ${wallet.name}`}
              title="Nonaktifkan"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Mobile 3-Dots Action Menu: Menyederhanakan aksi di layar sentuh */}
        <div className="sm:hidden flex items-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                onClick={e => e.stopPropagation()}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/40 transition-colors cursor-pointer"
                aria-label={`Pilihan aksi ${wallet.name}`}
                title="Pilihan dompet"
              >
                <MoreVertical className="w-4 h-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              {onTransfer && wallet.is_active && (
                <DropdownMenuItem
                  onClick={e => {
                    e.stopPropagation()
                    onTransfer(wallet.id)
                  }}
                >
                  <ArrowLeftRight className="w-4 h-4 mr-2 text-indigo-500" />
                  Transfer Dana
                </DropdownMenuItem>
              )}
              {onSelect && (
                <DropdownMenuItem
                  onClick={e => {
                    e.stopPropagation()
                    onSelect()
                  }}
                >
                  <Pencil className="w-4 h-4 mr-2 text-slate-500" />
                  Edit Dompet
                </DropdownMenuItem>
              )}
              {onManageMembers && (
                <DropdownMenuItem
                  onClick={e => {
                    e.stopPropagation()
                    onManageMembers()
                  }}
                >
                  <Users className="w-4 h-4 mr-2 text-indigo-500" />
                  Kelola Anggota
                </DropdownMenuItem>
              )}
              {onDeactivate && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={e => {
                      e.stopPropagation()
                      onDeactivate(wallet.id)
                    }}
                    className="text-rose-600 focus:text-rose-600 dark:text-rose-400 dark:focus:text-rose-400"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Nonaktifkan
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
