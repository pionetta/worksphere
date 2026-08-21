import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { FinancePage } from './FinancePage'
import * as walletService from '@/features/finance/services/walletService'
import * as transactionService from '@/features/finance/services/transactionService'
import * as budgetService from '@/features/finance/services/budgetService'
import * as savingsService from '@/features/finance/services/savingsService'

vi.mock('@/lib/auth', () => ({
  useAuth: () => ({
    user: { id: 'test-user', email: 'test@example.com' },
    isAuthenticated: true,
  }),
  ProtectedRoute: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

vi.mock('@/lib/db', () => {
  const Dexie = require('dexie')
  const db = new Dexie('FinanceErrorStatesDB')
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
    summary: { totalBalance: 0, totalIncome: 0, totalExpense: 0, netIncome: 0 },
    loading: false,
    refresh: vi.fn(),
  }),
}))

vi.mock('@/features/finance/services/walletService', () => ({
  getWalletsWithBalance: vi.fn().mockResolvedValue([]),
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

describe('FinancePage Error States', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Wallets tab', () => {
    it('should show empty state when no wallets exist', async () => {
      renderFinancePage()

      const walletsTab = screen.getByRole('button', { name: 'Dompet' })
      await userEvent.click(walletsTab)

      await waitFor(() => {
        expect(screen.getByText('Belum ada dompet')).toBeInTheDocument()
      })
    }, 15000)

    it('should show error state when wallet loading fails', async () => {
      vi.mocked(walletService.getWalletsWithBalance).mockRejectedValueOnce(new Error('DB error'))

      renderFinancePage()

      const walletsTab = screen.getByRole('button', { name: 'Dompet' })
      await userEvent.click(walletsTab)

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument()
        expect(screen.getByText('Gagal memuat data dompet. Silakan coba lagi.')).toBeInTheDocument()
        expect(screen.getByText('Coba Lagi')).toBeInTheDocument()
      })
    }, 15000)

    it('should retry and succeed after error', async () => {
      vi.mocked(walletService.getWalletsWithBalance)
        .mockRejectedValueOnce(new Error('DB error'))
        .mockResolvedValueOnce([])

      renderFinancePage()

      const walletsTab = screen.getByRole('button', { name: 'Dompet' })
      await userEvent.click(walletsTab)

      await waitFor(() => {
        expect(screen.getByText('Gagal memuat data dompet. Silakan coba lagi.')).toBeInTheDocument()
      })

      const retryButton = screen.getByText('Coba Lagi')
      await userEvent.click(retryButton)

      await waitFor(() => {
        expect(screen.getByText('Belum ada dompet')).toBeInTheDocument()
      })
    })
  })

  describe('Transactions tab', () => {
    it('should show transaction list when data loads', async () => {
      renderFinancePage()

      const transactionsTab = screen.getByRole('button', { name: 'Transaksi' })
      await userEvent.click(transactionsTab)

      await waitFor(() => {
        expect(screen.getByText('Riwayat Transaksi')).toBeInTheDocument()
      })
    })

    it('should show error state when transaction loading fails', async () => {
      vi.mocked(transactionService.getTransactions).mockRejectedValueOnce(new Error('DB error'))

      renderFinancePage()

      const transactionsTab = screen.getByRole('button', { name: 'Transaksi' })
      await userEvent.click(transactionsTab)

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument()
        expect(
          screen.getByText('Gagal memuat data transaksi. Silakan coba lagi.')
        ).toBeInTheDocument()
      })
    })
  })

  describe('Budgets tab', () => {
    it('should show empty state when no budgets exist', async () => {
      renderFinancePage()

      const budgetsTab = screen.getByRole('button', { name: 'Anggaran' })
      await userEvent.click(budgetsTab)

      await waitFor(() => {
        expect(screen.getByText('Belum ada anggaran')).toBeInTheDocument()
      })
    })

    it('should show error state when budget loading fails', async () => {
      vi.mocked(budgetService.getBudgetsByMonth).mockRejectedValueOnce(new Error('DB error'))

      renderFinancePage()

      const budgetsTab = screen.getByRole('button', { name: 'Anggaran' })
      await userEvent.click(budgetsTab)

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument()
        expect(screen.getByText('Gagal memuat data budget. Silakan coba lagi.')).toBeInTheDocument()
      })
    })
  })

  describe('Savings tab', () => {
    it('should show empty state when no savings goals exist', async () => {
      renderFinancePage()

      const savingsTab = screen.getByRole('button', { name: 'Tabungan' })
      await userEvent.click(savingsTab)

      await waitFor(() => {
        expect(screen.getByText('Belum ada target tabungan')).toBeInTheDocument()
      })
    })

    it('should show error state when savings loading fails', async () => {
      vi.mocked(savingsService.getSavingsGoals).mockRejectedValueOnce(new Error('DB error'))

      renderFinancePage()

      const savingsTab = screen.getByRole('button', { name: 'Tabungan' })
      await userEvent.click(savingsTab)

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument()
        expect(
          screen.getByText('Gagal memuat data tabungan. Silakan coba lagi.')
        ).toBeInTheDocument()
      })
    })
  })

  describe('Tab navigation', () => {
    it('should switch between tabs', async () => {
      renderFinancePage()

      await userEvent.click(screen.getByRole('button', { name: 'Dompet' }))
      await waitFor(() => {
        expect(screen.getByText('Belum ada dompet')).toBeInTheDocument()
      })

      await userEvent.click(screen.getByRole('button', { name: 'Transaksi' }))
      await waitFor(() => {
        expect(screen.getByText('Riwayat Transaksi')).toBeInTheDocument()
      })

      await userEvent.click(screen.getByRole('button', { name: 'Anggaran' }))
      await waitFor(() => {
        expect(screen.getByText('Belum ada anggaran')).toBeInTheDocument()
      })

      await userEvent.click(screen.getByRole('button', { name: 'Tabungan' }))
      await waitFor(() => {
        expect(screen.getByText('Belum ada target tabungan')).toBeInTheDocument()
      })
    })
  })
})
