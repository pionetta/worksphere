import * as sharedWalletRepo from '../repositories/sharedWalletRepository'
import { db } from '@/lib/db'
import {
  inviteWalletMemberSchema,
  type InviteWalletMemberInput,
} from '../schemas/sharedWalletSchema'
import { validate } from '@/lib/validation'
import type { WalletMember, WalletMemberRole } from '@/types'

export async function inviteMember(
  ownerUserId: string,
  input: InviteWalletMemberInput
): Promise<string> {
  const data = validate(inviteWalletMemberSchema, input)

  const wallet = await db.wallets.get(data.wallet_id)
  if (!wallet) {
    throw new Error('Dompet tidak ditemukan')
  }

  // Check if already invited or already owner
  const existingMembers = await sharedWalletRepo.getWalletMembers(data.wallet_id)
  const duplicate = existingMembers.find(
    m => m.invited_email?.toLowerCase() === data.invited_email.toLowerCase()
  )

  if (duplicate) {
    if (duplicate.status === 'declined') {
      await sharedWalletRepo.updateWalletMember(duplicate.id, { status: 'pending', role: data.role }, ownerUserId)
      return duplicate.id
    }
    throw new Error('Email tersebut sudah diundang ke dompet ini')
  }

  const now = new Date().toISOString()
  const member: WalletMember = {
    id: crypto.randomUUID(),
    wallet_id: data.wallet_id,
    user_id: null, // linked on acceptance if not found yet
    role: data.role,
    status: 'pending',
    invited_email: data.invited_email,
    created_at: now,
    updated_at: now,
  }

  return sharedWalletRepo.createWalletMember(member, ownerUserId)
}

export async function respondToInvitation(
  membershipId: string,
  userId: string,
  accept: boolean
): Promise<void> {
  const existing = await sharedWalletRepo.getWalletMemberById(membershipId)
  if (!existing) {
    throw new Error('Undangan tidak ditemukan')
  }

  const status = accept ? 'accepted' : 'declined'
  await sharedWalletRepo.updateWalletMember(
    membershipId,
    { status, user_id: userId },
    userId
  )
}

export async function updateMemberRole(
  membershipId: string,
  role: WalletMemberRole,
  operatorUserId: string
): Promise<void> {
  await sharedWalletRepo.updateWalletMember(membershipId, { role }, operatorUserId)
}

export async function removeMember(
  membershipId: string,
  operatorUserId: string
): Promise<void> {
  await sharedWalletRepo.deleteWalletMember(membershipId, operatorUserId)
}

export async function listWalletMembers(walletId: string): Promise<WalletMember[]> {
  return sharedWalletRepo.getWalletMembers(walletId)
}

export async function listPendingInvitations(
  userId: string,
  userEmail?: string
): Promise<Array<{ membership: WalletMember; walletName: string }>> {
  const memberships = await sharedWalletRepo.getMembershipsForUser(userId, userEmail)
  const pending = memberships.filter(m => m.status === 'pending')

  const results: Array<{ membership: WalletMember; walletName: string }> = []
  for (const m of pending) {
    const wallet = await db.wallets.get(m.wallet_id)
    results.push({
      membership: m,
      walletName: wallet?.name || 'Dompet Bersama',
    })
  }

  return results
}
