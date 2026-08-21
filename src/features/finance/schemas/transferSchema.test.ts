import { describe, it, expect } from 'vitest'
import { validate } from '@/lib/validation'
import { createTransferSchema } from './transferSchema'

const walletA = '550e8400-e29b-41d4-a716-446655440000'
const walletB = '660e8400-e29b-41d4-a716-446655440001'

describe('Transfer Schema', () => {
  it('should accept valid transfer', () => {
    const result = validate(createTransferSchema, {
      source_wallet_id: walletA,
      target_wallet_id: walletB,
      amount: 100000,
      transaction_date: '2026-08-20',
    })
    expect(result.source_wallet_id).toBe(walletA)
    expect(result.target_wallet_id).toBe(walletB)
  })

  it('should reject same source and destination', () => {
    expect(() =>
      validate(createTransferSchema, {
        source_wallet_id: walletA,
        target_wallet_id: walletA,
        amount: 100000,
        transaction_date: '2026-08-20',
      })
    ).toThrow('Dompet sumber dan tujuan tidak boleh sama.')
  })

  it('should reject zero amount', () => {
    expect(() =>
      validate(createTransferSchema, {
        source_wallet_id: walletA,
        target_wallet_id: walletB,
        amount: 0,
        transaction_date: '2026-08-20',
      })
    ).toThrow('Nominal harus lebih dari 0.')
  })

  it('should reject negative amount', () => {
    expect(() =>
      validate(createTransferSchema, {
        source_wallet_id: walletA,
        target_wallet_id: walletB,
        amount: -100000,
        transaction_date: '2026-08-20',
      })
    ).toThrow()
  })

  it('should reject non-integer amount', () => {
    expect(() =>
      validate(createTransferSchema, {
        source_wallet_id: walletA,
        target_wallet_id: walletB,
        amount: 100.5,
        transaction_date: '2026-08-20',
      })
    ).toThrow('Nominal harus berupa bilangan bulat.')
  })

  it('should reject empty source wallet ID', () => {
    expect(() =>
      validate(createTransferSchema, {
        source_wallet_id: '',
        target_wallet_id: walletB,
        amount: 100000,
        transaction_date: '2026-08-20',
      })
    ).toThrow('ID tidak valid.')
  })

  it('should reject empty target wallet ID', () => {
    expect(() =>
      validate(createTransferSchema, {
        source_wallet_id: walletA,
        target_wallet_id: '',
        amount: 100000,
        transaction_date: '2026-08-20',
      })
    ).toThrow('ID tidak valid.')
  })

  it('should reject invalid date', () => {
    expect(() =>
      validate(createTransferSchema, {
        source_wallet_id: walletA,
        target_wallet_id: walletB,
        amount: 100000,
        transaction_date: 'not-a-date',
      })
    ).toThrow()
  })

  it('should accept note', () => {
    const result = validate(createTransferSchema, {
      source_wallet_id: walletA,
      target_wallet_id: walletB,
      amount: 100000,
      transaction_date: '2026-08-20',
      note: 'Transfer ke rekening BCA',
    })
    expect(result.note).toBe('Transfer ke rekening BCA')
  })
})
