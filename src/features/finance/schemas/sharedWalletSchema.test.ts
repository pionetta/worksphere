import { describe, it, expect } from 'vitest'
import { inviteWalletMemberSchema, updateWalletMemberSchema } from './sharedWalletSchema'

describe('sharedWalletSchema', () => {
  it('validates valid invite input', () => {
    const res = inviteWalletMemberSchema.parse({
      wallet_id: 'w-123',
      invited_email: '  colleague@example.com  ',
      role: 'editor',
    })

    expect(res.wallet_id).toBe('w-123')
    expect(res.invited_email).toBe('colleague@example.com')
    expect(res.role).toBe('editor')
  })

  it('rejects invalid email', () => {
    expect(() =>
      inviteWalletMemberSchema.parse({
        wallet_id: 'w-123',
        invited_email: 'not-an-email',
      })
    ).toThrow('Format email tidak valid')
  })

  it('validates updateWalletMemberSchema', () => {
    const res = updateWalletMemberSchema.parse({
      status: 'accepted',
      role: 'viewer',
    })

    expect(res.status).toBe('accepted')
    expect(res.role).toBe('viewer')
  })
})
