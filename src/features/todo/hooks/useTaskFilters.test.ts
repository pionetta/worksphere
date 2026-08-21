import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useTaskFilters } from '@/features/todo/hooks/useTaskFilters'
import type { Task } from '@/types'

function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    id: crypto.randomUUID(),
    user_id: 'user-1',
    title: 'Test Task',
    description: null,
    status: 'todo',
    priority: 'medium',
    category: null,
    due_date: null,
    reminder_at: null,
    completed_at: null,
    created_at: '2026-08-20T10:00:00.000Z',
    updated_at: '2026-08-20T10:00:00.000Z',
    deleted_at: null,
    ...overrides,
  }
}

describe('useTaskFilters', () => {
  it('should return all tasks initially', () => {
    const tasks = [makeTask({ title: 'Task 1' }), makeTask({ title: 'Task 2' })]
    const { result } = renderHook(() => useTaskFilters(tasks))
    expect(result.current.filteredTasks).toHaveLength(2)
  })

  it('should filter by search query', () => {
    const tasks = [makeTask({ title: 'Beli bahan' }), makeTask({ title: 'Rapat tim' })]
    const { result } = renderHook(() => useTaskFilters(tasks))
    act(() => {
      result.current.setSearch('bahan')
    })
    expect(result.current.filteredTasks).toHaveLength(1)
    expect(result.current.filteredTasks[0].title).toBe('Beli bahan')
  })

  it('should filter by status', () => {
    const tasks = [makeTask({ status: 'todo' }), makeTask({ status: 'completed' })]
    const { result } = renderHook(() => useTaskFilters(tasks))
    act(() => {
      result.current.setStatus('completed')
    })
    expect(result.current.filteredTasks).toHaveLength(1)
    expect(result.current.filteredTasks[0].status).toBe('completed')
  })

  it('should filter by priority', () => {
    const tasks = [makeTask({ priority: 'urgent' }), makeTask({ priority: 'low' })]
    const { result } = renderHook(() => useTaskFilters(tasks))
    act(() => {
      result.current.setPriority('urgent')
    })
    expect(result.current.filteredTasks).toHaveLength(1)
    expect(result.current.filteredTasks[0].priority).toBe('urgent')
  })

  it('should filter by category', () => {
    const tasks = [makeTask({ category: 'Kerja' }), makeTask({ category: 'Pribadi' })]
    const { result } = renderHook(() => useTaskFilters(tasks))
    act(() => {
      result.current.setCategory('Kerja')
    })
    expect(result.current.filteredTasks).toHaveLength(1)
    expect(result.current.filteredTasks[0].category).toBe('Kerja')
  })

  it('should filter overdue only', () => {
    const tasks = [
      makeTask({ due_date: '2020-01-01', status: 'todo' }),
      makeTask({ due_date: '2099-01-01', status: 'todo' }),
    ]
    const { result } = renderHook(() => useTaskFilters(tasks))
    act(() => {
      result.current.setOverdueOnly(true)
    })
    expect(result.current.filteredTasks).toHaveLength(1)
    expect(result.current.filteredTasks[0].due_date).toBe('2020-01-01')
  })

  it('should sort by priority', () => {
    const tasks = [
      makeTask({ priority: 'low' }),
      makeTask({ priority: 'urgent' }),
      makeTask({ priority: 'medium' }),
    ]
    const { result } = renderHook(() => useTaskFilters(tasks))
    act(() => {
      result.current.setSort('priority')
    })
    expect(result.current.filteredTasks[0].priority).toBe('urgent')
    expect(result.current.filteredTasks[1].priority).toBe('medium')
    expect(result.current.filteredTasks[2].priority).toBe('low')
  })

  it('should reset filters', () => {
    const tasks = [makeTask({ title: 'Task 1' })]
    const { result } = renderHook(() => useTaskFilters(tasks))
    act(() => {
      result.current.setSearch('bahan')
      result.current.setStatus('completed')
    })
    act(() => {
      result.current.resetFilters()
    })
    expect(result.current.filteredTasks).toHaveLength(1)
    expect(result.current.filters.search).toBe('')
    expect(result.current.filters.status).toBe('all')
  })

  it('should count active filters', () => {
    const tasks = [makeTask()]
    const { result } = renderHook(() => useTaskFilters(tasks))
    expect(result.current.activeFilterCount).toBe(0)
    act(() => {
      result.current.setSearch('test')
      result.current.setPriority('urgent')
    })
    expect(result.current.activeFilterCount).toBe(2)
  })

  it('should extract categories from tasks', () => {
    const tasks = [
      makeTask({ category: 'Kerja' }),
      makeTask({ category: 'Pribadi' }),
      makeTask({ category: 'Kerja' }),
    ]
    const { result } = renderHook(() => useTaskFilters(tasks))
    expect(result.current.categories).toEqual(['Kerja', 'Pribadi'])
  })
})
