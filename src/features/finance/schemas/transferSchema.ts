import { z } from 'zod'
import { dateStringSchema, idSchema } from '@/features/attendance/schemas/shared'

const optionalNoteSchema = z
  .string()
  .trim()
  .max(500, 'Catatan terlalu panjang.')
  .nullable()
  .optional()

export const createTransferSchema = z
  .object({
    source_wallet_id: idSchema,
    target_wallet_id: idSchema,
    amount: z
      .number()
      .int('Nominal harus berupa bilangan bulat.')
      .min(1, 'Nominal harus lebih dari 0.'),
    transaction_date: dateStringSchema,
    note: optionalNoteSchema,
  })
  .refine(data => data.source_wallet_id !== data.target_wallet_id, {
    message: 'Dompet sumber dan tujuan tidak boleh sama.',
    path: ['target_wallet_id'],
  })

export type CreateTransferInput = z.infer<typeof createTransferSchema>
