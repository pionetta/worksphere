import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import type { WalletWithBalance } from '@/types'

interface TransferFormProps {
  wallets: WalletWithBalance[]
  onSubmit: (
    sourceWalletId: string,
    targetWalletId: string,
    amount: number,
    date: string,
    note: string | null
  ) => Promise<void>
  onCancel: () => void
}

export function TransferForm({ wallets, onSubmit, onCancel }: TransferFormProps) {
  const [sourceId, setSourceId] = useState(wallets[0]?.id || '')
  const [targetId, setTargetId] = useState(wallets[1]?.id || '')
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0])
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

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
    const parsedAmount = parseInt(amount.replace(/[^\d]/g, ''), 10)
    if (!parsedAmount || parsedAmount <= 0) {
      setError('Nominal harus lebih dari 0.')
      return
    }
    setLoading(true)
    try {
      await onSubmit(sourceId, targetId, parsedAmount, date, note.trim() || null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal mentransfer.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
          Dari Dompet
        </label>
        <select
          value={sourceId}
          onChange={e => setSourceId(e.target.value)}
          className="block w-full px-3 py-2.5 text-sm rounded-xl bg-white dark:bg-gray-900/50 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        >
          {wallets.map(w => (
            <option key={w.id} value={w.id}>
              {w.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
          Ke Dompet
        </label>
        <select
          value={targetId}
          onChange={e => setTargetId(e.target.value)}
          className="block w-full px-3 py-2.5 text-sm rounded-xl bg-white dark:bg-gray-900/50 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        >
          {wallets.map(w => (
            <option key={w.id} value={w.id}>
              {w.name}
            </option>
          ))}
        </select>
      </div>
      <Input
        label="Nominal"
        type="number"
        value={amount}
        onChange={e => setAmount(e.target.value)}
        placeholder="0"
        error={error}
      />
      <Input label="Tanggal" type="date" value={date} onChange={e => setDate(e.target.value)} />
      <Input
        label="Catatan (opsional)"
        value={note}
        onChange={e => setNote(e.target.value)}
        placeholder="Keterangan transfer"
      />
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Batal
        </Button>
        <Button type="submit" loading={loading}>
          Transfer
        </Button>
      </div>
    </form>
  )
}
