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
import { CategoryList } from '@/features/finance/components/CategoryList'
import { TransferForm } from '@/features/finance/components/TransferForm'
import { AdjustmentForm } from '@/features/finance/components/AdjustmentForm'
import { BudgetCard } from '@/features/finance/components/BudgetCard'
import { BudgetForm } from '@/features/finance/components/BudgetForm'
import { SavingsGoalCard } from '@/features/finance/components/SavingsGoalCard'
import { SavingsGoalForm } from '@/features/finance/components/SavingsGoalForm'
import { FinanceSummary } from '@/features/finance/components/FinanceSummary'
import { BudgetSummary } from '@/features/finance/components/BudgetSummary'
import { SavingsSummary } from '@/features/finance/components/SavingsSummary'
import { IncomeExpenseChart } from '@/features/finance/components/IncomeExpenseChart'
import { ExpenseByCategoryChart } from '@/features/finance/components/ExpenseByCategoryChart'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { LoadingState } from '@/components/ui/LoadingState'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { Plus, ArrowLeftRight, Settings2, Wallet, Receipt, PiggyBank } from 'lucide-react'
import type { Category, Transaction } from '@/types'
import type { TransactionFilters } from '@/features/finance/utils/transactionFilters'
import {
  DEFAULT_FILTERS,
  useFilteredTransactions,
} from '@/features/finance/utils/transactionFilters'
import { TransactionFilter } from '@/features/finance/components/TransactionFilter'

type Tab = 'summary' | 'wallets' | 'transactions' | 'categories' | 'budgets' | 'savings'

