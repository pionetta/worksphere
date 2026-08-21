import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { BottomSheet } from '@/components/ui/BottomSheet'
import { X, Filter, RotateCcw } from 'lucide-react'
import type {
  TransactionFilters,
  TransactionTypeFilter,
  TransactionSort,
} from '../utils/transactionFilters'
import { DEFAULT_FILTERS } from '../utils/transactionFilters'
import type { Category, Wallet } from '@/types'

interface TransactionFilterProps {
  filters: TransactionFilters
  onFiltersChange: (filters: TransactionFilters) => void
  categories: Category[]
  wallets: Wallet[]
}

const TYPE_OPTIONS: Array<{ value: TransactionTypeFilter; label: string }> = [
  { value: 'all', label: 'Semua' },
  { value: 'income', label: 'Pemasukan' },
  { value: 'expense', label: 'Pengeluaran' },
  { value: 'transfer', label: 'Transfer' },
  { value: 'adjustment', label: 'Penyesuaian' },
]

const DATE_OPTIONS: Array<{ value: TransactionFilters['dateRange']; label: string }> = [
  { value: 'all', label: 'Semua' },
  { value: 'today', label: 'Hari ini' },
  { value: 'week', label: 'Minggu ini' },
  { value: 'month', label: 'Bulan ini' },
  { value: 'custom', label: 'Rentang tanggal' },
]

const SORT_OPTIONS: Array<{ value: TransactionSort; label: string }> = [
  { value: 'newest', label: 'Terbaru' },
  { value: 'oldest', label: 'Terlama' },
  { value: 'highest', label: 'Nominal terbesar' },
  { value: 'lowest', label: 'Nominal terkecil' },
]

export function TransactionFilter({
  filters,
  onFiltersChange,
  categories,
  wallets,
}: TransactionFilterProps) {
  const [showSheet, setShowSheet] = useState(false)
  const [localFilters, setLocalFilters] = useState<TransactionFilters>(filters)

  const activeFilterCount = countActiveFilters(filters)

  const handleApply = () => {
    onFiltersChange(localFilters)
    setShowSheet(false)
  }

  const handleReset = () => {
    setLocalFilters(DEFAULT_FILTERS)
    onFiltersChange(DEFAULT_FILTERS)
    setShowSheet(false)
  }

  const updateLocal = (patch: Partial<TransactionFilters>) => {
    setLocalFilters(prev => ({ ...prev, ...patch }))
  }

  return (
    <>
      <Button
        variant="secondary"
        size="sm"
        onClick={() => {
          setLocalFilters(filters)
          setShowSheet(true)
        }}
        icon={<Filter className="w-4 h-4" />}
      >
        Filter
        {activeFilterCount > 0 && (
          <span className="ml-1 px-1.5 py-0.5 text-xs rounded-full bg-primary-500 text-white">
            {activeFilterCount}
          </span>
        )}
      </Button>

      <BottomSheet open={showSheet} onClose={() => setShowSheet(false)}>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Filter Transaksi
            </h3>
            <button
              onClick={() => setShowSheet(false)}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:text-gray-300 dark:hover:bg-gray-700"
              aria-label="Tutup"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Jenis Transaksi
            </label>
            <div className="flex flex-wrap gap-2">
              {TYPE_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => updateLocal({ type: opt.value })}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    localFilters.type === opt.value
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Date Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Periode
            </label>
            <div className="flex flex-wrap gap-2">
              {DATE_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => updateLocal({ dateRange: opt.value })}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    localFilters.dateRange === opt.value
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            {localFilters.dateRange === 'custom' && (
              <div className="flex gap-2 mt-2">
                <input
                  type="date"
                  value={localFilters.startDate ?? ''}
                  onChange={e => updateLocal({ startDate: e.target.value || null })}
                  className="flex-1 px-3 py-2 text-sm rounded-xl bg-white dark:bg-gray-900/50 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                  aria-label="Tanggal mulai"
                />
                <input
                  type="date"
                  value={localFilters.endDate ?? ''}
                  onChange={e => updateLocal({ endDate: e.target.value || null })}
                  className="flex-1 px-3 py-2 text-sm rounded-xl bg-white dark:bg-gray-900/50 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                  aria-label="Tanggal akhir"
                />
              </div>
            )}
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Kategori
            </label>
            <select
              value={localFilters.categoryId ?? ''}
              onChange={e => updateLocal({ categoryId: e.target.value || null })}
              className="w-full px-3 py-2 text-sm rounded-xl bg-white dark:bg-gray-900/50 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
              aria-label="Filter kategori"
            >
              <option value="">Semua kategori</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.type === 'income' ? 'Pemasukan' : 'Pengeluaran'})
                </option>
              ))}
            </select>
          </div>

          {/* Wallet Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Dompet
            </label>
            <select
              value={localFilters.walletId ?? ''}
              onChange={e => updateLocal({ walletId: e.target.value || null })}
              className="w-full px-3 py-2 text-sm rounded-xl bg-white dark:bg-gray-900/50 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
              aria-label="Filter dompet"
            >
              <option value="">Semua dompet</option>
              {wallets.map(w => (
                <option key={w.id} value={w.id}>
                  {w.name}
                </option>
              ))}
            </select>
          </div>

          {/* Sort */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Urutkan
            </label>
            <select
              value={localFilters.sort}
              onChange={e => updateLocal({ sort: e.target.value as TransactionSort })}
              className="w-full px-3 py-2 text-sm rounded-xl bg-white dark:bg-gray-900/50 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
              aria-label="Urutkan transaksi"
            >
              {SORT_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Cari
            </label>
            <input
              type="text"
              value={localFilters.search}
              onChange={e => updateLocal({ search: e.target.value })}
              placeholder="Cari catatan, kategori, atau dompet..."
              className="w-full px-3 py-2 text-sm rounded-xl bg-white dark:bg-gray-900/50 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder-gray-400"
              aria-label="Cari transaksi"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-between gap-2 pt-2">
            <Button variant="ghost" onClick={handleReset} icon={<RotateCcw className="w-4 h-4" />}>
              Reset
            </Button>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => setShowSheet(false)}>
                Batal
              </Button>
              <Button onClick={handleApply}>Terapkan</Button>
            </div>
          </div>
        </div>
      </BottomSheet>
    </>
  )
}

function countActiveFilters(filters: TransactionFilters): number {
  let count = 0
  if (filters.dateRange !== 'all') count++
  if (filters.categoryId) count++
  if (filters.walletId) count++
  if (filters.type !== 'all') count++
  if (filters.search.trim()) count++
  return count
}
