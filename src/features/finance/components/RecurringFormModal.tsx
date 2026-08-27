import { useState, useEffect } from 'react'
import { BottomSheet } from '@/components/ui/BottomSheet'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { RefreshCw, Zap, ArrowDownLeft, ArrowUpRight } from 'lucide-react'
import type { RecurringTransaction, Wallet, Category, RecurringFrequency } from '@/types'
import type { CreateRecurringInput, UpdateRecurringInput } from '../schemas/recurringSchema'
import { cn } from '@/lib/utils'

interface RecurringFormModalProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: CreateRecurringInput) => Promise<void>
  onUpdate?: (id: string, data: UpdateRecurringInput) => Promise<void>
  initialData?: RecurringTransaction | null
  wallets: Wallet[]
  categories: Category[]
}

const FREQUENCIES: { value: RecurringFrequency; label: string; desc: string }[] = [
  { value: 'daily', label: 'Harian', desc: 'Setiap hari' },
  { value: 'weekly', label: 'Mingguan', desc: 'Setiap minggu' },
  { value: 'monthly', label: 'Bulanan', desc: 'Setiap bulan' },
  { value: 'yearly', label: 'Tahunan', desc: 'Setiap tahun' },
]

export function RecurringFormModal({
  open,
  onClose,
  onSubmit,
  onUpdate,
  initialData,
  wallets,
  categories,
}: RecurringFormModalProps) {
  const [type, setType] = useState<'income' | 'expense'>('expense')
  const [amount, setAmount] = useState<string>('')
  const [walletId, setWalletId] = useState<string>('')
  const [categoryId, setCategoryId] = useState<string>('')
  const [frequency, setFrequency] = useState<RecurringFrequency>('monthly')
  const [startDate, setStartDate] = useState<string>(() => new Date().toISOString().split('T')[0])
  const [endDate, setEndDate] = useState<string>('')
  const [autoRecord, setAutoRecord] = useState<boolean>(true)
  const [note, setNote] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (initialData) {
      setType(initialData.type)
      setAmount(String(initialData.amount))
      setWalletId(initialData.wallet_id)
      setCategoryId(initialData.category_id || '')
      setFrequency(initialData.frequency)
      setStartDate(initialData.start_date)
      setEndDate(initialData.end_date || '')
      setAutoRecord(initialData.auto_record)
      setNote(initialData.note || '')
    } else {
      setType('expense')
      setAmount('')
      setWalletId(wallets[0]?.id || '')
      setCategoryId('')
      setFrequency('monthly')
      setStartDate(new Date().toISOString().split('T')[0])
      setEndDate('')
      setAutoRecord(true)
      setNote('')
    }
    setError(null)
  }, [initialData, open, wallets])

  const filteredCategories = categories.filter(c => c.type === type && c.is_active)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const numAmount = parseInt(amount.replace(/\D/g, ''), 10)
    if (!numAmount || numAmount <= 0) {
      setError('Nominal harus lebih dari 0')
      return
    }

    if (!walletId) {
      setError('Silakan pilih dompet')
      return
    }

    if (!startDate) {
      setError('Silakan pilih tanggal mulai')
      return
    }

    setLoading(true)
    try {
      if (initialData && onUpdate) {
        await onUpdate(initialData.id, {
          wallet_id: walletId,
          category_id: categoryId || null,
          amount: numAmount,
          frequency,
          end_date: endDate || null,
          auto_record: autoRecord,
          note: note.trim() || null,
        })
      } else {
        await onSubmit({
          wallet_id: walletId,
          category_id: categoryId || null,
          type,
          amount: numAmount,
          frequency,
          start_date: startDate,
          end_date: endDate || null,
          auto_record: autoRecord,
          note: note.trim() || null,
        })
      }
      onClose()
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan saat menyimpan')
    } finally {
      setLoading(false)
    }
  }

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title={initialData ? 'Edit Transaksi Rutin' : 'Tambah Transaksi Rutin / Langganan'}
    >
      <form onSubmit={handleSubmit} className="space-y-4 py-2">
        {error && (
          <div className="p-3 rounded-xl bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 text-xs font-medium border border-rose-200 dark:border-rose-800">
            {error}
          </div>
        )}

        {/* Type Toggle */}
        {!initialData && (
          <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-gray-100 dark:bg-gray-800">
            <button
              type="button"
              onClick={() => setType('expense')}
              className={cn(
                'flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all',
                type === 'expense'
                  ? 'bg-rose-500 text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
              )}
            >
              <ArrowUpRight className="w-4 h-4" />
              Pengeluaran Rutin
            </button>
            <button
              type="button"
              onClick={() => setType('income')}
              className={cn(
                'flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all',
                type === 'income'
                  ? 'bg-emerald-500 text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
              )}
            >
              <ArrowDownLeft className="w-4 h-4" />
              Pemasukan Rutin
            </button>
          </div>
        )}

        {/* Title / Name */}
        <div>
          <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
            Nama Transaksi / Langganan <span className="text-rose-500">*</span>
          </label>
          <Input
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="Contoh: Netflix, Sewa Kos, Internet Indihome, Gaji"
            required
          />
        </div>

        {/* Amount */}
        <div>
          <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
            Nominal (Rp) <span className="text-rose-500">*</span>
          </label>
          <Input
            type="text"
            inputMode="numeric"
            value={amount ? Number(amount).toLocaleString('id-ID') : ''}
            onChange={e => {
              const raw = e.target.value.replace(/\D/g, '')
              setAmount(raw)
            }}
            placeholder="0"
            required
          />
        </div>

        {/* Frequency Picker */}
        <div>
          <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
            Frekuensi Pengulangan <span className="text-rose-500">*</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {FREQUENCIES.map(freq => (
              <button
                key={freq.value}
                type="button"
                onClick={() => setFrequency(freq.value)}
                className={cn(
                  'flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all',
                  frequency === freq.value
                    ? 'border-indigo-600 bg-indigo-50/80 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-bold shadow-xs'
                    : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                )}
              >
                <span className="text-xs font-bold">{freq.label}</span>
                <span className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">{freq.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Wallet & Category */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
              Dompet <span className="text-rose-500">*</span>
            </label>
            <select
              value={walletId}
              onChange={e => setWalletId(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl text-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
              required
            >
              <option value="" disabled>
                Pilih Dompet
              </option>
              {wallets.map(w => (
                <option key={w.id} value={w.id}>
                  {w.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
              Kategori
            </label>
            <select
              value={categoryId}
              onChange={e => setCategoryId(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl text-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              <option value="">(Tanpa Kategori)</option>
              {filteredCategories.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
              Tanggal Mulai / Jatuh Tempo Pertama <span className="text-rose-500">*</span>
            </label>
            <Input
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
              Berakhir Pada (Opsional)
            </label>
            <Input
              type="date"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
              placeholder="Selamanya"
            />
          </div>
        </div>

        {/* Auto Record Switch */}
        <div className="flex items-center justify-between p-3.5 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white">
                Otomatis Catat Transaksi
              </p>
              <p className="text-[11px] text-gray-500 dark:text-gray-400">
                Catat langsung ke saldo dompet saat tanggal jatuh tempo tiba
              </p>
            </div>
          </div>
          <input
            type="checkbox"
            checked={autoRecord}
            onChange={e => setAutoRecord(e.target.checked)}
            className="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
          />
        </div>

        {/* Submit Buttons */}
        <div className="flex items-center justify-end gap-2.5 pt-3">
          <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>
            Batal
          </Button>
          <Button type="submit" loading={loading} icon={<RefreshCw className="w-4 h-4" />}>
            {initialData ? 'Simpan Perubahan' : 'Simpan Transaksi Rutin'}
          </Button>
        </div>
      </form>
    </BottomSheet>
  )
}
