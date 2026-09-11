import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { FinancePage } from './FinancePage'
import * as walletService from '@/features/finance/services/walletService'
import * as recurringService from '@/features/finance/services/recurringService'

vi.mock('@/lib/auth', () => ({
  useAuth: () => ({
    user: { id: 'test-user', email: 'test@example.com' },
    isAuthenticated: true,
  }),
  ProtectedRoute: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

vi.mock('@/lib/db', () => {
  const Dexie = require('dexie')
  const db = new Dexie('FinanceCompactModeDB')
  db.version(1).stores({
    wallets: 'id, user_id, name, type',
    transactions: 'id, user_id, wallet_id, type, category_id, transaction_date, deleted_at',
    budgets: 'id, user_id, category_id, month, year',
    savings_goals: 'id, user_id, name',
    categories: 'id, user_id, name, type',
    recurring: 'id, user_id, is_active, type, amount',
    members: 'id, user_id, name',
    attendance: 'id, user_id, member_id, attendance_date',
    tasks: 'id, user_id, title, status, priority, deadline',
    subtasks: 'id, user_id, task_id',
    sync_queue: 'id, user_id, status, entity',
  })
  return { db }
})

vi.mock('@/hooks/useSyncStatus', () => ({
  useSyncStatus: () => ({
    status: 'synced',
    retry: vi.fn(),
    pendingCount: 0,
  }),
}))

vi.mock('@/hooks/useNetworkStatus', () => ({
  useNetworkStatus: () => 'online',
}))

vi.mock('@/features/finance/hooks/useFinanceSummary', () => ({
  useFinanceSummary: () => ({
    summary: { totalBalance: 1000000, totalIncome: 500000, totalExpense: 200000, netIncome: 300000 },
    loading: false,
    refresh: vi.fn(),
  }),
}))

vi.mock('@/features/finance/services/walletService', () => ({
  getWalletsWithBalance: vi.fn(),
  createWallet: vi.fn().mockResolvedValue({}),
  updateWallet: vi.fn().mockResolvedValue(undefined),
  deactivateWallet: vi.fn().mockResolvedValue(undefined),
  activateWallet: vi.fn().mockResolvedValue(undefined),
  removeWallet: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('@/features/finance/services/transactionService', () => ({
  getTransactions: vi.fn().mockResolvedValue([]),
  createIncome: vi.fn().mockResolvedValue({}),
  createExpense: vi.fn().mockResolvedValue({}),
  createAdjustment: vi.fn().mockResolvedValue({}),
  removeTransaction: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('@/features/finance/services/recurringService', () => ({
  getAllRecurring: vi.fn().mockResolvedValue([]),
  processDueRecurringTransactions: vi.fn().mockResolvedValue([]),
  getRecurringTransactions: vi.fn().mockResolvedValue([]),
  createRecurringTransaction: vi.fn().mockResolvedValue({}),
  updateRecurringTransaction: vi.fn().mockResolvedValue(undefined),
  removeRecurringTransaction: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('@/features/finance/services/budgetService', () => ({
  getBudgetsByMonth: vi.fn().mockResolvedValue([]),
  createBudget: vi.fn().mockResolvedValue({}),
  updateBudget: vi.fn().mockResolvedValue(undefined),
  removeBudget: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('@/features/finance/services/savingsService', () => ({
  getSavingsGoals: vi.fn().mockResolvedValue([]),
  createSavingsGoal: vi.fn().mockResolvedValue({}),
  updateSavingsGoal: vi.fn().mockResolvedValue(undefined),
  addToSavings: vi.fn().mockResolvedValue(undefined),
  removeSavingsGoal: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('@/features/finance/services/categoryService', () => ({
  getAllCategories: vi.fn().mockResolvedValue([
    { id: 'cat-1', user_id: 'test-user', name: 'Makanan', type: 'expense', icon: 'Utensils' },
    { id: 'cat-2', user_id: 'test-user', name: 'Gaji', type: 'income', icon: 'Briefcase' },
  ]),
  initializeDefaultCategories: vi.fn().mockResolvedValue(undefined),
  createCategory: vi.fn().mockResolvedValue({}),
  updateCategory: vi.fn().mockResolvedValue(undefined),
  removeCategory: vi.fn().mockResolvedValue(undefined),
}))

describe('FinancePage Compact Mode & Quick Actions', () => {
  const mockWallets = [
    { id: 'w1', user_id: 'test-user', name: 'Dompet Utama', type: 'cash' as const, balance: 100000, initial_balance: 0, note: '', is_active: true, created_at: '', updated_at: '' },
    { id: 'w2', user_id: 'test-user', name: 'Rekening BCA', type: 'bank' as const, balance: 500000, initial_balance: 0, note: '', is_active: true, created_at: '', updated_at: '' },
    { id: 'w3', user_id: 'test-user', name: 'GoPay', type: 'e_wallet' as const, balance: 50000, initial_balance: 0, note: '', is_active: true, created_at: '', updated_at: '' },
    { id: 'w4', user_id: 'test-user', name: 'OVO', type: 'e_wallet' as const, balance: 75000, initial_balance: 0, note: '', is_active: true, created_at: '', updated_at: '' },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(walletService.getWalletsWithBalance).mockResolvedValue(mockWallets)
  })

  it('renders Kelola Kategori in quick actions and opens category modal on click', async () => {
    render(
      <MemoryRouter>
        <FinancePage />
      </MemoryRouter>
    )

    // There are two "Kelola Kategori" buttons: Quick Actions & Chart Header
    const manageCatBtns = await screen.findAllByRole('button', { name: /kelola kategori/i })
    expect(manageCatBtns.length).toBeGreaterThanOrEqual(1)

    // Click the Quick Action button (first one)
    await userEvent.click(manageCatBtns[0])

    await waitFor(() => {
      expect(screen.getByText('Kelola Kategori Transaksi')).toBeInTheDocument()
    })
  })

  it('limits wallets to 2 by default, shows expand toggle, and expands/collapses in-place', async () => {
    render(
      <MemoryRouter>
        <FinancePage />
      </MemoryRouter>
    )

    // Wait for compact wallets section to load and switch to 'Dompet' tab
    const walletsSection = await screen.findByTestId('compact-wallets-section')
    const dompetTabBtn = within(walletsSection).getByRole('button', { name: /dompet/i })
    await userEvent.click(dompetTabBtn)

    await waitFor(() => {
      expect(within(walletsSection).getByText('Dompet Utama')).toBeInTheDocument()
      expect(within(walletsSection).getByText('Rekening BCA')).toBeInTheDocument()
    })

    // 3rd and 4th wallets should NOT be visible by default (max 2 limit)
    expect(within(walletsSection).queryByText('GoPay')).not.toBeInTheDocument()
    expect(within(walletsSection).queryByText('OVO')).not.toBeInTheDocument()

    // Find expand toggle button at bottom of card
    const expandBtn = within(walletsSection).getByRole('button', { name: /tampilkan lebih banyak \(2 lainnya\)/i })
    expect(expandBtn).toBeInTheDocument()

    // Click expand
    await userEvent.click(expandBtn)

    // Now all 4 wallets should be visible
    await waitFor(() => {
      expect(within(walletsSection).getByText('GoPay')).toBeInTheDocument()
      expect(within(walletsSection).getByText('OVO')).toBeInTheDocument()
    })

    // Both header button and bottom button now show "Sembunyikan"
    const collapseBtns = within(walletsSection).getAllByRole('button', { name: /^sembunyikan$/i })
    expect(collapseBtns.length).toBeGreaterThanOrEqual(1)

    // Click bottom collapse button
    await userEvent.click(collapseBtns[collapseBtns.length - 1])

    // 3rd and 4th should be hidden again
    await waitFor(() => {
      expect(within(walletsSection).queryByText('GoPay')).not.toBeInTheDocument()
      expect(within(walletsSection).queryByText('OVO')).not.toBeInTheDocument()
    })
  })

  it('limits recurring transactions to 2 by default and toggles expand/collapse', async () => {
    vi.mocked(recurringService.getAllRecurring).mockResolvedValue([
      { id: 'r1', user_id: 'test-user', wallet_id: 'w1', category_id: 'c1', type: 'expense', amount: 50000, frequency: 'monthly', interval_count: 1, start_date: '2026-01-01', end_date: null, next_due_date: '2026-09-15', last_processed_date: null, is_active: true, auto_record: false, note: 'Langganan Netflix', created_at: '', updated_at: '' },
      { id: 'r2', user_id: 'test-user', wallet_id: 'w1', category_id: 'c1', type: 'expense', amount: 100000, frequency: 'monthly', interval_count: 1, start_date: '2026-01-01', end_date: null, next_due_date: '2026-09-20', last_processed_date: null, is_active: true, auto_record: false, note: 'Tagihan Listrik', created_at: '', updated_at: '' },
      { id: 'r3', user_id: 'test-user', wallet_id: 'w1', category_id: 'c1', type: 'expense', amount: 300000, frequency: 'monthly', interval_count: 1, start_date: '2026-01-01', end_date: null, next_due_date: '2026-09-25', last_processed_date: null, is_active: true, auto_record: false, note: 'Internet Wifi', created_at: '', updated_at: '' },
    ])

    render(
      <MemoryRouter>
        <FinancePage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('Langganan Netflix')).toBeInTheDocument()
      expect(screen.getByText('Tagihan Listrik')).toBeInTheDocument()
    })

    // 3rd recurring item should be hidden initially
    expect(screen.queryByText('Internet Wifi')).not.toBeInTheDocument()

    // Expand recurring list
    const expandRecurringBtn = screen.getByRole('button', { name: /tampilkan lebih banyak \(1 lainnya\)/i })
    await userEvent.click(expandRecurringBtn)

    // Now 3rd item should be visible
    await waitFor(() => {
      expect(screen.getByText('Internet Wifi')).toBeInTheDocument()
    })
  })
})
