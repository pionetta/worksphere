import { useState, useEffect, useCallback, useMemo } from 'react'
import * as habitService from '../services/habitService'
import * as habitRepo from '../repositories/habitRepository'
import type { Habit, HabitLog } from '@/types'
import type { CreateHabitInput, UpdateHabitInput } from '../schemas/habitSchema'

export interface HabitItemWithStats {
  habit: Habit
  logs: HabitLog[]
  currentStreak: number
  bestStreak: number
  isCompletedToday: boolean
  weeklyStatus: ReturnType<typeof habitService.getHabitWeeklyStatus>
}

export function useHabits(userId: string | null) {
  const [habits, setHabits] = useState<Habit[]>([])
  const [logs, setLogs] = useState<HabitLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    if (!userId) {
      setHabits([])
      setLogs([])
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)
    try {
      const [fetchedHabits, fetchedLogs] = await Promise.all([
        habitRepo.listHabits(userId),
        habitRepo.listHabitLogs(userId),
      ])
      setHabits(fetchedHabits)
      setLogs(fetchedLogs)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memuat kebiasaan')
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
        detail.table === 'habits' ||
        detail.table === 'habit_logs' ||
        detail.type === 'full-pull'
      ) {
        refresh()
      }
    }

    window.addEventListener('worksphere-data-synced', handleSync)
    return () => window.removeEventListener('worksphere-data-synced', handleSync)
  }, [refresh])

  const addHabit = useCallback(
    async (input: CreateHabitInput) => {
      if (!userId) return
      await habitService.createHabit(userId, input)
      await refresh()
    },
    [userId, refresh]
  )

  const editHabit = useCallback(
    async (id: string, input: UpdateHabitInput) => {
      await habitService.updateHabit(id, input)
      await refresh()
    },
    [refresh]
  )

  const removeHabit = useCallback(
    async (id: string) => {
      await habitService.deleteHabit(id)
      await refresh()
    },
    [refresh]
  )

  const toggleToday = useCallback(
    async (habitId: string, dateStr?: string) => {
      if (!userId) return
      await habitService.toggleHabitCompletion(userId, habitId, dateStr)
      await refresh()
    },
    [userId, refresh]
  )

  const habitsWithStats = useMemo<HabitItemWithStats[]>(() => {
    const today = new Date().toISOString().split('T')[0]
    return habits.map(habit => {
      const habitLogs = logs.filter(l => l.habit_id === habit.id)
      const { currentStreak, bestStreak } = habitService.calculateHabitStreak(
        habitLogs.map(l => l.completed_date),
        today
      )
      const isCompletedToday = habitLogs.some(l => l.completed_date === today)
      const weeklyStatus = habitService.getHabitWeeklyStatus(habitLogs)

      return {
        habit,
        logs: habitLogs,
        currentStreak,
        bestStreak,
        isCompletedToday,
        weeklyStatus,
      }
    })
  }, [habits, logs])

  const totalCompletedToday = useMemo(() => {
    return habitsWithStats.filter(h => h.isCompletedToday).length
  }, [habitsWithStats])

  return {
    habits,
    logs,
    habitsWithStats,
    totalCompletedToday,
    totalHabits: habits.length,
    loading,
    error,
    refresh,
    addHabit,
    editHabit,
    removeHabit,
    toggleToday,
  }
}
