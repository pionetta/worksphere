import { z } from 'zod'
import { idSchema } from '@/features/attendance/schemas/shared'

export const createBudgetSchema = z.object({
  category_id: idSchema,
  amount: z
    .number()
    .int('Nominal harus berupa bilangan bulat.')
    .min(1, 'Nominal harus lebih dari 0.'),
  month: z.number().int().min(1, 'Bulan harus antara 1–12.').max(12, 'Bulan harus antara 1–12.'),
  year: z.number().int().min(2000, 'Tahun tidak valid.').max(2100, 'Tahun tidak valid.'),
  note: z.string().trim().max(500, 'Catatan terlalu panjang.').nullable().optional(),
})

export const updateBudgetSchema = z.object({
  amount: z
    .number()
    .int('Nominal harus berupa bilangan bulat.')
    .min(1, 'Nominal harus lebih dari 0.')
    .optional(),
  note: z.string().trim().max(500, 'Catatan terlalu panjang.').nullable().optional(),
})

export type CreateBudgetInput = z.infer<typeof createBudgetSchema>
export type UpdateBudgetInput = z.infer<typeof updateBudgetSchema>
