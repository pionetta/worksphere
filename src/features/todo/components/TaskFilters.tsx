import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { cn } from '@/utils/cn'
import type {
  TaskFilters as TaskFiltersType,
  SortOption,
} from '@/features/todo/hooks/useTaskFilters'
import type { TaskStatus, TaskPriority } from '@/types'
import { Filter, X, ArrowUpDown } from 'lucide-react'

interface TaskFiltersProps {
  filters: TaskFiltersType
  categories: string[]
  activeFilterCount: number
  onSetStatus: (status: TaskStatus | 'all') => void
  onSetPriority: (priority: TaskPriority | 'all') => void
  onSetCategory: (category: string | 'all') => void
  onSetOverdueOnly: (overdue: boolean) => void
  onSetSort: (sort: SortOption) => void
  onReset: () => void
}

const statusOptions: Array<{ value: TaskStatus | 'all'; label: string }> = [
  { value: 'all', label: 'Semua' },
  { value: 'todo', label: 'Todo' },
  { value: 'in_progress', label: 'Sedang Dikerjakan' },
  { value: 'completed', label: 'Selesai' },
  { value: 'cancelled', label: 'Dibatalkan' },
]

const priorityOptions: Array<{ value: TaskPriority | 'all'; label: string }> = [
  { value: 'all', label: 'Semua prioritas' },
  { value: 'urgent', label: 'Mendesak' },
  { value: 'high', label: 'Tinggi' },
  { value: 'medium', label: 'Sedang' },
  { value: 'low', label: 'Rendah' },
]

const sortOptions: Array<{ value: SortOption; label: string }> = [
  { value: 'deadline', label: 'Deadline terdekat' },
  { value: 'priority', label: 'Prioritas' },
  { value: 'created', label: 'Terbaru dibuat' },
  { value: 'updated', label: 'Terakhir diperbarui' },
]

export function TaskFiltersComponent({
  filters,
  categories,
  activeFilterCount,
  onSetStatus,
  onSetPriority,
  onSetCategory,
  onSetOverdueOnly,
  onSetSort,
  onReset,
}: TaskFiltersProps) {
  const [showFilters, setShowFilters] = useState(false)

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
          icon={<Filter className="w-4 h-4" />}
        >
          Filter
          {activeFilterCount > 0 && (
            <span className="ml-1 w-5 h-5 rounded-full bg-primary-500 text-white text-xs flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </Button>

        <div className="relative">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              const currentIdx = sortOptions.findIndex(s => s.value === filters.sort)
              const nextIdx = (currentIdx + 1) % sortOptions.length
              onSetSort(sortOptions[nextIdx].value)
            }}
            icon={<ArrowUpDown className="w-4 h-4" />}
          >
            {sortOptions.find(s => s.value === filters.sort)?.label}
          </Button>
        </div>

        {activeFilterCount > 0 && (
          <Button variant="ghost" size="sm" onClick={onReset} icon={<X className="w-4 h-4" />}>
            Reset
          </Button>
        )}
      </div>

      {showFilters && (
        <div className="space-y-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
          <div>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Status</p>
            <div className="flex flex-wrap gap-1.5">
              {statusOptions.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => onSetStatus(opt.value)}
                  className={cn(
                    'px-2.5 py-1 text-xs rounded-full border transition-colors',
                    'focus:outline-none focus:ring-2 focus:ring-primary-500',
                    filters.status === opt.value
                      ? 'bg-primary-500 text-white border-primary-500'
                      : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Prioritas</p>
            <div className="flex flex-wrap gap-1.5">
              {priorityOptions.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => onSetPriority(opt.value)}
                  className={cn(
                    'px-2.5 py-1 text-xs rounded-full border transition-colors',
                    'focus:outline-none focus:ring-2 focus:ring-primary-500',
                    filters.priority === opt.value
                      ? 'bg-primary-500 text-white border-primary-500'
                      : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {categories.length > 0 && (
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
                Kategori
              </p>
              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() => onSetCategory('all')}
                  className={cn(
                    'px-2.5 py-1 text-xs rounded-full border transition-colors',
                    'focus:outline-none focus:ring-2 focus:ring-primary-500',
                    filters.category === 'all'
                      ? 'bg-primary-500 text-white border-primary-500'
                      : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                  )}
                >
                  Semua
                </button>
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => onSetCategory(cat)}
                    className={cn(
                      'px-2.5 py-1 text-xs rounded-full border transition-colors',
                      'focus:outline-none focus:ring-2 focus:ring-primary-500',
                      filters.category === cat
                        ? 'bg-primary-500 text-white border-primary-500'
                        : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                    )}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.overdueOnly}
                onChange={e => onSetOverdueOnly(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-primary-500 focus:ring-primary-500"
              />
              <span className="text-xs text-gray-600 dark:text-gray-400">Hanya terlambat</span>
            </label>
          </div>
        </div>
      )}
    </div>
  )
}
