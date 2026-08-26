import { useState, useEffect } from 'react'
import * as walletService from '@/features/finance/services/walletService'
import * as categoryService from '@/features/finance/services/categoryService'
import * as transactionService from '@/features/finance/services/transactionService'
import { TransactionForm } from '@/features/finance/components/TransactionForm'
import { LoadingState } from '@/components/ui/LoadingState'
import { EmptyState } from '@/components/ui/EmptyState'
import type { WalletWithBalance, Category } from '@/types'

interface ExpenseQuickActionProps {
  userId: string
  onSuccess: () => void
  onCancel: () => void
}

export function ExpenseQuickAction({ userId, onSuccess, onCancel }: ExpenseQuickActionProps) {
  const [wallets, setWallets] = useState<WalletWithBalance[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)
      await categoryService.initializeDefaultCategories(userId)
      const [w, c] = await Promise.all([
        walletService.getWalletsWithBalance(userId),
        categoryService.getAllCategories(userId),
      ])
      setWallets(w)
      setCategories(c)
      setLoading(false)
    }
    load()
  }, [userId])

  if (loading) return <LoadingState text="Memuat data..." />

  if (wallets.length === 0) {
    return (
      <EmptyState
        title="Belum ada dompet"
        description="Buat dompet terlebih dahulu di halaman Keuangan."
      />
    )
  }

  return (
    <TransactionForm
      wallets={wallets}
      categories={categories}
      type="expense"
      onSubmit={async (walletId, amount, categoryId, date, note, effectiveType) => {
        if (effectiveType === 'income') {
          await transactionService.createIncome(
            userId,
            walletId,
            amount,
            categoryId,
            date,
            note ?? undefined
          )
        } else {
          await transactionService.createExpense(
            userId,
            walletId,
            amount,
            categoryId,
            date,
            note ?? undefined
          )
        }
        onSuccess()
      }}
      onCancel={onCancel}
    />
  )
}
