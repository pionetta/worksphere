import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { BottomSheet } from '@/components/ui/BottomSheet'
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

  const editingCategory = categories.find(c => c.id === editingId)

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

        {/* Modal Form Tambah Kategori */}
        <BottomSheet
          open={showForm}
          onClose={() => setShowForm(false)}
          title="Tambah Kategori Baru"
        >
          <div className="pb-4">
            <CategoryForm
              onSubmit={async (name, type, icon) => {
                await onAdd(name, type, icon)
                setShowForm(false)
              }}
              onCancel={() => setShowForm(false)}
            />
          </div>
        </BottomSheet>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button onClick={() => setShowForm(true)} icon={<Plus className="w-4 h-4" />} size="sm">
          Tambah Kategori
        </Button>
      </div>

      <div className="space-y-2">
        {categories.map(category => (
          <div
            key={category.id}
            className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
          >
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
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:text-gray-300 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                aria-label="Edit kategori"
              >
                <Pencil className="w-4 h-4" />
              </button>
              <button
                onClick={() => onRemove(category.id)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-danger hover:bg-danger-light dark:hover:bg-red-900/30 transition-colors cursor-pointer"
                aria-label="Hapus kategori"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Form Tambah Kategori */}
      <BottomSheet
        open={showForm}
        onClose={() => setShowForm(false)}
        title="Tambah Kategori Baru"
      >
        <div className="pb-4">
          <CategoryForm
            onSubmit={async (name, type, icon) => {
              await onAdd(name, type, icon)
              setShowForm(false)
            }}
            onCancel={() => setShowForm(false)}
          />
        </div>
      </BottomSheet>

      {/* Modal Form Edit Kategori */}
      <BottomSheet
        open={editingId !== null}
        onClose={() => setEditingId(null)}
        title={`Edit Kategori: ${editingCategory?.name || ''}`}
        onDelete={
          editingCategory
            ? async () => {
                const id = editingCategory.id
                setEditingId(null)
                await onRemove(id)
              }
            : undefined
        }
        deleteLabel="Hapus Kategori"
      >
        <div className="pb-4">
          {editingCategory && (
            <CategoryForm
              key={editingCategory.id}
              initialName={editingCategory.name}
              initialType={editingCategory.type}
              initialIcon={editingCategory.icon ?? ''}
              onSubmit={async (name, type, icon) => {
                await onEdit(editingCategory.id, { name, type, icon })
                setEditingId(null)
              }}
              onCancel={() => setEditingId(null)}
              submitLabel="Simpan Perubahan"
            />
          )}
        </div>
      </BottomSheet>
    </div>
  )
}
