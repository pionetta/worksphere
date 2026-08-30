import { z } from 'zod'
import { dateStringSchema, optionalNoteSchema } from '@/features/attendance/schemas/shared'

export const debtTypeSchema = z.enum(['debt', 'receivable'], {
  message: 'Tipe harus berupa utang (debt) atau piutang (receivable).',
})

export const debtStatusSchema = z.enum(['unpaid', 'partially_paid', 'paid'], {
  message: 'Status harus berupa unpaid, partially_paid, atau paid.',
})

export const createDebtSchema = z.object({
  type: debtTypeSchema,
  person_name: z
    .string()
    .trim()
    .min(1, 'Nama pihak / orang wajib diisi.')
    .max(100, 'Nama terlalu panjang.'),
  group_name: z.string().trim().max(100, 'Nama kelompok terlalu panjang.').nullable().optional(),
  amount: z
    .number()
    .int('Nominal harus berupa bilangan bulat.')
    .min(1, 'Nominal harus lebih dari 0.'),
  due_date: dateStringSchema.nullable().optional(),
  is_installment: z.boolean().optional(),
  is_flexible_installment: z.boolean().optional(),
  installment_count: z.number().int().min(1).max(120).nullable().optional(),
  installment_paid_count: z.number().int().min(0).max(120).nullable().optional(),
  installment_amount: z.number().int().min(1).nullable().optional(),
  installment_schedule: z.array(z.number().int().min(0)).nullable().optional(),
  current_bill_amount: z.number().int().min(1).nullable().optional(),
  installment_due_day: z.number().int().min(1).max(31).nullable().optional(),
  note: optionalNoteSchema,
})

export const updateDebtSchema = z.object({
  type: debtTypeSchema.optional(),
  person_name: z
    .string()
    .trim()
    .min(1, 'Nama pihak / orang wajib diisi.')
    .max(100, 'Nama terlalu panjang.')
    .optional(),
  group_name: z.string().trim().max(100, 'Nama kelompok terlalu panjang.').nullable().optional(),
  amount: z
    .number()
    .int('Nominal harus berupa bilangan bulat.')
    .min(1, 'Nominal harus lebih dari 0.')
    .optional(),
  due_date: dateStringSchema.nullable().optional(),
  is_installment: z.boolean().optional(),
  is_flexible_installment: z.boolean().optional(),
  installment_count: z.number().int().min(1).max(120).nullable().optional(),
  installment_paid_count: z.number().int().min(0).max(120).nullable().optional(),
  installment_amount: z.number().int().min(1).nullable().optional(),
  installment_schedule: z.array(z.number().int().min(0)).nullable().optional(),
  current_bill_amount: z.number().int().min(1).nullable().optional(),
  installment_due_day: z.number().int().min(1).max(31).nullable().optional(),
  note: optionalNoteSchema,
})

export const payDebtSchema = z.object({
  amount: z
    .number()
    .int('Nominal pembayaran harus berupa bilangan bulat.')
    .min(1, 'Nominal pembayaran harus lebih dari 0.'),
  increment_installment: z.boolean().optional(),
})

export type CreateDebtInput = z.infer<typeof createDebtSchema>
export type UpdateDebtInput = z.infer<typeof updateDebtSchema>
export type PayDebtInput = z.infer<typeof payDebtSchema>
