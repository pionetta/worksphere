import * as budgetRepo from '@/features/finance/repositories/budgetRepository'
import * as categoryRepo from '@/features/finance/repositories/categoryRepository'
import { createBudgetSchema, updateBudgetSchema } from '@/features/finance/schemas/budgetSchema'
import { validate } from '@/lib/validation'
import type { Budget } from '@/types'

export async function getBudgetsByMonth(
  userId: string,
  month: number,
  year: number
): Promise<Budget[]> {
  return budgetRepo.listBudgetsByMonth(userId, month, year)
}

export async function getBudgetById(id: string): Promise<Budget | undefined> {
  return budgetRepo.getBudgetById(id)
}

export async function createBudget(
  userId: string,
  categoryId: string,
  amount: number,
  month: number,
  year: number,
  note?: string
): Promise<string> {
  const data = validate(createBudgetSchema, { category_id: categoryId, amount, month, year, note })

  const category = await categoryRepo.getCategoryById(data.category_id)
  if (!category) throw new Error('Kategori tidak ditemukan.')
  if (category.type !== 'expense') throw new Error('Anggaran hanya untuk kategori pengeluaran.')

  const existing = await budgetRepo.getBudgetByCategoryAndMonth(
    userId,
    data.category_id,
    data.month,
    data.year
  )
  if (existing) {
    throw new Error('Anggaran untuk kategori ini sudah ada di bulan tersebut.')
  }

  return budgetRepo.createBudget({
    user_id: userId,
    category_id: data.category_id,
    amount: data.amount,
    month: data.month,
    year: data.year,
    note: data.note ?? null,
  })
}

export async function updateBudget(
  id: string,
  data: Partial<Pick<Budget, 'amount' | 'note'>>
): Promise<void> {
  const parsed = validate(updateBudgetSchema, {
    amount: data.amount,
    note: data.note ?? undefined,
  })

  const updateData: Partial<Pick<Budget, 'amount' | 'note'>> = {}
  if (parsed.amount !== undefined) updateData.amount = parsed.amount
  if (data.note !== undefined) updateData.note = parsed.note ?? null

  return budgetRepo.updateBudget(id, updateData)
}

export async function removeBudget(id: string): Promise<void> {
  return budgetRepo.deleteBudget(id)
}
