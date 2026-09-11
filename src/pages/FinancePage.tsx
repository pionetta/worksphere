import { useState, useEffect, useCallback, useMemo } from 'react'
import { useAuth } from '@/lib/auth'
import { useWallets } from '@/features/finance/hooks/useWallets'
import { useTransactions } from '@/features/finance/hooks/useTransactions'
import { useBudgets } from '@/features/finance/hooks/useBudgets'
import { useSavingsGoals } from '@/features/finance/hooks/useSavingsGoals'
import { useFinanceSummary } from '@/features/finance/hooks/useFinanceSummary'
import * as categoryService from '@/features/finance/services/categoryService'
import { WalletCard } from '@/features/finance/components/WalletCard'
import { WalletForm } from '@/features/finance/components/WalletForm'
import { TransactionForm } from '@/features/finance/components/TransactionForm'
import { TransactionList } from '@/features/finance/components/TransactionList'
import { TransactionDetail } from '@/features/finance/components/TransactionDetail'
import { TransactionFilter } from '@/features/finance/components/TransactionFilter'
import { CategoryList } from '@/features/finance/components/CategoryList'
import { TransferForm } from '@/features/finance/components/TransferForm'
import { AdjustmentForm } from '@/features/finance/components/AdjustmentForm'
import { BudgetCard } from '@/features/finance/components/BudgetCard'
import { BudgetForm } from '@/features/finance/components/BudgetForm'
import { SavingsGoalCard } from '@/features/finance/components/SavingsGoalCard'
import { SavingsGoalForm } from '@/features/finance/components/SavingsGoalForm'
import { FinanceSummary } from '@/features/finance/components/FinanceSummary'
import {
  getWalletCustomization,
  CUSTOMIZATION_EVENT,
} from '@/features/finance/services/cardCustomizationService'
import { BudgetSummary } from '@/features/finance/components/BudgetSummary'
import { SavingsSummary } from '@/features/finance/components/SavingsSummary'
import { DebtSummary } from '@/features/finance/components/DebtSummary'
import { DebtCard } from '@/features/finance/components/DebtCard'
import { DebtForm } from '@/features/finance/components/DebtForm'
import { DebtPaymentModal } from '@/features/finance/components/DebtPaymentModal'
import { useDebts } from '@/features/finance/hooks/useDebts'
import { groupDebts } from '@/features/finance/services/debtService'
import { IncomeExpenseChart } from '@/features/finance/components/IncomeExpenseChart'
import { ExpenseByCategoryChart } from '@/features/finance/components/ExpenseByCategoryChart'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { BottomSheet } from '@/components/ui/BottomSheet'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { LoadingState } from '@/components/ui/LoadingState'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { useRecurringTransactions } from '@/features/finance/hooks/useRecurringTransactions'
import { RecurringCard } from '@/features/finance/components/RecurringCard'
import { RecurringFormModal } from '@/features/finance/components/RecurringFormModal'
import { useSharedWallets } from '@/features/finance/hooks/useSharedWallets'
import { SharedWalletModal } from '@/features/finance/components/SharedWalletModal'
import { WalletInvitationsBanner } from '@/features/finance/components/WalletInvitationsBanner'
import {
  Plus,
  ArrowLeft,
  ArrowLeftRight,
  Settings2,
  Wallet,
  Receipt,
  PiggyBank,
  HandCoins,
  FileDown,
  RefreshCw,
  ListFilter,
  Building2,
  Filter,
  Clock,
  DollarSign,
  Tag,
  ArrowUpDown,
  X,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { toast } from 'sonner'
import { formatCurrency } from '@/utils/currency'
import type { Category, Transaction, Debt, RecurringTransaction, WalletWithBalance } from '@/types'
import {
  useFilteredTransactions,
  DEFAULT_FILTERS,
  type TransactionFilters,
} from '@/features/finance/utils/transactionFilters'

type Tab =
  | 'summary'
  | 'wallets'
  | 'transactions'
  | 'categories'
  | 'budgets'
  | 'savings'
  | 'debts'
  | 'recurring'

const SUB_TABS: { id: Tab; label: string }[] = [
  { id: 'summary', label: 'Ringkasan' },
  { id: 'recurring', label: 'Rutin' },
  { id: 'budgets', label: 'Anggaran' },
  { id: 'savings', label: 'Tabungan' },
  { id: 'debts', label: 'Utang' },
]

export function FinancePage() {
  const { user } = useAuth()
  const userId = user?.id
  const [tab, setTab] = useState<Tab>('summary')
  const [activeTabIndex, setActiveTabIndex] = useState(0)

  // Keep activeTabIndex in sync if tab is changed externally
  useEffect(() => {
    const idx = SUB_TABS.findIndex(t => t.id === tab)
    if (idx !== -1 && idx !== activeTabIndex) {
      setActiveTabIndex(idx)
    }
  }, [tab, activeTabIndex])

  const handlePrevTab = () => {
    setActiveTabIndex(prev => {
      const nextIndex = prev > 0 ? prev - 1 : SUB_TABS.length - 1
      setTab(SUB_TABS[nextIndex].id)
      return nextIndex
    })
  }

  const handleNextTab = () => {
    setActiveTabIndex(prev => {
      const nextIndex = prev < SUB_TABS.length - 1 ? prev + 1 : 0
      setTab(SUB_TABS[nextIndex].id)
      return nextIndex
    })
  }

  const handleSelectTab = (index: number) => {
    setActiveTabIndex(index)
    setTab(SUB_TABS[index].id)
  }

  // Touch swipe gesture handlers for horizontal tab switching
  const [touchStartX, setTouchStartX] = useState<number | null>(null)
  const [touchStartY, setTouchStartY] = useState<number | null>(null)

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX)
    setTouchStartY(e.touches[0].clientY)
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null || touchStartY === null) return
    const touchEndX = e.changedTouches[0].clientX
    const touchEndY = e.changedTouches[0].clientY
    const diffX = touchStartX - touchEndX
    const diffY = touchStartY - touchEndY

    // Only trigger swipe if horizontal movement is dominant and > 50px
    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
      if (diffX > 0) {
        handleNextTab()
      } else {
        handlePrevTab()
      }
    }
    setTouchStartX(null)
    setTouchStartY(null)
  }

  const now = new Date()
  const [currentMonth, setCurrentMonth] = useState(now.getMonth() + 1)
  const [currentYear, setCurrentYear] = useState(now.getFullYear())

  const walletsHook = useWallets(userId || null)
  const transactionsHook = useTransactions(userId || null)
  const budgetsHook = useBudgets(userId || null, currentMonth, currentYear)
  const savingsHook = useSavingsGoals(userId || null)
  const debtsHook = useDebts(userId || null)
  const recurringHook = useRecurringTransactions(userId || null)
  const summaryHook = useFinanceSummary(userId || null, currentMonth, currentYear)
  const sharedWalletsHook = useSharedWallets(userId || null, user?.email)

  const [showRecurringModal, setShowRecurringModal] = useState(false)
  const [editingRecurring, setEditingRecurring] = useState<RecurringTransaction | null>(null)
  const [managingSharedWallet, setManagingSharedWallet] = useState<WalletWithBalance | null>(null)
  const [recentSectionTab, setRecentSectionTab] = useState<'transactions' | 'wallets'>('transactions')

  const totalBudgetAmount = useMemo(() => {
    return budgetsHook.budgets.reduce((sum, b) => sum + (b.amount || 0), 0)
  }, [budgetsHook.budgets])

  const totalSavingsCollected = useMemo(() => {
    return savingsHook.goals.reduce((sum, g) => sum + (g.current_amount || 0), 0)
  }, [savingsHook.goals])

  const [categories, setCategories] = useState<Category[]>([])
  const [categoriesLoading, setCategoriesLoading] = useState(true)

  const refreshCategories = useCallback(async () => {
    if (!userId) return
    setCategoriesLoading(true)
    try {
      const data = await categoryService.getAllCategories(userId)
      setCategories(data)
    } finally {
      setCategoriesLoading(false)
    }
  }, [userId])

  useEffect(() => {
    async function init() {
      if (!userId) return
      await categoryService.initializeDefaultCategories(userId)
      await refreshCategories()
    }
    init()
  }, [userId, refreshCategories])

  const categoryMap = useMemo(() => {
    const map: Record<string, string> = {}
    for (const c of categories) {
      map[c.id] = c.name
    }
    return map
  }, [categories])

  const walletMap = useMemo(() => {
    const map: Record<string, string> = {}
    for (const w of walletsHook.wallets) {
      map[w.id] = w.name
    }
    return map
  }, [walletsHook.wallets])

  const [transactionFilters, setTransactionFilters] = useState<TransactionFilters>(DEFAULT_FILTERS)

  const filteredTransactions = useFilteredTransactions(
    transactionsHook.transactions,
    transactionFilters,
    categoryMap,
    walletMap
  )

  // Popup Modal States for Wallets and Transactions
  const [showWalletsModal, setShowWalletsModal] = useState(false)
  const [showTransactionsModal, setShowTransactionsModal] = useState(false)

  const [showWalletForm, setShowWalletForm] = useState(false)
  const [editingWalletId, setEditingWalletId] = useState<string | null>(null)

  const [showTransactionForm, setShowTransactionForm] = useState(false)
  const [transactionType, setTransactionType] = useState<'income' | 'expense'>('expense')
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)

  const [showTransferForm, setShowTransferForm] = useState(false)
  const [selectedTransferSourceId, setSelectedTransferSourceId] = useState<string | null>(null)
  const [showAdjustmentForm, setShowAdjustmentForm] = useState(false)
  const [showCategoryModal, setShowCategoryModal] = useState(false)

  // In-place expand/collapse states for summary cards (default max 2 items)
  const [expandWallets, setExpandWallets] = useState(false)
  const [expandRecurring, setExpandRecurring] = useState(false)
  const [expandTransactions, setExpandTransactions] = useState(false)

  const [showBudgetForm, setShowBudgetForm] = useState(false)
  const [editingBudgetId, setEditingBudgetId] = useState<string | null>(null)

  const [showSavingsForm, setShowSavingsForm] = useState(false)
  const [editingSavingsId, setEditingSavingsId] = useState<string | null>(null)

  const [addSavingsToId, setAddSavingsToId] = useState<string | null>(null)
  const [addAmount, setAddAmount] = useState('')

  const [withdrawSavingsFromId, setWithdrawSavingsFromId] = useState<string | null>(null)
  const [withdrawAmount, setWithdrawAmount] = useState('')

  const [showDebtForm, setShowDebtForm] = useState(false)
  const [editingDebtId, setEditingDebtId] = useState<string | null>(null)
  const [payingDebt, setPayingDebt] = useState<Debt | null>(null)

  const [pendingDelete, setPendingDelete] = useState<{
    message: string
    label: string
    onConfirm: () => void
  } | null>(null)

  const [pendingWalletDelete, setPendingWalletDelete] = useState<{
    id: string
    name: string
  } | null>(null)

  // Interactive filter triggered by clicking Pemasukan/Pengeluaran pills on FinanceSummary
  const [summaryTypeFilter, setSummaryTypeFilter] = useState<'all' | 'income' | 'expense'>('all')

  // Card customization version to trigger re-renders on customization save
  const [cardCustomizationVersion, setCardCustomizationVersion] = useState(0)

  useEffect(() => {
    const handleCardCustomizationChange = () => {
      setCardCustomizationVersion(v => v + 1)
    }
    window.addEventListener(CUSTOMIZATION_EVENT, handleCardCustomizationChange)
    return () => window.removeEventListener(CUSTOMIZATION_EVENT, handleCardCustomizationChange)
  }, [])

  // Transactions filtered by currently selected month & year in header, and optional summary income/expense filter
  const monthlyTransactions = useMemo(() => {
    const monthStr = String(currentMonth).padStart(2, '0')
    const prefix = `${currentYear}-${monthStr}`
    const list = transactionsHook.transactions.filter(
      t => t.deleted_at === null && t.transaction_date.startsWith(prefix)
    )
    if (summaryTypeFilter === 'income') {
      return list.filter(t => t.type === 'income')
    }
    if (summaryTypeFilter === 'expense') {
      return list.filter(t => t.type === 'expense')
    }
    return list
  }, [transactionsHook.transactions, currentMonth, currentYear, summaryTypeFilter])

  // Compile wallet summary list with current month income & expense for swipeable hero cards
  const walletSummaryList = useMemo(() => {
    const monthStr = String(currentMonth).padStart(2, '0')
    const prefix = `${currentYear}-${monthStr}`

    const statsMap: Record<string, { income: number; expense: number }> = {}
    for (const t of transactionsHook.transactions) {
      if (t.deleted_at === null && t.transaction_date.startsWith(prefix)) {
        if (!statsMap[t.wallet_id]) {
          statsMap[t.wallet_id] = { income: 0, expense: 0 }
        }
        if (t.type === 'income') {
          statsMap[t.wallet_id].income += t.amount
        } else if (t.type === 'expense') {
          statsMap[t.wallet_id].expense += t.amount
        }
      }
    }

    return walletsHook.wallets.map((w, idx) => {
      const custom = getWalletCustomization(w.id, w.type, idx + 1)
      return {
        id: w.id,
        name: w.name,
        type: w.type,
        balance: w.balance ?? 0,
        income: statsMap[w.id]?.income ?? 0,
        expense: statsMap[w.id]?.expense ?? 0,
        cardTheme: custom.cardTheme,
        cardPattern: custom.cardPattern,
        chipStyle: custom.chipStyle,
      }
    })
  }, [walletsHook.wallets, transactionsHook.transactions, currentMonth, currentYear, cardCustomizationVersion])

  // Calculate spent amount per category for current month (budget warnings)
  const spentByCategory = useMemo(() => {
    const map: Record<string, number> = {}
    const monthStr = String(currentMonth).padStart(2, '0')
    const yearStr = String(currentYear)
    const prefix = `${yearStr}-${monthStr}`

    for (const t of transactionsHook.transactions) {
      if (
        t.category_id &&
        t.type === 'expense' &&
        t.deleted_at === null &&
        t.transaction_date.startsWith(prefix)
      ) {
        map[t.category_id] = (map[t.category_id] || 0) + t.amount
      }
    }
    return map
  }, [transactionsHook.transactions, currentMonth, currentYear])

  const [debtFilterType, setDebtFilterType] = useState<'all' | 'debt' | 'receivable'>('all')
  const [debtFilterStatus, setDebtFilterStatus] = useState<'all' | 'unpaid' | 'paid'>('all')
  const [debtTimeFilter, setDebtTimeFilter] = useState<'all' | 'this_month' | 'next_7_days' | 'overdue'>('all')
  const [debtAmountFilter, setDebtAmountFilter] = useState<'all' | 'under_500k' | '500k_2m' | 'above_2m'>('all')
  const [debtCategoryFilter, setDebtCategoryFilter] = useState<'all' | 'paylater' | 'bank' | 'personal'>('all')
  const [debtSortFilter, setDebtSortFilter] = useState<'remaining_desc' | 'remaining_asc' | 'due_date_asc' | 'total_desc' | 'newest'>('remaining_desc')
  const [showDebtFilters, setShowDebtFilters] = useState(false)

  const activeDebtFiltersCount = useMemo(() => {
    let count = 0
    if (debtFilterType !== 'all') count++
    if (debtFilterStatus !== 'all') count++
    if (debtTimeFilter !== 'all') count++
    if (debtAmountFilter !== 'all') count++
    if (debtCategoryFilter !== 'all') count++
    if (debtSortFilter !== 'remaining_desc') count++
    return count
  }, [debtFilterType, debtFilterStatus, debtTimeFilter, debtAmountFilter, debtCategoryFilter, debtSortFilter])

  const filteredDebts = useMemo(() => {
    const now = new Date()
    now.setHours(0, 0, 0, 0)
    const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

    return debtsHook.debts
      .filter(d => {
        // 1. Tipe (Utang / Piutang)
        if (debtFilterType !== 'all' && d.type !== debtFilterType) return false
        // 2. Status (Lunas / Belum Lunas)
        if (debtFilterStatus === 'unpaid' && d.status === 'paid') return false
        if (debtFilterStatus === 'paid' && d.status !== 'paid') return false

        const remaining = Math.max(0, d.amount - d.paid_amount)

        // 3. Filter Nominal
        if (debtAmountFilter === 'under_500k' && remaining >= 500000) return false
        if (debtAmountFilter === '500k_2m' && (remaining < 500000 || remaining > 2000000)) return false
        if (debtAmountFilter === 'above_2m' && remaining <= 2000000) return false

        // 4. Filter Waktu
        if (debtTimeFilter === 'this_month') {
          const isDueThisMonth =
            (d.due_date && d.due_date.startsWith(currentMonthStr)) ||
            (d.is_installment && d.installment_due_day != null)
          if (!isDueThisMonth) return false
        } else if (debtTimeFilter === 'next_7_days') {
          if (!d.due_date) {
            if (!d.is_installment || !d.installment_due_day) return false
            const dueDay = d.installment_due_day
            const todayDay = now.getDate()
            const diff = dueDay - todayDay
            if (diff < 0 || diff > 7) return false
          } else {
            const dueDate = new Date(d.due_date)
            dueDate.setHours(0, 0, 0, 0)
            const diffDays = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
            if (diffDays < 0 || diffDays > 7) return false
          }
        } else if (debtTimeFilter === 'overdue') {
          if (d.status === 'paid') return false
          if (!d.due_date) return false
          const dueDate = new Date(d.due_date)
          dueDate.setHours(0, 0, 0, 0)
          if (dueDate.getTime() >= now.getTime()) return false
        }

        // 5. Filter Kategori / Tempat
        if (debtCategoryFilter !== 'all') {
          const grp = (d.group_name || '').toLowerCase()
          if (debtCategoryFilter === 'paylater') {
            const isPaylater =
              d.is_flexible_installment ||
              grp.includes('paylater') ||
              grp.includes('kredivo') ||
              grp.includes('akulaku')
            if (!isPaylater) return false
          } else if (debtCategoryFilter === 'bank') {
            const isBank =
              grp.includes('bank') ||
              grp.includes('kta') ||
              grp.includes('kartu kredit') ||
              grp.includes('bca') ||
              grp.includes('mandiri') ||
              grp.includes('bni') ||
              grp.includes('bri')
            if (!isBank) return false
          } else if (debtCategoryFilter === 'personal') {
            const isPersonal =
              grp.includes('teman') ||
              grp.includes('keluarga') ||
              grp.includes('rekan') ||
              grp.includes('kantor') ||
              !d.group_name
            if (!isPersonal) return false
          }
        }

        return true
      })
      .sort((a, b) => {
        const remA = Math.max(0, a.amount - a.paid_amount)
        const remB = Math.max(0, b.amount - b.paid_amount)

        if (debtSortFilter === 'remaining_desc') return remB - remA
        if (debtSortFilter === 'remaining_asc') return remA - remB
        if (debtSortFilter === 'total_desc') return b.amount - a.amount
        if (debtSortFilter === 'due_date_asc') {
          if (!a.due_date) return 1
          if (!b.due_date) return -1
          return a.due_date.localeCompare(b.due_date)
        }
        // newest
        return b.created_at.localeCompare(a.created_at)
      })
  }, [
    debtsHook.debts,
    debtFilterType,
    debtFilterStatus,
    debtTimeFilter,
    debtAmountFilter,
    debtSortFilter,
    debtCategoryFilter,
  ])

  const [debtViewMode, setDebtViewMode] = useState<'grouped' | 'flat'>('grouped')
  const [selectedDebtGroup, setSelectedDebtGroup] = useState<string | null>(null)
  const debtGroups = useMemo(() => groupDebts(filteredDebts), [filteredDebts])

  const displayedDebtGroups = useMemo(() => {
    if (!selectedDebtGroup) return debtGroups
    return debtGroups.filter(g => g.groupName.toLowerCase() === selectedDebtGroup.toLowerCase())
  }, [debtGroups, selectedDebtGroup])

  const displayedDebts = useMemo(() => {
    if (!selectedDebtGroup) return filteredDebts
    return filteredDebts.filter(d => {
      const grpName = d.group_name?.trim() || d.person_name.trim() || 'Lainnya'
      return grpName.toLowerCase() === selectedDebtGroup.toLowerCase()
    })
  }, [filteredDebts, selectedDebtGroup])

  const [exportLoading, setExportLoading] = useState(false)

  const handleExportPdf = async () => {
    setExportLoading(true)
    try {
      const { exportFinancePdf } = await import('@/features/finance/utils/exportFinancePdf')
      exportFinancePdf({
        transactions: transactionsHook.transactions,
        wallets: walletsHook.wallets,
        categories,
        totalBalance: summaryHook.summary.totalBalance,
        totalIncome: summaryHook.summary.totalIncome,
        totalExpense: summaryHook.summary.totalExpense,
        netIncome: summaryHook.summary.netIncome,
      })
      toast.success('Laporan keuangan PDF berhasil dibuat!')
    } catch {
      toast.error('Gagal mengekspor PDF laporan keuangan')
    } finally {
      setExportLoading(false)
    }
  }

  const handleExportExcel = async () => {
    setExportLoading(true)
    try {
      const { exportFinanceExcel } = await import('@/features/finance/utils/exportFinanceExcel')
      await exportFinanceExcel({
        transactions: transactionsHook.transactions,
        wallets: walletsHook.wallets,
        categories,
        totalBalance: summaryHook.summary.totalBalance,
        totalIncome: summaryHook.summary.totalIncome,
        totalExpense: summaryHook.summary.totalExpense,
        netIncome: summaryHook.summary.netIncome,
      })
      toast.success('Laporan keuangan Excel berhasil dibuat!')
    } catch {
      toast.error('Gagal mengekspor Excel laporan keuangan')
    } finally {
      setExportLoading(false)
    }
  }
  const handleAddSavings = async () => {
    if (!addSavingsToId || !addAmount) return
    const num = parseInt(addAmount, 10)
    if (isNaN(num) || num <= 0) return
    try {
      await savingsHook.addToSavings(addSavingsToId, num)
      setAddSavingsToId(null)
      setAddAmount('')
    } catch {
      toast.error('Gagal mencatat setoran tabungan')
    }
  }

  const handleWithdrawSavings = async () => {
    if (!withdrawSavingsFromId || !withdrawAmount) return
    const num = parseInt(withdrawAmount, 10)
    if (isNaN(num) || num <= 0) return
    try {
      await savingsHook.withdrawSavings(withdrawSavingsFromId, num)
      setWithdrawSavingsFromId(null)
      setWithdrawAmount('')
      toast.success('Penarikan tabungan berhasil!')
    } catch {
      toast.error('Gagal menarik saldo tabungan')
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-4 sm:space-y-5 pb-36">
      {/* ─── Pending Shared Wallet Invitations Banner ─── */}
      <WalletInvitationsBanner
        invitations={sharedWalletsHook.pendingInvitations}
        onRespond={sharedWalletsHook.respondToInvitation}
      />

      {/* ─── Header Minimal Keuangan ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 pt-1">
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-[#1E1B4B] dark:text-slate-100">
            Keuangan
          </h1>
          <p className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400">
            Ringkasan finansial dan arus kas Anda
          </p>
        </div>
      </div>

      {/* ─── Carousel Pager Navigasi Tunggal & Swipe Container ─── */}
      <div
        className="flex flex-col items-center justify-center w-full px-1 my-3 touch-pan-y"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Baris Kapsul Utama Penuh */}
        <div className="w-full flex items-center justify-between px-4 py-2.5 bg-white/80 dark:bg-slate-800/80 rounded-2xl border border-slate-200/70 dark:border-white/10 shadow-sm">
          <button
            type="button"
            onClick={handlePrevTab}
            className="p-1.5 rounded-xl text-slate-500 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all cursor-pointer"
            title="Tab sebelumnya"
            aria-label="Tab sebelumnya"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <span
            key={SUB_TABS[activeTabIndex]?.id || tab}
            className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-100 tracking-wide text-center flex-1 select-none animate-fade-in"
          >
            {SUB_TABS[activeTabIndex]?.label || 'Ringkasan'}
          </span>

          <button
            type="button"
            onClick={handleNextTab}
            className="p-1.5 rounded-xl text-slate-500 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all cursor-pointer"
            title="Tab berikutnya"
            aria-label="Tab berikutnya"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Accessible fallback buttons for test compatibility and screen readers */}
        <div className="sr-only">
          {SUB_TABS.map((t, idx) => (
            <button key={t.id} type="button" onClick={() => handleSelectTab(idx)}>
              {t.label}
            </button>
          ))}
          <button type="button" onClick={() => setTab('wallets')}>
            Dompet
          </button>
          <button type="button" onClick={() => setTab('transactions')}>
            Transaksi
          </button>
          <button type="button" onClick={() => setTab('categories')}>
            Kategori
          </button>
          <button
            type="button"
            onClick={() => {
              setEditingTransaction(null)
              setTransactionType('expense')
              setShowTransactionForm(true)
            }}
          >
            Catat Transaksi
          </button>
          <button
            type="button"
            onClick={() => {
              setSelectedTransferSourceId(null)
              setShowTransferForm(true)
            }}
          >
            Transfer Dana
          </button>
          <button
            type="button"
            onClick={() => {
              setEditingWalletId(null)
              setShowWalletForm(true)
            }}
          >
            Tambah Dompet
          </button>
          <button type="button" onClick={() => setShowCategoryModal(true)}>
            Kelola Kategori
          </button>
        </div>
      </div>

      {/* Summary Tab (Halaman Utama Keuangan) */}
      {tab === 'summary' && (
        <div className="space-y-4 sm:space-y-5 animate-fade-in-up">
          {/* Card Total Saldo Bersih & Period Selector with Swipeable Wallet Cards */}
          <FinanceSummary
            totalBalance={summaryHook.summary.totalBalance}
            totalIncome={summaryHook.summary.totalIncome}
            totalExpense={summaryHook.summary.totalExpense}
            netIncome={summaryHook.summary.netIncome}
            month={currentMonth}
            year={currentYear}
            onMonthChange={(m, y) => {
              setCurrentMonth(m)
              setCurrentYear(y)
            }}
            activeTypeFilter={summaryTypeFilter}
            onTypeFilterChange={setSummaryTypeFilter}
            wallets={walletSummaryList}
          />

          {/* Hero CTA Bar Quick Actions */}
          <div className="my-4 flex items-center gap-2 sm:gap-2.5">
            {/* Tombol Utama: Catat Transaksi (Primary Action) */}
            <button
              type="button"
              onClick={() => {
                setEditingTransaction(null)
                setTransactionType('expense')
                setShowTransactionForm(true)
              }}
              className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md shadow-indigo-500/25 active:scale-95 transition-all cursor-pointer whitespace-nowrap min-w-0"
              title="Catat Transaksi Baru"
              aria-label="Catat Transaksi"
            >
              <Plus className="w-4 h-4 stroke-[2.5] shrink-0" />
              <span className="truncate">Catat Transaksi</span>
            </button>

            {/* Tombol Sekunder (Secondary Actions: Transfer, Tambah Dompet, Kelola Kategori) */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Transfer */}
              <button
                type="button"
                onClick={() => {
                  setSelectedTransferSourceId(null)
                  setShowTransferForm(true)
                }}
                className="w-11 h-11 flex items-center justify-center rounded-2xl bg-[#F0F3F8] dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-white/80 dark:border-white/10 shadow-[-3px_-3px_6px_rgba(255,255,255,0.9),3px_3px_6px_rgba(163,177,198,0.3)] active:scale-95 transition-all cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400"
                title="Transfer Dana Antar Dompet"
                aria-label="Transfer Dana"
              >
                <ArrowLeftRight className="w-4 h-4" />
              </button>

              {/* Tambah Dompet */}
              <button
                type="button"
                onClick={() => {
                  setEditingWalletId(null)
                  setShowWalletForm(true)
                }}
                className="w-11 h-11 flex items-center justify-center rounded-2xl bg-[#F0F3F8] dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-white/80 dark:border-white/10 shadow-[-3px_-3px_6px_rgba(255,255,255,0.9),3px_3px_6px_rgba(163,177,198,0.3)] active:scale-95 transition-all cursor-pointer hover:text-emerald-600 dark:hover:text-emerald-400"
                title="Tambah Dompet Baru"
                aria-label="Tambah Dompet"
              >
                <Wallet className="w-4 h-4" />
              </button>

              {/* Kelola Kategori */}
              <button
                type="button"
                onClick={() => setShowCategoryModal(true)}
                className="w-11 h-11 flex items-center justify-center rounded-2xl bg-[#F0F3F8] dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-white/80 dark:border-white/10 shadow-[-3px_-3px_6px_rgba(255,255,255,0.9),3px_3px_6px_rgba(163,177,198,0.3)] active:scale-95 transition-all cursor-pointer hover:text-amber-600 dark:hover:text-amber-400"
                title="Kelola Kategori"
                aria-label="Kelola Kategori"
              >
                <Tag className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* ─── Aktivitas & Transaksi Terbaru (Neumorphic Card dengan Tab Switch Mini) ─── */}
          <div
            data-testid="compact-wallets-section"
            className="p-4 rounded-[26px] bg-[#F0F3F8] dark:bg-slate-800 border border-white/80 dark:border-white/10 shadow-[-5px_-5px_10px_rgba(255,255,255,0.85),5px_5px_10px_rgba(163,177,198,0.22)] my-3 space-y-3"
          >
            {/* Baris 1 (Judul & Switcher) - Posisi Terkunci Statis Tanpa Layout Shift */}
            <div className="flex items-center justify-between gap-2">
              {/* Kiri: Ikon jam dan teks judul dinamis */}
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-inner shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">
                  {recentSectionTab === 'transactions' ? 'Transaksi Terbaru' : 'Daftar Dompet'}
                </h3>
                {recentSectionTab === 'transactions' && summaryTypeFilter !== 'all' && (
                  <button
                    type="button"
                    onClick={() => setSummaryTypeFilter('all')}
                    className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center gap-1 hover:bg-indigo-100 dark:hover:bg-indigo-900/80 transition-colors cursor-pointer shrink-0"
                    title="Hapus filter jenis transaksi"
                  >
                    <span>{summaryTypeFilter === 'income' ? 'Pemasukan' : 'Pengeluaran'}</span>
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* Kanan: Segmented Pill Switcher "Transaksi | Dompet" terkunci di sisi kanan atas */}
              <div className="flex items-center p-1 bg-slate-200/70 dark:bg-slate-700/60 rounded-xl shrink-0">
                <button
                  type="button"
                  onClick={() => setRecentSectionTab('transactions')}
                  aria-label="Tampilkan Transaksi"
                  className={cn(
                    "rounded-lg transition-all cursor-pointer",
                    recentSectionTab === 'transactions'
                      ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 font-semibold px-3 py-1 text-xs shadow-sm"
                      : "text-slate-500 dark:text-slate-400 font-medium px-3 py-1 text-xs hover:text-slate-800 dark:hover:text-slate-200"
                  )}
                >
                  Transaksi
                </button>
                <button
                  type="button"
                  onClick={() => setRecentSectionTab('wallets')}
                  aria-label="Tampilkan Dompet"
                  className={cn(
                    "rounded-lg transition-all cursor-pointer",
                    recentSectionTab === 'wallets'
                      ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 font-semibold px-3 py-1 text-xs shadow-sm"
                      : "text-slate-500 dark:text-slate-400 font-medium px-3 py-1 text-xs hover:text-slate-800 dark:hover:text-slate-200"
                  )}
                >
                  Dompet
                </button>
              </div>
            </div>

            {/* Baris 2 (Toolbars / Aksi Tambahan) - Terpisah di bawah Baris 1 */}
            <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-slate-200/50 dark:border-white/5 gap-2">
              {recentSectionTab === 'transactions' ? (
                <>
                  {/* Mode Transaksi: Kiri tombol export (PDF, Excel) */}
                  <div className="flex items-center gap-1.5">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={handleExportPdf}
                      loading={exportLoading}
                      icon={<FileDown className="w-3 h-3" />}
                      className="h-7 px-2.5 text-[11px] font-semibold"
                      title="Ekspor PDF"
                    >
                      PDF
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={handleExportExcel}
                      loading={exportLoading}
                      icon={<FileDown className="w-3 h-3" />}
                      className="h-7 px-2.5 text-[11px] font-semibold"
                      title="Ekspor Excel"
                    >
                      Excel
                    </Button>
                  </div>

                  {/* Mode Transaksi: Kanan link "Lihat Semua →" */}
                  <button
                    type="button"
                    onClick={() => setTab('transactions')}
                    className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline cursor-pointer"
                  >
                    Lihat Semua &rarr;
                  </button>
                </>
              ) : (
                <>
                  {/* Mode Dompet: Kiri badge total dompet */}
                  <div className="flex items-center gap-1.5">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-200/60 dark:bg-slate-700/60 text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                      {walletsHook.wallets.length} Dompet Terdaftar
                    </span>
                  </div>

                  {/* Mode Dompet: Kanan tombol "+ Tambah Dompet" dan link "Lihat Semua →" */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingWalletId(null)
                        setShowWalletForm(true)
                      }}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/80 transition-colors cursor-pointer"
                    >
                      <Plus className="w-3 h-3 stroke-[2.5]" />
                      + Tambah Dompet
                    </button>
                    <button
                      type="button"
                      onClick={() => setTab('wallets')}
                      className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline cursor-pointer"
                    >
                      Lihat Semua &rarr;
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Content: Transaksi Terbaru */}
            {recentSectionTab === 'transactions' && (
              <div>
                {monthlyTransactions.length === 0 ? (
                  <div className="py-8 px-4 text-center flex flex-col items-center justify-center rounded-2xl bg-white/40 dark:bg-slate-900/30 border border-white/60 dark:border-white/5 shadow-inner">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-inner mb-3">
                      <Receipt className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-100">
                      Belum ada transaksi di dompet ini
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mt-1 mb-4">
                      {summaryTypeFilter !== 'all'
                        ? 'Ubah filter atau catat transaksi baru untuk mulai melihat aktivitas.'
                        : 'Mulai catat transaksi untuk melihat ringkasan keuangan Anda.'}
                    </p>
                    <div className="flex items-center gap-2">
                      {summaryTypeFilter !== 'all' && (
                        <button
                          type="button"
                          onClick={() => setSummaryTypeFilter('all')}
                          className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 transition-all cursor-pointer"
                        >
                          Tampilkan Semua
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          setTransactionType(summaryTypeFilter === 'income' ? 'income' : 'expense')
                          setEditingTransaction(null)
                          setShowTransactionForm(true)
                        }}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/20 active:scale-95 transition-all cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                        + Catat Sekarang
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <TransactionList
                      transactions={
                        expandTransactions
                          ? monthlyTransactions
                          : monthlyTransactions.slice(0, 3)
                      }
                      categoryMap={categoryMap}
                      walletMap={walletMap}
                      onClick={(tx: Transaction) => setSelectedTransaction(tx)}
                      onEdit={(tx: Transaction) => {
                        if (tx.type === 'income' || tx.type === 'expense') {
                          setTransactionType(tx.type)
                          setEditingTransaction(tx)
                          setShowTransactionForm(true)
                        }
                      }}
                      onDelete={id => {
                        const targetTx = transactionsHook.transactions.find(t => t.id === id)
                        const isTransfer = !!targetTx?.transfer_group_id
                        setPendingDelete({
                          message: isTransfer
                            ? 'Apakah Anda yakin ingin menghapus transfer ini? Kedua sisi transaksi akan dibatalkan.'
                            : 'Apakah Anda yakin ingin menghapus transaksi ini?',
                          label: 'Hapus',
                          onConfirm: async () => {
                            try {
                              if (targetTx?.transfer_group_id) {
                                await transactionsHook.removeTransfer(targetTx.transfer_group_id)
                                toast.success('Transfer berhasil dihapus')
                              } else {
                                await transactionsHook.removeTransaction(id)
                                toast.success('Transaksi berhasil dihapus')
                              }
                              await walletsHook.refresh()
                              await summaryHook.refresh()
                            } catch {
                              toast.error('Gagal menghapus transaksi')
                            }
                          },
                        })
                      }}
                    />

                    {monthlyTransactions.length > 3 && (
                      <button
                        type="button"
                        onClick={() => setExpandTransactions(prev => !prev)}
                        className="w-full py-2 mt-1 rounded-xl text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-black/5 dark:hover:bg-white/5 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                      >
                        {expandTransactions ? (
                          <>
                            <ChevronUp className="w-3.5 h-3.5" />
                            <span>Sembunyikan</span>
                          </>
                        ) : (
                          <>
                            <ChevronDown className="w-3.5 h-3.5" />
                            <span>Tampilkan Lebih Banyak ({monthlyTransactions.length - 3} lainnya)</span>
                          </>
                        )}
                      </button>
                    )}
                  </>
                )}
              </div>
            )}

            {/* Content: Daftar Dompet */}
            {recentSectionTab === 'wallets' && (
              <div>
                {walletsHook.loading ? (
                  <LoadingState text="Memuat dompet..." />
                ) : walletsHook.error ? (
                  <ErrorState message={walletsHook.error} onRetry={walletsHook.refresh} />
                ) : walletsHook.wallets.length === 0 ? (
                  <div className="py-8 px-4 text-center flex flex-col items-center justify-center rounded-2xl bg-white/40 dark:bg-slate-900/30 border border-white/60 dark:border-white/5 shadow-inner">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-inner mb-3">
                      <Wallet className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-100">
                      Belum ada dompet
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mt-1 mb-4">
                      Tambahkan dompet untuk mulai mencatat keuangan Anda.
                    </p>
                    <Button
                      size="sm"
                      onClick={() => setShowWalletForm(true)}
                      icon={<Plus className="w-3.5 h-3.5" />}
                    >
                      Tambah Dompet
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 transition-all">
                      {(expandWallets ? walletsHook.wallets : walletsHook.wallets.slice(0, 2)).map(
                        wallet => (
                          <WalletCard
                            key={wallet.id}
                            wallet={wallet}
                            onSelect={() => {
                              setEditingWalletId(wallet.id)
                              setShowWalletForm(true)
                            }}
                            onTransfer={id => {
                              setSelectedTransferSourceId(id)
                              setShowTransferForm(true)
                            }}
                            onDeactivate={id => {
                              setPendingWalletDelete({ id, name: wallet.name })
                            }}
                          />
                        )
                      )}
                    </div>

                    {walletsHook.wallets.length > 2 && (
                      <button
                        type="button"
                        onClick={() => setExpandWallets(prev => !prev)}
                        className="w-full py-2 mt-1 rounded-xl text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-black/5 dark:hover:bg-white/5 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                      >
                        {expandWallets ? (
                          <>
                            <ChevronUp className="w-3.5 h-3.5" />
                            <span>Sembunyikan</span>
                          </>
                        ) : (
                          <>
                            <ChevronDown className="w-3.5 h-3.5" />
                            <span>Tampilkan Lebih Banyak ({walletsHook.wallets.length - 2} lainnya)</span>
                          </>
                        )}
                      </button>
                    )}
                  </>
                )}
              </div>
            )}
          </div>

          {/* Grafik & Arus Keuangan (Bento Grid 2 Kolom di Desktop) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <IncomeExpenseChart
              transactions={transactionsHook.transactions}
              year={currentYear}
              month={currentMonth}
            />
            <ExpenseByCategoryChart
              transactions={transactionsHook.transactions}
              categoryMap={categoryMap}
              year={currentYear}
              month={currentMonth}
              onManageCategories={() => setShowCategoryModal(true)}
            />
          </div>

          {/* Ringkasan Anggaran & Tabungan (Bento Grid 2 Kolom di Tablet/Desktop) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <BudgetSummary
              budgets={budgetsHook.budgets}
              spentByCategory={spentByCategory}
              categoryMap={categoryMap}
              onViewAll={() => setTab('budgets')}
            />

            <SavingsSummary savings={savingsHook.goals} onViewAll={() => setTab('savings')} />
          </div>

          {/* Ringkasan Transaksi Rutin / Langganan */}
          <div className="rounded-3xl bg-white/75 dark:bg-slate-900/75 backdrop-blur-xl border border-white/60 dark:border-white/10 shadow-lg shadow-indigo-500/5 p-4 sm:p-5 space-y-3 transition-colors">
            <div className="flex items-center justify-between pb-2 border-b border-white/60 dark:border-white/10">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <RefreshCw className="w-3.5 h-3.5" />
                </div>
                <h3 className="text-xs sm:text-sm font-bold text-[#1E1B4B] dark:text-slate-100">
                  Tagihan & Transaksi Rutin
                </h3>
              </div>
              {recurringHook.recurringList.length > 2 ? (
                <button
                  type="button"
                  onClick={() => setExpandRecurring(prev => !prev)}
                  className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline cursor-pointer"
                >
                  {expandRecurring
                    ? 'Sembunyikan'
                    : `Lihat Semua (${recurringHook.recurringList.length})`}
                </button>
              ) : recurringHook.recurringList.length > 0 ? (
                <button
                  type="button"
                  onClick={() => setTab('recurring')}
                  className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline cursor-pointer"
                >
                  Lihat Semua &rarr;
                </button>
              ) : null}
            </div>

            {recurringHook.recurringList.length === 0 ? (
              <p className="text-xs text-[#737373] dark:text-[#A3A3A3] py-1">
                Belum ada tagihan atau pengeluaran rutin terdaftar.
              </p>
            ) : (
              <>
                <div className="space-y-2 transition-all">
                  {(expandRecurring
                    ? recurringHook.recurringList
                    : recurringHook.recurringList.slice(0, 2)
                  ).map(item => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 rounded-2xl bg-white/60 dark:bg-slate-800/60 backdrop-blur-md border border-white/60 dark:border-white/10 text-xs"
                    >
                      <div className="min-w-0 pr-2">
                        <p className="font-semibold text-[#171717] dark:text-[#F5F5F5] truncate">
                          {item.note || (item.type === 'income' ? 'Pemasukan Rutin' : 'Pengeluaran Rutin')}
                        </p>
                        <p className="text-[11px] text-[#737373] dark:text-[#A3A3A3] mt-0.5">
                          Jatuh tempo: {item.next_due_date}
                        </p>
                      </div>
                      <span
                        className={`font-black shrink-0 ${
                          item.type === 'income'
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-rose-600 dark:text-rose-400'
                        }`}
                      >
                        {item.type === 'income' ? '+' : '-'}
                        {formatCurrency(item.amount)}
                      </span>
                    </div>
                  ))}
                </div>

                {recurringHook.recurringList.length > 2 && (
                  <button
                    type="button"
                    onClick={() => setExpandRecurring(prev => !prev)}
                    className="w-full py-2 mt-1 rounded-xl text-xs font-semibold text-[#737373] dark:text-[#A3A3A3] hover:text-[#171717] dark:hover:text-[#F5F5F5] hover:bg-black/5 dark:hover:bg-white/5 flex items-center justify-center gap-1.5 transition-all cursor-pointer border border-transparent hover:border-[#E6E6E3] dark:hover:border-[#272727]"
                  >
                    {expandRecurring ? (
                      <>
                        <ChevronUp className="w-3.5 h-3.5" />
                        <span>Sembunyikan</span>
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-3.5 h-3.5" />
                        <span>Tampilkan Lebih Banyak ({recurringHook.recurringList.length - 2} lainnya)</span>
                      </>
                    )}
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* ─── Recurring Tab (Transaksi Rutin & Tagihan) ─── */}
      {tab === 'recurring' && (
        <div className="space-y-4 animate-fade-in-up">
          <div className="flex items-center justify-between p-3.5 sm:p-4 rounded-3xl bg-white/75 dark:bg-slate-900/75 backdrop-blur-xl border border-white/60 dark:border-white/10 shadow-lg shadow-indigo-500/5 transition-colors">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-[#1E1B4B] dark:text-slate-100">
                Transaksi Rutin & Tagihan
              </h3>
              <p className="text-xs text-[#737373] dark:text-[#A3A3A3] mt-0.5">
                {recurringHook.recurringList.filter(r => r.is_active).length} Langganan Aktif
              </p>
            </div>
            <Button
              size="sm"
              onClick={() => {
                setEditingRecurring(null)
                setShowRecurringModal(true)
              }}
              icon={<Plus className="w-4 h-4" />}
            >
              Tambah Rutin
            </Button>
          </div>

          {recurringHook.loading ? (
            <LoadingState text="Memuat transaksi rutin..." />
          ) : recurringHook.error ? (
            <ErrorState message={recurringHook.error} onRetry={recurringHook.refresh} />
          ) : recurringHook.recurringList.length === 0 ? (
            <EmptyState
              icon={<RefreshCw className="w-8 h-8 text-gray-400" />}
              title="Belum Ada Transaksi Rutin"
              description="Catat tagihan bulanan rutin seperti sewa tempat, internet, langganan streaming, atau gaji berkala."
              action={
                <Button
                  size="sm"
                  onClick={() => {
                    setEditingRecurring(null)
                    setShowRecurringModal(true)
                  }}
                  icon={<Plus className="w-4 h-4" />}
                >
                  Tambah Transaksi Rutin
                </Button>
              }
            />
          ) : (
            <div className="space-y-3">
              {recurringHook.recurringList.map(item => (
                <RecurringCard
                  key={item.id}
                  recurring={item}
                  wallets={walletsHook.wallets}
                  categories={categories}
                  onEdit={rec => {
                    setEditingRecurring(rec)
                    setShowRecurringModal(true)
                  }}
                  onToggleActive={async (id, active) => {
                    try {
                      await recurringHook.toggleActive(id, active)
                      toast.success(active ? 'Transaksi rutin diaktifkan' : 'Transaksi rutin dijeda')
                    } catch {
                      toast.error('Gagal memperbarui status')
                    }
                  }}
                  onDelete={async id => {
                    try {
                      await recurringHook.removeRecurring(id)
                      toast.success('Transaksi rutin dihapus')
                    } catch {
                      toast.error('Gagal menghapus transaksi rutin')
                    }
                  }}
                  onExecuteNow={async id => {
                    try {
                      await recurringHook.executeNow(id)
                      toast.success('Transaksi berhasil dicatat ke dompet!')
                      await walletsHook.refresh()
                      await transactionsHook.refresh()
                      await summaryHook.refresh()
                    } catch {
                      toast.error('Gagal mencatat transaksi rutin')
                    }
                  }}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Wallets Tab (Halaman Semua Dompet) */}
      {tab === 'wallets' && (
        <div className="space-y-4 animate-fade-in-up">
          {/* Tombol Navigasi Kembali ke Halaman Utama Keuangan */}
          <div className="flex items-center justify-between p-3.5 rounded-3xl bg-white/75 dark:bg-slate-900/75 backdrop-blur-xl border border-white/60 dark:border-white/10 shadow-lg shadow-indigo-500/5 transition-colors">
            <button
              type="button"
              onClick={() => setTab('summary')}
              className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:underline active:scale-95 transition-all cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Kembali ke Halaman Utama Keuangan</span>
            </button>
            <span className="text-xs font-semibold text-[#737373] dark:text-[#A3A3A3]">
              {walletsHook.wallets.length} Dompet
            </span>
          </div>

          <div className="flex justify-end gap-2">
            {walletsHook.wallets.length > 0 && (
              <>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowTransferForm(true)}
                  icon={<ArrowLeftRight className="w-4 h-4" />}
                >
                  Transfer
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowAdjustmentForm(true)}
                  icon={<Settings2 className="w-4 h-4" />}
                >
                  Penyesuaian
                </Button>
              </>
            )}
            <Button
              size="sm"
              onClick={() => {
                setEditingWalletId(null)
                setShowWalletForm(true)
              }}
              icon={<Plus className="w-4 h-4" />}
            >
              Tambah Dompet
            </Button>
          </div>

          {walletsHook.loading ? (
            <LoadingState text="Memuat dompet..." />
          ) : walletsHook.error ? (
            <ErrorState message={walletsHook.error} onRetry={walletsHook.refresh} />
          ) : walletsHook.wallets.length === 0 && !showWalletForm ? (
            <EmptyState
              icon={<Wallet className="w-6 h-6 text-gray-400" />}
              title="Belum ada dompet"
              description="Buat dompet pertama Anda untuk mulai mencatat keuangan."
              action={
                <Button
                  size="sm"
                  onClick={() => {
                    setEditingWalletId(null)
                    setShowWalletForm(true)
                  }}
                  icon={<Plus className="w-4 h-4" />}
                >
                  Tambah Dompet
                </Button>
              }
            />
          ) : (
            walletsHook.wallets.map(wallet => (
              <WalletCard
                key={wallet.id}
                wallet={wallet}
                memberCount={
                  sharedWalletsHook.membersMap[wallet.id]?.filter(
                    m => m.status === 'accepted'
                  ).length || 0
                }
                onManageMembers={() => {
                  sharedWalletsHook.loadMembersForWallet(wallet.id)
                  setManagingSharedWallet(wallet)
                }}
                onSelect={() => {
                  setEditingWalletId(wallet.id)
                  setShowWalletForm(true)
                }}
                onTransfer={id => {
                  setSelectedTransferSourceId(id)
                  setShowTransferForm(true)
                }}
                onDeactivate={id => {
                  setPendingWalletDelete({ id, name: wallet.name })
                }}
              />
            ))
          )}
        </div>
      )}

      {/* Transactions Tab (Halaman Semua Transaksi) */}
      {tab === 'transactions' && (
        <div className="space-y-3.5 animate-fade-in-up">
          {/* Tombol Navigasi Kembali ke Halaman Utama Keuangan */}
          <div className="flex items-center justify-between p-3.5 rounded-3xl bg-white/75 dark:bg-slate-900/75 backdrop-blur-xl border border-white/60 dark:border-white/10 shadow-lg shadow-indigo-500/5 transition-colors">
            <button
              type="button"
              onClick={() => setTab('summary')}
              className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:underline active:scale-95 transition-all cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Kembali ke Halaman Utama Keuangan</span>
            </button>
            <span className="text-xs font-semibold text-[#737373] dark:text-[#A3A3A3]">
              {filteredTransactions.length} Transaksi
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <Button
                variant="secondary"
                size="sm"
                onClick={handleExportPdf}
                loading={exportLoading}
                icon={<FileDown className="w-3.5 h-3.5" />}
              >
                PDF
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleExportExcel}
                loading={exportLoading}
                icon={<FileDown className="w-3.5 h-3.5" />}
              >
                Excel
              </Button>
            </div>

            <div className="flex items-center gap-1.5">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowCategoryModal(true)}
                icon={<Tag className="w-3.5 h-3.5" />}
              >
                Kategori
              </Button>
              <TransactionFilter
                filters={transactionFilters}
                onFiltersChange={setTransactionFilters}
                categories={categories}
                wallets={walletsHook.wallets}
              />
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setTransactionType('income')
                  setEditingTransaction(null)
                  setShowTransactionForm(true)
                }}
                icon={<Plus className="w-4 h-4" />}
              >
                Masuk
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  setTransactionType('expense')
                  setEditingTransaction(null)
                  setShowTransactionForm(true)
                }}
                icon={<Plus className="w-4 h-4" />}
              >
                Keluar
              </Button>
            </div>
          </div>

          {transactionsHook.loading ? (
            <LoadingState text="Memuat transaksi..." />
          ) : transactionsHook.error ? (
            <ErrorState message={transactionsHook.error} onRetry={transactionsHook.refresh} />
          ) : (
            <div className="rounded-3xl bg-white/75 dark:bg-slate-900/75 backdrop-blur-xl border border-white/60 dark:border-white/10 shadow-lg shadow-indigo-500/5 p-4 sm:p-5 space-y-3 transition-colors">
              <div className="flex items-center justify-between pb-2 border-b border-white/60 dark:border-white/10">
                <h3 className="text-xs sm:text-sm font-bold text-[#1E1B4B] dark:text-slate-100">
                  Riwayat Transaksi
                </h3>
                <span className="text-xs font-semibold text-[#737373] dark:text-[#A3A3A3]">
                  {filteredTransactions.length} transaksi
                </span>
              </div>
              <TransactionList
                transactions={filteredTransactions}
                categoryMap={categoryMap}
                walletMap={walletMap}
                onClick={t => setSelectedTransaction(t)}
                onEdit={t => {
                  if (t.type === 'income' || t.type === 'expense') {
                    setTransactionType(t.type)
                    setEditingTransaction(t)
                    setShowTransactionForm(true)
                  }
                }}
                onDelete={id => {
                  const targetTx = transactionsHook.transactions.find(t => t.id === id)
                  const isTransfer = !!targetTx?.transfer_group_id
                  setPendingDelete({
                    message: isTransfer
                      ? 'Apakah Anda yakin ingin menghapus transfer ini? Kedua sisi transaksi akan dibatalkan.'
                      : 'Apakah Anda yakin ingin menghapus transaksi ini?',
                    label: 'Hapus',
                    onConfirm: async () => {
                      try {
                        if (targetTx?.transfer_group_id) {
                          await transactionsHook.removeTransfer(targetTx.transfer_group_id)
                          toast.success('Transfer berhasil dihapus')
                        } else {
                          await transactionsHook.removeTransaction(id)
                          toast.success('Transaksi berhasil dihapus')
                        }
                        await walletsHook.refresh()
                        await summaryHook.refresh()
                      } catch {
                        toast.error('Gagal menghapus transaksi')
                      }
                    },
                  })
                }}
                emptyTitle="Tidak ada transaksi yang sesuai"
                emptyDescription="Ubah filter atau tambahkan transaksi baru."
              />
            </div>
          )}
        </div>
      )}

      {/* Categories Tab */}
      {tab === 'categories' && (
        <div className="rounded-3xl bg-white/75 dark:bg-slate-900/75 backdrop-blur-xl border border-white/60 dark:border-white/10 shadow-lg shadow-indigo-500/5 p-4 sm:p-5 shadow-xs transition-colors">
          <CategoryList
            categories={categories}
            loading={categoriesLoading}
            onAdd={async (name, type, icon) => {
              if (!userId) return
              try {
                await categoryService.createCategory(userId, name, type, icon ?? undefined)
                toast.success(`Kategori "${name}" berhasil ditambahkan`)
                await refreshCategories()
              } catch {
                toast.error('Gagal menambahkan kategori')
              }
            }}
            onEdit={async (id, data) => {
              try {
                await categoryService.updateCategory(id, data)
                toast.success('Kategori berhasil diperbarui')
                await refreshCategories()
              } catch {
                toast.error('Gagal memperbarui kategori')
              }
            }}
            onRemove={async id => {
              const name = categories.find(c => c.id === id)?.name ?? 'ini'
              setPendingDelete({
                message: `Apakah Anda yakin ingin menghapus kategori "${name}"?`,
                label: 'Hapus',
                onConfirm: async () => {
                  try {
                    await categoryService.removeCategory(id)
                    toast.success(`Kategori "${name}" berhasil dihapus`)
                    await refreshCategories()
                  } catch {
                    toast.error('Gagal menghapus kategori')
                  }
                },
              })
            }}
          />
        </div>
      )}

          {/* Budgets Tab */}
          {tab === 'budgets' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-2 pb-2 border-b border-white/80 dark:border-white/5">
                <div className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                  Total Anggaran:{' '}
                  <span className="font-extrabold text-slate-900 dark:text-slate-100">
                    {formatCurrency(totalBudgetAmount)}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setEditingBudgetId(null)
                    setShowBudgetForm(true)
                  }}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm active:scale-95 transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Tambah</span>
                </button>
              </div>

              {budgetsHook.loading ? (
                <LoadingState text="Memuat anggaran..." />
              ) : budgetsHook.error ? (
                <ErrorState message={budgetsHook.error} onRetry={budgetsHook.refresh} />
              ) : budgetsHook.budgets.length === 0 && !showBudgetForm ? (
                <EmptyState
                  icon={<Receipt className="w-6 h-6 text-gray-400" />}
                  title="Belum ada anggaran"
                  description="Buat anggaran bulanan untuk mengontrol pengeluaran."
                  action={
                    <Button
                      size="sm"
                      onClick={() => setShowBudgetForm(true)}
                      icon={<Plus className="w-4 h-4" />}
                    >
                      Tambah Anggaran
                    </Button>
                  }
                />
              ) : (
                budgetsHook.budgets.map(budget => (
                  <BudgetCard
                    key={budget.id}
                    budget={budget}
                    categoryName={categoryMap[budget.category_id]}
                    spent={spentByCategory[budget.category_id] || 0}
                    onEdit={() => {
                      setEditingBudgetId(budget.id)
                      setShowBudgetForm(true)
                    }}
                    onDelete={id => {
                      const name = categoryMap[budget.category_id] ?? 'ini'
                      setPendingDelete({
                        message: `Apakah Anda yakin ingin menghapus anggaran "${name}"?`,
                        label: 'Hapus',
                        onConfirm: async () => {
                          try {
                            await budgetsHook.removeBudget(id)
                            toast.success(`Anggaran "${name}" berhasil dihapus`)
                          } catch {
                            toast.error('Gagal menghapus anggaran')
                          }
                        },
                      })
                    }}
                  />
                ))
              )}
            </div>
          )}

          {/* Savings Tab */}
          {tab === 'savings' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-2 pb-2 border-b border-white/80 dark:border-white/5">
                <div className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                  Total Terkumpul:{' '}
                  <span className="font-extrabold text-slate-900 dark:text-slate-100">
                    {formatCurrency(totalSavingsCollected)}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setEditingSavingsId(null)
                    setShowSavingsForm(true)
                  }}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm active:scale-95 transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Tambah</span>
                </button>
              </div>

              {savingsHook.loading ? (
                <LoadingState text="Memuat tabungan..." />
              ) : savingsHook.error ? (
                <ErrorState message={savingsHook.error} onRetry={savingsHook.refresh} />
              ) : savingsHook.goals.length === 0 && !showSavingsForm ? (
                <EmptyState
                  icon={<PiggyBank className="w-6 h-6 text-gray-400" />}
                  title="Belum ada target tabungan"
                  description="Buat target tabungan untuk mencapai tujuan keuangan Anda."
                  action={
                    <Button
                      size="sm"
                      onClick={() => setShowSavingsForm(true)}
                      icon={<Plus className="w-4 h-4" />}
                    >
                      Tambah Tujuan
                    </Button>
                  }
                />
              ) : (
                savingsHook.goals.map(goal => (
                  <SavingsGoalCard
                    key={goal.id}
                    goal={goal}
                    onEdit={() => {
                      setEditingSavingsId(goal.id)
                      setShowSavingsForm(true)
                    }}
                    onAdd={id => {
                      setAddSavingsToId(id)
                      setAddAmount('')
                      setWithdrawSavingsFromId(null)
                    }}
                    onWithdraw={id => {
                      setWithdrawSavingsFromId(id)
                      setWithdrawAmount('')
                      setAddSavingsToId(null)
                    }}
                    onDelete={id => {
                      setPendingDelete({
                        message: `Apakah Anda yakin ingin menghapus tabungan "${goal.name}"?`,
                        label: 'Hapus',
                        onConfirm: async () => {
                          await savingsHook.removeGoal(id)
                        },
                      })
                    }}
                  />
                ))
              )}
            </div>
          )}

      {/* Debts Tab */}
      {tab === 'debts' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">
              Utang & Piutang
            </h2>
            {!showDebtForm && (
              <Button
                size="sm"
                onClick={() => {
                  setEditingDebtId(null)
                  setShowDebtForm(true)
                }}
                icon={<Plus className="w-4 h-4" />}
              >
                Catat Utang / Piutang
              </Button>
            )}
          </div>

          <DebtSummary summary={debtsHook.summary} />

          {/* Filters & View Mode Switcher (Full Width) */}
          <div className="space-y-2.5 pt-1 w-full">
            {/* Mode Tampilan: Dikelompokkan per Tempat vs Daftar Semua & Toggle Filter Lanjutan */}
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center p-0.5 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs">
                <button
                  type="button"
                  onClick={() => setDebtViewMode('grouped')}
                  className={`py-1 px-2.5 rounded-md font-bold transition-all cursor-pointer flex items-center gap-1 ${
                    debtViewMode === 'grouped'
                      ? 'bg-white dark:bg-gray-700 text-primary-600 dark:text-primary-400 shadow-xs'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                  }`}
                >
                  <Building2 className="w-3 h-3" />
                  Per Tempat
                </button>
                <button
                  type="button"
                  onClick={() => setDebtViewMode('flat')}
                  className={`py-1 px-2.5 rounded-md font-bold transition-all cursor-pointer flex items-center gap-1 ${
                    debtViewMode === 'flat'
                      ? 'bg-white dark:bg-gray-700 text-primary-600 dark:text-primary-400 shadow-xs'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                  }`}
                >
                  <ListFilter className="w-3 h-3" />
                  Semua Daftar
                </button>
              </div>

              {/* Filter Toolbar Button */}
              <button
                type="button"
                onClick={() => setShowDebtFilters(prev => !prev)}
                className={`py-1 px-2.5 rounded-lg font-bold text-xs border transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeDebtFiltersCount > 0 || showDebtFilters
                    ? 'bg-primary-50 dark:bg-primary-950/50 border-primary-300 dark:border-primary-700 text-primary-700 dark:text-primary-300 shadow-xs'
                    : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-750'
                }`}
              >
                <Filter className="w-3.5 h-3.5" />
                Filter & Urutkan
                {activeDebtFiltersCount > 0 && (
                  <span className="w-4 h-4 rounded-full bg-primary-500 text-white text-[10px] flex items-center justify-center font-extrabold">
                    {activeDebtFiltersCount}
                  </span>
                )}
                {showDebtFilters ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
            </div>

            {/* Quick Status / Type Filter Row */}
            <div className="grid grid-cols-2 gap-2">
              {/* Tipe Filter (Semua | Utang | Piutang) */}
              <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-gray-100/90 dark:bg-gray-800/90 border border-gray-200/80 dark:border-gray-700/80 text-xs shadow-xs">
                <button
                  type="button"
                  onClick={() => setDebtFilterType('all')}
                  className={`py-1 px-1.5 rounded-lg font-bold transition-all text-center justify-center cursor-pointer truncate ${
                    debtFilterType === 'all'
                      ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-xs'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                  }`}
                >
                  Semua
                </button>
                <button
                  type="button"
                  onClick={() => setDebtFilterType('debt')}
                  className={`py-1 px-1.5 rounded-lg font-bold transition-all text-center justify-center cursor-pointer truncate ${
                    debtFilterType === 'debt'
                      ? 'bg-white dark:bg-gray-700 text-rose-600 dark:text-rose-400 shadow-xs'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                  }`}
                >
                  Utang
                </button>
                <button
                  type="button"
                  onClick={() => setDebtFilterType('receivable')}
                  className={`py-1 px-1.5 rounded-lg font-bold transition-all text-center justify-center cursor-pointer truncate ${
                    debtFilterType === 'receivable'
                      ? 'bg-white dark:bg-gray-700 text-emerald-600 dark:text-emerald-400 shadow-xs'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                  }`}
                >
                  Piutang
                </button>
              </div>

              {/* Status Filter (Semua Status | Belum Lunas | Lunas) */}
              <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-gray-100/90 dark:bg-gray-800/90 border border-gray-200/80 dark:border-gray-700/80 text-xs shadow-xs">
                <button
                  type="button"
                  onClick={() => setDebtFilterStatus('all')}
                  className={`py-1 px-1.5 rounded-lg font-bold transition-all text-center justify-center cursor-pointer truncate ${
                    debtFilterStatus === 'all'
                      ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-xs'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                  }`}
                >
                  Semua
                </button>
                <button
                  type="button"
                  onClick={() => setDebtFilterStatus('unpaid')}
                  className={`py-1 px-1.5 rounded-lg font-bold transition-all text-center justify-center cursor-pointer truncate ${
                    debtFilterStatus === 'unpaid'
                      ? 'bg-white dark:bg-gray-700 text-amber-600 dark:text-amber-400 shadow-xs'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                  }`}
                >
                  Belum Lunas
                </button>
                <button
                  type="button"
                  onClick={() => setDebtFilterStatus('paid')}
                  className={`py-1 px-1.5 rounded-lg font-bold transition-all text-center justify-center cursor-pointer truncate ${
                    debtFilterStatus === 'paid'
                      ? 'bg-white dark:bg-gray-700 text-emerald-600 dark:text-emerald-400 shadow-xs'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                  }`}
                >
                  Lunas
                </button>
              </div>
            </div>

            {/* Advanced Filters Panel (Waktu, Nominal, Kategori, Urutkan) */}
            {showDebtFilters && (
              <div className="p-3.5 rounded-2xl bg-white dark:bg-gray-850 border border-primary-200 dark:border-primary-800 shadow-xs space-y-3 animate-fade-in">
                <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-gray-800">
                  <span className="text-xs font-bold text-gray-900 dark:text-gray-100 flex items-center gap-1.5">
                    <Filter className="w-3.5 h-3.5 text-primary-500" />
                    Filter Lanjutan (Waktu, Nominal & Kategori)
                  </span>
                  {activeDebtFiltersCount > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        setDebtFilterType('all')
                        setDebtFilterStatus('all')
                        setDebtTimeFilter('all')
                        setDebtAmountFilter('all')
                        setDebtCategoryFilter('all')
                        setDebtSortFilter('remaining_desc')
                        setSelectedDebtGroup(null)
                      }}
                      className="text-[11px] font-bold text-rose-600 dark:text-rose-400 hover:underline cursor-pointer flex items-center gap-1"
                    >
                      <X className="w-3 h-3" />
                      Reset Filter
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                  {/* 1. Filter Waktu */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-indigo-500" />
                      Waktu Jatuh Tempo:
                    </label>
                    <select
                      value={debtTimeFilter}
                      onChange={e => setDebtTimeFilter(e.target.value as any)}
                      className="w-full px-2.5 py-1.5 text-xs rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 focus:ring-1 focus:ring-primary-500"
                    >
                      <option value="all">Semua Waktu</option>
                      <option value="this_month">Jatuh Tempo Bulan Ini</option>
                      <option value="next_7_days">7 Hari ke Depan</option>
                      <option value="overdue">Lewat Jatuh Tempo (Overdue)</option>
                    </select>
                  </div>

                  {/* 2. Filter Nominal */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1">
                      <DollarSign className="w-3 h-3 text-emerald-500" />
                      Rentang Sisa Nominal:
                    </label>
                    <select
                      value={debtAmountFilter}
                      onChange={e => setDebtAmountFilter(e.target.value as any)}
                      className="w-full px-2.5 py-1.5 text-xs rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 focus:ring-1 focus:ring-primary-500"
                    >
                      <option value="all">Semua Nominal</option>
                      <option value="under_500k">&lt; Rp 500.000</option>
                      <option value="500k_2m">Rp 500.000 - Rp 2.000.000</option>
                      <option value="above_2m">&gt; Rp 2.000.000</option>
                    </select>
                  </div>

                  {/* 3. Filter Kategori */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1">
                      <Tag className="w-3 h-3 text-amber-500" />
                      Kategori / Sumber:
                    </label>
                    <select
                      value={debtCategoryFilter}
                      onChange={e => setDebtCategoryFilter(e.target.value as any)}
                      className="w-full px-2.5 py-1.5 text-xs rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 focus:ring-1 focus:ring-primary-500"
                    >
                      <option value="all">Semua Kategori</option>
                      <option value="paylater">Paylater &amp; Pinjol</option>
                      <option value="bank">Bank &amp; Kartu Kredit</option>
                      <option value="personal">Pribadi / Teman / Keluarga</option>
                    </select>
                  </div>

                  {/* 4. Urutkan */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1">
                      <ArrowUpDown className="w-3 h-3 text-primary-500" />
                      Urutkan Berdasarkan:
                    </label>
                    <select
                      value={debtSortFilter}
                      onChange={e => setDebtSortFilter(e.target.value as any)}
                      className="w-full px-2.5 py-1.5 text-xs rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 focus:ring-1 focus:ring-primary-500"
                    >
                      <option value="remaining_desc">Sisa Terbesar</option>
                      <option value="remaining_asc">Sisa Terkecil</option>
                      <option value="due_date_asc">Jatuh Tempo Terdekat</option>
                      <option value="total_desc">Total Nominal Terbesar</option>
                      <option value="newest">Terbaru Ditambahkan</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Overview Ringkasan per Kelompok / Tempat (Ultra Compact Sleek Layout) */}
          {debtGroups.length > 1 && (
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-primary-500" />
                  Ringkasan Kelompok:
                  <span className="text-[10px] font-normal text-gray-400">
                    (Klik untuk filter)
                  </span>
                </h3>
                {selectedDebtGroup && (
                  <button
                    type="button"
                    onClick={() => setSelectedDebtGroup(null)}
                    className="text-[11px] font-bold text-primary-600 dark:text-primary-400 hover:underline cursor-pointer flex items-center gap-1"
                  >
                    ✕ Tampilkan Semua ({debtGroups.length})
                  </button>
                )}
              </div>

              {/* Compact Responsive Card Grid (2 cols on mobile, 3/4 on larger screens) */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                {debtGroups.map(grp => {
                  const isSelected = selectedDebtGroup?.toLowerCase() === grp.groupName.toLowerCase()
                  const pct = grp.totalAmount > 0 ? Math.min(100, Math.round((grp.totalPaid / grp.totalAmount) * 100)) : 0
                  return (
                    <button
                      key={grp.groupName}
                      type="button"
                      onClick={() => setSelectedDebtGroup(prev => prev?.toLowerCase() === grp.groupName.toLowerCase() ? null : grp.groupName)}
                      className={`w-full text-left p-2.5 rounded-xl transition-all cursor-pointer space-y-1.5 border relative ${
                        isSelected
                          ? 'bg-primary-50/95 dark:bg-primary-950/70 border-primary-500 shadow-xs ring-1 ring-primary-500'
                          : 'bg-white dark:bg-gray-800 border-gray-200/90 dark:border-gray-700/80 shadow-2xs hover:border-primary-400 dark:hover:border-primary-600 hover:shadow-xs'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span className={`text-[11px] font-bold truncate ${isSelected ? 'text-primary-700 dark:text-primary-300' : 'text-gray-900 dark:text-gray-100'}`}>
                          {grp.groupName}
                        </span>
                        <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-md shrink-0 ${
                          isSelected
                            ? 'bg-primary-500 text-white'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                        }`}>
                          {grp.totalCount}
                        </span>
                      </div>
                      <div className="flex items-baseline justify-between text-[11px]">
                        <span className="text-[10px] text-gray-400">Sisa:</span>
                        <span className={`font-extrabold ${isSelected ? 'text-primary-700 dark:text-primary-300' : 'text-gray-900 dark:text-gray-100'}`}>
                          {formatCurrency(grp.totalRemaining)}
                        </span>
                      </div>
                      <div className="w-full bg-gray-100 dark:bg-gray-700 h-1 rounded-full overflow-hidden">
                        <div
                          className="bg-primary-500 h-full rounded-full transition-all duration-300"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </button>
                  )
                })}
              </div>

              {/* Active Filter Indicator */}
              {selectedDebtGroup && (
                <div className="p-2 rounded-xl bg-primary-50/70 dark:bg-primary-950/40 border border-primary-200 dark:border-primary-800 flex items-center justify-between text-xs text-primary-900 dark:text-primary-200 animate-fade-in">
                  <span className="font-semibold flex items-center gap-1.5 truncate">
                    <Building2 className="w-3.5 h-3.5 text-primary-600 dark:text-primary-400 shrink-0" />
                    <span className="truncate">Kelompok: <strong>{selectedDebtGroup}</strong> ({displayedDebts.length} tagihan)</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedDebtGroup(null)}
                    className="text-[10px] font-bold text-primary-700 dark:text-primary-300 hover:underline px-2 py-0.5 rounded-md bg-white dark:bg-gray-800 border border-primary-200 dark:border-primary-700 cursor-pointer shadow-2xs shrink-0 ml-2"
                  >
                    ✕ Reset
                  </button>
                </div>
              )}
            </div>
          )}

          {debtsHook.loading ? (
            <LoadingState text="Memuat utang & piutang..." />
          ) : debtsHook.error ? (
            <ErrorState message={debtsHook.error} onRetry={debtsHook.refresh} />
          ) : displayedDebts.length === 0 && !showDebtForm ? (
            <EmptyState
              icon={<HandCoins className="w-6 h-6 text-gray-400" />}
              title={selectedDebtGroup ? `Tidak ada tagihan di kelompok "${selectedDebtGroup}"` : "Belum ada catatan utang / piutang"}
              description={selectedDebtGroup ? "Pilih kelompok lain atau klik Tampilkan Semua untuk melihat semua tagihan." : "Catat utang atau pinjaman uang untuk memudahkan pemantauan pelunasan."}
              action={
                selectedDebtGroup ? (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => setSelectedDebtGroup(null)}
                  >
                    Tampilkan Semua Tagihan
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => setShowDebtForm(true)}
                    icon={<Plus className="w-4 h-4" />}
                  >
                    Catat Utang / Piutang
                  </Button>
                )
              }
            />
          ) : debtViewMode === 'grouped' ? (
            /* Grouped View */
            <div className="space-y-5">
              {displayedDebtGroups.map(group => {
                const groupPct =
                  group.totalAmount > 0
                    ? Math.min(100, Math.round((group.totalPaid / group.totalAmount) * 100))
                    : 0
                return (
                  <div
                    key={group.groupName}
                    className="p-4 rounded-2xl bg-gray-50/70 dark:bg-gray-850/60 border border-gray-200/80 dark:border-gray-700/70 space-y-3"
                  >
                    {/* Header Group */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-gray-200/70 dark:border-gray-700/70">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-primary-100 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400 flex items-center justify-center font-bold text-xs">
                          <Building2 className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">
                              {group.groupName}
                            </h3>
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gray-200/80 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                              {group.totalCount} catatan ({group.unpaidCount} belum lunas)
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-xs">
                          <span className="text-gray-500 dark:text-gray-400">Total Sisa: </span>
                          <span className="font-bold text-primary-600 dark:text-primary-400">
                            {formatCurrency(group.totalRemaining)}
                          </span>
                          <span className="text-gray-400 text-[11px] ml-1">
                            / {formatCurrency(group.totalAmount)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar for Group */}
                    <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                        style={{ width: `${groupPct}%` }}
                      />
                    </div>

                    {/* Items in this group */}
                    <div className="space-y-2.5 pt-1">
                      {group.items.map(debt => (
                        <DebtCard
                          key={debt.id}
                          debt={debt}
                          onPay={() => setPayingDebt(debt)}
                          onEdit={() => {
                            setEditingDebtId(debt.id)
                            setShowDebtForm(true)
                          }}
                          onDelete={() => {
                            setPendingDelete({
                              message: `Apakah Anda yakin ingin menghapus catatan utang/piutang dengan "${debt.person_name}"?`,
                              label: 'Hapus',
                              onConfirm: async () => {
                                await debtsHook.removeDebt(debt.id)
                              },
                            })
                          }}
                        />
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            /* Flat List View */
            displayedDebts.map(debt => (
              <DebtCard
                key={debt.id}
                debt={debt}
                onPay={() => setPayingDebt(debt)}
                onEdit={() => {
                  setEditingDebtId(debt.id)
                  setShowDebtForm(true)
                }}
                onDelete={() => {
                  setPendingDelete({
                    message: `Apakah Anda yakin ingin menghapus catatan utang/piutang dengan "${debt.person_name}"?`,
                    label: 'Hapus',
                    onConfirm: async () => {
                      await debtsHook.removeDebt(debt.id)
                    },
                  })
                }}
              />
            ))
          )}

          {/* Payment Modal */}
          <DebtPaymentModal
            debt={payingDebt}
            open={payingDebt !== null}
            onClose={() => setPayingDebt(null)}
            onPayment={async (debtId, amount, incrementInstallment) => {
              await debtsHook.makePayment(debtId, amount, incrementInstallment)
            }}
          />
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={pendingDelete !== null}
        onClose={() => setPendingDelete(null)}
        onConfirm={() => pendingDelete?.onConfirm()}
        title="Konfirmasi Hapus"
        message={pendingDelete?.message ?? ''}
        confirmLabel={pendingDelete?.label ?? 'Hapus'}
      />

      {/* Wallet Deactivate Confirmation */}
      <ConfirmDialog
        open={pendingWalletDelete !== null}
        onClose={() => setPendingWalletDelete(null)}
        onConfirm={async () => {
          if (pendingWalletDelete) {
            await walletsHook.deactivateWallet(pendingWalletDelete.id)
            await summaryHook.refresh()
          }
          setPendingWalletDelete(null)
        }}
        title="Nonaktifkan Dompet"
        message={`Apakah Anda yakin ingin menonaktifkan dompet "${pendingWalletDelete?.name ?? ''}"? Dompet yang dinonaktifkan tidak akan muncul di pilihan transaksi baru, namun data transaksi sebelumnya tetap tersimpan.`}
        confirmLabel="Nonaktifkan"
        variant="warning"
      />

      {/* Transaction Detail */}
      <TransactionDetail
        transaction={selectedTransaction}
        categoryName={
          selectedTransaction?.category_id ? categoryMap[selectedTransaction.category_id] : null
        }
        walletName={
          selectedTransaction?.wallet_id ? walletMap[selectedTransaction.wallet_id] : undefined
        }
        onClose={() => setSelectedTransaction(null)}
        onEdit={t => {
          if (t.type === 'income' || t.type === 'expense') {
            setTransactionType(t.type)
            setEditingTransaction(t)
            setShowTransactionForm(true)
          }
        }}
        onDelete={id => {
          const targetTx =
            selectedTransaction?.id === id
              ? selectedTransaction
              : transactionsHook.transactions.find(t => t.id === id)
          const isTransfer = !!targetTx?.transfer_group_id
          setPendingDelete({
            message: isTransfer
              ? 'Apakah Anda yakin ingin menghapus transfer ini? Kedua sisi transaksi (keluar dan masuk) akan dibatalkan.'
              : 'Apakah Anda yakin ingin menghapus transaksi ini?',
            label: 'Hapus',
            onConfirm: async () => {
              if (targetTx?.transfer_group_id) {
                await transactionsHook.removeTransfer(targetTx.transfer_group_id)
              } else {
                await transactionsHook.removeTransaction(id)
              }
              setSelectedTransaction(null)
              await walletsHook.refresh()
              await summaryHook.refresh()
            },
          })
        }}
      />

      {/* ─── Popup Halaman: Kelola Dompet ─── */}
      <BottomSheet
        open={showWalletsModal}
        onClose={() => setShowWalletsModal(false)}
        title="Kelola Dompet"
      >
        <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-1 pb-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              {walletsHook.wallets.length > 0 && (
                <>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setShowWalletsModal(false)
                      setShowTransferForm(true)
                    }}
                    icon={<ArrowLeftRight className="w-3.5 h-3.5" />}
                  >
                    Transfer
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setShowWalletsModal(false)
                      setShowAdjustmentForm(true)
                    }}
                    icon={<Settings2 className="w-3.5 h-3.5" />}
                  >
                    Penyesuaian
                  </Button>
                </>
              )}
            </div>
            <Button
              size="sm"
              onClick={() => {
                setEditingWalletId(null)
                setShowWalletForm(true)
              }}
              icon={<Plus className="w-3.5 h-3.5" />}
            >
              Tambah Dompet
            </Button>
          </div>

          {walletsHook.loading ? (
            <LoadingState text="Memuat dompet..." />
          ) : walletsHook.error ? (
            <ErrorState message={walletsHook.error} onRetry={walletsHook.refresh} />
          ) : walletsHook.wallets.length === 0 ? (
            <EmptyState
              icon={<Wallet className="w-6 h-6 text-gray-400" />}
              title="Belum ada dompet"
              description="Buat dompet pertama Anda untuk mulai mencatat keuangan."
              action={
                <Button
                  size="sm"
                  onClick={() => setShowWalletForm(true)}
                  icon={<Plus className="w-4 h-4" />}
                >
                  Tambah Dompet
                </Button>
              }
            />
          ) : (
            <div className="space-y-2.5">
              {walletsHook.wallets.map(wallet => (
                <WalletCard
                  key={wallet.id}
                  wallet={wallet}
                  onSelect={() => {
                    setEditingWalletId(wallet.id)
                    setShowWalletForm(true)
                  }}
                  onDeactivate={id => {
                    setPendingWalletDelete({ id, name: wallet.name })
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </BottomSheet>

      {/* ─── Popup Halaman: Riwayat Transaksi ─── */}
      <BottomSheet
        open={showTransactionsModal}
        onClose={() => setShowTransactionsModal(false)}
        title="Riwayat Transaksi"
      >
        <div className="space-y-3.5 max-h-[78vh] overflow-y-auto pr-1 pb-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <Button
                variant="secondary"
                size="sm"
                onClick={handleExportPdf}
                loading={exportLoading}
                icon={<FileDown className="w-3.5 h-3.5" />}
              >
                PDF
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleExportExcel}
                loading={exportLoading}
                icon={<FileDown className="w-3.5 h-3.5" />}
              >
                Excel
              </Button>
            </div>

            <div className="flex items-center gap-1.5">
              <TransactionFilter
                filters={transactionFilters}
                onFiltersChange={setTransactionFilters}
                categories={categories}
                wallets={walletsHook.wallets}
              />
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setTransactionType('income')
                  setEditingTransaction(null)
                  setShowTransactionForm(true)
                }}
                icon={<Plus className="w-3.5 h-3.5" />}
              >
                Masuk
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  setTransactionType('expense')
                  setEditingTransaction(null)
                  setShowTransactionForm(true)
                }}
                icon={<Plus className="w-3.5 h-3.5" />}
              >
                Keluar
              </Button>
            </div>
          </div>

          {transactionsHook.loading ? (
            <LoadingState text="Memuat transaksi..." />
          ) : transactionsHook.error ? (
            <ErrorState message={transactionsHook.error} onRetry={transactionsHook.refresh} />
          ) : filteredTransactions.length === 0 ? (
            <EmptyState
              icon={<Receipt className="w-6 h-6 text-gray-400" />}
              title="Belum ada transaksi"
              description="Catat transaksi pemasukan atau pengeluaran pertama Anda."
              action={
                <Button
                  size="sm"
                  onClick={() => {
                    setTransactionType('expense')
                    setEditingTransaction(null)
                    setShowTransactionForm(true)
                  }}
                  icon={<Plus className="w-4 h-4" />}
                >
                  Catat Transaksi
                </Button>
              }
            />
          ) : (
            <TransactionList
              transactions={filteredTransactions}
              categoryMap={categoryMap}
              walletMap={walletMap}
              onClick={(tx: Transaction) => setSelectedTransaction(tx)}
            />
          )}
        </div>
      </BottomSheet>

      {/* ─── Popup: Form Tambah / Edit Dompet ─── */}
      <BottomSheet
        open={showWalletForm}
        onClose={() => {
          setShowWalletForm(false)
          setEditingWalletId(null)
        }}
        title={editingWalletId ? 'Edit Dompet' : 'Tambah Dompet Baru'}
      >
        <div className="pb-4">
          <WalletForm
            key={editingWalletId ?? 'new-wallet'}
            initialName={
              editingWalletId
                ? walletsHook.wallets.find(w => w.id === editingWalletId)?.name
                : ''
            }
            initialType={
              editingWalletId
                ? walletsHook.wallets.find(w => w.id === editingWalletId)?.type
                : 'bank'
            }
            initialBalance={
              editingWalletId
                ? walletsHook.wallets.find(w => w.id === editingWalletId)?.balance
                : 0
            }
            initialNote={
              editingWalletId
                ? (walletsHook.wallets.find(w => w.id === editingWalletId)?.note ?? '')
                : ''
            }
            onSubmit={async (name, type, balance, note) => {
              try {
                if (editingWalletId) {
                  await walletsHook.editWallet(editingWalletId, {
                    name,
                    type,
                    initial_balance: balance,
                    note: note ?? null,
                  })
                  toast.success(`Dompet "${name}" berhasil diperbarui`)
                  setEditingWalletId(null)
                } else {
                  await walletsHook.createWallet(name, type, balance, note ?? undefined)
                  toast.success(`Dompet "${name}" berhasil dibuat`)
                }
                setShowWalletForm(false)
                await summaryHook.refresh()
              } catch {
                toast.error('Gagal menyimpan dompet')
              }
            }}
            onCancel={() => {
              setShowWalletForm(false)
              setEditingWalletId(null)
            }}
            submitLabel={editingWalletId ? 'Update' : 'Simpan'}
          />
        </div>
      </BottomSheet>

      {/* ─── Popup: Form Catat Transaksi ─── */}
      <BottomSheet
        open={showTransactionForm}
        onClose={() => {
          setShowTransactionForm(false)
          setEditingTransaction(null)
        }}
        title={
          editingTransaction
            ? 'Edit Transaksi'
            : transactionType === 'income'
            ? 'Tambah Pemasukan'
            : 'Tambah Pengeluaran'
        }
      >
        <div className="pb-4">
          <TransactionForm
            key={editingTransaction?.id ?? 'new-transaction'}
            wallets={walletsHook.wallets}
            categories={categories}
            type={transactionType}
            initialData={editingTransaction ?? undefined}
            onTypeChange={setTransactionType}
            onManageCategories={() => setShowCategoryModal(true)}
            onSubmit={async (walletId, amount, categoryId, date, note, effectiveType) => {
              const finalType = effectiveType ?? transactionType
              try {
                if (editingTransaction) {
                  await transactionsHook.editTransaction(
                    editingTransaction.id,
                    finalType,
                    walletId,
                    amount,
                    categoryId,
                    date,
                    note ?? undefined
                  )
                  toast.success('Transaksi berhasil diperbarui!')
                } else if (finalType === 'income') {
                  await transactionsHook.addIncome(
                    walletId,
                    amount,
                    categoryId,
                    date,
                    note ?? undefined
                  )
                  toast.success('Pemasukan berhasil dicatat!')
                } else {
                  await transactionsHook.addExpense(
                    walletId,
                    amount,
                    categoryId,
                    date,
                    note ?? undefined
                  )
                  toast.success('Pengeluaran berhasil dicatat!')
                }
                setShowTransactionForm(false)
                setEditingTransaction(null)
                await walletsHook.refresh()
                await summaryHook.refresh()
              } catch {
                toast.error('Gagal menyimpan transaksi')
              }
            }}
            onCancel={() => {
              setShowTransactionForm(false)
              setEditingTransaction(null)
            }}
          />
        </div>
      </BottomSheet>

      {/* ─── Popup: Form Transfer Antar Dompet ─── */}
      <BottomSheet
        open={showTransferForm}
        onClose={() => {
          setShowTransferForm(false)
          setSelectedTransferSourceId(null)
        }}
        title="Transfer Antar Dompet"
      >
        <div className="pb-4">
          <TransferForm
            wallets={walletsHook.wallets}
            initialSourceWalletId={selectedTransferSourceId || undefined}
            onSubmit={async (sourceId, targetId, amount, date, note) => {
              try {
                await transactionsHook.addTransfer(
                  sourceId,
                  targetId,
                  amount,
                  date,
                  note ?? undefined
                )
                toast.success('Transfer antar dompet berhasil!')
                setShowTransferForm(false)
                setSelectedTransferSourceId(null)
                await walletsHook.refresh()
                await summaryHook.refresh()
              } catch {
                toast.error('Gagal melakukan transfer')
              }
            }}
            onCancel={() => {
              setShowTransferForm(false)
              setSelectedTransferSourceId(null)
            }}
          />
        </div>
      </BottomSheet>

      {/* ─── Popup: Form Penyesuaian Saldo ─── */}
      <BottomSheet
        open={showAdjustmentForm}
        onClose={() => setShowAdjustmentForm(false)}
        title="Penyesuaian Saldo"
      >
        <div className="pb-4">
          <AdjustmentForm
            wallets={walletsHook.wallets}
            onSubmit={async (walletId, amount, date, note) => {
              try {
                await transactionsHook.addAdjustment(walletId, amount, date, note ?? undefined)
                toast.success('Penyesuaian saldo berhasil!')
                setShowAdjustmentForm(false)
                await walletsHook.refresh()
                await summaryHook.refresh()
              } catch {
                toast.error('Gagal menyesuaikan saldo')
              }
            }}
            onCancel={() => setShowAdjustmentForm(false)}
          />
        </div>
      </BottomSheet>

      {/* ─── Popup: Kelola Kategori Transaksi ─── */}
      <BottomSheet
        open={showCategoryModal}
        onClose={() => setShowCategoryModal(false)}
        title="Kelola Kategori Transaksi"
      >
        <div className="pb-4">
          <CategoryList
            categories={categories}
            loading={categoriesLoading}
            onAdd={async (name, type, icon) => {
              if (!userId) return
              try {
                await categoryService.createCategory(userId, name, type, icon ?? undefined)
                toast.success(`Kategori "${name}" berhasil ditambahkan`)
                await refreshCategories()
              } catch {
                toast.error('Gagal menambahkan kategori')
              }
            }}
            onEdit={async (id, data) => {
              try {
                await categoryService.updateCategory(id, data)
                toast.success('Kategori berhasil diperbarui')
                await refreshCategories()
              } catch {
                toast.error('Gagal memperbarui kategori')
              }
            }}
            onRemove={async id => {
              try {
                await categoryService.removeCategory(id)
                toast.success('Kategori berhasil dihapus')
                await refreshCategories()
              } catch {
                toast.error('Gagal menghapus kategori')
              }
            }}
          />
        </div>
      </BottomSheet>

      {/* ─── Popup: Form Transaksi Rutin / Langganan ─── */}
      <RecurringFormModal
        open={showRecurringModal}
        onClose={() => {
          setShowRecurringModal(false)
          setEditingRecurring(null)
        }}
        initialData={editingRecurring}
        wallets={walletsHook.wallets}
        categories={categories}
        onSubmit={async data => {
          try {
            await recurringHook.addRecurring(data)
            toast.success('Transaksi rutin berhasil ditambahkan!')
            setShowRecurringModal(false)
          } catch {
            toast.error('Gagal menambahkan transaksi rutin')
          }
        }}
        onUpdate={async (id, data) => {
          try {
            await recurringHook.editRecurring(id, data)
            toast.success('Transaksi rutin berhasil diperbarui!')
            setShowRecurringModal(false)
            setEditingRecurring(null)
          } catch {
            toast.error('Gagal memperbarui transaksi rutin')
          }
        }}
      />

      {/* ─── Popup: Kelola Anggota Dompet Bersama ─── */}
      <SharedWalletModal
        open={managingSharedWallet !== null}
        onClose={() => setManagingSharedWallet(null)}
        wallet={managingSharedWallet}
        members={
          managingSharedWallet
            ? sharedWalletsHook.membersMap[managingSharedWallet.id] || []
            : []
        }
        onInvite={async (email, role) => {
          if (!managingSharedWallet) return
          await sharedWalletsHook.inviteMember({
            wallet_id: managingSharedWallet.id,
            invited_email: email,
            role,
          })
        }}
        onUpdateRole={async (memberId, role) => {
          if (!managingSharedWallet) return
          await sharedWalletsHook.updateRole(
            memberId,
            role,
            managingSharedWallet.id
          )
        }}
        onRemoveMember={async memberId => {
          if (!managingSharedWallet) return
          await sharedWalletsHook.removeMember(
            memberId,
            managingSharedWallet.id
          )
        }}
      />

      {/* ─── Popup: Form Tambah / Edit Anggaran ─── */}
      <BottomSheet
        open={showBudgetForm}
        onClose={() => {
          setShowBudgetForm(false)
          setEditingBudgetId(null)
        }}
        title={editingBudgetId ? 'Edit Anggaran' : 'Tambah Anggaran'}
      >
        <div className="pb-4">
          <BudgetForm
            key={editingBudgetId ?? 'new-budget'}
            categories={categories}
            initialCategoryId={
              editingBudgetId
                ? budgetsHook.budgets.find(b => b.id === editingBudgetId)?.category_id
                : ''
            }
            initialAmount={
              editingBudgetId
                ? budgetsHook.budgets.find(b => b.id === editingBudgetId)?.amount
                : undefined
            }
            initialNote={
              editingBudgetId
                ? (budgetsHook.budgets.find(b => b.id === editingBudgetId)?.note ?? '')
                : ''
            }
            onSubmit={async (categoryId, amount, note) => {
              try {
                if (editingBudgetId) {
                  await budgetsHook.editBudget(editingBudgetId, { amount, note })
                  toast.success('Anggaran berhasil diperbarui')
                  setEditingBudgetId(null)
                } else {
                  await budgetsHook.addBudget(categoryId, amount, note ?? undefined)
                  toast.success('Anggaran baru berhasil disimpan')
                }
                setShowBudgetForm(false)
              } catch {
                toast.error('Gagal menyimpan anggaran')
              }
            }}
            onCancel={() => {
              setShowBudgetForm(false)
              setEditingBudgetId(null)
            }}
            submitLabel={editingBudgetId ? 'Update' : 'Simpan'}
          />
        </div>
      </BottomSheet>

      {/* ─── Popup: Form Tambah / Edit Target Tabungan ─── */}
      <BottomSheet
        open={showSavingsForm}
        onClose={() => {
          setShowSavingsForm(false)
          setEditingSavingsId(null)
        }}
        title={editingSavingsId ? 'Edit Target Tabungan' : 'Tambah Target Tabungan'}
      >
        <div className="pb-4">
          <SavingsGoalForm
            key={editingSavingsId ?? 'new-savings'}
            initialName={
              editingSavingsId
                ? savingsHook.goals.find(g => g.id === editingSavingsId)?.name
                : ''
            }
            initialTarget={
              editingSavingsId
                ? savingsHook.goals.find(g => g.id === editingSavingsId)?.target_amount
                : undefined
            }
            initialDeadline={
              editingSavingsId
                ? (savingsHook.goals.find(g => g.id === editingSavingsId)?.deadline ?? '')
                : ''
            }
            initialNote={
              editingSavingsId
                ? (savingsHook.goals.find(g => g.id === editingSavingsId)?.note ?? '')
                : ''
            }
            onSubmit={async (name, target, deadline, note) => {
              try {
                if (editingSavingsId) {
                  await savingsHook.editGoal(editingSavingsId, {
                    name,
                    target_amount: target,
                    deadline,
                    note,
                  })
                  toast.success(`Target tabungan "${name}" diperbarui`)
                  setEditingSavingsId(null)
                } else {
                  await savingsHook.addGoal(
                    name,
                    target,
                    deadline ?? undefined,
                    note ?? undefined
                  )
                  toast.success(`Target tabungan "${name}" berhasil dibuat`)
                }
                setShowSavingsForm(false)
              } catch {
                toast.error('Gagal menyimpan target tabungan')
              }
            }}
            onCancel={() => {
              setShowSavingsForm(false)
              setEditingSavingsId(null)
            }}
            submitLabel={editingSavingsId ? 'Update' : 'Simpan'}
          />
        </div>
      </BottomSheet>

      {/* ─── Popup: Form Setor Saldo Tabungan ─── */}
      <BottomSheet
        open={!!addSavingsToId}
        onClose={() => {
          setAddSavingsToId(null)
          setAddAmount('')
        }}
        title={`Setor Saldo: ${savingsHook.goals.find(g => g.id === addSavingsToId)?.name || ''}`}
      >
        <div className="space-y-4 pb-2">
          <div className="p-3.5 rounded-xl bg-primary-50/70 dark:bg-primary-950/40 border border-primary-100 dark:border-primary-900/40 text-xs text-primary-800 dark:text-primary-300">
            Target Tabungan: <strong>{formatCurrency(savingsHook.goals.find(g => g.id === addSavingsToId)?.target_amount || 0)}</strong> • Terkumpul saat ini: <strong>{formatCurrency(savingsHook.goals.find(g => g.id === addSavingsToId)?.current_amount || 0)}</strong>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
              Nominal Setoran (Rp)
            </label>
            <input
              type="number"
              value={addAmount}
              onChange={e => setAddAmount(e.target.value)}
              placeholder="Contoh: 100000"
              autoFocus
              className="block w-full px-3 py-2.5 text-sm rounded-xl bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setAddSavingsToId(null)
                setAddAmount('')
              }}
            >
              Batal
            </Button>
            <Button
              size="sm"
              onClick={async () => {
                await handleAddSavings()
                toast.success('Setoran tabungan berhasil dicatat!')
              }}
              disabled={!addAmount || parseInt(addAmount, 10) <= 0}
            >
              Simpan Setoran
            </Button>
          </div>
        </div>
      </BottomSheet>

      {/* ─── Popup: Form Tarik Saldo Tabungan ─── */}
      <BottomSheet
        open={!!withdrawSavingsFromId}
        onClose={() => {
          setWithdrawSavingsFromId(null)
          setWithdrawAmount('')
        }}
        title={`Tarik Saldo: ${savingsHook.goals.find(g => g.id === withdrawSavingsFromId)?.name || ''}`}
      >
        <div className="space-y-4 pb-2">
          <div className="p-3.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-900/40 text-xs text-amber-800 dark:text-amber-300">
            Maksimal penarikan:{' '}
            <strong>
              {formatCurrency(
                savingsHook.goals.find(g => g.id === withdrawSavingsFromId)?.current_amount ?? 0
              )}
            </strong>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
              Nominal Penarikan (Rp)
            </label>
            <input
              type="number"
              value={withdrawAmount}
              onChange={e => setWithdrawAmount(e.target.value)}
              placeholder="Contoh: 50000"
              autoFocus
              className="block w-full px-3 py-2.5 text-sm rounded-xl bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setWithdrawSavingsFromId(null)
                setWithdrawAmount('')
              }}
            >
              Batal
            </Button>
            <Button
              size="sm"
              onClick={handleWithdrawSavings}
              disabled={
                !withdrawAmount ||
                parseInt(withdrawAmount, 10) <= 0 ||
                parseInt(withdrawAmount, 10) >
                  (savingsHook.goals.find(g => g.id === withdrawSavingsFromId)?.current_amount ?? 0)
              }
            >
              Tarik Saldo
            </Button>
          </div>
        </div>
      </BottomSheet>

      {/* ─── Popup: Form Tambah / Edit Utang & Piutang ─── */}
      <BottomSheet
        open={showDebtForm}
        onClose={() => {
          setShowDebtForm(false)
          setEditingDebtId(null)
        }}
        title={editingDebtId ? 'Edit Utang / Piutang' : 'Catat Utang / Piutang'}
      >
        <div className="pb-4">
          <DebtForm
            key={editingDebtId ?? 'new-debt'}
            initialType={
              editingDebtId ? debtsHook.debts.find(d => d.id === editingDebtId)?.type : 'debt'
            }
            initialPersonName={
              editingDebtId
                ? debtsHook.debts.find(d => d.id === editingDebtId)?.person_name
                : ''
            }
            initialGroupName={
              editingDebtId
                ? (debtsHook.debts.find(d => d.id === editingDebtId)?.group_name ?? '')
                : ''
            }
            initialAmount={
              editingDebtId
                ? debtsHook.debts.find(d => d.id === editingDebtId)?.amount
                : undefined
            }
            initialDueDate={
              editingDebtId
                ? (debtsHook.debts.find(d => d.id === editingDebtId)?.due_date ?? '')
                : ''
            }
            initialIsInstallment={
              editingDebtId
                ? Boolean(debtsHook.debts.find(d => d.id === editingDebtId)?.is_installment)
                : false
            }
            initialIsFlexibleInstallment={
              editingDebtId
                ? Boolean(debtsHook.debts.find(d => d.id === editingDebtId)?.is_flexible_installment)
                : false
            }
            initialInstallmentCount={
              editingDebtId
                ? debtsHook.debts.find(d => d.id === editingDebtId)?.installment_count
                : null
            }
            initialInstallmentPaidCount={
              editingDebtId
                ? debtsHook.debts.find(d => d.id === editingDebtId)?.installment_paid_count
                : null
            }
            initialInstallmentAmount={
              editingDebtId
                ? debtsHook.debts.find(d => d.id === editingDebtId)?.installment_amount
                : null
            }
            initialInstallmentSchedule={
              editingDebtId
                ? debtsHook.debts.find(d => d.id === editingDebtId)?.installment_schedule
                : null
            }
            initialCurrentBillAmount={
              editingDebtId
                ? debtsHook.debts.find(d => d.id === editingDebtId)?.current_bill_amount
                : null
            }
            initialInstallmentDueDay={
              editingDebtId
                ? debtsHook.debts.find(d => d.id === editingDebtId)?.installment_due_day
                : null
            }
            initialNote={
              editingDebtId
                ? (debtsHook.debts.find(d => d.id === editingDebtId)?.note ?? '')
                : ''
            }
            onSubmit={async data => {
              try {
                if (editingDebtId) {
                  await debtsHook.editDebt(editingDebtId, data)
                  toast.success('Data utang/piutang berhasil diperbarui')
                  setEditingDebtId(null)
                } else {
                  await debtsHook.addDebt(data)
                  toast.success('Utang/piutang berhasil dicatat')
                }
                setShowDebtForm(false)
              } catch {
                toast.error('Gagal menyimpan data utang/piutang')
              }
            }}
            onCancel={() => {
              setShowDebtForm(false)
              setEditingDebtId(null)
            }}
            submitLabel={editingDebtId ? 'Update' : 'Simpan'}
          />
        </div>
      </BottomSheet>
    </div>
  )
}
