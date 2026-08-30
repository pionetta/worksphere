import { useState } from 'react'
import { Check, X, Bell } from 'lucide-react'
import type { WalletMember } from '@/types'
import { toast } from 'sonner'

interface WalletInvitationsBannerProps {
  invitations: Array<{ membership: WalletMember; walletName: string }>
  onRespond: (membershipId: string, accept: boolean) => Promise<void>
}

export function WalletInvitationsBanner({
  invitations,
  onRespond,
}: WalletInvitationsBannerProps) {
  const [respondingId, setRespondingId] = useState<string | null>(null)

  if (invitations.length === 0) return null

  return (
    <div className="space-y-2 animate-fade-in-up">
      {invitations.map(({ membership, walletName }) => (
        <div
          key={membership.id}
          className="p-3 sm:p-3.5 rounded-2xl bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 border border-indigo-200/80 dark:border-indigo-800/60 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 backdrop-blur-md"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Bell className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-gray-900 dark:text-white truncate">
                Undangan Dompet Bersama
              </p>
              <p className="text-[11px] text-gray-600 dark:text-gray-300">
                Anda diundang untuk bergabung ke <strong>"{walletName}"</strong> sebagai{' '}
                <span className="capitalize font-bold text-indigo-600 dark:text-indigo-400">
                  {membership.role}
                </span>
                .
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end shrink-0">
            <button
              type="button"
              disabled={respondingId === membership.id}
              onClick={async () => {
                setRespondingId(membership.id)
                try {
                  await onRespond(membership.id, true)
                  toast.success(`Berhasil bergabung ke ${walletName}! 🎉`)
                } catch {
                  toast.error('Gagal menerima undangan')
                } finally {
                  setRespondingId(null)
                }
              }}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1 shadow-xs transition-colors cursor-pointer"
            >
              <Check className="w-3.5 h-3.5 stroke-[3]" />
              <span>Terima</span>
            </button>

            <button
              type="button"
              disabled={respondingId === membership.id}
              onClick={async () => {
                setRespondingId(membership.id)
                try {
                  await onRespond(membership.id, false)
                  toast.info('Undangan ditolak')
                } catch {
                  toast.error('Gagal menolak undangan')
                } finally {
                  setRespondingId(null)
                }
              }}
              className="px-3 py-1.5 rounded-xl bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 text-gray-700 dark:text-gray-200 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              <span>Tolak</span>
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
