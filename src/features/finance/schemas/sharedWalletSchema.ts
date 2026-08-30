import { z } from 'zod'

export const inviteWalletMemberSchema = z.object({
  wallet_id: z.string().min(1, 'ID dompet wajib diisi'),
  invited_email: z
    .string()
    .trim()
    .email('Format email tidak valid')
    .toLowerCase(),
  role: z.enum(['editor', 'viewer']).default('editor'),
})

export const updateWalletMemberSchema = z.object({
  role: z.enum(['editor', 'viewer']).optional(),
  status: z.enum(['pending', 'accepted', 'declined']).optional(),
})

export type InviteWalletMemberInput = z.input<typeof inviteWalletMemberSchema>
export type InviteWalletMemberOutput = z.output<typeof inviteWalletMemberSchema>
export type UpdateWalletMemberInput = z.input<typeof updateWalletMemberSchema>
export type UpdateWalletMemberOutput = z.output<typeof updateWalletMemberSchema>
