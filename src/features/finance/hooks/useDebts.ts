import { useState, useEffect, useCallback } from 'react'
import * as debtService from '@/features/finance/services/debtService'
import type { CreateDebtInput, UpdateDebtInput } from '@/features/finance/schemas/debtSchema'
import type { Debt, DebtType, DebtStatus } from '@/types'

export function useDebts(userId: string | null) {
  const [debts, setDebts] = useState<Debt[]>([])
  const [summary, setSummary] = useState<debtService.DebtSummary>({
    totalDebt: 0,
    totalDebtRemaining: 0,
    totalReceivable: 0,
    totalReceivableRemaining: 0,
    unpaidDebtCount: 0,
    unpaidReceivableCount: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(
    async (filters?: { type?: DebtType; status?: DebtStatus }, silent = false) => {
      if (!userId) return
      if (!silent) {
        setLoading(true)
      }
      setError(null)
      try {
        const [data, sum] = await Promise.all([
          debtService.getDebts(userId, filters),
          debtService.getDebtSummary(userId),
        ])
        setDebts(data)
        setSummary(sum)
      } catch {
        setError('Gagal memuat data utang & piutang. Silakan coba lagi.')
      } finally {
        setLoading(false)
      }
    },
    [userId]
  )

  useEffect(() => {
    refresh(undefined, false)

    const handleSync = (e: Event) => {
      const detail = (e as CustomEvent).detail
      if (!detail || !detail.table || detail.table === 'debts' || detail.type === 'full-pull') {
        refresh(undefined, true)
      }
    }
    window.addEventListener('worksphere-data-synced', handleSync)
    return () => window.removeEventListener('worksphere-data-synced', handleSync)
  }, [refresh])

  const addDebt = useCallback(
    async (data: CreateDebtInput) => {
      if (!userId) return
      const id = await debtService.createDebt(userId, data)
      await refresh()
      return id
    },
    [userId, refresh]
  )

  const editDebt = useCallback(
    async (id: string, data: UpdateDebtInput) => {
      await debtService.updateDebt(id, data)
      await refresh()
    },
    [refresh]
  )

  const makePayment = useCallback(
    async (id: string, amount: number, incrementInstallment = true) => {
      await debtService.payDebt(id, amount, incrementInstallment)
      await refresh()
    },
    [refresh]
  )

  const removeDebt = useCallback(
    async (id: string) => {
      await debtService.removeDebt(id)
      await refresh()
    },
    [refresh]
  )

  return {
    debts,
    summary,
    loading,
    error,
    refresh,
    addDebt,
    editDebt,
    makePayment,
    removeDebt,
  }
}
