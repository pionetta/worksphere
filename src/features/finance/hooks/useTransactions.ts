import { useState, useEffect, useCallback } from 'react'
import * as transactionService from '@/features/finance/services/transactionService'
import * as transferService from '@/features/finance/services/transferService'
import type { Transaction } from '@/types'

export function useTransactions(userId: string | null) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    if (!userId) return
    setLoading(true)
    setError(null)
    try {
      const data = await transactionService.getTransactions(userId)
      setTransactions(data)
    } catch {
      setError('Gagal memuat data transaksi. Silakan coba lagi.')
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    refresh()

    const handleSync = (e: Event) => {
      const detail = (e as CustomEvent).detail
      if (
        !detail ||
        !detail.table ||
        detail.table === 'transactions' ||
        detail.table === 'wallets' ||
        detail.type === 'full-pull'
      ) {
        refresh()
      }
    }
    window.addEventListener('worksphere-data-synced', handleSync)
    return () => window.removeEventListener('worksphere-data-synced', handleSync)
  }, [refresh])

  const getTransactionsByDateRange = useCallback(
    async (startDate: string, endDate: string) => {
      if (!userId) return []
      return transactionService.getTransactionsByDateRange(userId, startDate, endDate)
    },
    [userId]
  )

  const addIncome = useCallback(
    async (
      walletId: string,
      amount: number,
      categoryId: string | null,
      transactionDate: string,
      note?: string
    ) => {
      if (!userId) return
      await transactionService.createIncome(
        userId,
        walletId,
        amount,
        categoryId,
        transactionDate,
        note
      )
      await refresh()
    },
    [userId, refresh]
  )

  const addExpense = useCallback(
    async (
      walletId: string,
      amount: number,
      categoryId: string | null,
      transactionDate: string,
      note?: string
    ) => {
      if (!userId) return
      await transactionService.createExpense(
        userId,
        walletId,
        amount,
        categoryId,
        transactionDate,
        note
      )
      await refresh()
    },
    [userId, refresh]
  )

  const addAdjustment = useCallback(
    async (walletId: string, amount: number, transactionDate: string, note?: string) => {
      if (!userId) return
      await transactionService.createAdjustment(userId, walletId, amount, transactionDate, note)
      await refresh()
    },
    [userId, refresh]
  )

  const addTransfer = useCallback(
    async (
      sourceWalletId: string,
      targetWalletId: string,
      amount: number,
      transactionDate: string,
      note?: string
    ) => {
      if (!userId) return
      await transferService.createTransfer(
        userId,
        sourceWalletId,
        targetWalletId,
        amount,
        transactionDate,
        note
      )
      await refresh()
    },
    [userId, refresh]
  )

  const removeTransaction = useCallback(
    async (id: string) => {
      await transactionService.removeTransaction(id)
      await refresh()
    },
    [refresh]
  )

  const removeTransfer = useCallback(
    async (groupId: string) => {
      await transferService.removeTransfer(groupId)
      await refresh()
    },
    [refresh]
  )

  const editTransaction = useCallback(
    async (
      id: string,
      type: 'income' | 'expense',
      walletId: string,
      amount: number,
      categoryId: string | null,
      transactionDate: string,
      note?: string
    ) => {
      if (!userId) return
      if (type === 'income') {
        await transactionService.updateIncome(
          id,
          walletId,
          amount,
          categoryId,
          transactionDate,
          note
        )
      } else {
        await transactionService.updateExpense(
          id,
          walletId,
          amount,
          categoryId,
          transactionDate,
          note
        )
      }
      await refresh()
    },
    [userId, refresh]
  )

  return {
    transactions,
    loading,
    error,
    refresh,
    getTransactionsByDateRange,
    addIncome,
    addExpense,
    addAdjustment,
    addTransfer,
    removeTransaction,
    removeTransfer,
    editTransaction,
  }
}
