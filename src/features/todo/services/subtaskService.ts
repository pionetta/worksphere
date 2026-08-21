import * as subtaskRepo from '@/features/todo/repositories/subtaskRepository'
import { createSubtaskSchema, updateSubtaskSchema } from '@/features/todo/schemas/subtaskSchema'
import { validate } from '@/lib/validation'
import type { Subtask } from '@/types'

export async function createSubtask(
  userId: string,
  taskId: string,
  title: string,
  position?: number
): Promise<string> {
  const parsed = validate(createSubtaskSchema, { title, position })

  const existing = await subtaskRepo.listSubtasksByTask(taskId)
  const nextPosition = position ?? existing.length

  return subtaskRepo.createSubtask({
    task_id: taskId,
    user_id: userId,
    title: parsed.title,
    is_completed: false,
    position: nextPosition,
  })
}

export async function updateSubtask(
  id: string,
  data: { title?: string; is_completed?: boolean; position?: number }
): Promise<void> {
  const parsed = validate(updateSubtaskSchema, data)
  const updatePayload: Partial<Pick<Subtask, 'title' | 'is_completed' | 'position'>> = {}
  if (parsed.title !== undefined) updatePayload.title = parsed.title
  if (parsed.is_completed !== undefined) updatePayload.is_completed = parsed.is_completed
  if (parsed.position !== undefined) updatePayload.position = parsed.position
  await subtaskRepo.updateSubtask(id, updatePayload)
}

export async function toggleSubtask(id: string): Promise<void> {
  const subtask = await subtaskRepo.getSubtaskById(id)
  if (!subtask) return
  if (subtask.is_completed) {
    await subtaskRepo.uncompleteSubtask(id)
  } else {
    await subtaskRepo.completeSubtask(id)
  }
}

export async function deleteSubtask(id: string): Promise<void> {
  await subtaskRepo.deleteSubtask(id)
}

export async function listSubtasksByTask(taskId: string): Promise<Subtask[]> {
  return subtaskRepo.listSubtasksByTask(taskId)
}

export function getSubtaskProgress(subtasks: Subtask[]): {
  total: number
  completed: number
  percentage: number
} {
  const total = subtasks.length
  const completed = subtasks.filter(s => s.is_completed).length
  const percentage = total === 0 ? 0 : Math.round((completed / total) * 100)
  return { total, completed, percentage }
}
