import { useState, useEffect, useCallback } from 'react'
import * as sharedWalletService from '../services/sharedWalletService'
import type { WalletMember, WalletMemberRole } from '@/types'
import type { InviteWalletMemberInput } from '../schemas/sharedWalletSchema'

export function useSharedWallets(userId: string | null, userEmail?: string) {
  const [membersMap, setMembersMap] = useState<Record<string, WalletMember[]>>({})
  const [pendingInvitations, setPendingInvitations] = useState<
    Array<{ membership: WalletMember; walletName: string }>
  >([])
  const [loading, setLoading] = useState(false)

  const loadPendingInvitations = useCallback(async () => {
    if (!userId) return
    try {
      const list = await sharedWalletService.listPendingInvitations(userId, userEmail)
      setPendingInvitations(list)
    } catch {
      // Ignore
    }
  }, [userId, userEmail])

  const loadMembersForWallet = useCallback(async (walletId: string) => {
    try {
      const members = await sharedWalletService.listWalletMembers(walletId)
      setMembersMap(prev => ({ ...prev, [walletId]: members }))
      return members
    } catch {
      return []
    }
  }, [])

  useEffect(() => {
    loadPendingInvitations()

    const handleSync = () => loadPendingInvitations()
    window.addEventListener('worksphere-data-synced', handleSync)
    return () => window.removeEventListener('worksphere-data-synced', handleSync)
  }, [loadPendingInvitations])

  const inviteMember = useCallback(
    async (input: InviteWalletMemberInput) => {
      if (!userId) throw new Error('User tidak terautentikasi')
      setLoading(true)
      try {
        const id = await sharedWalletService.inviteMember(userId, input)
        await loadMembersForWallet(input.wallet_id)
        return id
      } finally {
        setLoading(false)
      }
    },
    [userId, loadMembersForWallet]
  )

  const respondToInvitation = useCallback(
    async (membershipId: string, accept: boolean) => {
      if (!userId) throw new Error('User tidak terautentikasi')
      setLoading(true)
      try {
        await sharedWalletService.respondToInvitation(membershipId, userId, accept)
        await loadPendingInvitations()
      } finally {
        setLoading(false)
      }
    },
    [userId, loadPendingInvitations]
  )

  const updateRole = useCallback(
    async (membershipId: string, role: WalletMemberRole, walletId: string) => {
      if (!userId) throw new Error('User tidak terautentikasi')
      setLoading(true)
      try {
        await sharedWalletService.updateMemberRole(membershipId, role, userId)
        await loadMembersForWallet(walletId)
      } finally {
        setLoading(false)
      }
    },
    [userId, loadMembersForWallet]
  )

  const removeMember = useCallback(
    async (membershipId: string, walletId: string) => {
      if (!userId) throw new Error('User tidak terautentikasi')
      setLoading(true)
      try {
        await sharedWalletService.removeMember(membershipId, userId)
        await loadMembersForWallet(walletId)
      } finally {
        setLoading(false)
      }
    },
    [userId, loadMembersForWallet]
  )

  return {
    membersMap,
    pendingInvitations,
    loading,
    inviteMember,
    respondToInvitation,
    updateRole,
    removeMember,
    loadMembersForWallet,
    refreshInvitations: loadPendingInvitations,
  }
}
