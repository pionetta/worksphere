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
    timeframe?: Task['timeframe']
    category?: string
    dueDate?: string | null
    reminderAt?: string | null
    workspaceId?: string | null
    assigneeId?: string | null
  }
): Promise<string> {
  const parsed = validate(createTaskSchema, {
    title,
    description: options?.description ?? undefined,
    priority: options?.priority ?? 'medium',
    timeframe: options?.timeframe ?? 'daily',
    category: options?.category ?? undefined,
    due_date: options?.dueDate ?? null,
    reminder_at: options?.reminderAt ?? null,
    workspace_id: options?.workspaceId ?? null,
    assignee_id: options?.assigneeId ?? null,
  })

  return taskRepo.createTask({
    user_id: userId,
    title: parsed.title,
    description: parsed.description || null,
    status: 'todo',
    priority: parsed.priority,
    timeframe: parsed.timeframe ?? 'daily',
    category: parsed.category || null,
    due_date: parsed.due_date || null,
    reminder_at: parsed.reminder_at || null,
    workspace_id: parsed.workspace_id || null,
    assignee_id: parsed.assignee_id || null,
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
    timeframe?: Task['timeframe']
    category?: string | null
    dueDate?: string | null
    reminderAt?: string | null
    workspaceId?: string | null
    assigneeId?: string | null
  }
): Promise<void> {
  const parsed = validate(updateTaskSchema, {
    title: data.title,
    description: data.description,
    status: data.status,
    priority: data.priority,
    timeframe: data.timeframe,
    category: data.category,
    due_date: data.dueDate,
    reminder_at: data.reminderAt,
    workspace_id: data.workspaceId,
    assignee_id: data.assigneeId,
  })

  const updatePayload: Partial<
    Pick<
      Task,
      | 'title'
      | 'description'
      | 'status'
      | 'priority'
      | 'timeframe'
      | 'category'
      | 'due_date'
      | 'reminder_at'
      | 'workspace_id'
      | 'assignee_id'
      | 'completed_at'
    >
  > = {}

  if (parsed.title !== undefined) updatePayload.title = parsed.title
  if (parsed.description !== undefined) updatePayload.description = parsed.description || null
  if (parsed.status !== undefined) updatePayload.status = parsed.status
  if (parsed.priority !== undefined) updatePayload.priority = parsed.priority
  if (parsed.timeframe !== undefined) updatePayload.timeframe = parsed.timeframe
  if (parsed.category !== undefined) updatePayload.category = parsed.category || null
  if (parsed.due_date !== undefined) updatePayload.due_date = parsed.due_date || null
  if (parsed.reminder_at !== undefined) updatePayload.reminder_at = parsed.reminder_at || null
  if (parsed.workspace_id !== undefined) updatePayload.workspace_id = parsed.workspace_id || null
  if (parsed.assignee_id !== undefined) updatePayload.assignee_id = parsed.assignee_id || null

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
  const dueStr = task.due_date
  // If date-only string (e.g. "YYYY-MM-DD"), task is only overdue after the end of that day
  if (!dueStr.includes('T')) {
    const parts = dueStr.split('-').map(Number)
    if (parts.length === 3) {
      const endOfDay = new Date(parts[0], parts[1] - 1, parts[2], 23, 59, 59, 999)
      return endOfDay.getTime() < Date.now()
    }
  }
  return new Date(dueStr).getTime() < Date.now()
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
