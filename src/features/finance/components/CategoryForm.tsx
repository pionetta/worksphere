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
      // Default to initialType (or expense) for schema compatibility
      await onSubmit(name.trim(), initialType || 'expense', icon.trim() || null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menyimpan kategori.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3.5">
      <Input
        label="Nama Kategori"
        value={name}
        onChange={e => setName(e.target.value)}
        placeholder="Contoh: Makanan, Gaji, Belanja, Transportasi"
        error={error}
        autoFocus
      />
      <Input
        label="Ikon (opsional)"
        value={icon}
        onChange={e => setIcon(e.target.value)}
        placeholder="Contoh: Utensils, Wallet, ShoppingBag"
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
