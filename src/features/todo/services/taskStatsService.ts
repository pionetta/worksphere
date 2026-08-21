import * as taskRepo from '@/features/todo/repositories/taskRepository'
import type { Task } from '@/types'

export interface TaskStats {
  total: number
  todo: number
  inProgress: number
  completed: number
  cancelled: number
  overdue: number
}

export async function getTaskStats(userId: string): Promise<TaskStats> {
  const tasks = await taskRepo.listTasks(userId)
  return calculateStats(tasks)
}

export function calculateStats(tasks: Task[]): TaskStats {
  const now = new Date()
  return {
    total: tasks.length,
    todo: tasks.filter(t => t.status === 'todo').length,
    inProgress: tasks.filter(t => t.status === 'in_progress').length,
    completed: tasks.filter(t => t.status === 'completed').length,
    cancelled: tasks.filter(t => t.status === 'cancelled').length,
    overdue: tasks.filter(
      t =>
        t.due_date !== null &&
        t.status !== 'completed' &&
        t.status !== 'cancelled' &&
        new Date(t.due_date) < now
    ).length,
  }
}

export function getUpcomingDeadlines(tasks: Task[], days = 7): Task[] {
  const now = new Date()
  const future = new Date(now.getTime() + days * 24 * 60 * 60 * 1000)
  return tasks
    .filter(
      t =>
        t.due_date !== null &&
        t.status !== 'completed' &&
        t.status !== 'cancelled' &&
        !t.deleted_at &&
        new Date(t.due_date) >= now &&
        new Date(t.due_date) <= future
    )
    .sort((a, b) => new Date(a.due_date!).getTime() - new Date(b.due_date!).getTime())
}
