import { describe, it, expect, beforeEach } from 'vitest'
import { db } from '@/lib/db'
import * as subtaskService from '@/features/todo/services/subtaskService'
import * as taskService from '@/features/todo/services/taskService'

const userId = 'test-user-subtask-service'

beforeEach(async () => {
  await db.tasks.clear()
  await db.subtasks.clear()
  await db.sync_queue.clear()
})

describe('subtaskService', () => {
  async function createParentTask(): Promise<string> {
    return taskService.createTask(userId, 'Parent Task')
  }

  describe('createSubtask', () => {
    it('should create a subtask', async () => {
      const taskId = await createParentTask()
      const id = await subtaskService.createSubtask(userId, taskId, 'Subtask 1')
      expect(id).toBeTruthy()
      const subtask = await db.subtasks.get(id)
      expect(subtask).toBeDefined()
      expect(subtask!.title).toBe('Subtask 1')
      expect(subtask!.is_completed).toBe(false)
      expect(subtask!.task_id).toBe(taskId)
    })

    it('should assign incrementing position', async () => {
      const taskId = await createParentTask()
      const id1 = await subtaskService.createSubtask(userId, taskId, 'Sub 1')
      const id2 = await subtaskService.createSubtask(userId, taskId, 'Sub 2')
      const s1 = await db.subtasks.get(id1)
      const s2 = await db.subtasks.get(id2)
      expect(s1!.position).toBe(0)
      expect(s2!.position).toBe(1)
    })

    it('should reject empty title', async () => {
      const taskId = await createParentTask()
      await expect(subtaskService.createSubtask(userId, taskId, '')).rejects.toThrow()
    })

    it('should queue sync operation', async () => {
      const taskId = await createParentTask()
      await subtaskService.createSubtask(userId, taskId, 'Sync Sub')
      const queue = await db.sync_queue.where('entity').equals('subtask').toArray()
      expect(queue).toHaveLength(1)
      expect(queue[0].operation).toBe('create')
    })
  })

  describe('toggleSubtask', () => {
    it('should complete a subtask', async () => {
      const taskId = await createParentTask()
      const id = await subtaskService.createSubtask(userId, taskId, 'Toggle')
      await subtaskService.toggleSubtask(id)
      const subtask = await db.subtasks.get(id)
      expect(subtask!.is_completed).toBe(true)
    })

    it('should uncomplete a subtask', async () => {
      const taskId = await createParentTask()
      const id = await subtaskService.createSubtask(userId, taskId, 'Toggle')
      await subtaskService.toggleSubtask(id)
      await subtaskService.toggleSubtask(id)
      const subtask = await db.subtasks.get(id)
      expect(subtask!.is_completed).toBe(false)
    })
  })

  describe('deleteSubtask', () => {
    it('should delete a subtask', async () => {
      const taskId = await createParentTask()
      const id = await subtaskService.createSubtask(userId, taskId, 'Delete Me')
      await subtaskService.deleteSubtask(id)
      const subtask = await db.subtasks.get(id)
      expect(subtask).toBeUndefined()
    })
  })

  describe('getSubtaskProgress', () => {
    it('should calculate progress correctly', () => {
      const subtasks = [
        { is_completed: true } as import('@/types').Subtask,
        { is_completed: true } as import('@/types').Subtask,
        { is_completed: false } as import('@/types').Subtask,
        { is_completed: false } as import('@/types').Subtask,
        { is_completed: false } as import('@/types').Subtask,
      ]
      const progress = subtaskService.getSubtaskProgress(subtasks)
      expect(progress.total).toBe(5)
      expect(progress.completed).toBe(2)
      expect(progress.percentage).toBe(40)
    })

    it('should handle empty subtasks', () => {
      const progress = subtaskService.getSubtaskProgress([])
      expect(progress.total).toBe(0)
      expect(progress.completed).toBe(0)
      expect(progress.percentage).toBe(0)
    })
  })

  describe('ordering', () => {
    it('should maintain deterministic ordering', async () => {
      const taskId = await createParentTask()
      const id1 = await subtaskService.createSubtask(userId, taskId, 'First')
      const id2 = await subtaskService.createSubtask(userId, taskId, 'Second')
      const id3 = await subtaskService.createSubtask(userId, taskId, 'Third')
      const list = await subtaskService.listSubtasksByTask(taskId)
      const sorted = list.sort((a, b) => a.position - b.position)
      expect(sorted[0].id).toBe(id1)
      expect(sorted[1].id).toBe(id2)
      expect(sorted[2].id).toBe(id3)
    })
  })

  describe('user isolation', () => {
    it('should not return subtasks from other users', async () => {
      const taskId = await createParentTask()
      await subtaskService.createSubtask(userId, taskId, 'My Subtask')
      const otherTaskId = await taskService.createTask('other-user', 'Other Task')
      await subtaskService.createSubtask('other-user', otherTaskId, 'Other Subtask')
      const subtasks = await subtaskService.listSubtasksByTask(taskId)
      expect(subtasks).toHaveLength(1)
      expect(subtasks[0].title).toBe('My Subtask')
    })
  })
})
