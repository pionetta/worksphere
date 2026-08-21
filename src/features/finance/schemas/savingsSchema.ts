import { z } from 'zod'
import { dateStringSchema, optionalNoteSchema } from '@/features/attendance/schemas/shared'

export const createSavingsGoalSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Nama target tabungan wajib diisi.')
    .max(100, 'Nama terlalu panjang.'),
  target_amount: z
    .number()
    .int('Target harus berupa bilangan bulat.')
    .min(1, 'Target harus lebih dari 0.'),
  current_amount: z
    .number()
    .int('Saldo harus berupa bilangan bulat.')
    .min(0, 'Saldo tidak boleh negatif.')
    .optional()
    .default(0),
  deadline: dateStringSchema.nullable().optional(),
  note: optionalNoteSchema,
})

export const updateSavingsGoalSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Nama target tabungan wajib diisi.')
    .max(100, 'Nama terlalu panjang.')
    .optional(),
  target_amount: z
    .number()
    .int('Target harus berupa bilangan bulat.')
    .min(1, 'Target harus lebih dari 0.')
    .optional(),
  current_amount: z
    .number()
    .int('Saldo harus berupa bilangan bulat.')
    .min(0, 'Saldo tidak boleh negatif.')
    .optional(),
  deadline: dateStringSchema.nullable().optional(),
  note: optionalNoteSchema,
})

export const addToSavingsSchema = z.object({
  amount: z
    .number()
    .int('Nominal harus berupa bilangan bulat.')
    .min(1, 'Nominal harus lebih dari 0.'),
})

export type CreateSavingsGoalInput = z.infer<typeof createSavingsGoalSchema>
export type UpdateSavingsGoalInput = z.infer<typeof updateSavingsGoalSchema>
export type AddToSavingsInput = z.infer<typeof addToSavingsSchema>
