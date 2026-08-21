import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { CategoryForm } from './CategoryForm'
import { Tags, Plus, Pencil, Trash2 } from 'lucide-react'
import type { Category, CategoryType } from '@/types'

interface CategoryListProps {
  categories: Category[]
  loading?: boolean
  onAdd: (name: string, type: CategoryType, icon: string | null) => Promise<void>
  onEdit: (id: string, data: Partial<Pick<Category, 'name' | 'type' | 'icon'>>) => Promise<void>
  onRemove: (id: string) => Promise<void>
}

export function CategoryList({ categories, loading, onAdd, onEdit, onRemove }: CategoryListProps) {
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  if (categories.length === 0 && !loading && !showForm) {
    return (
      <div>
        <div className="flex justify-end mb-4">
          <Button onClick={() => setShowForm(true)} icon={<Plus className="w-4 h-4" />} size="sm">
            Tambah Kategori
          </Button>
        </div>
        <EmptyState
          icon={<Tags className="w-6 h-6 text-gray-400" />}
          title="Belum ada kategori"
          description="Tambahkan kategori untuk mengelompokkan transaksi."
          action={
            <Button onClick={() => setShowForm(true)} icon={<Plus className="w-4 h-4" />}>
              Tambah Kategori
            </Button>
          }
        />
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-end mb-4">
        {!showForm && (
          <Button onClick={() => setShowForm(true)} icon={<Plus className="w-4 h-4" />} size="sm">
            Tambah Kategori
          </Button>
        )}
      </div>

      {showForm && (
        <div className="mb-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
          <CategoryForm
            onSubmit={async (name, type, icon) => {
              await onAdd(name, type, icon)
              setShowForm(false)
            }}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}

      <div className="space-y-2">
        {categories.map(category => (
          <div
            key={category.id}
            className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
          >
            {editingId === category.id ? (
              <div className="flex-1 mr-2">
                <CategoryForm
                  initialName={category.name}
                  initialType={category.type}
                  initialIcon={category.icon ?? ''}
                  onSubmit={async (name, type, icon) => {
                    await onEdit(category.id, { name, type, icon })
                    setEditingId(null)
                  }}
                  onCancel={() => setEditingId(null)}
                  submitLabel="Update"
                />
              </div>
            ) : (
              <>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                      {category.name}
                    </p>
                    <Badge variant={category.type === 'income' ? 'success' : 'danger'}>
                      {category.type === 'income' ? 'Pemasukan' : 'Pengeluaran'}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 ml-2">
                  <button
                    onClick={() => setEditingId(category.id)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:text-gray-300 dark:hover:bg-gray-700 transition-colors"
                    aria-label="Edit kategori"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onRemove(category.id)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-danger hover:bg-danger-light dark:hover:bg-red-900/30 transition-colors"
                    aria-label="Hapus kategori"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
