import { useState, useRef, useEffect, useMemo } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { cn } from '@/lib/utils'
import {
  ArrowDownLeft,
  ArrowUpRight,
  Utensils,
  Car,
  ShoppingBag,
  Receipt,
  Gamepad2,
  HeartPulse,
  GraduationCap,
  Briefcase,
  Gift,
  Laptop,
  TrendingUp,
  Tag,
  Sparkles,
  Home,
  Coffee,
  Plane,
  Plus,
  Wallet,
  CreditCard,
  Building2,
  HelpCircle,
  Check,
} from 'lucide-react'
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

function getCategoryIcon(name: string) {
  const lower = name.toLowerCase()
  if (lower.includes('makan') || lower.includes('minum') || lower.includes('kuliner') || lower.includes('food'))
    return <Utensils className="w-4 h-4" />
  if (lower.includes('transport') || lower.includes('bensin') || lower.includes('kendaraan') || lower.includes('ojek'))
    return <Car className="w-4 h-4" />
  if (lower.includes('belanja') || lower.includes('shop') || lower.includes('mall') || lower.includes('pasar'))
    return <ShoppingBag className="w-4 h-4" />
  if (lower.includes('tagihan') || lower.includes('listrik') || lower.includes('air') || lower.includes('wifi') || lower.includes('pulsa'))
    return <Receipt className="w-4 h-4" />
  if (lower.includes('hiburan') || lower.includes('game') || lower.includes('nonton') || lower.includes('hobi'))
    return <Gamepad2 className="w-4 h-4" />
  if (lower.includes('sehat') || lower.includes('obat') || lower.includes('dokter') || lower.includes('medis'))
    return <HeartPulse className="w-4 h-4" />
  if (lower.includes('didik') || lower.includes('sekolah') || lower.includes('kursus') || lower.includes('buku'))
    return <GraduationCap className="w-4 h-4" />
  if (lower.includes('gaji') || lower.includes('salary') || lower.includes('upah'))
    return <Briefcase className="w-4 h-4" />
  if (lower.includes('bonus') || lower.includes('thr') || lower.includes('komisi'))
    return <Sparkles className="w-4 h-4" />
  if (lower.includes('freelance') || lower.includes('proyek') || lower.includes('side'))
    return <Laptop className="w-4 h-4" />
  if (lower.includes('hadiah') || lower.includes('gift') || lower.includes('angpao'))
    return <Gift className="w-4 h-4" />
  if (lower.includes('invest') || lower.includes('dividen') || lower.includes('saham') || lower.includes('crypto'))
    return <TrendingUp className="w-4 h-4" />
  if (lower.includes('rumah') || lower.includes('kos') || lower.includes('sewa'))
    return <Home className="w-4 h-4" />
  if (lower.includes('kopi') || lower.includes('cafe'))
    return <Coffee className="w-4 h-4" />
  if (lower.includes('libur') || lower.includes('travel') || lower.includes('tiket'))
    return <Plane className="w-4 h-4" />
  return <Tag className="w-4 h-4" />
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

  const amountInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const timer = setTimeout(() => {
      amountInputRef.current?.focus()
    }, 150)
    return () => clearTimeout(timer)
  }, [])

  const isEditing = !!initialData

  const handleTypeSwitch = (newType: 'income' | 'expense') => {
    setCurrentType(newType)
    onTypeChange?.(newType)
  }

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\D/g, '')
    if (rawValue.length <= 15) {
      setAmount(rawValue)
    }
  }

  const formattedAmount = amount
    ? new Intl.NumberFormat('id-ID').format(parseInt(amount, 10))
    : ''

  const relevantCategories = useMemo(() => {
    return categories.filter(c => c.type === currentType || !c.type)
  }, [categories, currentType])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!walletId) {
      setError('Pilih dompet terlebih dahulu.')
      return
    }
    const parsedAmount = parseInt(amount, 10)
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
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* 1. Type Switcher Segmented Control (Pengeluaran vs Pemasukan) */}
      {!isEditing && (
        <div className="grid grid-cols-2 p-1 bg-gray-100 dark:bg-gray-800/90 rounded-2xl border border-gray-200/80 dark:border-gray-700/80 shadow-xs gap-1">
          <button
            type="button"
            onClick={() => handleTypeSwitch('expense')}
            className={cn(
              'py-2.5 px-3 rounded-xl text-xs sm:text-sm font-extrabold flex items-center justify-center gap-1.5 transition-all duration-200 cursor-pointer',
              currentType === 'expense'
                ? 'bg-rose-500 text-white shadow-md shadow-rose-500/25 scale-[1.01]'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-200/40 dark:hover:bg-gray-700/40'
            )}
          >
            <ArrowDownLeft className="w-4 h-4 shrink-0 stroke-[2.5]" />
            <span>Pengeluaran</span>
          </button>
          <button
            type="button"
            onClick={() => handleTypeSwitch('income')}
            className={cn(
              'py-2.5 px-3 rounded-xl text-xs sm:text-sm font-extrabold flex items-center justify-center gap-1.5 transition-all duration-200 cursor-pointer',
              currentType === 'income'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/25 scale-[1.01]'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-200/40 dark:hover:bg-gray-700/40'
            )}
          >
            <ArrowUpRight className="w-4 h-4 shrink-0 stroke-[2.5]" />
            <span>Pemasukan</span>
          </button>
        </div>
      )}

      {/* 2. Input Nominal Transaksi Mencolok */}
      <div>
        <label className="block text-xs sm:text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">
          Nominal Transaksi
        </label>
        <div className="relative flex items-center">
          <div
            className={cn(
              'absolute left-4 flex items-center pointer-events-none text-xl sm:text-2xl font-black transition-colors',
              currentType === 'income'
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-rose-500 dark:text-rose-400'
            )}
          >
            Rp
          </div>
          <input
            ref={amountInputRef}
            type="text"
            inputMode="numeric"
            value={formattedAmount}
            onChange={handleAmountChange}
            placeholder="0"
            autoFocus
            className={cn(
              'block w-full pl-14 pr-4 py-3 sm:py-3.5 rounded-2xl text-2xl sm:text-3xl font-black',
              'bg-white dark:bg-gray-900 border transition-all tracking-tight',
              'focus:outline-none focus:ring-2 focus:border-transparent shadow-xs',
              currentType === 'income'
                ? 'text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/60 focus:ring-emerald-500'
                : 'text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800/60 focus:ring-rose-500',
              error && 'border-rose-500 ring-1 ring-rose-500'
            )}
          />
        </div>
        {error && (
          <p className="mt-1.5 text-xs text-rose-500 font-semibold">{error}</p>
        )}
      </div>

      {/* 3. Pilihan Dompet / Akun */}
      <div>
        <label className="block text-xs sm:text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">
          Pilih Dompet / Akun
        </label>
        {wallets.length <= 4 ? (
          <div className="grid grid-cols-2 gap-2">
            {wallets.map(w => {
              const isSelected = walletId === w.id
              return (
                <button
                  key={w.id}
                  type="button"
                  onClick={() => setWalletId(w.id)}
                  className={cn(
                    'p-2.5 rounded-2xl border text-left flex items-center gap-2.5 transition-all cursor-pointer',
                    isSelected
                      ? 'border-[#2563EB] bg-blue-50/70 dark:bg-blue-950/40 text-blue-900 dark:text-blue-100 ring-2 ring-[#2563EB]/20 shadow-xs'
                      : 'border-gray-200/80 dark:border-gray-700/80 bg-white dark:bg-gray-850 text-gray-700 dark:text-gray-300 hover:border-gray-300'
                  )}
                >
                  <div
                    className={cn(
                      'w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-colors',
                      isSelected
                        ? 'bg-[#2563EB] text-white'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
                    )}
                  >
                    {w.type === 'bank' ? (
                      <Building2 className="w-4 h-4" />
                    ) : w.type === 'e_wallet' ? (
                      <CreditCard className="w-4 h-4" />
                    ) : (
                      <Wallet className="w-4 h-4" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-extrabold truncate">{w.name}</p>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate font-semibold">
                      {new Intl.NumberFormat('id-ID', {
                        style: 'currency',
                        currency: 'IDR',
                        maximumFractionDigits: 0,
                      }).format(w.balance)}
                    </p>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-[#2563EB] dark:text-blue-400 shrink-0" />}
                </button>
              )
            })}
          </div>
        ) : (
          <select
            value={walletId}
            onChange={e => setWalletId(e.target.value)}
            className="block w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-colors font-medium"
          >
            {wallets.map(w => (
              <option key={w.id} value={w.id}>
                {w.name} (
                {new Intl.NumberFormat('id-ID', {
                  style: 'currency',
                  currency: 'IDR',
                  maximumFractionDigits: 0,
                }).format(w.balance)}
                )
              </option>
            ))}
          </select>
        )}
      </div>

      {/* 4. Kategori Transaksi (Grid Ikon Ringkas) */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs sm:text-sm font-bold text-gray-700 dark:text-gray-300">
            Kategori Transaksi
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

        {/* Grid Ikon Kategori */}
        <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 max-h-48 overflow-y-auto pr-1 pb-1">
          {/* Opsi Tanpa Kategori */}
          <button
            type="button"
            onClick={() => setCategoryId('')}
            className={cn(
              'p-2 rounded-2xl border text-center flex flex-col items-center justify-center transition-all cursor-pointer group',
              categoryId === ''
                ? 'border-gray-400 dark:border-gray-500 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-xs ring-2 ring-gray-400/20 scale-[1.02]'
                : 'border-gray-200/80 dark:border-gray-800 bg-white/80 dark:bg-gray-900/60 text-gray-600 dark:text-gray-400 hover:border-gray-300'
            )}
          >
            <div
              className={cn(
                'w-8 h-8 rounded-xl flex items-center justify-center mb-1 transition-colors',
                categoryId === ''
                  ? 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-400'
              )}
            >
              <HelpCircle className="w-4 h-4" />
            </div>
            <span className="text-[10px] sm:text-[11px] font-bold truncate max-w-full">
              Tanpa Kategori
            </span>
          </button>

          {/* Daftar Kategori Dinamis */}
          {relevantCategories.map(cat => {
            const isSelected = categoryId === cat.id
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCategoryId(cat.id)}
                className={cn(
                  'p-2 rounded-2xl border text-center flex flex-col items-center justify-center transition-all cursor-pointer group',
                  isSelected
                    ? currentType === 'income'
                      ? 'border-emerald-500 bg-emerald-50/80 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-200 shadow-xs ring-2 ring-emerald-500/30 scale-[1.02]'
                      : 'border-rose-500 bg-rose-50/80 dark:bg-rose-950/50 text-rose-800 dark:text-rose-200 shadow-xs ring-2 ring-rose-500/30 scale-[1.02]'
                    : 'border-gray-200/80 dark:border-gray-800 bg-white/80 dark:bg-gray-900/60 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-700'
                )}
              >
                <div
                  className={cn(
                    'w-8 h-8 rounded-xl flex items-center justify-center mb-1 transition-colors',
                    isSelected
                      ? currentType === 'income'
                        ? 'bg-emerald-500 text-white shadow-xs'
                        : 'bg-rose-500 text-white shadow-xs'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 group-hover:scale-105'
                  )}
                >
                  {getCategoryIcon(cat.name)}
                </div>
                <span className="text-[10px] sm:text-[11px] font-bold truncate max-w-full">
                  {cat.name}
                </span>
              </button>
            )
          })}

          {/* Tombol Tambah Kategori Cepat */}
          {onManageCategories && (
            <button
              type="button"
              onClick={onManageCategories}
              className="p-2 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 text-center flex flex-col items-center justify-center transition-all hover:border-[#2563EB] dark:hover:border-blue-500 hover:bg-blue-50/30 dark:hover:bg-blue-950/20 text-gray-500 dark:text-gray-400 hover:text-[#2563EB] dark:hover:text-blue-400 cursor-pointer group"
            >
              <div className="w-8 h-8 rounded-xl bg-gray-50 dark:bg-gray-800/80 flex items-center justify-center mb-1 group-hover:scale-105 transition-transform">
                <Plus className="w-4 h-4" />
              </div>
              <span className="text-[10px] sm:text-[11px] font-bold truncate max-w-full">
                + Baru
              </span>
            </button>
          )}
        </div>
      </div>

      {/* 5. Tanggal Transaksi */}
      <Input
        label="Tanggal Transaksi"
        type="date"
        value={date}
        onChange={e => setDate(e.target.value)}
      />

      {/* 6. Catatan Ringkas */}
      <Input
        label="Catatan ringkas (opsional)"
        value={note}
        onChange={e => setNote(e.target.value)}
        placeholder="Contoh: Makan siang, beli pulsa..."
      />

      {/* 7. Action Buttons */}
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
              : 'bg-rose-500 hover:bg-rose-600 text-white'
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
