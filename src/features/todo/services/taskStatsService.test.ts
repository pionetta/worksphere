import { describe, it, expect, beforeEach } from 'vitest'
import { db } from '@/lib/db'
import * as taskStatsService from '@/features/todo/services/taskStatsService'
import type { Task } from '@/types'

const userId = 'test-user-task-stats'

beforeEach(async () => {
  await db.tasks.clear()
  await db.sync_queue.clear()
})

function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    id: crypto.randomUUID(),
    user_id: userId,
    title: 'Test Task',
    description: null,
    status: 'todo',
    priority: 'medium',
    category: null,
    due_date: null,
    reminder_at: null,
    completed_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    deleted_at: null,
    ...overrides,
  }
}

describe('taskStatsService', () => {
  describe('calculateStats', () => {
    it('should count tasks by status', () => {
      const tasks = [
        makeTask({ status: 'todo' }),
        makeTask({ status: 'todo' }),
        makeTask({ status: 'in_progress' }),
        makeTask({ status: 'completed' }),
        makeTask({ status: 'cancelled' }),
      ]
      const stats = taskStatsService.calculateStats(tasks)
      expect(stats.total).toBe(5)
      expect(stats.todo).toBe(2)
      expect(stats.inProgress).toBe(1)
      expect(stats.completed).toBe(1)
      expect(stats.cancelled).toBe(1)
    })

    it('should count overdue tasks', () => {
      const tasks = [
        makeTask({ due_date: '2020-01-01', status: 'todo' }),
        makeTask({ due_date: '2020-01-01', status: 'in_progress' }),
      ]
      const stats = taskStatsService.calculateStats(tasks)
      expect(stats.overdue).toBe(2)
    })

    it('should not count completed as overdue', () => {
      const tasks = [makeTask({ due_date: '2020-01-01', status: 'completed' })]
      const stats = taskStatsService.calculateStats(tasks)
      expect(stats.overdue).toBe(0)
    })

    it('should not count cancelled as overdue', () => {
      const tasks = [makeTask({ due_date: '2020-01-01', status: 'cancelled' })]
      const stats = taskStatsService.calculateStats(tasks)
      expect(stats.overdue).toBe(0)
    })

    it('should handle empty task list', () => {
      const stats = taskStatsService.calculateStats([])
      expect(stats.total).toBe(0)
      expect(stats.todo).toBe(0)
      expect(stats.overdue).toBe(0)
    })
  })

  describe('getUpcomingDeadlines', () => {
    it('should return tasks with deadlines within range', () => {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      const dateStr = tomorrow.toISOString().split('T')[0]
      const tasks = [
        makeTask({ due_date: dateStr, status: 'todo' }),
        makeTask({ due_date: '2099-01-01', status: 'todo' }),
      ]
      const upcoming = taskStatsService.getUpcomingDeadlines(tasks, 7)
      expect(upcoming).toHaveLength(1)
    })

    it('should exclude completed tasks', () => {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      const dateStr = tomorrow.toISOString().split('T')[0]
      const tasks = [makeTask({ due_date: dateStr, status: 'completed' })]
      const upcoming = taskStatsService.getUpcomingDeadlines(tasks, 7)
      expect(upcoming).toHaveLength(0)
    })
  })
})
