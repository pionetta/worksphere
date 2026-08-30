import { z } from 'zod'

export const createHabitSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Judul kebiasaan wajib diisi')
    .max(100, 'Judul kebiasaan maksimal 100 karakter'),
  description: z
    .string()
    .max(500, 'Deskripsi maksimal 500 karakter')
    .optional()
    .nullable()
    .transform(v => v?.trim() || null),
  icon: z.string().default('🎯'),
  color: z.string().default('#4F46E5'),
  frequency: z.enum(['daily', 'weekly', 'custom']).default('daily'),
  target_days: z.array(z.number().min(1).max(7)).default([1, 2, 3, 4, 5, 6, 7]),
  target_per_day: z.number().int().min(1).default(1),
})

export const updateHabitSchema = createHabitSchema.partial().extend({
  is_archived: z.boolean().optional(),
})

export const logHabitSchema = z.object({
  habit_id: z.string().uuid('ID kebiasaan tidak valid'),
  completed_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal harus YYYY-MM-DD'),
  count: z.number().int().min(1).default(1),
  notes: z.string().max(300).optional().nullable().transform(v => v?.trim() || null),
})

export type CreateHabitInput = z.input<typeof createHabitSchema>
export type CreateHabitOutput = z.output<typeof createHabitSchema>
export type UpdateHabitInput = z.input<typeof updateHabitSchema>
export type UpdateHabitOutput = z.output<typeof updateHabitSchema>
export type LogHabitInput = z.input<typeof logHabitSchema>
export type LogHabitOutput = z.output<typeof logHabitSchema>
