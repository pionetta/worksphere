import { z } from 'zod'

export const createWorkspaceSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Nama workspace wajib diisi')
    .max(100, 'Nama workspace maksimal 100 karakter'),
  description: z
    .string()
    .max(500, 'Deskripsi maksimal 500 karakter')
    .optional()
    .nullable()
    .transform(v => v?.trim() || null),
})

export const updateWorkspaceSchema = createWorkspaceSchema.partial()

export const inviteWorkspaceMemberSchema = z.object({
  workspace_id: z.string().min(1, 'ID workspace wajib diisi'),
  invited_email: z
    .string()
    .trim()
    .email('Format email tidak valid')
    .toLowerCase(),
  role: z.enum(['admin', 'member', 'viewer']).default('member'),
})

export const updateWorkspaceMemberSchema = z.object({
  role: z.enum(['admin', 'member', 'viewer']).optional(),
  status: z.enum(['pending', 'accepted', 'declined']).optional(),
})

export type CreateWorkspaceInput = z.input<typeof createWorkspaceSchema>
export type CreateWorkspaceOutput = z.output<typeof createWorkspaceSchema>
export type UpdateWorkspaceInput = z.input<typeof updateWorkspaceSchema>
export type UpdateWorkspaceOutput = z.output<typeof updateWorkspaceSchema>
export type InviteWorkspaceMemberInput = z.input<typeof inviteWorkspaceMemberSchema>
export type InviteWorkspaceMemberOutput = z.output<typeof inviteWorkspaceMemberSchema>
export type UpdateWorkspaceMemberInput = z.input<typeof updateWorkspaceMemberSchema>
export type UpdateWorkspaceMemberOutput = z.output<typeof updateWorkspaceMemberSchema>
