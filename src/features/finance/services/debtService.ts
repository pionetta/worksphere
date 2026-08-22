import * as debtRepo from '@/features/finance/repositories/debtRepository'
import {
  createDebtSchema,
  updateDebtSchema,
  payDebtSchema,
  type CreateDebtInput,
  type UpdateDebtInput,
} from '@/features/finance/schemas/debtSchema'
import { validate } from '@/lib/validation'
import type { Debt, DebtType, DebtStatus } from '@/types'

export interface DebtSummary {
  totalDebt: number
  totalDebtRemaining: number
  totalReceivable: number
  totalReceivableRemaining: number
  unpaidDebtCount: number
  unpaidReceivableCount: number
}

export async function getDebts(
  userId: string,
  filters?: {
    type?: DebtType
    status?: DebtStatus
  }
): Promise<Debt[]> {
  return debtRepo.listDebts(userId, filters)
}

export async function getDebtById(id: string): Promise<Debt | undefined> {
  return debtRepo.getDebtById(id)
}

export async function createDebt(userId: string, input: CreateDebtInput): Promise<string> {
  const data = validate(createDebtSchema, input)

  return debtRepo.createDebt({
    user_id: userId,
    type: data.type,
    person_name: data.person_name,
    amount: data.amount,
    paid_amount: 0,
    due_date: data.due_date ?? null,
    status: 'unpaid',
    note: data.note ?? null,
  })
}

export async function updateDebt(id: string, input: UpdateDebtInput): Promise<void> {
  const data = validate(updateDebtSchema, input)
  const existing = await debtRepo.getDebtById(id)
  if (!existing) throw new Error('Data utang/piutang tidak ditemukan.')

  const newAmount = data.amount !== undefined ? data.amount : existing.amount

  // Recalculate status based on new amount
  let newStatus = existing.status
  if (existing.paid_amount >= newAmount) {
    newStatus = 'paid'
  } else if (existing.paid_amount > 0) {
    newStatus = 'partially_paid'
  } else {
    newStatus = 'unpaid'
  }

  return debtRepo.updateDebt(id, {
    ...(data.type !== undefined && { type: data.type }),
    ...(data.person_name !== undefined && { person_name: data.person_name }),
    ...(data.amount !== undefined && { amount: data.amount }),
    ...(data.due_date !== undefined && { due_date: data.due_date ?? null }),
    ...(data.note !== undefined && { note: data.note ?? null }),
    status: newStatus,
  })
}

export async function payDebt(id: string, paymentAmount: number): Promise<void> {
  const data = validate(payDebtSchema, { amount: paymentAmount })
  const debt = await debtRepo.getDebtById(id)
  if (!debt) throw new Error('Data utang/piutang tidak ditemukan.')

  const remaining = Math.max(0, debt.amount - debt.paid_amount)
  if (data.amount > remaining) {
    throw new Error('Nominal pembayaran melebihi sisa tagihan.')
  }

  const newPaidAmount = debt.paid_amount + data.amount
  const newStatus: DebtStatus = newPaidAmount >= debt.amount ? 'paid' : 'partially_paid'

  return debtRepo.updateDebt(id, {
    paid_amount: newPaidAmount,
    status: newStatus,
  })
}

export async function removeDebt(id: string): Promise<void> {
  return debtRepo.deleteDebt(id)
}

export async function getDebtSummary(userId: string): Promise<DebtSummary> {
  const allDebts = await debtRepo.listDebts(userId)

  let totalDebt = 0
  let totalDebtRemaining = 0
  let totalReceivable = 0
  let totalReceivableRemaining = 0
  let unpaidDebtCount = 0
  let unpaidReceivableCount = 0

  for (const d of allDebts) {
    const remaining = Math.max(0, d.amount - d.paid_amount)
    if (d.type === 'debt') {
      totalDebt += d.amount
      totalDebtRemaining += remaining
      if (d.status !== 'paid') {
        unpaidDebtCount++
      }
    } else {
      totalReceivable += d.amount
      totalReceivableRemaining += remaining
      if (d.status !== 'paid') {
        unpaidReceivableCount++
      }
    }
  }

  return {
    totalDebt,
    totalDebtRemaining,
    totalReceivable,
    totalReceivableRemaining,
    unpaidDebtCount,
    unpaidReceivableCount,
  }
}
