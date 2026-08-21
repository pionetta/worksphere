import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { MemberForm } from './MemberForm'
import { Users, Plus, Pencil, UserCheck, UserX } from 'lucide-react'
import type { Member } from '@/types'
import { cn } from '@/utils/cn'

interface MemberListProps {
  members: Member[]
  loading?: boolean
  onAdd: (name: string, note: string | null) => Promise<void>
  onEdit: (id: string, data: Partial<Pick<Member, 'name' | 'note'>>) => Promise<void>
  onToggleActive: (id: string, isActive: boolean) => Promise<void>
}

export function MemberList({ members, loading, onAdd, onEdit, onToggleActive }: MemberListProps) {
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  if (members.length === 0 && !loading && !showForm) {
    return (
      <div>
        <div className="flex justify-end mb-4">
          <Button onClick={() => setShowForm(true)} icon={<Plus className="w-4 h-4" />} size="sm">
            Tambah Anggota
          </Button>
        </div>
        <EmptyState
          icon={<Users className="w-6 h-6 text-gray-400" />}
          title="Belum ada anggota"
          description="Tambahkan anggota untuk mulai mencatat absensi."
          action={
            <Button onClick={() => setShowForm(true)} icon={<Plus className="w-4 h-4" />}>
              Tambah Anggota
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
            Tambah Anggota
          </Button>
        )}
      </div>

      {showForm && (
        <div className="mb-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
          <MemberForm
            onSubmit={async (name, note) => {
              await onAdd(name, note)
              setShowForm(false)
            }}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}

      <div className="space-y-2">
        {members.map(member => (
          <div
            key={member.id}
            className={cn(
              'flex items-center justify-between p-3 rounded-xl border',
              'bg-white dark:bg-gray-800',
              'border-gray-200 dark:border-gray-700',
              !member.is_active && 'opacity-60'
            )}
          >
            {editingId === member.id ? (
              <div className="flex-1 mr-2">
                <MemberForm
                  initialName={member.name}
                  initialNote={member.note ?? ''}
                  onSubmit={async (name, note) => {
                    await onEdit(member.id, { name, note })
                    setEditingId(null)
                  }}
                  onCancel={() => setEditingId(null)}
                  submitLabel="Update"
                />
              </div>
            ) : (
              <>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                    {member.name}
                  </p>
                  {member.note && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {member.note}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-1.5 ml-2">
                  <Badge variant={member.is_active ? 'success' : 'default'}>
                    {member.is_active ? 'Aktif' : 'Nonaktif'}
                  </Badge>
                  <button
                    onClick={() => setEditingId(member.id)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:text-gray-300 dark:hover:bg-gray-700 transition-colors"
                    aria-label="Edit anggota"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onToggleActive(member.id, member.is_active)}
                    className={cn(
                      'p-1.5 rounded-lg transition-colors',
                      member.is_active
                        ? 'text-warning hover:bg-warning-light dark:hover:bg-amber-900/30'
                        : 'text-success hover:bg-success-light dark:hover:bg-green-900/30'
                    )}
                    aria-label={member.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                  >
                    {member.is_active ? (
                      <UserX className="w-4 h-4" />
                    ) : (
                      <UserCheck className="w-4 h-4" />
                    )}
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
