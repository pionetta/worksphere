import { z } from 'zod'

/**
 * Parse Zod schema and throw Indonesian-friendly error message on failure.
 * Uses `.safeParse()` to avoid raw ZodError leaking to UI.
 */
export function validate<T>(schema: z.ZodSchema<T>, data: unknown): T {
  const result = schema.safeParse(data)
  if (!result.success) {
    const firstError = result.error.issues[0]
    const message = firstError?.message ?? 'Input tidak valid.'
    throw new Error(message)
  }
  return result.data
}
