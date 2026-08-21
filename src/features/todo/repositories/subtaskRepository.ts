import { db } from '@/lib/db'
import type { Subtask } from '@/types'
import { queueCreate, queueUpdate, queueDelete } from '@/lib/sync/syncHelper'

function now(): string {
  return new Date().toISOString()
}

export async function getSubtaskById(id: string): Promise<Subtask | undefined> {
  return db.subtasks.get(id)
}

export async function listSubtasksByTask(taskId: string): Promise<Subtask[]> {
  return db.subtasks.where('task_id').equals(taskId).toArray()
}

export async function listSubtasksByUser(userId: string): Promise<Subtask[]> {
  return db.subtasks.where('user_id').equals(userId).toArray()
}

export async function createSubtask(
  data: Omit<Subtask, 'id' | 'created_at' | 'updated_at'>
): Promise<string> {
  const id = crypto.randomUUID()
  const timestamp = now()
  await db.subtasks.add({
    ...data,
    id,
    created_at: timestamp,
    updated_at: timestamp,
  })

  // Queue sync
  await queueCreate(data.user_id, 'subtask', id, {
    id,
    task_id: data.task_id,
    user_id: data.user_id,
    title: data.title,
    is_completed: data.is_completed,
    position: data.position,
    created_at: timestamp,
    updated_at: timestamp,
  })

  return id
}

export async function updateSubtask(
  id: string,
  data: Partial<Pick<Subtask, 'title' | 'is_completed' | 'position'>>
): Promise<void> {
  const subtask = await db.subtasks.get(id)
  if (!subtask) return

  const timestamp = now()
  await db.subtasks.update(id, { ...data, updated_at: timestamp })

  // Queue sync
  await queueUpdate(subtask.user_id, 'subtask', id, {
    ...subtask,
    ...data,
    updated_at: timestamp,
  })
}

export async function completeSubtask(id: string): Promise<void> {
  const subtask = await db.subtasks.get(id)
  if (!subtask) return

  const timestamp = now()
  await db.subtasks.update(id, {
    is_completed: true,
    updated_at: timestamp,
  })

  // Queue sync
  await queueUpdate(subtask.user_id, 'subtask', id, {
    ...subtask,
    is_completed: true,
    updated_at: timestamp,
  })
}

export async function uncompleteSubtask(id: string): Promise<void> {
  const subtask = await db.subtasks.get(id)
  if (!subtask) return

  const timestamp = now()
  await db.subtasks.update(id, {
    is_completed: false,
    updated_at: timestamp,
  })

  // Queue sync
  await queueUpdate(subtask.user_id, 'subtask', id, {
    ...subtask,
    is_completed: false,
    updated_at: timestamp,
  })
}

export async function deleteSubtask(id: string): Promise<void> {
  const subtask = await db.subtasks.get(id)
  if (!subtask) return

  await db.subtasks.delete(id)

  // Queue sync
  await queueDelete(subtask.user_id, 'subtask', id)
}

export async function deleteSubtasksByTask(taskId: string): Promise<void> {
  const subtasks = await db.subtasks.where('task_id').equals(taskId).toArray()

  // Delete all subtasks
  await db.subtasks.where('task_id').equals(taskId).delete()

  // Queue sync for each subtask
  for (const subtask of subtasks) {
    await queueDelete(subtask.user_id, 'subtask', subtask.id)
  }
}
