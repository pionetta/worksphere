import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { exportFinancePdf } from './exportFinancePdf'
import { exportFinanceExcel } from './exportFinanceExcel'
import type { Transaction, WalletWithBalance, Category } from '@/types'

const mockWallets: WalletWithBalance[] = [
  {
    id: 'w1',
    user_id: 'user-1',
    name: 'BCA Utama',
    type: 'bank',
    initial_balance: 1000000,
    balance: 1500000,
    is_active: true,
    note: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]

const mockCategories: Category[] = [
  {
    id: 'c1',
    user_id: 'user-1',
    name: 'Gaji',
    type: 'income',
    icon: 'wallet',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]

const mockTransactions: Transaction[] = [
  {
    id: 't1',
    user_id: 'user-1',
    wallet_id: 'w1',
    category_id: 'c1',
    type: 'income',
    amount: 500000,
    transaction_date: '2026-08-25',
    note: 'Bonus project',
    transfer_group_id: null,
    deleted_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]

describe('Finance Export Utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should generate PDF export without error', () => {
    const originalCreateElement = document.createElement.bind(document)
    const mockClick = vi.fn()
    vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
      const el = originalCreateElement(tag)
      if (tag === 'a') {
        Object.defineProperty(el, 'click', { value: mockClick })
      }
      return el
    })

    expect(() =>
      exportFinancePdf({
        transactions: mockTransactions,
        wallets: mockWallets,
        categories: mockCategories,
        totalBalance: 1500000,
        totalIncome: 500000,
        totalExpense: 0,
        netIncome: 500000,
      })
    ).not.toThrow()
  })

  it('should generate Excel export without error', async () => {
    const originalCreateElement = document.createElement.bind(document)
    const mockClick = vi.fn()
    vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
      const el = originalCreateElement(tag)
      if (tag === 'a') {
        Object.defineProperty(el, 'click', { value: mockClick })
      }
      return el
    })

    await expect(
      exportFinanceExcel({
        transactions: mockTransactions,
        wallets: mockWallets,
        categories: mockCategories,
        totalBalance: 1500000,
        totalIncome: 500000,
        totalExpense: 0,
        netIncome: 500000,
      })
    ).resolves.not.toThrow()
  })
})
