import { z } from 'zod'

// ─── Shared Helpers ──────────────────────────────────────────────────────────

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/

export const dateStringSchema = z
  .string()
  .regex(DATE_REGEX, 'Format tanggal harus YYYY-MM-DD.')
  .refine(
    val => {
      const [y, m, d] = val.split('-').map(Number)
      const date = new Date(y, m - 1, d)
      return date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d
    },
    { message: 'Tanggal tidak valid.' }
  )

export const optionalDateStringSchema = dateStringSchema.nullable().optional()

export const positiveIntSchema = z
  .number()
  .int('Nominal harus berupa bilangan bulat.')
  .min(1, 'Nominal harus lebih dari 0.')

export const nonNegativeIntSchema = z
  .number()
  .int('Nominal harus berupa bilangan bulat.')
  .min(0, 'Nominal tidak boleh negatif.')

export const idSchema = z.string().min(1, 'ID tidak valid.')

export const optionalNoteSchema = z
  .string()
  .trim()
  .max(500, 'Catatan terlalu panjang.')
  .nullable()
  .optional()
