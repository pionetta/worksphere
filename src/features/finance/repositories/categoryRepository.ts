import { db } from '@/lib/db'
import type { Category, CategoryType } from '@/types'
import { queueCreate, queueUpdate, queueDelete } from '@/lib/sync/syncHelper'

function now(): string {
  return new Date().toISOString()
}

export async function getCategoryById(id: string): Promise<Category | undefined> {
  return db.categories.get(id)
}

export async function listCategories(userId: string): Promise<Category[]> {
  return db.categories.where('user_id').equals(userId).toArray()
}

export async function listCategoriesByType(
  userId: string,
  type: CategoryType
): Promise<Category[]> {
  return db.categories
    .where('user_id')
    .equals(userId)
    .and(c => c.type === type)
    .toArray()
}

export async function listActiveCategories(userId: string): Promise<Category[]> {
  return db.categories
    .where('user_id')
    .equals(userId)
    .and(c => c.is_active)
    .toArray()
}

export async function createCategory(
  data: Omit<Category, 'id' | 'created_at' | 'updated_at'>
): Promise<string> {
  const id = crypto.randomUUID()
  const timestamp = now()
  await db.categories.add({
    ...data,
    id,
    created_at: timestamp,
    updated_at: timestamp,
  })

  // Queue sync
  await queueCreate(data.user_id, 'category', id, {
    id,
    user_id: data.user_id,
    name: data.name,
    type: data.type,
    icon: data.icon,
    is_active: data.is_active,
    created_at: timestamp,
    updated_at: timestamp,
  })

  return id
}

export async function updateCategory(
  id: string,
  data: Partial<Pick<Category, 'name' | 'type' | 'icon' | 'is_active'>>
): Promise<void> {
  const category = await db.categories.get(id)
  if (!category) return

  const timestamp = now()
  await db.categories.update(id, { ...data, updated_at: timestamp })

  // Queue sync
  await queueUpdate(category.user_id, 'category', id, {
    ...category,
    ...data,
    updated_at: timestamp,
  })
}

export async function deleteCategory(id: string): Promise<void> {
  const category = await db.categories.get(id)
  if (!category) return

  await db.categories.delete(id)

  // Queue sync
  await queueDelete(category.user_id, 'category', id)
}
