import { describe, it, expect, beforeEach } from 'vitest'
import { db } from '@/lib/db'
import * as sharedWalletService from './sharedWalletService'

describe('sharedWalletService', () => {
  const ownerId = 'user-owner-1'
  const invitedUserId = 'user-member-2'
  const walletId = 'wallet-shared-1'

  beforeEach(async () => {
    await db.wallets.clear()
    await db.wallet_members.clear()
    await db.sync_queue.clear()

    await db.wallets.put({
      id: walletId,
      user_id: ownerId,
      name: 'Dompet Operasional',
      type: 'bank',
      initial_balance: 1000000,
      note: null,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
  })

  it('invites a new member by email', async () => {
    const memberId = await sharedWalletService.inviteMember(ownerId, {
      wallet_id: walletId,
      invited_email: 'partner@example.com',
      role: 'editor',
    })

    expect(memberId).toBeDefined()

    const members = await sharedWalletService.listWalletMembers(walletId)
    expect(members).toHaveLength(1)
    expect(members[0].invited_email).toBe('partner@example.com')
    expect(members[0].role).toBe('editor')
    expect(members[0].status).toBe('pending')
  })

  it('allows accepting an invitation', async () => {
    const memberId = await sharedWalletService.inviteMember(ownerId, {
      wallet_id: walletId,
      invited_email: 'partner@example.com',
      role: 'editor',
    })

    await sharedWalletService.respondToInvitation(memberId, invitedUserId, true)

    const member = await db.wallet_members.get(memberId)
    expect(member?.status).toBe('accepted')
    expect(member?.user_id).toBe(invitedUserId)
  })

  it('lists pending invitations for invited user email', async () => {
    await sharedWalletService.inviteMember(ownerId, {
      wallet_id: walletId,
      invited_email: 'partner@example.com',
      role: 'editor',
    })

    const pending = await sharedWalletService.listPendingInvitations(
      invitedUserId,
      'partner@example.com'
    )

    expect(pending).toHaveLength(1)
    expect(pending[0].walletName).toBe('Dompet Operasional')
    expect(pending[0].membership.status).toBe('pending')
  })
})
