import { useState, useEffect, useCallback } from 'react'
import * as savingsService from '@/features/finance/services/savingsService'
import type { SavingsGoal } from '@/types'

export function useSavingsGoals(userId: string | null) {
  const [goals, setGoals] = useState<SavingsGoal[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    if (!userId) return
    setLoading(true)
    setError(null)
    try {
      const data = await savingsService.getSavingsGoals(userId)
      setGoals(data)
    } catch {
      setError('Gagal memuat data tabungan. Silakan coba lagi.')
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    refresh()

    const handleSync = (e: Event) => {
      const detail = (e as CustomEvent).detail
      if (!detail || !detail.table || detail.table === 'savings_goals' || detail.type === 'full-pull') {
        refresh()
      }
    }
    window.addEventListener('worksphere-data-synced', handleSync)
    return () => window.removeEventListener('worksphere-data-synced', handleSync)
  }, [refresh])

  const addGoal = useCallback(
    async (name: string, targetAmount: number, deadline?: string | null, note?: string) => {
      if (!userId) return
      await savingsService.createSavingsGoal(userId, name, targetAmount, deadline, note)
      await refresh()
    },
    [userId, refresh]
  )

  const editGoal = useCallback(
    async (
      id: string,
      data: Partial<
        Pick<SavingsGoal, 'name' | 'target_amount' | 'current_amount' | 'deadline' | 'note'>
      >
    ) => {
      await savingsService.updateSavingsGoal(id, data)
      await refresh()
    },
    [refresh]
  )

  const addToSavings = useCallback(
    async (id: string, amount: number) => {
      await savingsService.addToSavings(id, amount)
      await refresh()
    },
    [refresh]
  )

  const withdrawSavings = useCallback(
    async (id: string, amount: number) => {
      await savingsService.withdrawFromSavings(id, amount)
      await refresh()
    },
    [refresh]
  )

  const removeGoal = useCallback(
    async (id: string) => {
      await savingsService.removeSavingsGoal(id)
      await refresh()
    },
    [refresh]
  )

  return {
    goals,
    loading,
    error,
    refresh,
    addGoal,
    editGoal,
    addToSavings,
    withdrawSavings,
    removeGoal,
  }
}
