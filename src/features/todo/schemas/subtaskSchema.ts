import { z } from 'zod'

export const createSubtaskSchema = z.object({
  title: z.string().trim().min(1, 'Judul subtask wajib diisi.').max(200, 'Judul terlalu panjang.'),
  position: z.number().int().min(0).optional().default(0),
})

export const updateSubtaskSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Judul subtask wajib diisi.')
    .max(200, 'Judul terlalu panjang.')
    .optional(),
  is_completed: z.boolean().optional(),
  position: z.number().int().min(0).optional(),
})

export type CreateSubtaskInput = z.infer<typeof createSubtaskSchema>
export type UpdateSubtaskInput = z.infer<typeof updateSubtaskSchema>
