import { useState } from 'react'
import { BottomSheet } from '@/components/ui/BottomSheet'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Users, UserPlus, Trash2, Shield, Eye } from 'lucide-react'
import type { Wallet, WalletMember, WalletMemberRole } from '@/types'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface SharedWalletModalProps {
  open: boolean
  onClose: () => void
  wallet: Wallet | null
  members: WalletMember[]
  onInvite: (email: string, role: WalletMemberRole) => Promise<void>
  onUpdateRole: (memberId: string, role: WalletMemberRole) => Promise<void>
  onRemoveMember: (memberId: string) => Promise<void>
}

export function SharedWalletModal({
  open,
  onClose,
  wallet,
  members,
  onInvite,
  onUpdateRole,
  onRemoveMember,
}: SharedWalletModalProps) {
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<WalletMemberRole>('editor')
  const [submitting, setSubmitting] = useState(false)

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) {
      toast.error('Email wajib diisi')
      return
    }

    setSubmitting(true)
    try {
      await onInvite(email.trim(), role)
      setEmail('')
      toast.success('Undangan berhasil dikirim!')
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
      title={`Dompet Bersama: ${wallet?.name || ''}`}
    >
      <div className="space-y-4 py-2 pb-6">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Undang pasangan, rekan, atau keluarga untuk mencatat pemasukan & pengeluaran bersama pada dompet ini secara real-time.
        </p>

        {/* Invite Form */}
        <form onSubmit={handleInvite} className="p-3.5 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 space-y-3">
          <div className="flex items-center gap-2">
            <UserPlus className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <h4 className="text-xs font-bold text-gray-900 dark:text-white">
              Undang Anggota Baru
            </h4>
          </div>

          <div className="space-y-2">
            <Input
              type="email"
              placeholder="Masukkan alamat email pengguna..."
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />

            <div className="flex items-center gap-2">
              <div className="flex-1 flex rounded-xl bg-white dark:bg-gray-800 p-1 border border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => setRole('editor')}
                  className={cn(
                    'flex-1 py-1 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer',
                    role === 'editor'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-gray-500 hover:text-gray-800'
                  )}
                >
                  <Shield className="w-3 h-3" />
                  <span>Editor (Bisa Catat)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRole('viewer')}
                  className={cn(
                    'flex-1 py-1 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer',
                    role === 'viewer'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-gray-500 hover:text-gray-800'
                  )}
                >
                  <Eye className="w-3 h-3" />
                  <span>Viewer (Lihat Saja)</span>
                </button>
              </div>

              <Button
                type="submit"
                size="sm"
                loading={submitting}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold shrink-0"
              >
                Kirim
              </Button>
            </div>
          </div>
        </form>

        {/* Member List */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5" />
            <span>Anggota Dompet ({members.length})</span>
          </h4>

          {members.length === 0 ? (
            <div className="py-4 text-center text-xs text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-800/40 rounded-xl">
              Belum ada anggota yang diundang.
            </div>
          ) : (
            <div className="space-y-2">
              {members.map(member => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200/80 dark:border-gray-700/60 text-xs shadow-2xs"
                >
                  <div className="min-w-0 pr-2">
                    <p className="font-bold text-gray-900 dark:text-white truncate">
                      {member.invited_email}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5 text-[10px] text-gray-500">
                      <span
                        className={cn(
                          'px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wider',
                          member.status === 'accepted'
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                            : member.status === 'declined'
                            ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                            : 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                        )}
                      >
                        {member.status === 'accepted' ? 'Diterima' : member.status === 'declined' ? 'Ditolak' : 'Menunggu'}
                      </span>
                      <span>• Role: <strong className="capitalize">{member.role}</strong></span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() =>
                        onUpdateRole(
                          member.id,
                          member.role === 'editor' ? 'viewer' : 'editor'
                        )
                      }
                      className="px-2 py-1 text-[11px] rounded-lg text-gray-600 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 transition-colors"
                      title="Ubah Role"
                    >
                      Ubah Role
                    </button>
                    <button
                      type="button"
                      onClick={() => onRemoveMember(member.id)}
                      className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                      title="Hapus Anggota"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="pt-2">
          <Button variant="secondary" className="w-full" onClick={onClose}>
            Tutup
          </Button>
        </div>
      </div>
    </BottomSheet>
  )
}
