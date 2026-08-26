import { useState, useMemo, useCallback } from 'react'
import * as taskService from '@/features/todo/services/taskService'
import type { Task, TaskStatus, TaskPriority, TaskTimeframe } from '@/types'

export type SortOption = 'deadline' | 'priority' | 'created' | 'updated'

export interface TaskFilters {
  search: string
  status: TaskStatus | 'all'
  priority: TaskPriority | 'all'
  timeframe: TaskTimeframe | 'all'
  category: string | 'all'
  overdueOnly: boolean
  sort: SortOption
}

const defaultFilters: TaskFilters = {
  search: '',
  status: 'all',
  priority: 'all',
  timeframe: 'all',
  category: 'all',
  overdueOnly: false,
  sort: 'deadline',
}

const priorityOrder: Record<TaskPriority, number> = {
  urgent: 0,
  high: 1,
  medium: 2,
  low: 3,
}

export function useTaskFilters(tasks: Task[]) {
  const [filters, setFilters] = useState<TaskFilters>(defaultFilters)

  const setSearch = useCallback((search: string) => {
    setFilters(prev => ({ ...prev, search }))
  }, [])

  const setStatus = useCallback((status: TaskStatus | 'all') => {
    setFilters(prev => ({ ...prev, status }))
  }, [])

  const setPriority = useCallback((priority: TaskPriority | 'all') => {
    setFilters(prev => ({ ...prev, priority }))
  }, [])

  const setTimeframe = useCallback((timeframe: TaskTimeframe | 'all') => {
    setFilters(prev => ({ ...prev, timeframe }))
  }, [])

  const setCategory = useCallback((category: string | 'all') => {
    setFilters(prev => ({ ...prev, category }))
  }, [])

  const setOverdueOnly = useCallback((overdueOnly: boolean) => {
    setFilters(prev => ({ ...prev, overdueOnly }))
  }, [])

  const setSort = useCallback((sort: SortOption) => {
    setFilters(prev => ({ ...prev, sort }))
  }, [])

  const resetFilters = useCallback(() => {
    setFilters(defaultFilters)
  }, [])

  const categories = useMemo(() => {
    const cats = new Set<string>()
    tasks.forEach(t => {
      if (t.category) cats.add(t.category)
    })
    return Array.from(cats).sort()
  }, [tasks])

  const filteredTasks = useMemo(() => {
    let result = [...tasks]

    // Search
    if (filters.search) {
      result = taskService.searchTasks(result, filters.search)
    }

    // Status filter
    if (filters.status !== 'all') {
      result = result.filter(t => t.status === filters.status)
    }

    // Priority filter
    if (filters.priority !== 'all') {
      result = result.filter(t => t.priority === filters.priority)
    }

    // Timeframe filter (Daily, Weekly, Yearly)
    if (filters.timeframe !== 'all') {
      result = result.filter(t => (t.timeframe ?? 'daily') === filters.timeframe)
    }

    // Category filter
    if (filters.category !== 'all') {
      result = result.filter(t => t.category === filters.category)
    }

    // Overdue filter
    if (filters.overdueOnly) {
      result = result.filter(t => taskService.isOverdue(t))
    }

    // Sort
    result.sort((a, b) => {
      switch (filters.sort) {
        case 'deadline': {
          if (!a.due_date && !b.due_date) return 0
          if (!a.due_date) return 1
          if (!b.due_date) return -1
          return new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
        }
        case 'priority':
          return priorityOrder[a.priority] - priorityOrder[b.priority]
        case 'created':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        case 'updated':
          return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
        default:
          return 0
      }
    })

    // Default: overdue first, then by priority
    if (filters.sort === 'deadline') {
      const overdue = result.filter(t => taskService.isOverdue(t))
      const notOverdue = result.filter(t => !taskService.isOverdue(t))
      return [...overdue, ...notOverdue]
    }

    return result
  }, [tasks, filters])

  const activeFilterCount = useMemo(() => {
    let count = 0
    if (filters.search) count++
    if (filters.status !== 'all') count++
    if (filters.priority !== 'all') count++
    if (filters.timeframe !== 'all') count++
    if (filters.category !== 'all') count++
    if (filters.overdueOnly) count++
    return count
  }, [filters])

  return {
    filters,
    filteredTasks,
    categories,
    activeFilterCount,
    setSearch,
    setStatus,
    setPriority,
    setTimeframe,
    setCategory,
    setOverdueOnly,
    setSort,
    resetFilters,
  }
}
