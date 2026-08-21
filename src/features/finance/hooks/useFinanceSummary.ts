import { useState, useEffect, useCallback } from 'react'
import * as financeSummaryService from '@/features/finance/services/financeSummaryService'
import type { FinanceSummary } from '@/features/finance/services/financeSummaryService'

export function useFinanceSummary(userId: string | null, month?: number, year?: number) {
  const [summary, setSummary] = useState<FinanceSummary>({
    totalBalance: 0,
    totalIncome: 0,
    totalExpense: 0,
    netIncome: 0,
    transactionCount: 0,
  })
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    if (!userId) return
    setLoading(true)
    try {
      const data =
        month !== undefined && year !== undefined
          ? await financeSummaryService.getFinanceSummaryByMonth(userId, month, year)
          : await financeSummaryService.getFinanceSummary(userId)
      setSummary(data)
    } finally {
      setLoading(false)
    }
  }, [userId, month, year])

  useEffect(() => {
    refresh()
  }, [refresh])

  return {
    summary,
    loading,
    refresh,
  }
}
