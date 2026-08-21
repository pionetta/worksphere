import { describe, it, expect, beforeEach } from 'vitest'
import { db } from '@/lib/db'
import * as taskService from '@/features/todo/services/taskService'

const userId = 'test-user-task-service'

beforeEach(async () => {
  await db.tasks.clear()
  await db.subtasks.clear()
  await db.sync_queue.clear()
})

describe('taskService', () => {
  describe('createTask', () => {
    it('should create a task with default status and priority', async () => {
      const id = await taskService.createTask(userId, 'Tugas Pertama')
      expect(id).toBeTruthy()
      const task = await db.tasks.get(id)
      expect(task).toBeDefined()
      expect(task!.title).toBe('Tugas Pertama')
      expect(task!.status).toBe('todo')
      expect(task!.priority).toBe('medium')
      expect(task!.user_id).toBe(userId)
    })

    it('should create task with custom options', async () => {
      const id = await taskService.createTask(userId, 'Tugas Khusus', {
        description: 'Deskripsi tugas',
        priority: 'urgent',
        category: 'Kerja',
        dueDate: '2026-08-25',
        reminderAt: '2026-08-25T09:00:00.000Z',
      })
      const task = await db.tasks.get(id)
      expect(task!.title).toBe('Tugas Khusus')
      expect(task!.description).toBe('Deskripsi tugas')
      expect(task!.priority).toBe('urgent')
      expect(task!.category).toBe('Kerja')
      expect(task!.due_date).toBe('2026-08-25')
      expect(task!.reminder_at).toBe('2026-08-25T09:00:00.000Z')
    })

    it('should reject empty title', async () => {
      await expect(taskService.createTask(userId, '')).rejects.toThrow()
    })

    it('should reject whitespace-only title', async () => {
      await expect(taskService.createTask(userId, '   ')).rejects.toThrow()
    })

    it('should trim title', async () => {
      const id = await taskService.createTask(userId, '  Tugas  ')
      const task = await db.tasks.get(id)
      expect(task!.title).toBe('Tugas')
    })

    it('should queue sync operation', async () => {
      const id = await taskService.createTask(userId, 'Sync Test')
      const queue = await db.sync_queue.where('entity').equals('task').toArray()
      expect(queue).toHaveLength(1)
      expect(queue[0].operation).toBe('create')
      expect(queue[0].entity_id).toBe(id)
    })
  })

  describe('updateTask', () => {
    it('should update task title', async () => {
      const id = await taskService.createTask(userId, 'Original')
      await taskService.updateTask(id, { title: 'Updated' })
      const task = await db.tasks.get(id)
      expect(task!.title).toBe('Updated')
    })

    it('should update task priority', async () => {
      const id = await taskService.createTask(userId, 'Tugas')
      await taskService.updateTask(id, { priority: 'urgent' })
      const task = await db.tasks.get(id)
      expect(task!.priority).toBe('urgent')
    })

    it('should reject empty title on update', async () => {
      const id = await taskService.createTask(userId, 'Tugas')
      await expect(taskService.updateTask(id, { title: '' })).rejects.toThrow()
    })
  })

  describe('changeStatus', () => {
    it('should change status to in_progress', async () => {
      const id = await taskService.createTask(userId, 'Tugas')
      await taskService.changeStatus(id, 'in_progress')
      const task = await db.tasks.get(id)
      expect(task!.status).toBe('in_progress')
    })

    it('should change status to completed with completed_at', async () => {
      const id = await taskService.createTask(userId, 'Tugas')
      await taskService.changeStatus(id, 'completed')
      const task = await db.tasks.get(id)
      expect(task!.status).toBe('completed')
      expect(task!.completed_at).toBeTruthy()
    })

    it('should reopen completed task to todo', async () => {
      const id = await taskService.createTask(userId, 'Tugas')
      await taskService.changeStatus(id, 'completed')
      await taskService.changeStatus(id, 'todo')
      const task = await db.tasks.get(id)
      expect(task!.status).toBe('todo')
      expect(task!.completed_at).toBeNull()
    })

    it('should change status to cancelled', async () => {
      const id = await taskService.createTask(userId, 'Tugas')
      await taskService.changeStatus(id, 'cancelled')
      const task = await db.tasks.get(id)
      expect(task!.status).toBe('cancelled')
    })
  })

  describe('deleteTask', () => {
    it('should soft delete task', async () => {
      const id = await taskService.createTask(userId, 'Hapus')
      await taskService.deleteTask(id)
      const tasks = await taskService.listTasks(userId)
      expect(tasks).toHaveLength(0)
    })

    it('should not appear in list after soft delete', async () => {
      const id = await taskService.createTask(userId, 'Hapus')
      await taskService.deleteTask(id)
      const allTasks = await db.tasks.where('user_id').equals(userId).toArray()
      expect(allTasks).toHaveLength(1)
      expect(allTasks[0].deleted_at).toBeTruthy()
    })
  })

  describe('overdue detection', () => {
    it('should detect overdue task', async () => {
      const id = await taskService.createTask(userId, 'Terlambat', {
        dueDate: '2020-01-01',
      })
      const task = await db.tasks.get(id)!
      expect(taskService.isOverdue(task!)).toBe(true)
    })

    it('should not mark completed task as overdue', async () => {
      const id = await taskService.createTask(userId, 'Selesai', {
        dueDate: '2020-01-01',
      })
      await taskService.changeStatus(id, 'completed')
      const task = await db.tasks.get(id)!
      expect(taskService.isOverdue(task!)).toBe(false)
    })

    it('should not mark cancelled task as overdue', async () => {
      const id = await taskService.createTask(userId, 'Dibatalkan', {
        dueDate: '2020-01-01',
      })
      await taskService.changeStatus(id, 'cancelled')
      const task = await db.tasks.get(id)!
      expect(taskService.isOverdue(task!)).toBe(false)
    })

    it('should not mark task without due_date as overdue', async () => {
      const id = await taskService.createTask(userId, 'Tanpa Deadline')
      const task = await db.tasks.get(id)!
      expect(taskService.isOverdue(task!)).toBe(false)
    })

    it('should not mark future task as overdue', async () => {
      const futureDate = new Date()
      futureDate.setFullYear(futureDate.getFullYear() + 1)
      const dateStr = futureDate.toISOString().split('T')[0]
      const id = await taskService.createTask(userId, 'Masa Depan', {
        dueDate: dateStr,
      })
      const task = await db.tasks.get(id)!
      expect(taskService.isOverdue(task!)).toBe(false)
    })
  })

  describe('search', () => {
    it('should search by title', async () => {
      await taskService.createTask(userId, 'Beli bahan masak')
      await taskService.createTask(userId, 'Rapat tim')
      const tasks = await taskService.listTasks(userId)
      const results = taskService.searchTasks(tasks, 'bahan')
      expect(results).toHaveLength(1)
      expect(results[0].title).toBe('Beli bahan masak')
    })

    it('should search by description', async () => {
      await taskService.createTask(userId, 'Tugas 1', {
        description: 'Belanja bulanan',
      })
      await taskService.createTask(userId, 'Tugas 2')
      const tasks = await taskService.listTasks(userId)
      const results = taskService.searchTasks(tasks, 'Belanja')
      expect(results).toHaveLength(1)
    })

    it('should return all tasks for empty search', async () => {
      await taskService.createTask(userId, 'Tugas 1')
      await taskService.createTask(userId, 'Tugas 2')
      const tasks = await taskService.listTasks(userId)
      const results = taskService.searchTasks(tasks, '')
      expect(results).toHaveLength(2)
    })
  })

  describe('user isolation', () => {
    it('should not return tasks from other users', async () => {
      await taskService.createTask(userId, 'My Task')
      await taskService.createTask('other-user', 'Other Task')
      const tasks = await taskService.listTasks(userId)
      expect(tasks).toHaveLength(1)
      expect(tasks[0].title).toBe('My Task')
    })
  })
})
