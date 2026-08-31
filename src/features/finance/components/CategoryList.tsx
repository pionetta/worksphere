import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/Button'
import { BottomSheet } from '@/components/ui/BottomSheet'
import { EmptyState } from '@/components/ui/EmptyState'
import { CategoryForm } from './CategoryForm'
import { Tag, Plus, Pencil, Trash2, Search } from 'lucide-react'
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
  const [searchQuery, setSearchQuery] = useState('')

  const editingCategory = categories.find(c => c.id === editingId)

  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return categories
    return categories.filter(cat =>
      cat.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [categories, searchQuery])

  if (loading && categories.length === 0) {
    return (
      <div className="py-8 text-center text-xs text-gray-500">
        Memuat kategori...
      </div>
    )
  }

  return (
    <div className="space-y-3.5">
      {/* Header Toolbar: Count & Tambah Button */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-xs font-bold text-gray-700 dark:text-gray-300">
          <Tag className="w-3.5 h-3.5 text-primary-600" />
          <span>Total {categories.length} Kategori</span>
        </div>

        <Button
          size="sm"
          onClick={() => setShowForm(true)}
          icon={<Plus className="w-4 h-4" />}
          className="shadow-xs"
        >
          Tambah Kategori
        </Button>
      </div>

      {/* Search Bar */}
      {categories.length > 4 && (
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Cari kategori..."
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      )}

      {/* Category List Items */}
      {filteredCategories.length === 0 ? (
        <EmptyState
          icon={<Tag className="w-6 h-6 text-gray-400" />}
          title="Tidak ada kategori"
          description={searchQuery ? 'Kategori yang Anda cari tidak ditemukan.' : 'Belum ada kategori yang ditambahkan.'}
          action={
            <Button size="sm" onClick={() => setShowForm(true)} icon={<Plus className="w-4 h-4" />}>
              Tambah Kategori Baru
            </Button>
          }
        />
      ) : (
        <div className="space-y-1.5 max-h-[380px] overflow-y-auto pr-0.5">
          {filteredCategories.map(category => (
            <div
              key={category.id}
              className="flex items-center justify-between p-2.5 sm:p-3 rounded-xl bg-white dark:bg-gray-850 border border-gray-200/80 dark:border-gray-700/80 hover:border-gray-300 dark:hover:border-gray-600 transition-all shadow-2xs"
            >
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 bg-primary-50 text-primary-600 dark:bg-primary-950/50 dark:text-primary-400">
                  <Tag className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-bold text-gray-900 dark:text-gray-100 truncate">
                    {category.name}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1 ml-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setEditingId(category.id)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 dark:hover:text-gray-300 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                  title="Edit Kategori"
                  aria-label={`Edit ${category.name}`}
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => onRemove(category.id)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                  title="Hapus Kategori"
                  aria-label={`Hapus ${category.name}`}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

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
