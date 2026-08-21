import { describe, it, expect } from 'vitest'
import { validate } from '@/lib/validation'
import { createMemberSchema, updateMemberSchema } from './memberSchema'

describe('Member Schemas', () => {
  describe('createMemberSchema', () => {
    it('should accept valid name', () => {
      const result = validate(createMemberSchema, { name: 'Budi' })
      expect(result.name).toBe('Budi')
    })

    it('should trim whitespace from name', () => {
      const result = validate(createMemberSchema, { name: '  Budi  ' })
      expect(result.name).toBe('Budi')
    })

    it('should reject empty name', () => {
      expect(() => validate(createMemberSchema, { name: '' })).toThrow('Nama anggota wajib diisi.')
    })

    it('should reject whitespace-only name', () => {
      expect(() => validate(createMemberSchema, { name: '   ' })).toThrow(
        'Nama anggota wajib diisi.'
      )
    })

    it('should reject name exceeding 100 characters', () => {
      expect(() => validate(createMemberSchema, { name: 'A'.repeat(101) })).toThrow(
        'Nama terlalu panjang.'
      )
    })

    it('should accept name at exactly 100 characters', () => {
      const result = validate(createMemberSchema, { name: 'A'.repeat(100) })
      expect(result.name).toHaveLength(100)
    })

    it('should accept note', () => {
      const result = validate(createMemberSchema, { name: 'Budi', note: 'Catatan' })
      expect(result.note).toBe('Catatan')
    })

    it('should accept null note', () => {
      const result = validate(createMemberSchema, { name: 'Budi', note: null })
      expect(result.note).toBeNull()
    })

    it('should trim note', () => {
      const result = validate(createMemberSchema, { name: 'Budi', note: '  Catatan  ' })
      expect(result.note).toBe('Catatan')
    })

    it('should reject note exceeding 500 characters', () => {
      expect(() => validate(createMemberSchema, { name: 'Budi', note: 'A'.repeat(501) })).toThrow(
        'Catatan terlalu panjang.'
      )
    })

    it('should accept undefined note', () => {
      const result = validate(createMemberSchema, { name: 'Budi' })
      expect(result.note).toBeUndefined()
    })
  })

  describe('updateMemberSchema', () => {
    it('should accept valid update', () => {
      const result = validate(updateMemberSchema, { name: 'Budi' })
      expect(result.name).toBe('Budi')
    })

    it('should accept empty update (no fields)', () => {
      const result = validate(updateMemberSchema, {})
      expect(result).toEqual({})
    })

    it('should reject empty name on update', () => {
      expect(() => validate(updateMemberSchema, { name: '' })).toThrow('Nama anggota wajib diisi.')
    })

    it('should reject whitespace-only name on update', () => {
      expect(() => validate(updateMemberSchema, { name: '   ' })).toThrow(
        'Nama anggota wajib diisi.'
      )
    })
  })
})