export function FinancePage() {
  const { user } = useAuth()
  const userId = user?.id ?? ''
  const [tab, setTab] = useState<Tab>('summary')
  const [now] = useState(new Date())
  const currentMonth = now.getMonth() + 1
  const currentYear = now.getFullYear()

  const walletsHook = useWallets(userId || null)
  const transactionsHook = useTransactions(userId || null)
  const budgetsHook = useBudgets(userId || null, currentMonth, currentYear)
  const savingsHook = useSavingsGoals(userId || null)
  const summaryHook = useFinanceSummary(userId || null, currentMonth, currentYear)

  const [categories, setCategories] = useState<Category[]>([])
  const [categoriesLoading, setCategoriesLoading] = useState(true)

  const refreshCategories = useCallback(async () => {
    if (!userId) return
    setCategoriesLoading(true)
    try {
      await categoryService.initializeDefaultCategories(userId)
      const data = await categoryService.getAllCategories(userId)
      setCategories(data)
    } finally {
      setCategoriesLoading(false)
    }
  }, [userId])

  useEffect(() => {
    refreshCategories()
  }, [refreshCategories])

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

  const [showWalletForm, setShowWalletForm] = useState(false)
  const [editingWalletId, setEditingWalletId] = useState<string | null>(null)

  const [showTransactionForm, setShowTransactionForm] = useState(false)
  const [transactionType, setTransactionType] = useState<'income' | 'expense'>('expense')
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)

  const [showTransferForm, setShowTransferForm] = useState(false)
  const [showAdjustmentForm, setShowAdjustmentForm] = useState(false)

  const [showBudgetForm, setShowBudgetForm] = useState(false)
  const [editingBudgetId, setEditingBudgetId] = useState<string | null>(null)

  const [showSavingsForm, setShowSavingsForm] = useState(false)
  const [editingSavingsId, setEditingSavingsId] = useState<string | null>(null)

  const [addSavingsToId, setAddSavingsToId] = useState<string | null>(null)
  const [addAmount, setAddAmount] = useState('')

  const [pendingDelete, setPendingDelete] = useState<{
    message: string
    label: string
    onConfirm: () => void
  } | null>(null)

  const [pendingWalletDelete, setPendingWalletDelete] = useState<{
    id: string
    name: string
  } | null>(null)

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
        map[t.category_id] = (map[t.category_id] ?? 0) + t.amount
      }
    }
    return map
  }, [transactionsHook.transactions, currentMonth, currentYear])

  const tabs: Array<{ key: Tab; label: string }> = [
    { key: 'summary', label: 'Ringkasan' },
    { key: 'wallets', label: 'Dompet' },
    { key: 'transactions', label: 'Transaksi' },
    { key: 'categories', label: 'Kategori' },
    { key: 'budgets', label: 'Anggaran' },
    { key: 'savings', label: 'Tabungan' },
  ]

  const handleAddSavings = async () => {
    if (!addSavingsToId) return
    const amount = parseInt(addAmount.replace(/[^\d]/g, ''), 10)
    if (!amount || amount <= 0) return
    await savingsHook.addToSavings(addSavingsToId, amount)
    setAddSavingsToId(null)
    setAddAmount('')
    await summaryHook.refresh()
  }

  return (
    <div className="space-y-4">
      {/* Tab Navigation */}
      <div className="overflow-x-auto -mx-1 px-1">
        <div className="flex gap-1 p-1 rounded-xl bg-gray-100 dark:bg-gray-800 min-w-max">
          {tabs.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                tab === t.key
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Tab */}
      {tab === 'summary' && (
        <div className="space-y-4">
          <FinanceSummary
            totalBalance={summaryHook.summary.totalBalance}
            totalIncome={summaryHook.summary.totalIncome}
            totalExpense={summaryHook.summary.totalExpense}
            netIncome={summaryHook.summary.netIncome}
          />

          <BudgetSummary
            budgets={budgetsHook.budgets}
            spentByCategory={spentByCategory}
            categoryMap={categoryMap}
            onViewAll={() => setTab('budgets')}
          />

          <SavingsSummary savings={savingsHook.goals} onViewAll={() => setTab('savings')} />

          <IncomeExpenseChart
            transactions={transactionsHook.transactions}
            year={currentYear}
            month={currentMonth}
          />
          <ExpenseByCategoryChart
            transactions={transactionsHook.transactions}
            categoryMap={categoryMap}
          />
          <Card>
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
              Transaksi Terakhir
            </h3>
            <TransactionList
              transactions={transactionsHook.transactions.slice(0, 5)}
              categoryMap={categoryMap}
              walletMap={walletMap}
            />
          </Card>
        </div>
      )}

      {/* Wallets Tab */}
      {tab === 'wallets' && (
        <div className="space-y-4">
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
              onClick={() => setShowWalletForm(true)}
              icon={<Plus className="w-4 h-4" />}
            >
              Tambah Dompet
            </Button>
          </div>

          {showWalletForm && (
            <Card>
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
                  if (editingWalletId) {
                    await walletsHook.editWallet(editingWalletId, {
                      name,
                      type,
                      initial_balance: balance,
                      note,
                    })
                    setEditingWalletId(null)
                  } else {
                    await walletsHook.createWallet(name, type, balance, note ?? undefined)
                  }
                  setShowWalletForm(false)
                  await summaryHook.refresh()
                }}
                onCancel={() => {
                  setShowWalletForm(false)
                  setEditingWalletId(null)
                }}
                submitLabel={editingWalletId ? 'Update' : 'Simpan'}
              />
            </Card>
          )}

          {showTransferForm && (
            <Card>
              <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
                Transfer Antar Dompet
              </h3>
              <TransferForm
                wallets={walletsHook.wallets}
                onSubmit={async (sourceId, targetId, amount, date, note) => {
                  await transactionsHook.addTransfer(
                    sourceId,
                    targetId,
                    amount,
                    date,
                    note ?? undefined
                  )
                  setShowTransferForm(false)
                  await walletsHook.refresh()
                  await summaryHook.refresh()
                }}
                onCancel={() => setShowTransferForm(false)}
              />
            </Card>
          )}

          {showAdjustmentForm && (
            <Card>
              <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
                Penyesuaian Saldo
              </h3>
              <AdjustmentForm
                wallets={walletsHook.wallets}
                onSubmit={async (walletId, amount, date, note) => {
                  await transactionsHook.addAdjustment(walletId, amount, date, note ?? undefined)
                  setShowAdjustmentForm(false)
                  await walletsHook.refresh()
                  await summaryHook.refresh()
                }}
                onCancel={() => setShowAdjustmentForm(false)}
              />
            </Card>
          )}

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
                  onClick={() => setShowWalletForm(true)}
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
                onSelect={() => {
                  setEditingWalletId(wallet.id)
                  setShowWalletForm(true)
                }}
                onDeactivate={id => {
                  setPendingWalletDelete({ id, name: wallet.name })
                }}
              />
            ))
          )}
        </div>
      )}

      {/* Transactions Tab */}
      {tab === 'transactions' && (
        <div className="space-y-4">
          <div className="flex justify-end gap-2">
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
              Pemasukan
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
              Pengeluaran
            </Button>
          </div>

          {showTransactionForm && (
            <Card>
              <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
                {editingTransaction
                  ? 'Edit Transaksi'
                  : transactionType === 'income'
                    ? 'Tambah Pemasukan'
                    : 'Tambah Pengeluaran'}
              </h3>
              <TransactionForm
                key={editingTransaction?.id ?? `new-${transactionType}`}
                wallets={walletsHook.wallets}
                categories={categories}
                type={transactionType}
                initialData={editingTransaction ?? undefined}
                onSubmit={async (walletId, amount, categoryId, date, note) => {
                  if (editingTransaction) {
                    await transactionsHook.editTransaction(
                      editingTransaction.id,
                      transactionType,
                      walletId,
                      amount,
                      categoryId,
                      date,
                      note ?? undefined
                    )
                  } else if (transactionType === 'income') {
                    await transactionsHook.addIncome(
                      walletId,
                      amount,
                      categoryId,
                      date,
                      note ?? undefined
                    )
                  } else {
                    await transactionsHook.addExpense(
                      walletId,
                      amount,
                      categoryId,
                      date,
                      note ?? undefined
                    )
                  }
                  setShowTransactionForm(false)
                  setEditingTransaction(null)
                  await walletsHook.refresh()
                  await summaryHook.refresh()
                }}
                onCancel={() => {
                  setShowTransactionForm(false)
                  setEditingTransaction(null)
                }}
              />
            </Card>
          )}

          {transactionsHook.loading ? (
            <LoadingState text="Memuat transaksi..." />
          ) : transactionsHook.error ? (
            <ErrorState message={transactionsHook.error} onRetry={transactionsHook.refresh} />
          ) : (
            <Card>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  Riwayat Transaksi
                </h3>
                <span className="text-xs text-gray-500 dark:text-gray-400">
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
                      ? 'Apakah Anda yakin ingin menghapus transfer ini? Kedua sisi transaksi (keluar dan masuk) akan dibatalkan.'
                      : 'Apakah Anda yakin ingin menghapus transaksi ini?',
                    label: 'Hapus',
                    onConfirm: async () => {
                      if (targetTx?.transfer_group_id) {
                        await transactionsHook.removeTransfer(targetTx.transfer_group_id)
                      } else {
                        await transactionsHook.removeTransaction(id)
                      }
                      await walletsHook.refresh()
                      await summaryHook.refresh()
                    },
                  })
                }}
                emptyTitle="Tidak ada transaksi yang sesuai"
                emptyDescription="Ubah filter atau tambahkan transaksi baru."
              />
            </Card>
          )}
        </div>
      )}

      {/* Categories Tab */}
      {tab === 'categories' && (
        <Card>
          <CategoryList
            categories={categories}
            loading={categoriesLoading}
            onAdd={async (name, type, icon) => {
              if (!userId) return
              await categoryService.createCategory(userId, name, type, icon ?? undefined)
              await refreshCategories()
            }}
            onEdit={async (id, data) => {
              await categoryService.updateCategory(id, data)
              await refreshCategories()
            }}
            onRemove={async id => {
              const name = categories.find(c => c.id === id)?.name ?? 'ini'
              setPendingDelete({
                message: `Apakah Anda yakin ingin menghapus kategori "${name}"?`,
                label: 'Hapus',
                onConfirm: async () => {
                  await categoryService.removeCategory(id)
                  await refreshCategories()
                },
              })
            }}
          />
        </Card>
      )}

      {/* Budgets Tab */}
      {tab === 'budgets' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button
              size="sm"
              onClick={() => setShowBudgetForm(true)}
              icon={<Plus className="w-4 h-4" />}
            >
              Tambah Anggaran
            </Button>
          </div>

          {showBudgetForm && (
            <Card>
              <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
                {editingBudgetId ? 'Edit Anggaran' : 'Tambah Anggaran'}
              </h3>
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
                  if (editingBudgetId) {
                    await budgetsHook.editBudget(editingBudgetId, { amount, note })
                    setEditingBudgetId(null)
                  } else {
                    await budgetsHook.addBudget(categoryId, amount, note ?? undefined)
                  }
                  setShowBudgetForm(false)
                }}
                onCancel={() => {
                  setShowBudgetForm(false)
                  setEditingBudgetId(null)
                }}
                submitLabel={editingBudgetId ? 'Update' : 'Simpan'}
              />
            </Card>
          )}

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
                      await budgetsHook.removeBudget(id)
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
          <div className="flex justify-end">
            <Button
              size="sm"
              onClick={() => setShowSavingsForm(true)}
              icon={<Plus className="w-4 h-4" />}
            >
              Tambah Tujuan
            </Button>
          </div>

          {showSavingsForm && (
            <Card>
              <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
                {editingSavingsId ? 'Edit Tujuan Tabungan' : 'Tambah Tujuan Tabungan'}
              </h3>
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
                  if (editingSavingsId) {
                    await savingsHook.editGoal(editingSavingsId, {
                      name,
                      target_amount: target,
                      deadline,
                      note,
                    })
                    setEditingSavingsId(null)
                  } else {
                    await savingsHook.addGoal(
                      name,
                      target,
                      deadline ?? undefined,
                      note ?? undefined
                    )
                  }
                  setShowSavingsForm(false)
                }}
                onCancel={() => {
                  setShowSavingsForm(false)
                  setEditingSavingsId(null)
                }}
                submitLabel={editingSavingsId ? 'Update' : 'Simpan'}
              />
            </Card>
          )}

          {addSavingsToId && (
            <Card>
              <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
                Tambah Tabungan
              </h3>
              <div className="space-y-3">
                <input
                  type="number"
                  value={addAmount}
                  onChange={e => setAddAmount(e.target.value)}
                  placeholder="Nominal"
                  className="block w-full px-3 py-2.5 text-sm rounded-xl bg-white dark:bg-gray-900/50 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setAddSavingsToId(null)
                      setAddAmount('')
                    }}
                  >
                    Batal
                  </Button>
                  <Button onClick={handleAddSavings}>Tambah</Button>
                </div>
              </div>
            </Card>
          )}

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
            setTab('transactions')
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
    </div>
  )
}
