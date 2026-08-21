import * as taskRepo from '@/features/todo/repositories/taskRepository'
import * as subtaskRepo from '@/features/todo/repositories/subtaskRepository'
import { createTaskSchema, updateTaskSchema } from '@/features/todo/schemas/taskSchema'
import { validate } from '@/lib/validation'
import type { Task, TaskStatus, TaskPriority } from '@/types'

export async function createTask(
  userId: string,
  title: string,
  options?: {
    description?: string
    priority?: TaskPriority
    category?: string
    dueDate?: string | null
    reminderAt?: string | null
  }
): Promise<string> {
  const parsed = validate(createTaskSchema, {
    title,
    description: options?.description ?? undefined,
    priority: options?.priority ?? 'medium',
    category: options?.category ?? undefined,
    due_date: options?.dueDate ?? null,
    reminder_at: options?.reminderAt ?? null,
  })

  return taskRepo.createTask({
    user_id: userId,
    title: parsed.title,
    description: parsed.description || null,
    status: 'todo',
    priority: parsed.priority,
    category: parsed.category || null,
    due_date: parsed.due_date || null,
    reminder_at: parsed.reminder_at || null,
    completed_at: null,
    deleted_at: null,
  })
}

export async function updateTask(
  id: string,
  data: {
    title?: string
    description?: string | null
    status?: TaskStatus
    priority?: TaskPriority
    category?: string | null
    dueDate?: string | null
    reminderAt?: string | null
  }
): Promise<void> {
  const parsed = validate(updateTaskSchema, {
    title: data.title,
    description: data.description,
    status: data.status,
    priority: data.priority,
    category: data.category,
    due_date: data.dueDate,
    reminder_at: data.reminderAt,
  })

  const updatePayload: Partial<
    Pick<
      Task,
      | 'title'
      | 'description'
      | 'status'
      | 'priority'
      | 'category'
      | 'due_date'
      | 'reminder_at'
      | 'completed_at'
    >
  > = {}

  if (parsed.title !== undefined) updatePayload.title = parsed.title
  if (parsed.description !== undefined) updatePayload.description = parsed.description || null
  if (parsed.status !== undefined) updatePayload.status = parsed.status
  if (parsed.priority !== undefined) updatePayload.priority = parsed.priority
  if (parsed.category !== undefined) updatePayload.category = parsed.category || null
  if (parsed.due_date !== undefined) updatePayload.due_date = parsed.due_date || null
  if (parsed.reminder_at !== undefined) updatePayload.reminder_at = parsed.reminder_at || null

  if (parsed.status === 'completed') {
    updatePayload.completed_at = new Date().toISOString()
  } else if (parsed.status === 'todo' || parsed.status === 'in_progress') {
    updatePayload.completed_at = null
  }

  await taskRepo.updateTask(id, updatePayload)
}

export async function deleteTask(id: string): Promise<void> {
  await subtaskRepo.deleteSubtasksByTask(id)
  await taskRepo.softDeleteTask(id)
}

export async function getTaskById(id: string): Promise<Task | undefined> {
  return taskRepo.getTaskById(id)
}

export async function listTasks(userId: string): Promise<Task[]> {
  return taskRepo.listTasks(userId)
}

export async function listTasksByStatus(userId: string, status: TaskStatus): Promise<Task[]> {
  return taskRepo.listTasksByStatus(userId, status)
}

export async function listTasksByPriority(userId: string, priority: TaskPriority): Promise<Task[]> {
  return taskRepo.listTasksByPriority(userId, priority)
}

export async function listTasksByCategory(userId: string, category: string): Promise<Task[]> {
  return taskRepo.listTasksByCategory(userId, category)
}

export async function listOverdueTasks(userId: string): Promise<Task[]> {
  return taskRepo.listOverdueTasks(userId)
}

export async function changeStatus(id: string, status: TaskStatus): Promise<void> {
  if (status === 'completed') {
    await taskRepo.completeTask(id)
  } else if (status === 'todo') {
    const task = await taskRepo.getTaskById(id)
    if (task?.status === 'completed') {
      await taskRepo.reopenTask(id)
    } else {
      await taskRepo.updateTask(id, { status: 'todo' })
    }
  } else {
    await taskRepo.updateTask(id, { status })
  }
}

export function isOverdue(task: Task): boolean {
  if (!task.due_date) return false
  if (task.status === 'completed' || task.status === 'cancelled') return false
  return new Date(task.due_date) < new Date()
}

export function searchTasks(tasks: Task[], query: string): Task[] {
  if (!query.trim()) return tasks
  const lower = query.toLowerCase()
  return tasks.filter(
    t =>
      t.title.toLowerCase().includes(lower) ||
      (t.description && t.description.toLowerCase().includes(lower))
  )
}

export type { TaskStatus, TaskPriority }
