import { useState, useEffect, useCallback } from 'react'
import * as recurringService from '../services/recurringService'
import type { RecurringTransaction } from '@/types'
import type { CreateRecurringInput, UpdateRecurringInput } from '../schemas/recurringSchema'

export function useRecurringTransactions(userId: string | null) {
  const [recurringList, setRecurringList] = useState<RecurringTransaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    if (!userId) {
      setRecurringList([])
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    try {
      // 1. Process any due items in the background
      await recurringService.processDueRecurringTransactions(userId)

      // 2. Fetch fresh list
      const data = await recurringService.getAllRecurring(userId)
      setRecurringList(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memuat transaksi rutin')
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
        detail.table === 'recurring_transactions' ||
        detail.table === 'transactions' ||
        detail.type === 'full-pull'
      ) {
        refresh()
      }
    }
    window.addEventListener('worksphere-data-synced', handleSync)
    return () => window.removeEventListener('worksphere-data-synced', handleSync)
  }, [refresh])

  const addRecurring = useCallback(
    async (input: CreateRecurringInput) => {
      if (!userId) return
      await recurringService.createRecurringTransaction(userId, input)
      await refresh()
    },
    [userId, refresh]
  )

  const editRecurring = useCallback(
    async (id: string, input: UpdateRecurringInput) => {
      await recurringService.updateRecurringTransaction(id, input)
      await refresh()
    },
    [refresh]
  )

  const toggleActive = useCallback(
    async (id: string, isActive: boolean) => {
      await recurringService.toggleRecurringActive(id, isActive)
      await refresh()
    },
    [refresh]
  )

  const removeRecurring = useCallback(
    async (id: string) => {
      await recurringService.deleteRecurringTransaction(id)
      await refresh()
    },
    [refresh]
  )

  const executeNow = useCallback(
    async (id: string) => {
      await recurringService.executeRecurringTransaction(id)
      await refresh()
    },
    [refresh]
  )

  return {
    recurringList,
    loading,
    error,
    refresh,
    addRecurring,
    editRecurring,
    toggleActive,
    removeRecurring,
    executeNow,
  }
}
