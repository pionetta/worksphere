import { describe, it, expect, beforeEach } from 'vitest'
import { db } from '@/lib/db'
import * as taskService from '@/features/todo/services/taskService'
import * as subtaskService from '@/features/todo/services/subtaskService'

const userId = 'test-user-integrity'

beforeEach(async () => {
  await db.tasks.clear()
  await db.subtasks.clear()
  await db.sync_queue.clear()
})

describe('Todo Integrity Tests', () => {
  it('Test 1: Completed task is not overdue', async () => {
    const id = await taskService.createTask(userId, 'Selesai', { dueDate: '2020-01-01' })
    await taskService.changeStatus(id, 'completed')
    const task = await db.tasks.get(id)!
    expect(taskService.isOverdue(task!)).toBe(false)
  })

  it('Test 2: Cancelled task is not overdue', async () => {
    const id = await taskService.createTask(userId, 'Dibatalkan', { dueDate: '2020-01-01' })
    await taskService.changeStatus(id, 'cancelled')
    const task = await db.tasks.get(id)!
    expect(taskService.isOverdue(task!)).toBe(false)
  })

  it('Test 3: Task without due_date is not overdue', async () => {
    const id = await taskService.createTask(userId, 'Tanpa Deadline')
    const task = await db.tasks.get(id)!
    expect(taskService.isOverdue(task!)).toBe(false)
  })

  it('Test 4: Deleting task does not leave visible orphan subtask', async () => {
    const taskId = await taskService.createTask(userId, 'Parent')
    await subtaskService.createSubtask(userId, taskId, 'Sub 1')
    await subtaskService.createSubtask(userId, taskId, 'Sub 2')

    await taskService.deleteTask(taskId)

    const task = await db.tasks.get(taskId)
    expect(task!.deleted_at).toBeTruthy()

    const subtasks = await db.subtasks.where('task_id').equals(taskId).toArray()
    expect(subtasks).toHaveLength(0)
  })

  it('Test 5: Subtask ordering is deterministic', async () => {
    const taskId = await taskService.createTask(userId, 'Parent')
    const ids: string[] = []
    for (let i = 0; i < 10; i++) {
      const id = await subtaskService.createSubtask(userId, taskId, `Sub ${i}`)
      ids.push(id)
    }

    for (let run = 0; run < 5; run++) {
      const subtasks = await subtaskService.listSubtasksByTask(taskId)
      const sorted = subtasks.sort((a, b) => a.position - b.position)
      for (let i = 0; i < ids.length; i++) {
        expect(sorted[i].id).toBe(ids[i])
      }
    }
  })

  it('Test 6: Repeated mutation does not create duplicate entities', async () => {
    const taskId = await taskService.createTask(userId, 'Duplicate Test')
    const subtaskId = await subtaskService.createSubtask(userId, taskId, 'Sub 1')

    await subtaskService.toggleSubtask(subtaskId)
    await subtaskService.toggleSubtask(subtaskId)
    await subtaskService.toggleSubtask(subtaskId)

    const subtasks = await subtaskService.listSubtasksByTask(taskId)
    expect(subtasks).toHaveLength(1)
    expect(subtasks[0].is_completed).toBe(true)

    const queueItems = await db.sync_queue.where('entity_id').equals(subtaskId).toArray()
    expect(queueItems.length).toBeGreaterThan(0)
  })
})
