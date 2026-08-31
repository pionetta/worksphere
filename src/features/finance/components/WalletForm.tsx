import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import type { WalletType } from '@/types'

interface WalletFormProps {
  initialName?: string
  initialType?: WalletType
  initialBalance?: number
  initialNote?: string
  onSubmit: (
    name: string,
    type: WalletType,
    balance: number,
    note: string | null
  ) => Promise<void>
  onCancel: () => void
  submitLabel?: string
}

const walletTypes: { value: WalletType; label: string }[] = [
  { value: 'bank', label: 'Bank' },
  { value: 'e_wallet', label: 'E-Wallet' },
  { value: 'cash', label: 'Tunai' },
  { value: 'other', label: 'Lainnya' },
]

export function WalletForm({
  initialName = '',
  initialType = 'bank',
  initialBalance = 0,
  initialNote = '',
  onSubmit,
  onCancel,
  submitLabel = 'Simpan',
}: WalletFormProps) {
  const [name, setName] = useState(initialName)
  const [type, setType] = useState<WalletType>(initialType)
  const [balance, setBalance] = useState(String(initialBalance))
  const [note, setNote] = useState(initialNote)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const isEditing = submitLabel.toLowerCase().includes('update') || submitLabel.toLowerCase().includes('edit')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!name.trim()) {
      setError('Nama dompet wajib diisi.')
      return
    }
    const parsedBalance = parseInt(balance.replace(/[^\d]/g, ''), 10) || 0
    if (parsedBalance < 0) {
      setError('Saldo dompet tidak boleh negatif.')
      return
    }
    setLoading(true)
    try {
      await onSubmit(name.trim(), type, parsedBalance, note.trim() || null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menyimpan dompet.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3.5">
      <Input
        label="Nama Dompet"
        value={name}
        onChange={e => setName(e.target.value)}
        placeholder="Contoh: BCA, GoPay, Dompet Tunai"
        error={error}
        autoFocus
      />
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
          Tipe Dompet
        </label>
        <div className="grid grid-cols-4 gap-2">
          {walletTypes.map(wt => (
            <button
              key={wt.value}
              type="button"
              onClick={() => setType(wt.value)}
              className={`px-3 py-2 text-xs sm:text-sm font-semibold rounded-xl border transition-colors cursor-pointer ${
                type === wt.value
                  ? 'bg-primary-50 border-primary-500 text-primary-700 dark:bg-primary-900/30 dark:border-primary-500 dark:text-primary-300 shadow-2xs'
                  : 'bg-white border-gray-300 text-gray-700 dark:bg-gray-900/50 dark:border-gray-600 dark:text-gray-300 hover:bg-gray-50'
              }`}
            >
              {wt.label}
            </button>
          ))}
        </div>
      </div>
      <Input
        label={isEditing ? 'Saldo Dompet (Rp)' : 'Saldo Awal (Rp)'}
        type="number"
        value={balance}
        onChange={e => setBalance(e.target.value)}
        placeholder="0"
      />
      <Input
        label="Keterangan (opsional)"
        value={note}
        onChange={e => setNote(e.target.value)}
        placeholder="Catatan tentang dompet ini"
      />
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Batal
        </Button>
        <Button type="submit" loading={loading}>
          {submitLabel}
        </Button>
      </div>
    </form>
  )
}
