import { z } from 'zod'

export const createMemberSchema = z.object({
  name: z.string().trim().min(1, 'Nama anggota wajib diisi.').max(100, 'Nama terlalu panjang.'),
  note: z.string().trim().max(500, 'Catatan terlalu panjang.').nullable().optional(),
})

export const updateMemberSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Nama anggota wajib diisi.')
    .max(100, 'Nama terlalu panjang.')
    .optional(),
  note: z.string().trim().max(500, 'Catatan terlalu panjang.').nullable().optional(),
})

export type CreateMemberInput = z.infer<typeof createMemberSchema>
export type UpdateMemberInput = z.infer<typeof updateMemberSchema>
