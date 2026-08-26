import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { cn } from '@/lib/utils'
import type { WishlistItem, WishlistPeriod, WishlistPriority } from '@/types'

interface WishlistFormProps {
  initialData?: WishlistItem
  onSubmit: (data: {
    title: string
    estimated_price: number
    period: WishlistPeriod
    priority?: WishlistPriority
    target_date?: string | null
    url?: string | null
    note?: string | null
  }) => Promise<void>
  onCancel: () => void
  submitLabel?: string
}

export function WishlistForm({
  initialData,
  onSubmit,
  onCancel,
  submitLabel = 'Simpan Wishlist',
}: WishlistFormProps) {
  const [title, setTitle] = useState(initialData?.title ?? '')
  const [estimatedPrice, setEstimatedPrice] = useState(
    initialData ? String(initialData.estimated_price) : ''
  )
  const [period, setPeriod] = useState<WishlistPeriod>(initialData?.period ?? 'monthly')
  const [priority, setPriority] = useState<WishlistPriority>(initialData?.priority ?? 'medium')
  const [targetDate, setTargetDate] = useState(initialData?.target_date ?? '')
  const [url, setUrl] = useState(initialData?.url ?? '')
  const [note, setNote] = useState(initialData?.note ?? '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!title.trim()) {
      setError('Nama impian/barang wajib diisi.')
      return
    }

    const price = parseInt(estimatedPrice.replace(/[^\d]/g, ''), 10)
    if (isNaN(price) || price <= 0) {
      setError('Estimasi harga harus lebih dari 0.')
      return
    }

    setLoading(true)
    try {
      await onSubmit({
        title: title.trim(),
        estimated_price: price,
        period,
        priority,
        target_date: targetDate || null,
        url: url.trim() || null,
        note: note.trim() || null,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menyimpan wishlist.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3.5">
      {/* Period Selector (Mingguan, Bulanan, Tahunan) */}
      <div>
        <label className="block text-xs sm:text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">
          Target Periode Wishlist
        </label>
        <div className="grid grid-cols-3 gap-1.5 p-1 bg-gray-100 dark:bg-gray-800 rounded-2xl border border-gray-200/80 dark:border-gray-700/80">
          {(
            [
              { value: 'weekly', label: 'Mingguan' },
              { value: 'monthly', label: 'Bulanan' },
              { value: 'yearly', label: 'Tahunan' },
            ] as const
          ).map(p => (
            <button
              key={p.value}
              type="button"
              onClick={() => setPeriod(p.value)}
              className={cn(
                'py-2 px-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer text-center',
                period === p.value
                  ? 'bg-[#2563EB] text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <Input
        label="Nama Barang / Impian"
        value={title}
        onChange={e => setTitle(e.target.value)}
        placeholder="Contoh: Mechanical Keyboard, Laptop M3, Liburan Bali..."
        error={error}
      />

      <Input
        label="Estimasi Harga (Rp)"
        type="number"
        value={estimatedPrice}
        onChange={e => setEstimatedPrice(e.target.value)}
        placeholder="0"
      />

      {/* Priority Selector */}
      <div>
        <label className="block text-xs sm:text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">
          Tingkat Prioritas
        </label>
        <div className="grid grid-cols-3 gap-2">
          {(
            [
              { value: 'low', label: 'Rendah' },
              { value: 'medium', label: 'Sedang' },
              { value: 'high', label: 'Tinggi' },
            ] as const
          ).map(pr => (
            <button
              key={pr.value}
              type="button"
              onClick={() => setPriority(pr.value)}
              className={cn(
                'py-2 px-2 rounded-xl text-xs font-bold border transition-all duration-200 cursor-pointer text-center',
                priority === pr.value
                  ? 'bg-blue-50 dark:bg-blue-950/40 text-[#2563EB] dark:text-blue-400 border-blue-500 shadow-xs'
                  : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400'
              )}
            >
              {pr.label}
            </button>
          ))}
        </div>
      </div>

      <Input
        label="Target Tanggal Tercapai (opsional)"
        type="date"
        value={targetDate}
        onChange={e => setTargetDate(e.target.value)}
      />

      <Input
        label="Link Produk / Toko Online (opsional)"
        type="url"
        value={url}
        onChange={e => setUrl(e.target.value)}
        placeholder="https://tokopedia.com/..."
      />

      <Input
        label="Catatan / Spesifikasi (opsional)"
        value={note}
        onChange={e => setNote(e.target.value)}
        placeholder="Warna, model, toko rekomendasi, dsb..."
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
