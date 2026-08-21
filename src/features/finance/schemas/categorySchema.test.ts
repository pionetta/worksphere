import { describe, it, expect } from 'vitest'
import { validate } from '@/lib/validation'
import { createCategorySchema, updateCategorySchema } from './categorySchema'

describe('Category Schemas', () => {
  describe('createCategorySchema', () => {
    it('should accept valid category', () => {
      const result = validate(createCategorySchema, {
        name: 'Makanan',
        type: 'expense',
      })
      expect(result.name).toBe('Makanan')
      expect(result.type).toBe('expense')
    })

    it('should accept income type', () => {
      const result = validate(createCategorySchema, {
        name: 'Gaji',
        type: 'income',
      })
      expect(result.type).toBe('income')
    })

    it('should trim name', () => {
      const result = validate(createCategorySchema, {
        name: '  Makanan  ',
        type: 'expense',
      })
      expect(result.name).toBe('Makanan')
    })

    it('should reject empty name', () => {
      expect(() => validate(createCategorySchema, { name: '', type: 'expense' })).toThrow(
        'Nama kategori wajib diisi.'
      )
    })

    it('should reject whitespace-only name', () => {
      expect(() => validate(createCategorySchema, { name: '   ', type: 'expense' })).toThrow(
        'Nama kategori wajib diisi.'
      )
    })

    it('should reject invalid type', () => {
      expect(() => validate(createCategorySchema, { name: 'Test', type: 'transfer' })).toThrow(
        'Tipe kategori tidak valid.'
      )
    })

    it('should accept icon', () => {
      const result = validate(createCategorySchema, {
        name: 'Makanan',
        type: 'expense',
        icon: 'utensils',
      })
      expect(result.icon).toBe('utensils')
    })

    it('should reject icon exceeding 50 characters', () => {
      expect(() =>
        validate(createCategorySchema, {
          name: 'Makanan',
          type: 'expense',
          icon: 'A'.repeat(51),
        })
      ).toThrow('Icon terlalu panjang.')
    })
  })

  describe('updateCategorySchema', () => {
    it('should accept valid update', () => {
      const result = validate(updateCategorySchema, { name: 'Makan & Minum' })
      expect(result.name).toBe('Makan & Minum')
    })

    it('should accept empty update', () => {
      const result = validate(updateCategorySchema, {})
      expect(result).toEqual({})
    })

    it('should reject empty name on update', () => {
      expect(() => validate(updateCategorySchema, { name: '' })).toThrow(
        'Nama kategori wajib diisi.'
      )
    })
  })
})
