import { useState } from 'react'
import {
  RefreshCw,
  Zap,
  Hand,
  Calendar,
  Wallet as WalletIcon,
  Play,
  Pause,
  Edit2,
  Trash2,
  CheckCircle2,
  Clock,
  ArrowDownLeft,
  ArrowUpRight,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { formatCurrency } from '@/utils/currency'
import { formatDate } from '@/utils/date'
import type { RecurringTransaction, Wallet, Category } from '@/types'
import { cn } from '@/lib/utils'

interface RecurringCardProps {
  recurring: RecurringTransaction
  wallets: Wallet[]
  categories: Category[]
  onEdit: (recurring: RecurringTransaction) => void
  onToggleActive: (id: string, isActive: boolean) => Promise<void>
  onDelete: (id: string) => Promise<void>
  onExecuteNow: (id: string) => Promise<void>
}

const FREQUENCY_LABELS: Record<string, string> = {
  daily: 'Harian',
  weekly: 'Mingguan',
  monthly: 'Bulanan',
  yearly: 'Tahunan',
}

export function RecurringCard({
  recurring,
  wallets,
  categories,
  onEdit,
  onToggleActive,
  onDelete,
  onExecuteNow,
}: RecurringCardProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showExecuteConfirm, setShowExecuteConfirm] = useState(false)
  const [executing, setExecuting] = useState(false)

  const wallet = wallets.find(w => w.id === recurring.wallet_id)
  const category = categories.find(c => c.id === recurring.category_id)

  const todayStr = new Date().toISOString().split('T')[0]
  const isDueToday = recurring.next_due_date === todayStr
  const isOverdue = recurring.next_due_date < todayStr

  // Calculate days remaining
  const daysDiff = Math.ceil(
    (new Date(recurring.next_due_date).getTime() - new Date(todayStr).getTime()) /
      (1000 * 60 * 60 * 24)
  )

  const handleExecute = async () => {
    setExecuting(true)
    try {
      await onExecuteNow(recurring.id)
    } finally {
      setExecuting(false)
      setShowExecuteConfirm(false)
    }
  }

  return (
    <>
      <div
        className={cn(
          'group relative p-4 sm:p-5 rounded-2xl border transition-all duration-200 shadow-sm backdrop-blur-md',
          recurring.is_active
            ? 'bg-white/80 dark:bg-gray-800/80 border-gray-200/80 dark:border-gray-700/60 hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-600/50'
            : 'bg-gray-50/70 dark:bg-gray-900/40 border-dashed border-gray-300 dark:border-gray-800 opacity-75'
        )}
      >
        <div className="flex items-start justify-between gap-3 mb-3">
          {/* Icon & Title */}
          <div className="flex items-start gap-3 min-w-0">
            <div
              className={cn(
                'w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-xs',
                recurring.type === 'income'
                  ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/50'
                  : 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200/60 dark:border-rose-800/50'
              )}
            >
              {recurring.type === 'income' ? (
                <ArrowDownLeft className="w-5 h-5" />
              ) : (
                <ArrowUpRight className="w-5 h-5" />
              )}
            </div>

            <div className="min-w-0">
              <h4 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white truncate">
                {recurring.note || (recurring.type === 'income' ? 'Pemasukan Rutin' : 'Pengeluaran Rutin')}
              </h4>
              <p
                className={cn(
                  'text-base sm:text-lg font-black tracking-tight mt-0.5',
                  recurring.type === 'income'
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-rose-600 dark:text-rose-400'
                )}
              >
                {recurring.type === 'income' ? '+' : '-'}
                {formatCurrency(recurring.amount)}
              </p>
            </div>
          </div>

          {/* Status & Frequency Badges */}
          <div className="flex flex-col items-end gap-1.5 shrink-0">
            <div className="flex items-center gap-1.5">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/40">
                <RefreshCw className="w-3 h-3 mr-1" />
                {FREQUENCY_LABELS[recurring.frequency] || recurring.frequency}
              </span>

              {recurring.auto_record ? (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/40" title="Otomatis dicatat saat jatuh tempo">
                  <Zap className="w-3 h-3 mr-0.5 text-amber-500" />
                  Otomatis
                </span>
              ) : (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400" title="Memerlukan konfirmasi manual">
                  <Hand className="w-3 h-3 mr-0.5" />
                  Manual
                </span>
              )}
            </div>

            {/* Due Date Indicator */}
            {recurring.is_active && (
              <span
                className={cn(
                  'inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-md',
                  isDueToday
                    ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 font-bold animate-pulse'
                    : isOverdue
                    ? 'bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-300'
                    : daysDiff <= 3
                    ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300'
                    : 'text-gray-500 dark:text-gray-400'
                )}
              >
                <Clock className="w-3 h-3 mr-1" />
                {isDueToday
                  ? 'Jatuh Tempo Hari Ini!'
                  : isOverdue
                  ? 'Terlewat'
                  : daysDiff === 1
                  ? 'Besok'
                  : `${daysDiff} hari lagi`}
              </span>
            )}
          </div>
        </div>

        {/* Metadata info */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-100 dark:border-gray-800/80 mb-3">
          <div className="flex items-center gap-1.5">
            <WalletIcon className="w-3.5 h-3.5 text-gray-400" />
            <span className="truncate max-w-[120px]">{wallet?.name || 'Dompet'}</span>
          </div>

          {category && (
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0" />
              <span className="truncate max-w-[120px]">{category.name}</span>
            </div>
          )}

          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-gray-400" />
            <span>Jatuh tempo: {formatDate(recurring.next_due_date)}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between gap-2 pt-1">
          {/* Quick Record Button */}
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowExecuteConfirm(true)}
            disabled={executing}
            className="h-8 text-xs font-semibold bg-indigo-50/60 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/60 dark:text-indigo-300 border-indigo-200/80 dark:border-indigo-800/60"
            icon={<CheckCircle2 className="w-3.5 h-3.5" />}
          >
            Catat Sekarang
          </Button>

          <div className="flex items-center gap-1">
            {/* Toggle Pause / Resume */}
            <button
              onClick={() => onToggleActive(recurring.id, !recurring.is_active)}
              className={cn(
                'p-1.5 rounded-lg text-xs font-medium transition-colors',
                recurring.is_active
                  ? 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'
                  : 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-400'
              )}
              title={recurring.is_active ? 'Jeda Transaksi Rutin' : 'Aktifkan Kembali'}
              aria-label={recurring.is_active ? 'Jeda' : 'Aktifkan'}
            >
              {recurring.is_active ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>

            {/* Edit */}
            <button
              onClick={() => onEdit(recurring)}
              className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
              title="Edit Transaksi Rutin"
              aria-label="Edit"
            >
              <Edit2 className="w-4 h-4" />
            </button>

            {/* Delete */}
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="p-1.5 rounded-lg text-gray-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 dark:hover:text-rose-400 transition-colors"
              title="Hapus Transaksi Rutin"
              aria-label="Hapus"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation to manually record */}
      <ConfirmDialog
        open={showExecuteConfirm}
        title="Catat Transaksi Sekarang?"
        message={`Apakah Anda ingin langsung mencatat transaksi "${recurring.note || 'Transaksi Rutin'}" sebesar ${formatCurrency(recurring.amount)} ke dalam dompet sekarang? Tanggal jatuh tempo berikutnya akan dimajukan otomatis.`}
        confirmLabel="Ya, Catat Transaksi"
        cancelLabel="Batal"
        onConfirm={handleExecute}
        onClose={() => setShowExecuteConfirm(false)}
      />

      {/* Confirmation to delete */}
      <ConfirmDialog
        open={showDeleteConfirm}
        title="Hapus Transaksi Rutin?"
        message="Transaksi rutin ini akan dihapus. Riwayat transaksi yang sudah pernah tercatat sebelumnya tidak akan terhapus."
        confirmLabel="Hapus"
        cancelLabel="Batal"
        variant="danger"
        onConfirm={async () => {
          await onDelete(recurring.id)
          setShowDeleteConfirm(false)
        }}
        onClose={() => setShowDeleteConfirm(false)}
      />
    </>
  )
}
