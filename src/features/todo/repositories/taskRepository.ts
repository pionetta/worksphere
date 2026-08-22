import { db } from '@/lib/db'
import type { Task, TaskStatus, TaskPriority } from '@/types'
import { queueCreate, queueUpdate, queueDelete } from '@/lib/sync/syncHelper'

function now(): string {
  return new Date().toISOString()
}

export async function getTaskById(id: string): Promise<Task | undefined> {
  return db.tasks.get(id)
}

export async function listTasks(userId: string): Promise<Task[]> {
  return db.tasks
    .where('user_id')
    .equals(userId)
    .and(t => t.deleted_at === null)
    .toArray()
}

export async function listTasksByStatus(userId: string, status: TaskStatus): Promise<Task[]> {
  return db.tasks
    .where('user_id')
    .equals(userId)
    .and(t => t.status === status && t.deleted_at === null)
    .toArray()
}

export async function listTasksByPriority(userId: string, priority: TaskPriority): Promise<Task[]> {
  return db.tasks
    .where('user_id')
    .equals(userId)
    .and(t => t.priority === priority && t.deleted_at === null)
    .toArray()
}

export async function listTasksByCategory(userId: string, category: string): Promise<Task[]> {
  return db.tasks
    .where('user_id')
    .equals(userId)
    .and(t => t.category === category && t.deleted_at === null)
    .toArray()
}

export async function listOverdueTasks(userId: string): Promise<Task[]> {
  const now = new Date()
  const todayDateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
  const nowIso = now.toISOString()
  return db.tasks
    .where('user_id')
    .equals(userId)
    .and(
      t => {
        if (!t.due_date || t.status === 'completed' || t.status === 'cancelled' || t.deleted_at !== null) {
          return false
        }
        if (!t.due_date.includes('T')) {
          return t.due_date < todayDateStr
        }
        return t.due_date < nowIso
      }
    )
    .toArray()
}

export async function createTask(
  data: Omit<Task, 'id' | 'created_at' | 'updated_at'>
): Promise<string> {
  const id = crypto.randomUUID()
  const timestamp = now()
  await db.tasks.add({
    ...data,
    id,
    created_at: timestamp,
    updated_at: timestamp,
  })

  // Queue sync
  await queueCreate(data.user_id, 'task', id, {
    id,
    user_id: data.user_id,
    title: data.title,
    description: data.description,
    status: data.status,
    priority: data.priority,
    category: data.category,
    due_date: data.due_date,
    reminder_at: data.reminder_at,
    completed_at: data.completed_at,
    deleted_at: data.deleted_at,
    created_at: timestamp,
    updated_at: timestamp,
  })

  return id
}

export async function updateTask(
  id: string,
  data: Partial<
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
  >
): Promise<void> {
  const task = await db.tasks.get(id)
  if (!task) return

  const timestamp = now()
  await db.tasks.update(id, { ...data, updated_at: timestamp })

  // Queue sync
  await queueUpdate(task.user_id, 'task', id, {
    ...task,
    ...data,
    updated_at: timestamp,
  })
}

export async function completeTask(id: string): Promise<void> {
  const task = await db.tasks.get(id)
  if (!task) return

  const timestamp = now()
  await db.tasks.update(id, {
    status: 'completed',
    completed_at: timestamp,
    updated_at: timestamp,
  })

  // Queue sync
  await queueUpdate(task.user_id, 'task', id, {
    ...task,
    status: 'completed',
    completed_at: timestamp,
    updated_at: timestamp,
  })
}

export async function reopenTask(id: string): Promise<void> {
  const task = await db.tasks.get(id)
  if (!task) return

  const timestamp = now()
  await db.tasks.update(id, {
    status: 'todo',
    completed_at: null,
    updated_at: timestamp,
  })

  // Queue sync
  await queueUpdate(task.user_id, 'task', id, {
    ...task,
    status: 'todo',
    completed_at: null,
    updated_at: timestamp,
  })
}

export async function softDeleteTask(id: string): Promise<void> {
  const task = await db.tasks.get(id)
  if (!task) return

  const timestamp = now()
  await db.tasks.update(id, {
    deleted_at: timestamp,
    updated_at: timestamp,
  })

  // Queue sync
  await queueUpdate(task.user_id, 'task', id, {
    ...task,
    deleted_at: timestamp,
    updated_at: timestamp,
  })
}

export async function deleteTask(id: string): Promise<void> {
  const task = await db.tasks.get(id)
  if (!task) return

  await db.tasks.delete(id)

  // Queue sync
  await queueDelete(task.user_id, 'task', id)
}
