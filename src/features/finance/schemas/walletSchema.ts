import { z } from 'zod'

export const walletTypeSchema = z.enum(['bank', 'e_wallet', 'cash', 'other'], {
  message: 'Tipe dompet tidak valid.',
})

export const createWalletSchema = z.object({
  name: z.string().trim().min(1, 'Nama dompet wajib diisi.').max(100, 'Nama terlalu panjang.'),
  type: walletTypeSchema,
  initial_balance: z
    .number()
    .int('Saldo harus berupa bilangan bulat.')
    .min(0, 'Saldo awal tidak boleh negatif.'),
  note: z.string().trim().max(500, 'Catatan terlalu panjang.').nullable().optional(),
})

export const updateWalletSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Nama dompet wajib diisi.')
    .max(100, 'Nama terlalu panjang.')
    .optional(),
  type: walletTypeSchema.optional(),
  initial_balance: z
    .number()
    .int('Saldo harus berupa bilangan bulat.')
    .min(0, 'Saldo awal tidak boleh negatif.')
    .optional(),
  note: z.string().trim().max(500, 'Catatan terlalu panjang.').nullable().optional(),
})

export type CreateWalletInput = z.infer<typeof createWalletSchema>
export type UpdateWalletInput = z.infer<typeof updateWalletSchema>
