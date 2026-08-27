import { z } from 'zod'

export const recurringFrequencySchema = z.enum(['daily', 'weekly', 'monthly', 'yearly'])

export const createRecurringSchema = z.object({
  wallet_id: z.string().uuid('ID dompet tidak valid'),
  category_id: z.string().uuid('ID kategori tidak valid').nullable().optional(),
  type: z.enum(['income', 'expense']),
  amount: z.number().int().positive('Nominal harus lebih besar dari 0'),
  frequency: recurringFrequencySchema,
  interval_count: z.number().int().positive().default(1),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal harus YYYY-MM-DD'),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal harus YYYY-MM-DD').nullable().optional(),
  auto_record: z.boolean().default(true),
  note: z.string().max(255, 'Catatan maksimal 255 karakter').nullable().optional(),
})

export const updateRecurringSchema = z.object({
  wallet_id: z.string().uuid('ID dompet tidak valid').optional(),
  category_id: z.string().uuid('ID kategori tidak valid').nullable().optional(),
  amount: z.number().int().positive('Nominal harus lebih besar dari 0').optional(),
  frequency: recurringFrequencySchema.optional(),
  interval_count: z.number().int().positive().optional(),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal harus YYYY-MM-DD').nullable().optional(),
  is_active: z.boolean().optional(),
  auto_record: z.boolean().optional(),
  note: z.string().max(255, 'Catatan maksimal 255 karakter').nullable().optional(),
  next_due_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
})

export type CreateRecurringInput = z.input<typeof createRecurringSchema>
export type UpdateRecurringInput = z.input<typeof updateRecurringSchema>
export type CreateRecurringOutput = z.output<typeof createRecurringSchema>
export type UpdateRecurringOutput = z.output<typeof updateRecurringSchema>
