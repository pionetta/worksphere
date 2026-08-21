import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
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
  const db = new Dexie('WalletDeleteConfirmDB')
  db.version(1).stores({
    wallets: 'id, user_id, name, type',
    transactions: 'id, user_id, wallet_id, type, category_id, transaction_date, deleted_at',
    budgets: 'id, user_id, category_id, month, year',
    savings_goals: 'id, user_id, name',
    categories: 'id, user_id, name, type',
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
    summary: { totalBalance: 150000, totalIncome: 0, totalExpense: 0, netIncome: 0 },
    loading: false,
    refresh: vi.fn(),
  }),
}))

vi.mock('@/features/finance/services/walletService', () => ({
  getWalletsWithBalance: vi.fn().mockResolvedValue([
    {
      id: 'wallet-1',
      user_id: 'test-user',
      name: 'Dompet Utama',
      type: 'bank',
      initial_balance: 100000,
      balance: 150000,
      is_active: true,
      note: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ]),
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

vi.mock('@/features/finance/services/transferService', () => ({
  createTransfer: vi.fn().mockResolvedValue({}),
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
  getAllCategories: vi.fn().mockResolvedValue([]),
  initializeDefaultCategories: vi.fn().mockResolvedValue(undefined),
  createCategory: vi.fn().mockResolvedValue({}),
  updateCategory: vi.fn().mockResolvedValue(undefined),
  removeCategory: vi.fn().mockResolvedValue(undefined),
}))

function renderFinancePage() {
  return render(
    <MemoryRouter initialEntries={['/finance']}>
      <FinancePage />
    </MemoryRouter>
  )
}

describe('FinancePage Wallet Delete Confirmation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should show wallet delete button on wallet card', async () => {
    renderFinancePage()

    const walletsTab = screen.getByRole('button', { name: 'Dompet' })
    await userEvent.click(walletsTab)

    await waitFor(() => {
      expect(screen.getByText('Dompet Utama')).toBeInTheDocument()
    })

    expect(screen.getByLabelText('Nonaktifkan dompet Dompet Utama')).toBeInTheDocument()
  }, 15000)

  it('should show confirmation dialog when deactivate button is clicked', async () => {
    renderFinancePage()

    const walletsTab = screen.getByRole('button', { name: 'Dompet' })
    await userEvent.click(walletsTab)

    await waitFor(() => {
      expect(screen.getByText('Dompet Utama')).toBeInTheDocument()
    })

    const deactivateButton = screen.getByLabelText('Nonaktifkan dompet Dompet Utama')
    await userEvent.click(deactivateButton)

    await waitFor(() => {
      expect(screen.getByText('Nonaktifkan Dompet')).toBeInTheDocument()
      expect(screen.getByText(/Apakah Anda yakin ingin menonaktifkan dompet/)).toBeInTheDocument()
    })
  }, 15000)

  it('should close dialog and not deactivate when cancel is clicked', async () => {
    renderFinancePage()

    const walletsTab = screen.getByRole('button', { name: 'Dompet' })
    await userEvent.click(walletsTab)

    await waitFor(() => {
      expect(screen.getByText('Dompet Utama')).toBeInTheDocument()
    })

    const deactivateButton = screen.getByLabelText('Nonaktifkan dompet Dompet Utama')
    await userEvent.click(deactivateButton)

    await waitFor(() => {
      expect(screen.getByText('Nonaktifkan Dompet')).toBeInTheDocument()
    })

    const cancelButton = screen.getByRole('button', { name: 'Batal' })
    await userEvent.click(cancelButton)

    await waitFor(() => {
      expect(screen.queryByText('Nonaktifkan Dompet')).not.toBeInTheDocument()
    })

    expect(walletService.deactivateWallet).not.toHaveBeenCalled()
  }, 15000)

  it('should call deactivateWallet when confirm is clicked', async () => {
    renderFinancePage()

    const walletsTab = screen.getByRole('button', { name: 'Dompet' })
    await userEvent.click(walletsTab)

    await waitFor(() => {
      expect(screen.getByText('Dompet Utama')).toBeInTheDocument()
    })

    const deactivateButton = screen.getByLabelText('Nonaktifkan dompet Dompet Utama')
    await userEvent.click(deactivateButton)

    await waitFor(() => {
      expect(screen.getByText('Nonaktifkan Dompet')).toBeInTheDocument()
    })

    const confirmButton = screen.getByRole('button', { name: 'Nonaktifkan' })
    await userEvent.click(confirmButton)

    await waitFor(() => {
      expect(walletService.deactivateWallet).toHaveBeenCalledWith('wallet-1')
    })
  }, 15000)

  it('should close dialog when Escape key is pressed', async () => {
    renderFinancePage()

    const walletsTab = screen.getByRole('button', { name: 'Dompet' })
    await userEvent.click(walletsTab)

    await waitFor(() => {
      expect(screen.getByText('Dompet Utama')).toBeInTheDocument()
    })

    const deactivateButton = screen.getByLabelText('Nonaktifkan dompet Dompet Utama')
    await userEvent.click(deactivateButton)

    await waitFor(() => {
      expect(screen.getByText('Nonaktifkan Dompet')).toBeInTheDocument()
    })

    await userEvent.keyboard('{Escape}')

    await waitFor(() => {
      expect(screen.queryByText('Nonaktifkan Dompet')).not.toBeInTheDocument()
    })
  }, 15000)
})
