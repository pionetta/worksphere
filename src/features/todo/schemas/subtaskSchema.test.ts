import { describe, it, expect } from 'vitest'
import { validate } from '@/lib/validation'
import { createSubtaskSchema, updateSubtaskSchema } from './subtaskSchema'

describe('Subtask Schemas', () => {
  describe('createSubtaskSchema', () => {
    it('should accept valid subtask', () => {
      const result = validate(createSubtaskSchema, { title: 'Beli beras' })
      expect(result.title).toBe('Beli beras')
      expect(result.position).toBe(0)
    })

    it('should trim title', () => {
      const result = validate(createSubtaskSchema, { title: '  Beli beras  ' })
      expect(result.title).toBe('Beli beras')
    })

    it('should reject empty title', () => {
      expect(() => validate(createSubtaskSchema, { title: '' })).toThrow(
        'Judul subtask wajib diisi.'
      )
    })

    it('should reject whitespace-only title', () => {
      expect(() => validate(createSubtaskSchema, { title: '   ' })).toThrow(
        'Judul subtask wajib diisi.'
      )
    })

    it('should reject title exceeding 200 characters', () => {
      expect(() => validate(createSubtaskSchema, { title: 'A'.repeat(201) })).toThrow(
        'Judul terlalu panjang.'
      )
    })

    it('should accept position', () => {
      const result = validate(createSubtaskSchema, { title: 'Beli beras', position: 5 })
      expect(result.position).toBe(5)
    })

    it('should reject negative position', () => {
      expect(() => validate(createSubtaskSchema, { title: 'Beli beras', position: -1 })).toThrow()
    })

    it('should reject non-integer position', () => {
      expect(() => validate(createSubtaskSchema, { title: 'Beli beras', position: 1.5 })).toThrow()
    })
  })

  describe('updateSubtaskSchema', () => {
    it('should accept valid update', () => {
      const result = validate(updateSubtaskSchema, { title: 'Updated title' })
      expect(result.title).toBe('Updated title')
    })

    it('should accept empty update', () => {
      const result = validate(updateSubtaskSchema, {})
      expect(result).toEqual({})
    })

    it('should reject empty title on update', () => {
      expect(() => validate(updateSubtaskSchema, { title: '' })).toThrow(
        'Judul subtask wajib diisi.'
      )
    })

    it('should accept is_completed', () => {
      const result = validate(updateSubtaskSchema, { is_completed: true })
      expect(result.is_completed).toBe(true)
    })

    it('should accept position update', () => {
      const result = validate(updateSubtaskSchema, { position: 3 })
      expect(result.position).toBe(3)
    })
  })
})
