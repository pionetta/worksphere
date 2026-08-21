import { z } from 'zod'
import { dateStringSchema, idSchema } from '@/features/attendance/schemas/shared'

// ─── Shared ──────────────────────────────────────────────────────────────────

export const transactionTypeSchema = z.enum(
  ['income', 'expense', 'transfer_in', 'transfer_out', 'adjustment'],
  { message: 'Tipe transaksi tidak valid.' }
)

const positiveAmountInt = z
  .number()
  .int('Nominal harus berupa bilangan bulat.')
  .min(1, 'Nominal harus lebih dari 0.')

const nonZeroInt = z
  .number()
  .int('Nominal harus berupa bilangan bulat.')
  .refine(v => v !== 0, 'Nominal tidak boleh 0.')

const optionalNoteSchema = z
  .string()
  .trim()
  .max(500, 'Catatan terlalu panjang.')
  .nullable()
  .optional()

// ─── Create Income ───────────────────────────────────────────────────────────

export const createIncomeSchema = z.object({
  wallet_id: idSchema,
  category_id: idSchema.nullable(),
  amount: positiveAmountInt,
  transaction_date: dateStringSchema,
  note: optionalNoteSchema,
})

// ─── Create Expense ──────────────────────────────────────────────────────────

export const createExpenseSchema = z.object({
  wallet_id: idSchema,
  category_id: idSchema.nullable(),
  amount: positiveAmountInt,
  transaction_date: dateStringSchema,
  note: optionalNoteSchema,
})

// ─── Create Adjustment ───────────────────────────────────────────────────────

export const createAdjustmentSchema = z.object({
  wallet_id: idSchema,
  amount: nonZeroInt,
  transaction_date: dateStringSchema,
  note: optionalNoteSchema,
})

// ─── Update Transaction Note ─────────────────────────────────────────────────

export const updateTransactionNoteSchema = z.object({
  note: z.string().trim().max(500, 'Catatan terlalu panjang.').nullable(),
})

// ─── Update Income/Expense ───────────────────────────────────────────────────

export const updateIncomeSchema = z.object({
  wallet_id: idSchema,
  category_id: idSchema.nullable(),
  amount: positiveAmountInt,
  transaction_date: dateStringSchema,
  note: optionalNoteSchema,
})

export const updateExpenseSchema = z.object({
  wallet_id: idSchema,
  category_id: idSchema.nullable(),
  amount: positiveAmountInt,
  transaction_date: dateStringSchema,
  note: optionalNoteSchema,
})

export type CreateIncomeInput = z.infer<typeof createIncomeSchema>
export type CreateExpenseInput = z.infer<typeof createExpenseSchema>
export type CreateAdjustmentInput = z.infer<typeof createAdjustmentSchema>
export type UpdateTransactionNoteInput = z.infer<typeof updateTransactionNoteSchema>
export type UpdateIncomeInput = z.infer<typeof updateIncomeSchema>
export type UpdateExpenseInput = z.infer<typeof updateExpenseSchema>
