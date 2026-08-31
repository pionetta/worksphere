import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { cn } from '@/lib/utils'
import { ArrowDownLeft, ArrowUpRight, Tag } from 'lucide-react'
import type { WalletWithBalance, Category, Transaction } from '@/types'

interface TransactionFormProps {
  wallets: WalletWithBalance[]
  categories: Category[]
  type: 'income' | 'expense'
  initialData?: Transaction
  onTypeChange?: (type: 'income' | 'expense') => void
  onManageCategories?: () => void
  onSubmit: (
    walletId: string,
    amount: number,
    categoryId: string | null,
    date: string,
    note: string | null,
    type?: 'income' | 'expense'
  ) => Promise<void>
  onCancel: () => void
}

export function TransactionForm({
  wallets,
  categories,
  type,
  initialData,
  onTypeChange,
  onManageCategories,
  onSubmit,
  onCancel,
}: TransactionFormProps) {
  const [currentType, setCurrentType] = useState<'income' | 'expense'>(
    initialData?.type === 'income' ? 'income' : type
  )
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

  const filteredCategories = categories.filter(c => c.type === currentType)

  const handleTypeSwitch = (newType: 'income' | 'expense') => {
    setCurrentType(newType)
    setCategoryId('')
    onTypeChange?.(newType)
  }

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
      await onSubmit(
        walletId,
        parsedAmount,
        categoryId || null,
        date,
        note.trim() || null,
        currentType
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menyimpan.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {/* Type Switcher Segmented Control (Pemasukan vs Pengeluaran) */}
      {!isEditing && (
        <div className="grid grid-cols-2 p-1 bg-gray-100 dark:bg-gray-800/80 rounded-2xl border border-gray-200/80 dark:border-gray-700/80">
          <button
            type="button"
            onClick={() => handleTypeSwitch('expense')}
            className={cn(
              'py-2 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all duration-200 cursor-pointer',
              currentType === 'expense'
                ? 'bg-rose-500 text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            )}
          >
            <ArrowDownLeft className="w-4 h-4 shrink-0" />
            <span>Pengeluaran</span>
          </button>
          <button
            type="button"
            onClick={() => handleTypeSwitch('income')}
            className={cn(
              'py-2 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all duration-200 cursor-pointer',
              currentType === 'income'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            )}
          >
            <ArrowUpRight className="w-4 h-4 shrink-0" />
            <span>Pemasukan</span>
          </button>
        </div>
      )}

      <div>
        <label className="block text-xs sm:text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">
          Pilih Dompet / Akun
        </label>
        <select
          value={walletId}
          onChange={e => setWalletId(e.target.value)}
          className="block w-full px-3 py-2.5 text-xs sm:text-sm rounded-xl bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-colors font-medium"
        >
          {wallets.map(w => (
            <option key={w.id} value={w.id}>
              {w.name}
            </option>
          ))}
        </select>
      </div>

      <Input
        label="Nominal (Rp)"
        type="number"
        value={amount}
        onChange={e => setAmount(e.target.value)}
        placeholder="0"
        error={error}
      />

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs sm:text-sm font-bold text-gray-700 dark:text-gray-300">
            Kategori {currentType === 'income' ? 'Pemasukan' : 'Pengeluaran'} (opsional)
          </label>
          {onManageCategories && (
            <button
              type="button"
              onClick={onManageCategories}
              className="text-xs font-bold text-[#2563EB] dark:text-blue-400 hover:underline cursor-pointer flex items-center gap-1"
            >
              <Tag className="w-3 h-3" />
              <span>Kelola Kategori</span>
            </button>
          )}
        </div>
        <select
          value={categoryId}
          onChange={e => setCategoryId(e.target.value)}
          className="block w-full px-3 py-2.5 text-xs sm:text-sm rounded-xl bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-colors font-medium"
        >
          <option value="">Tanpa kategori</option>
          {filteredCategories.map(c => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <Input label="Tanggal Transaksi" type="date" value={date} onChange={e => setDate(e.target.value)} />

      <Input
        label="Catatan (opsional)"
        value={note}
        onChange={e => setNote(e.target.value)}
        placeholder="Contoh: Gaji bulanan, makan siang, beli pulsa..."
      />

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Batal
        </Button>
        <Button
          type="submit"
          loading={loading}
          className={cn(
            currentType === 'income'
              ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
              : 'bg-[#2563EB] hover:bg-blue-700 text-white'
          )}
        >
          {isEditing
            ? 'Perbarui Transaksi'
            : currentType === 'income'
            ? 'Simpan Pemasukan'
            : 'Simpan Pengeluaran'}
        </Button>
      </div>
    </form>
  )
}
