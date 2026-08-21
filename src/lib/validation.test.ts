import { describe, it, expect } from 'vitest'
import { z } from 'zod'
import { validate } from './validation'

describe('validate utility', () => {
  const schema = z.object({
    name: z.string().min(1, 'Nama wajib diisi.'),
    amount: z.number().min(1, 'Minimal 1.'),
  })

  it('should return parsed data on valid input', () => {
    const result = validate(schema, { name: 'Test', amount: 5 })
    expect(result.name).toBe('Test')
    expect(result.amount).toBe(5)
  })

  it('should throw first error message on invalid input', () => {
    expect(() => validate(schema, { name: '', amount: 5 })).toThrow('Nama wajib diisi.')
  })

  it('should throw on completely invalid input', () => {
    expect(() => validate(schema, { name: 123, amount: 'abc' })).toThrow()
  })

  it('should return first error message even with multiple errors', () => {
    expect(() => validate(schema, { name: '', amount: 0 })).toThrow('Nama wajib diisi.')
  })

  it('should work with primitive schemas', () => {
    const strSchema = z.string().min(1, 'Wajib diisi.')
    expect(validate(strSchema, 'hello')).toBe('hello')
    expect(() => validate(strSchema, '')).toThrow('Wajib diisi.')
  })
})
