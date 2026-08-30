import { useState, useEffect, useCallback } from 'react'
import * as budgetService from '@/features/finance/services/budgetService'
import type { Budget } from '@/types'

export function useBudgets(userId: string | null, month: number, year: number) {
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(
    async (silent = false) => {
      if (!userId) return
      if (!silent) {
        setLoading(true)
      }
      setError(null)
      try {
        const data = await budgetService.getBudgetsByMonth(userId, month, year)
        setBudgets(data)
      } catch {
        setError('Gagal memuat data budget. Silakan coba lagi.')
      } finally {
        setLoading(false)
      }
    },
    [userId, month, year]
  )

  useEffect(() => {
    refresh(false)

    const handleSync = (e: Event) => {
      const detail = (e as CustomEvent).detail
      if (!detail || !detail.table || detail.table === 'budgets' || detail.type === 'full-pull') {
        refresh(true)
      }
    }
    window.addEventListener('worksphere-data-synced', handleSync)
    return () => window.removeEventListener('worksphere-data-synced', handleSync)
  }, [refresh])

  const addBudget = useCallback(
    async (categoryId: string, amount: number, note?: string) => {
      if (!userId) return
      await budgetService.createBudget(userId, categoryId, amount, month, year, note)
      await refresh()
    },
    [userId, month, year, refresh]
  )

  const editBudget = useCallback(
    async (id: string, data: Partial<Pick<Budget, 'amount' | 'note'>>) => {
      await budgetService.updateBudget(id, data)
      await refresh()
    },
    [refresh]
  )

  const removeBudget = useCallback(
    async (id: string) => {
      await budgetService.removeBudget(id)
      await refresh()
    },
    [refresh]
  )

  return {
    budgets,
    loading,
    error,
    refresh,
    addBudget,
    editBudget,
    removeBudget,
  }
}
