import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { formatCurrency } from '@/utils/currency'
import { ArrowLeftRight, AlertCircle, Sparkles } from 'lucide-react'
import type { WalletWithBalance } from '@/types'

interface TransferFormProps {
  wallets: WalletWithBalance[]
  initialSourceWalletId?: string
  initialTargetWalletId?: string
  onSubmit: (
    sourceWalletId: string,
    targetWalletId: string,
    amount: number,
    date: string,
    note: string | null
  ) => Promise<void>
  onCancel: () => void
}

export function TransferForm({
  wallets,
  initialSourceWalletId,
  initialTargetWalletId,
  onSubmit,
  onCancel,
}: TransferFormProps) {
  const activeWallets = useMemo(() => wallets.filter(w => w.is_active), [wallets])

  const [sourceId, setSourceId] = useState(() => {
    if (initialSourceWalletId && activeWallets.some(w => w.id === initialSourceWalletId)) {
      return initialSourceWalletId
    }
    return activeWallets[0]?.id || ''
  })

  const [targetId, setTargetId] = useState(() => {
    if (initialTargetWalletId && activeWallets.some(w => w.id === initialTargetWalletId && w.id !== initialSourceWalletId)) {
      return initialTargetWalletId
    }
    // Pick the first wallet that is not source
    const other = activeWallets.find(w => w.id !== (initialSourceWalletId || activeWallets[0]?.id))
    return other?.id || activeWallets[1]?.id || ''
  })

  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0])
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const sourceWallet = activeWallets.find(w => w.id === sourceId)
  const targetWallet = activeWallets.find(w => w.id === targetId)

  const parsedAmount = parseInt(amount.replace(/[^\d]/g, ''), 10) || 0
  const isInsufficient = Boolean(sourceWallet && parsedAmount > sourceWallet.balance)

  const handleSwap = () => {
    setSourceId(targetId)
    setTargetId(sourceId)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!sourceId || !targetId) {
      setError('Pilih dompet sumber dan tujuan.')
      return
    }
    if (sourceId === targetId) {
      setError('Dompet sumber dan tujuan tidak boleh sama.')
      return
    }
    if (!parsedAmount || parsedAmount <= 0) {
      setError('Nominal transfer harus lebih dari 0.')
      return
    }
    if (sourceWallet && parsedAmount > sourceWallet.balance) {
      setError(`Saldo ${sourceWallet.name} (${formatCurrency(sourceWallet.balance)}) tidak mencukupi untuk transfer ${formatCurrency(parsedAmount)}.`)
      return
    }

    setLoading(true)
    try {
      await onSubmit(sourceId, targetId, parsedAmount, date, note.trim() || null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal mentransfer dana.')
    } finally {
      setLoading(false)
    }
  }

  if (activeWallets.length < 2) {
    return (
      <div className="p-4 text-center space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
          <ArrowLeftRight className="w-6 h-6" />
        </div>
        <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100">
          Dibutuhkan minimal 2 dompet aktif
        </h4>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Buat minimal 2 dompet untuk dapat memindahkan dana antar dompet.
        </p>
        <div className="pt-2">
          <Button type="button" variant="secondary" onClick={onCancel} className="w-full">
            Tutup
          </Button>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3.5">
      {/* Wallet Selector Row with Swap Button */}
      <div className="space-y-2.5 p-3 rounded-2xl bg-gray-50 dark:bg-gray-850 border border-gray-200/80 dark:border-gray-700/80">
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
              Dari Dompet (Sumber Dana)
            </label>
            {sourceWallet && (
              <span className="text-[11px] font-semibold text-gray-500 dark:text-gray-400">
                Saldo: <strong className="text-gray-900 dark:text-gray-100">{formatCurrency(sourceWallet.balance)}</strong>
              </span>
            )}
          </div>
          <select
            value={sourceId}
            onChange={e => setSourceId(e.target.value)}
            className="block w-full px-3 py-2.5 text-xs sm:text-sm font-medium rounded-xl bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            {activeWallets.map(w => (
              <option key={w.id} value={w.id}>
                {w.name} — Saldo: {formatCurrency(w.balance)}
              </option>
            ))}
          </select>
        </div>

        {/* Swap Button */}
        <div className="flex justify-center -my-1">
          <button
            type="button"
            onClick={handleSwap}
            className="p-1.5 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-primary-600 dark:text-primary-400 shadow-2xs hover:scale-110 active:scale-95 transition-all cursor-pointer"
            title="Tukar Dompet Sumber & Tujuan"
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
              Ke Dompet (Tujuan)
            </label>
            {targetWallet && (
              <span className="text-[11px] font-semibold text-gray-500 dark:text-gray-400">
                Saldo: <strong className="text-gray-900 dark:text-gray-100">{formatCurrency(targetWallet.balance)}</strong>
              </span>
            )}
          </div>
          <select
            value={targetId}
            onChange={e => setTargetId(e.target.value)}
            className="block w-full px-3 py-2.5 text-xs sm:text-sm font-medium rounded-xl bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            {activeWallets.map(w => (
              <option key={w.id} value={w.id} disabled={w.id === sourceId}>
                {w.name} {w.id === sourceId ? '(Sumber)' : `— Saldo: ${formatCurrency(w.balance)}`}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Amount Input */}
      <div>
        <Input
          label="Nominal Transfer (Rp)"
          type="number"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          placeholder="0"
          error={error}
          autoFocus
        />

        {/* Quick Amount Pills */}
        {sourceWallet && sourceWallet.balance > 0 && (
          <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
            <span className="text-[10px] text-gray-400 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-500" /> Cepat:
            </span>
            {[50000, 100000, 250000, 500000].filter(v => v <= sourceWallet.balance).map(val => (
              <button
                key={val}
                type="button"
                onClick={() => setAmount(String(val))}
                className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-primary-50 hover:text-primary-600 dark:hover:bg-primary-950/50 transition-colors cursor-pointer"
              >
                {formatCurrency(val)}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setAmount(String(sourceWallet.balance))}
              className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-primary-50 dark:bg-primary-950/60 text-primary-700 dark:text-primary-300 hover:bg-primary-100 transition-colors cursor-pointer border border-primary-200 dark:border-primary-800"
            >
              Semua Saldo
            </button>
          </div>
        )}

        {isInsufficient && (
          <div className="flex items-center gap-1.5 mt-1 text-[11px] text-rose-600 dark:text-rose-400 font-medium">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>Nominal melebihi saldo dompet sumber ({formatCurrency(sourceWallet?.balance || 0)})</span>
          </div>
        )}
      </div>

      <Input label="Tanggal Transfer" type="date" value={date} onChange={e => setDate(e.target.value)} />
      
      <Input
        label="Keterangan / Catatan (opsional)"
        value={note}
        onChange={e => setNote(e.target.value)}
        placeholder="Contoh: Top up e-wallet, tarik tunai ATM"
      />

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Batal
        </Button>
        <Button type="submit" loading={loading} disabled={isInsufficient || parsedAmount <= 0}>
          Transfer Dana
        </Button>
      </div>
    </form>
  )
}
