import * as categoryRepo from '@/features/finance/repositories/categoryRepository'
import {
  createCategorySchema,
  updateCategorySchema,
} from '@/features/finance/schemas/categorySchema'
import { validate } from '@/lib/validation'
import type { Category, CategoryType } from '@/types'

// ─── Default Categories ───────────────────────────────────────────────────────

const DEFAULT_INCOME_CATEGORIES = ['Gaji', 'Bonus', 'Freelance', 'Hadiah', 'Lainnya']

const DEFAULT_EXPENSE_CATEGORIES = [
  'Makanan',
  'Transportasi',
  'Belanja',
  'Tagihan',
  'Hiburan',
  'Kesehatan',
  'Pendidikan',
  'Lainnya',
]

export async function initializeDefaultCategories(userId: string): Promise<void> {
  const existing = await categoryRepo.listCategories(userId)
  const existingNames = new Set(existing.map(c => c.name.toLowerCase()))

  const toCreate: Array<{ name: string; type: CategoryType }> = []

  for (const name of DEFAULT_INCOME_CATEGORIES) {
    if (!existingNames.has(name.toLowerCase())) {
      toCreate.push({ name, type: 'income' })
    }
  }

  for (const name of DEFAULT_EXPENSE_CATEGORIES) {
    if (!existingNames.has(name.toLowerCase())) {
      toCreate.push({ name, type: 'expense' })
    }
  }

  for (const cat of toCreate) {
    await categoryRepo.createCategory({
      user_id: userId,
      name: cat.name,
      type: cat.type,
      icon: null,
      is_active: true,
    })
  }
}

export async function hasDefaultCategories(userId: string): Promise<boolean> {
  const existing = await categoryRepo.listCategories(userId)
  return existing.length > 0
}

export async function getActiveCategories(userId: string): Promise<Category[]> {
  return categoryRepo.listActiveCategories(userId)
}

export async function getAllCategories(userId: string): Promise<Category[]> {
  return categoryRepo.listCategories(userId)
}

export async function getCategoriesByType(userId: string, type: CategoryType): Promise<Category[]> {
  return categoryRepo.listCategoriesByType(userId, type)
}

export async function getCategoryById(id: string): Promise<Category | undefined> {
  return categoryRepo.getCategoryById(id)
}

export async function createCategory(
  userId: string,
  name: string,
  type: string,
  icon?: string
): Promise<string> {
  const data = validate(createCategorySchema, { name, type, icon })

  return categoryRepo.createCategory({
    user_id: userId,
    name: data.name,
    type: data.type,
    icon: data.icon ?? null,
    is_active: true,
  })
}

export async function updateCategory(
  id: string,
  data: Partial<Pick<Category, 'name' | 'type' | 'icon' | 'is_active'>>
): Promise<void> {
  const parsed = validate(updateCategorySchema, {
    name: data.name,
    type: data.type,
    icon: data.icon ?? undefined,
  })

  const updateData: Partial<Pick<Category, 'name' | 'type' | 'icon' | 'is_active'>> = {}
  if (parsed.name !== undefined) updateData.name = parsed.name
  if (parsed.type !== undefined) updateData.type = parsed.type
  if (data.icon !== undefined) updateData.icon = parsed.icon ?? null
  if (data.is_active !== undefined) updateData.is_active = data.is_active

  return categoryRepo.updateCategory(id, updateData)
}

export async function deactivateCategory(id: string): Promise<void> {
  return categoryRepo.updateCategory(id, { is_active: false })
}

export async function activateCategory(id: string): Promise<void> {
  return categoryRepo.updateCategory(id, { is_active: true })
}

export async function removeCategory(id: string): Promise<void> {
  return categoryRepo.deleteCategory(id)
}
