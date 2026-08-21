import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import type { CategoryType } from '@/types'

interface CategoryFormProps {
  initialName?: string
  initialType?: CategoryType
  initialIcon?: string
  onSubmit: (name: string, type: CategoryType, icon: string | null) => Promise<void>
  onCancel: () => void
  submitLabel?: string
}

export function CategoryForm({
  initialName = '',
  initialType = 'expense',
  initialIcon = '',
  onSubmit,
  onCancel,
  submitLabel = 'Simpan',
}: CategoryFormProps) {
  const [name, setName] = useState(initialName)
  const [type, setType] = useState<CategoryType>(initialType)
  const [icon, setIcon] = useState(initialIcon)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!name.trim()) {
      setError('Nama kategori wajib diisi.')
      return
    }
    setLoading(true)
    try {
      await onSubmit(name.trim(), type, icon.trim() || null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menyimpan.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <Input
        label="Nama Kategori"
        value={name}
        onChange={e => setName(e.target.value)}
        placeholder="Contoh: Gaji, Makanan, Transport"
        error={error}
        autoFocus
      />
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
          Tipe
        </label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setType('income')}
            className={`px-3 py-2 text-sm rounded-xl border transition-colors ${
              type === 'income'
                ? 'bg-success-light border-green-500 text-green-700 dark:bg-green-900/30 dark:border-green-500 dark:text-green-300'
                : 'bg-white border-gray-300 text-gray-700 dark:bg-gray-900/50 dark:border-gray-600 dark:text-gray-300'
            }`}
          >
            Pemasukan
          </button>
          <button
            type="button"
            onClick={() => setType('expense')}
            className={`px-3 py-2 text-sm rounded-xl border transition-colors ${
              type === 'expense'
                ? 'bg-danger-light border-red-500 text-red-700 dark:bg-red-900/30 dark:border-red-500 dark:text-red-300'
                : 'bg-white border-gray-300 text-gray-700 dark:bg-gray-900/50 dark:border-gray-600 dark:text-gray-300'
            }`}
          >
            Pengeluaran
          </button>
        </div>
      </div>
      <Input
        label="Ikon (opsional)"
        value={icon}
        onChange={e => setIcon(e.target.value)}
        placeholder="Nama ikon Lucide"
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
