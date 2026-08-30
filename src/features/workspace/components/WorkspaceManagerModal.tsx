import { useState, useEffect } from 'react'
import { BottomSheet } from '@/components/ui/BottomSheet'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Users, UserPlus, Trash2, Briefcase } from 'lucide-react'
import type { Workspace, WorkspaceMember, WorkspaceRole } from '@/types'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface WorkspaceManagerModalProps {
  open: boolean
  onClose: () => void
  workspace: Workspace | null
  members: WorkspaceMember[]
  isCreating?: boolean
  onCreateWorkspace?: (name: string, description?: string) => Promise<void>
  onUpdateWorkspace?: (name: string, description?: string) => Promise<void>
  onDeleteWorkspace?: () => Promise<void>
  onInviteMember?: (email: string, role: WorkspaceRole) => Promise<void>
  onUpdateRole?: (memberId: string, role: WorkspaceRole) => Promise<void>
  onRemoveMember?: (memberId: string) => Promise<void>
}

export function WorkspaceManagerModal({
  open,
  onClose,
  workspace,
  members,
  isCreating = false,
  onCreateWorkspace,
  onUpdateWorkspace,
  onDeleteWorkspace,
  onInviteMember,
  onUpdateRole,
  onRemoveMember,
}: WorkspaceManagerModalProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<WorkspaceRole>('member')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (workspace && !isCreating) {
      setName(workspace.name)
      setDescription(workspace.description || '')
    } else {
      setName('')
      setDescription('')
    }
  }, [workspace, isCreating])

  const handleSaveWorkspace = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      toast.error('Nama workspace wajib diisi')
      return
    }

    setSubmitting(true)
    try {
      if (isCreating) {
        await onCreateWorkspace?.(name.trim(), description.trim() || undefined)
        toast.success('Workspace berhasil dibuat! 🚀')
      } else {
        await onUpdateWorkspace?.(name.trim(), description.trim() || undefined)
        toast.success('Workspace berhasil diperbarui!')
      }
      onClose()
    } catch (err: any) {
      toast.error(err.message || 'Gagal menyimpan workspace')
    } finally {
      setSubmitting(false)
    }
  }

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inviteEmail.trim()) {
      toast.error('Email wajib diisi')
      return
    }

    setSubmitting(true)
    try {
      await onInviteMember?.(inviteEmail.trim(), inviteRole)
      setInviteEmail('')
      toast.success('Undangan rekan tim berhasil dikirim! 📩')
    } catch (err: any) {
      toast.error(err.message || 'Gagal mengirim undangan')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title={isCreating ? 'Buat Workspace Tim Baru' : `Kelola: ${workspace?.name || ''}`}
      onDelete={
        !isCreating && onDeleteWorkspace && workspace
          ? async () => {
              if (confirm(`Apakah Anda yakin ingin menghapus workspace "${workspace.name}"?`)) {
                await onDeleteWorkspace()
                toast.success('Workspace berhasil dihapus')
                onClose()
              }
            }
          : undefined
      }
      deleteLabel="Hapus Workspace"
    >
      <div className="space-y-4 py-2 pb-6 max-h-[75vh] overflow-y-auto">
        {/* Workspace Form (Name & Description) */}
        <form onSubmit={handleSaveWorkspace} className="space-y-3 p-3.5 rounded-2xl bg-gray-50/80 dark:bg-gray-800/60 border border-gray-200/80 dark:border-gray-700/60">
          <div className="flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <h4 className="text-xs font-bold text-gray-900 dark:text-white">
              {isCreating ? 'Informasi Workspace' : 'Ubah Nama & Deskripsi'}
            </h4>
          </div>

          <div className="space-y-2">
            <div>
              <label className="text-[11px] font-bold text-gray-600 dark:text-gray-400 block mb-1">
                Nama Workspace
              </label>
              <Input
                placeholder="Contoh: Tim Pemasaran / Proyek Mobile"
                value={name}
                onChange={e => setName(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-gray-600 dark:text-gray-400 block mb-1">
                Deskripsi (Opsional)
              </label>
              <Input
                placeholder="Deskripsi singkat ruang kerja..."
                value={description}
                onChange={e => setDescription(e.target.value)}
              />
            </div>

            <Button
              type="submit"
              size="sm"
              loading={submitting}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
            >
              {isCreating ? 'Buat Workspace' : 'Simpan Perubahan'}
            </Button>
          </div>
        </form>

        {/* Member Management (only when editing existing workspace) */}
        {!isCreating && workspace && (
          <>
            {/* Invite Form */}
            <form onSubmit={handleInvite} className="p-3.5 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 space-y-3">
              <div className="flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <h4 className="text-xs font-bold text-gray-900 dark:text-white">
                  Undang Rekan Tim ke Workspace
                </h4>
              </div>

              <div className="space-y-2">
                <Input
                  type="email"
                  placeholder="Masukkan email rekan tim..."
                  value={inviteEmail}
                  onChange={e => setInviteEmail(e.target.value)}
                  required
                />

                <div className="flex items-center gap-2">
                  <div className="flex-1 flex rounded-xl bg-white dark:bg-gray-800 p-1 border border-gray-200 dark:border-gray-700">
                    <button
                      type="button"
                      onClick={() => setInviteRole('member')}
                      className={cn(
                        'flex-1 py-1 px-1.5 rounded-lg text-xs font-bold transition-all text-center cursor-pointer',
                        inviteRole === 'member'
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'text-gray-500 hover:text-gray-800'
                      )}
                    >
                      Member
                    </button>
                    <button
                      type="button"
                      onClick={() => setInviteRole('admin')}
                      className={cn(
                        'flex-1 py-1 px-1.5 rounded-lg text-xs font-bold transition-all text-center cursor-pointer',
                        inviteRole === 'admin'
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'text-gray-500 hover:text-gray-800'
                      )}
                    >
                      Admin
                    </button>
                    <button
                      type="button"
                      onClick={() => setInviteRole('viewer')}
                      className={cn(
                        'flex-1 py-1 px-1.5 rounded-lg text-xs font-bold transition-all text-center cursor-pointer',
                        inviteRole === 'viewer'
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'text-gray-500 hover:text-gray-800'
                      )}
                    >
                      Viewer
                    </button>
                  </div>

                  <Button
                    type="submit"
                    size="sm"
                    loading={submitting}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold shrink-0"
                  >
                    Undang
                  </Button>
                </div>
              </div>
            </form>

            {/* Member List */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" />
                <span>Anggota Tim ({members.length})</span>
              </h4>

              <div className="space-y-2">
                {members.map(member => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200/80 dark:border-gray-700/60 text-xs shadow-2xs"
                  >
                    <div className="min-w-0 pr-2">
                      <p className="font-bold text-gray-900 dark:text-white truncate">
                        {member.invited_email || (member.user_id === workspace.owner_id ? 'Pemilik Workspace' : 'Anggota Tim')}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5 text-[10px] text-gray-500">
                        <span
                          className={cn(
                            'px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wider',
                            member.status === 'accepted'
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                              : 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                          )}
                        >
                          {member.status === 'accepted' ? 'Diterima' : 'Menunggu'}
                        </span>
                        <span>• Role: <strong className="capitalize">{member.role}</strong></span>
                      </div>
                    </div>

                    {member.user_id !== workspace.owner_id && (
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() =>
                            onUpdateRole?.(
                              member.id,
                              member.role === 'member'
                                ? 'admin'
                                : member.role === 'admin'
                                ? 'viewer'
                                : 'member'
                            )
                          }
                          className="px-2 py-1 text-[11px] rounded-lg text-gray-600 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 transition-colors"
                        >
                          Ubah Role
                        </button>
                        <button
                          type="button"
                          onClick={() => onRemoveMember?.(member.id)}
                          className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                          title="Hapus Anggota"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </BottomSheet>
  )
}
