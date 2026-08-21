import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import type { Category } from '@/types'

interface BudgetFormProps {
  categories: Category[]
  initialCategoryId?: string
  initialAmount?: number
  initialNote?: string
  onSubmit: (categoryId: string, amount: number, note: string | null) => Promise<void>
  onCancel: () => void
  submitLabel?: string
}

export function BudgetForm({
  categories,
  initialCategoryId = '',
  initialAmount,
  initialNote = '',
  onSubmit,
  onCancel,
  submitLabel = 'Simpan',
}: BudgetFormProps) {
  const [categoryId, setCategoryId] = useState(initialCategoryId)
  const [amount, setAmount] = useState(initialAmount ? String(initialAmount) : '')
  const [note, setNote] = useState(initialNote)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const expenseCategories = categories.filter(c => c.type === 'expense' && c.is_active)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!categoryId) {
      setError('Pilih kategori terlebih dahulu.')
      return
    }
    const parsedAmount = parseInt(amount.replace(/[^\d]/g, ''), 10)
    if (!parsedAmount || parsedAmount <= 0) {
      setError('Anggaran harus lebih dari 0.')
      return
    }
    setLoading(true)
    try {
      await onSubmit(categoryId, parsedAmount, note.trim() || null)
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
          Kategori Pengeluaran
        </label>
        <select
          value={categoryId}
          onChange={e => setCategoryId(e.target.value)}
          className="block w-full px-3 py-2.5 text-sm rounded-xl bg-white dark:bg-gray-900/50 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          disabled={!!initialCategoryId}
        >
          <option value="">Pilih kategori</option>
          {expenseCategories.map(c => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>
      <Input
        label="Anggaran"
        type="number"
        value={amount}
        onChange={e => setAmount(e.target.value)}
        placeholder="0"
        error={error}
      />
      <Input
        label="Catatan (opsional)"
        value={note}
        onChange={e => setNote(e.target.value)}
        placeholder="Keterangan anggaran"
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
