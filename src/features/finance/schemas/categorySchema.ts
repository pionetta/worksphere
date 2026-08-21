import { z } from 'zod'

export const categoryTypeSchema = z.enum(['income', 'expense'], {
  message: 'Tipe kategori tidak valid.',
})

export const createCategorySchema = z.object({
  name: z.string().trim().min(1, 'Nama kategori wajib diisi.').max(100, 'Nama terlalu panjang.'),
  type: categoryTypeSchema,
  icon: z.string().trim().max(50, 'Icon terlalu panjang.').nullable().optional(),
})

export const updateCategorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Nama kategori wajib diisi.')
    .max(100, 'Nama terlalu panjang.')
    .optional(),
  type: categoryTypeSchema.optional(),
  icon: z.string().trim().max(50, 'Icon terlalu panjang.').nullable().optional(),
})

export type CreateCategoryInput = z.infer<typeof createCategorySchema>
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>
