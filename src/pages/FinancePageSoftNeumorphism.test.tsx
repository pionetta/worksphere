import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { FinancePage } from './FinancePage'
import * as walletService from '@/features/finance/services/walletService'

vi.mock('@/lib/auth', () => ({
  useAuth: () => ({
    user: { id: 'test-user', email: 'test@example.com' },
    isAuthenticated: true,
  }),
  ProtectedRoute: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

vi.mock('@/lib/db', () => {
  const Dexie = require('dexie')
  const db = new Dexie('FinanceNeumorphismDB')
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
    summary: { totalBalance: 1250000, totalIncome: 750000, totalExpense: 250000, netIncome: 500000 },
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
  ]),
  initializeDefaultCategories: vi.fn().mockResolvedValue(undefined),
  createCategory: vi.fn().mockResolvedValue({}),
  updateCategory: vi.fn().mockResolvedValue(undefined),
  removeCategory: vi.fn().mockResolvedValue(undefined),
}))

describe('FinancePage Soft Neumorphism & Layout Structure', () => {
  const mockWallets = [
    { id: 'w1', user_id: 'test-user', name: 'Dompet Tunai', type: 'cash' as const, balance: 250000, initial_balance: 0, note: '', is_active: true, created_at: '', updated_at: '' },
    { id: 'w2', user_id: 'test-user', name: 'BCA Prioritas', type: 'bank' as const, balance: 1000000, initial_balance: 0, note: '', is_active: true, created_at: '', updated_at: '' },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(walletService.getWalletsWithBalance).mockResolvedValue(mockWallets)
  })

  it('renders with safe area padding pb-36', () => {
    const { container } = render(
      <MemoryRouter>
        <FinancePage />
      </MemoryRouter>
    )

    const mainWrapper = container.querySelector('.max-w-6xl')
    expect(mainWrapper).toHaveClass('pb-36')
  })

  it('renders hero card status bar with active wallet pill badge counter and pagination dots', async () => {
    render(
      <MemoryRouter>
        <FinancePage />
      </MemoryRouter>
    )

    // Slides include Total Saldo Kas (1) + 2 wallets = 3 total slides
    await waitFor(() => {
      expect(screen.getByText('Semua Kas')).toBeInTheDocument()
      expect(screen.getByText('(1/3)')).toBeInTheDocument()
    })

    // Pagination dots should be present for 3 slides
    const slideDots = screen.getAllByRole('button', { name: /slide \d/i })
    expect(slideDots.length).toBe(3)
    // First slide dot should have active styling (w-4 h-1.5 bg-indigo-600)
    expect(slideDots[0].className).toContain('w-4')
    expect(slideDots[0].className).toContain('bg-indigo-600')
    // Other dots should have inactive styling (w-1.5 h-1.5 bg-slate-300)
    expect(slideDots[1].className).toContain('w-1.5')
    expect(slideDots[1].className).toContain('bg-slate-300')
  })

  it('renders the bottom neumorphic card with Transaksi Terbaru by default, breathing room, and 2-row header', async () => {
    const { container } = render(
      <MemoryRouter>
        <FinancePage />
      </MemoryRouter>
    )

    // Verify Wallet Stack container has mt-6 mb-3 for breathing room
    const walletStack = container.querySelector('.relative.w-full.h-\\[225px\\]')
    expect(walletStack).toHaveClass('mt-6')
    expect(walletStack).toHaveClass('mb-3')

    const recentSection = await screen.findByTestId('compact-wallets-section')
    expect(recentSection).toHaveClass('rounded-[26px]')
    expect(recentSection).toHaveClass('bg-[#F0F3F8]')

    // Default title is "Transaksi Terbaru"
    expect(within(recentSection).getByText('Transaksi Terbaru')).toBeInTheDocument()

    // Row 1: Mini tab switch buttons
    const txSwitch = within(recentSection).getByRole('button', { name: /transaksi/i })
    const walletSwitch = within(recentSection).getByRole('button', { name: /dompet/i })
    expect(txSwitch).toBeInTheDocument()
    expect(walletSwitch).toBeInTheDocument()

    // Row 2: In Transaksi mode, export buttons and "Lihat Semua" link are present
    expect(within(recentSection).getByTitle('Ekspor PDF')).toBeInTheDocument()
    expect(within(recentSection).getByTitle('Ekspor Excel')).toBeInTheDocument()
    expect(within(recentSection).getByText(/lihat semua/i)).toBeInTheDocument()

    // Empty state when no transactions exist
    expect(within(recentSection).getByText('Belum ada transaksi di dompet ini')).toBeInTheDocument()
    expect(within(recentSection).getByRole('button', { name: /\+ catat sekarang/i })).toBeInTheDocument()

    // Clicking "Dompet" switch shows wallets and updates Row 2 toolbar
    await userEvent.click(walletSwitch)
    await waitFor(() => {
      expect(within(recentSection).getByText('Daftar Dompet')).toBeInTheDocument()
      expect(within(recentSection).getByText('Dompet Tunai')).toBeInTheDocument()
      expect(within(recentSection).getByText('BCA Prioritas')).toBeInTheDocument()
      // Row 2 in Dompet mode: badge total dompet and "+ Tambah Dompet"
      expect(within(recentSection).getByText('2 Dompet Terdaftar')).toBeInTheDocument()
      expect(within(recentSection).getByRole('button', { name: /\+ tambah dompet/i })).toBeInTheDocument()
    })
  })

  it('renders Anggaran header with informative mini summary and elevated pill + Tambah button', async () => {
    render(
      <MemoryRouter>
        <FinancePage />
      </MemoryRouter>
    )

    await userEvent.click(screen.getByRole('button', { name: 'Anggaran' }))

    await waitFor(() => {
      expect(screen.getByText(/Total Anggaran:/)).toBeInTheDocument()
    })

    const addBtn = screen.getByRole('button', { name: 'Tambah' })
    expect(addBtn).toBeInTheDocument()
    expect(addBtn).toHaveClass('bg-indigo-600')
    expect(addBtn).toHaveClass('rounded-xl')
  })

  it('renders Tabungan header with informative mini summary and elevated pill + Tambah button', async () => {
    render(
      <MemoryRouter>
        <FinancePage />
      </MemoryRouter>
    )

    await userEvent.click(screen.getByRole('button', { name: 'Tabungan' }))

    await waitFor(() => {
      expect(screen.getByText(/Total Terkumpul:/)).toBeInTheDocument()
    })

    const addBtn = screen.getByRole('button', { name: 'Tambah' })
    expect(addBtn).toBeInTheDocument()
    expect(addBtn).toHaveClass('bg-indigo-600')
    expect(addBtn).toHaveClass('rounded-xl')
  })
})
