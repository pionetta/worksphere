import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { MemberForm } from './MemberForm'
import { Users, Plus, Pencil, UserCheck, UserX } from 'lucide-react'
import { toast } from 'sonner'
import type { Member } from '@/types'
import { cn } from '@/lib/utils'

interface MemberListProps {
  members: Member[]
  loading?: boolean
  onAdd: (name: string, note: string | null) => Promise<void>
  onEdit: (id: string, data: Partial<Pick<Member, 'name' | 'note'>>) => Promise<void>
  onToggleActive: (id: string, isActive: boolean) => Promise<void>
}

// Function to generate deterministic color for avatars
function getAvatarBg(name: string) {
  const colors = [
    'bg-indigo-500 text-white',
    'bg-sky-500 text-white',
    'bg-emerald-500 text-white',
    'bg-violet-500 text-white',
    'bg-amber-500 text-white',
    'bg-rose-500 text-white',
    'bg-teal-500 text-white',
    'bg-pink-500 text-white',
  ]
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return colors[Math.abs(hash) % colors.length]
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
              try {
                await onAdd(name, note)
                toast.success(`Anggota "${name}" berhasil ditambahkan`)
                setShowForm(false)
              } catch {
                toast.error('Gagal menambahkan anggota')
              }
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
              'flex items-center justify-between p-3 rounded-xl border transition-all duration-200',
              'bg-white dark:bg-gray-800',
              'border-gray-200 dark:border-gray-700 hover:border-primary-200 dark:hover:border-primary-800/80 shadow-xs hover:shadow-sm',
              !member.is_active && 'opacity-60'
            )}
          >
            {editingId === member.id ? (
              <div className="flex-1 mr-2">
                <MemberForm
                  initialName={member.name}
                  initialNote={member.note ?? ''}
                  onSubmit={async (name, note) => {
                    try {
                      await onEdit(member.id, { name, note })
                      toast.success(`Anggota "${name}" berhasil diperbarui`)
                      setEditingId(null)
                    } catch {
                      toast.error('Gagal memperbarui anggota')
                    }
                  }}
                  onCancel={() => setEditingId(null)}
                  submitLabel="Update"
                />
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <Avatar className="h-9 w-9 shrink-0 shadow-xs ring-1 ring-black/5 dark:ring-white/10">
                    <AvatarFallback className={cn('text-xs font-bold', getAvatarBg(member.name))}>
                      {member.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
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
                </div>
                <div className="flex items-center gap-1.5 ml-2">
                  <Badge variant={member.is_active ? 'success' : 'default'}>
                    {member.is_active ? 'Aktif' : 'Nonaktif'}
                  </Badge>
                  <button
                    onClick={() => setEditingId(member.id)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:text-gray-300 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                    aria-label="Edit anggota"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onToggleActive(member.id, member.is_active)}
                    className={cn(
                      'p-1.5 rounded-lg transition-colors cursor-pointer',
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
