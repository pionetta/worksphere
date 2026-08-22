import * as savingsRepo from '@/features/finance/repositories/savingsRepository'
import {
  createSavingsGoalSchema,
  updateSavingsGoalSchema,
  addToSavingsSchema,
  withdrawFromSavingsSchema,
} from '@/features/finance/schemas/savingsSchema'
import { validate } from '@/lib/validation'
import type { SavingsGoal } from '@/types'

export async function getSavingsGoals(userId: string): Promise<SavingsGoal[]> {
  return savingsRepo.listSavingsGoals(userId)
}

export async function getSavingsGoalById(id: string): Promise<SavingsGoal | undefined> {
  return savingsRepo.getSavingsGoalById(id)
}

export async function createSavingsGoal(
  userId: string,
  name: string,
  targetAmount: number,
  deadline?: string | null,
  note?: string
): Promise<string> {
  const data = validate(createSavingsGoalSchema, {
    name,
    target_amount: targetAmount,
    current_amount: 0,
    deadline: deadline ?? null,
    note,
  })

  return savingsRepo.createSavingsGoal({
    user_id: userId,
    name: data.name,
    target_amount: data.target_amount,
    current_amount: data.current_amount,
    deadline: data.deadline ?? null,
    note: data.note ?? null,
  })
}

export async function updateSavingsGoal(
  id: string,
  data: Partial<
    Pick<SavingsGoal, 'name' | 'target_amount' | 'current_amount' | 'deadline' | 'note'>
  >
): Promise<void> {
  const parsed = validate(updateSavingsGoalSchema, {
    name: data.name,
    target_amount: data.target_amount,
    current_amount: data.current_amount,
    deadline: data.deadline ?? undefined,
    note: data.note ?? undefined,
  })

  const updateData: Partial<
    Pick<SavingsGoal, 'name' | 'target_amount' | 'current_amount' | 'deadline' | 'note'>
  > = {}
  if (parsed.name !== undefined) updateData.name = parsed.name
  if (parsed.target_amount !== undefined) updateData.target_amount = parsed.target_amount
  if (parsed.current_amount !== undefined) updateData.current_amount = parsed.current_amount
  if (data.deadline !== undefined) updateData.deadline = parsed.deadline ?? null
  if (data.note !== undefined) updateData.note = parsed.note ?? null

  return savingsRepo.updateSavingsGoal(id, updateData)
}

export async function addToSavings(id: string, amount: number): Promise<void> {
  const data = validate(addToSavingsSchema, { amount })
  const goal = await savingsRepo.getSavingsGoalById(id)
  if (!goal) throw new Error('Tujuan tabungan tidak ditemukan.')

  return savingsRepo.updateSavingsGoal(id, {
    current_amount: goal.current_amount + data.amount,
  })
}

export async function withdrawFromSavings(id: string, amount: number): Promise<void> {
  const data = validate(withdrawFromSavingsSchema, { amount })
  const goal = await savingsRepo.getSavingsGoalById(id)
  if (!goal) throw new Error('Tujuan tabungan tidak ditemukan.')

  if (data.amount > goal.current_amount) {
    throw new Error('Nominal penarikan melebihi saldo tabungan saat ini.')
  }

  return savingsRepo.updateSavingsGoal(id, {
    current_amount: goal.current_amount - data.amount,
  })
}

export async function removeSavingsGoal(id: string): Promise<void> {
  return savingsRepo.deleteSavingsGoal(id)
}

export function calculateProgress(current: number, target: number): number {
  if (target <= 0) return 0
  return Math.min(Math.round((current / target) * 100), 100)
}
