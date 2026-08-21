import { describe, it, expect } from 'vitest'
import { validate } from '@/lib/validation'
import { createWalletSchema, updateWalletSchema } from './walletSchema'

describe('Wallet Schemas', () => {
  describe('createWalletSchema', () => {
    it('should accept valid wallet', () => {
      const result = validate(createWalletSchema, {
        name: 'BCA',
        type: 'bank',
        initial_balance: 1000000,
      })
      expect(result.name).toBe('BCA')
      expect(result.type).toBe('bank')
      expect(result.initial_balance).toBe(1000000)
    })

    it('should accept all valid types', () => {
      for (const type of ['bank', 'e_wallet', 'cash', 'other']) {
        const result = validate(createWalletSchema, {
          name: 'Test',
          type,
          initial_balance: 0,
        })
        expect(result.type).toBe(type)
      }
    })

    it('should trim name', () => {
      const result = validate(createWalletSchema, {
        name: '  BCA  ',
        type: 'bank',
        initial_balance: 0,
      })
      expect(result.name).toBe('BCA')
    })

    it('should reject empty name', () => {
      expect(() =>
        validate(createWalletSchema, { name: '', type: 'bank', initial_balance: 0 })
      ).toThrow('Nama dompet wajib diisi.')
    })

    it('should reject whitespace-only name', () => {
      expect(() =>
        validate(createWalletSchema, { name: '   ', type: 'bank', initial_balance: 0 })
      ).toThrow('Nama dompet wajib diisi.')
    })

    it('should reject invalid type', () => {
      expect(() =>
        validate(createWalletSchema, { name: 'BCA', type: 'credit', initial_balance: 0 })
      ).toThrow('Tipe dompet tidak valid.')
    })

    it('should reject negative initial balance', () => {
      expect(() =>
        validate(createWalletSchema, { name: 'BCA', type: 'bank', initial_balance: -1000 })
      ).toThrow('Saldo awal tidak boleh negatif.')
    })

    it('should accept zero initial balance', () => {
      const result = validate(createWalletSchema, {
        name: 'BCA',
        type: 'bank',
        initial_balance: 0,
      })
      expect(result.initial_balance).toBe(0)
    })

    it('should reject non-integer initial balance', () => {
      expect(() =>
        validate(createWalletSchema, { name: 'BCA', type: 'bank', initial_balance: 100.5 })
      ).toThrow('Saldo harus berupa bilangan bulat.')
    })

    it('should accept note', () => {
      const result = validate(createWalletSchema, {
        name: 'BCA',
        type: 'bank',
        initial_balance: 0,
        note: 'Rekening utama',
      })
      expect(result.note).toBe('Rekening utama')
    })

    it('should reject note exceeding 500 characters', () => {
      expect(() =>
        validate(createWalletSchema, {
          name: 'BCA',
          type: 'bank',
          initial_balance: 0,
          note: 'A'.repeat(501),
        })
      ).toThrow('Catatan terlalu panjang.')
    })
  })

  describe('updateWalletSchema', () => {
    it('should accept valid update', () => {
      const result = validate(updateWalletSchema, { name: 'BCA Baru' })
      expect(result.name).toBe('BCA Baru')
    })

    it('should accept empty update', () => {
      const result = validate(updateWalletSchema, {})
      expect(result).toEqual({})
    })

    it('should reject empty name on update', () => {
      expect(() => validate(updateWalletSchema, { name: '' })).toThrow('Nama dompet wajib diisi.')
    })

    it('should reject negative initial_balance on update', () => {
      expect(() => validate(updateWalletSchema, { initial_balance: -1000 })).toThrow(
        'Saldo awal tidak boleh negatif.'
      )
    })

    it('should reject non-integer initial_balance on update', () => {
      expect(() => validate(updateWalletSchema, { initial_balance: 100.5 })).toThrow()
    })
  })
})
