import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import type { WalletWithBalance, Category, Transaction } from '@/types'

interface TransactionFormProps {
  wallets: WalletWithBalance[]
  categories: Category[]
  type: 'income' | 'expense'
  initialData?: Transaction
  onSubmit: (
    walletId: string,
    amount: number,
    categoryId: string | null,
    date: string,
    note: string | null
  ) => Promise<void>
  onCancel: () => void
}

export function TransactionForm({
  wallets,
  categories,
  type,
  initialData,
  onSubmit,
  onCancel,
}: TransactionFormProps) {
  const [walletId, setWalletId] = useState(initialData?.wallet_id || wallets[0]?.id || '')
  const [amount, setAmount] = useState(initialData ? String(initialData.amount) : '')
  const [categoryId, setCategoryId] = useState<string>(initialData?.category_id || '')
  const [date, setDate] = useState(
    () => initialData?.transaction_date || new Date().toISOString().split('T')[0]
  )
  const [note, setNote] = useState(initialData?.note || '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const isEditing = !!initialData

  const filteredCategories = categories.filter(c => c.type === type)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!walletId) {
      setError('Pilih dompet terlebih dahulu.')
      return
    }
    const parsedAmount = parseInt(amount.replace(/[^\d]/g, ''), 10)
    if (!parsedAmount || parsedAmount <= 0) {
      setError('Nominal harus lebih dari 0.')
      return
    }
    setLoading(true)
    try {
      await onSubmit(walletId, parsedAmount, categoryId || null, date, note.trim() || null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menyimpan.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
          Dompet
        </label>
        <select
          value={walletId}
          onChange={e => setWalletId(e.target.value)}
            className="block w-full px-3 py-2.5 text-sm rounded-xl bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
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
      {filteredCategories.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Kategori (opsional)
          </label>
          <select
            value={categoryId}
            onChange={e => setCategoryId(e.target.value)}
          className="block w-full px-3 py-2.5 text-sm rounded-xl bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
          >
            <option value="">Tanpa kategori</option>
            {filteredCategories.map(c => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      )}
      <Input label="Tanggal" type="date" value={date} onChange={e => setDate(e.target.value)} />
      <Input
        label="Catatan (opsional)"
        value={note}
        onChange={e => setNote(e.target.value)}
        placeholder="Keterangan transaksi"
      />
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Batal
        </Button>
        <Button type="submit" loading={loading}>
          {isEditing ? 'Perbarui' : 'Simpan'}
        </Button>
      </div>
    </form>
  )
}
