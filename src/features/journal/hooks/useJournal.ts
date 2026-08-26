import { useState, useEffect, useCallback } from 'react'
import * as journalService from '../services/journalService'
import type { JournalEntry, JournalPeriod, JournalType } from '@/types'

export function useJournal(userId: string | null) {
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [summary, setSummary] = useState<journalService.JournalSummary>({
    totalNotes: 0,
    totalAchievements: 0,
    dailyWins: 0,
    weeklyWins: 0,
    monthlyWins: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    if (!userId) {
      setEntries([])
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const [list, sum] = await Promise.all([
        journalService.getAllJournalEntries(userId),
        journalService.getJournalSummary(userId),
      ])
      setEntries(list)
      setSummary(sum)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memuat catatan & pencapaian')
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    refresh()
  }, [refresh])

  const addEntry = useCallback(
    async (data: {
      title: string
      content: string
      type?: JournalType
      period?: JournalPeriod
      category?: string
      icon_tag?: string
      entry_date?: string
    }) => {
      if (!userId) return
      const res = await journalService.addJournalEntry(userId, data)
      await refresh()
      return res
    },
    [userId, refresh]
  )

  const updateEntry = useCallback(
    async (
      id: string,
      data: Partial<
        Pick<
          JournalEntry,
          'title' | 'content' | 'type' | 'period' | 'category' | 'icon_tag' | 'entry_date'
        >
      >
    ) => {
      await journalService.updateJournalEntry(id, data)
      await refresh()
    },
    [refresh]
  )

  const deleteEntry = useCallback(
    async (id: string) => {
      await journalService.deleteJournalEntry(id)
      await refresh()
    },
    [refresh]
  )

  return {
    entries,
    summary,
    loading,
    error,
    refresh,
    addEntry,
    updateEntry,
    deleteEntry,
  }
}
