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

export interface DebtGroupSummary {
  groupName: string
  totalAmount: number
  totalPaid: number
  totalRemaining: number
  unpaidCount: number
  paidCount: number
  totalCount: number
  debtType: DebtType | 'mixed'
  items: Debt[]
}

export interface InstallmentProgress {
  isInstallment: boolean
  isFlexible: boolean
  totalCount: number
  paidCount: number
  remainingCount: number
  currentInstallmentIndex: number
  progressPercent: number
  isFullyPaid: boolean
  currentBillAmount: number
}

export function getInstallmentProgress(debt: Debt): InstallmentProgress | null {
  if (!debt.is_installment) return null

  const totalCount = debt.installment_count || 1
  const isFullyPaid = debt.status === 'paid'

  let paidCount = debt.installment_paid_count ?? 0
  if (isFullyPaid) {
    paidCount = totalCount
  } else if (paidCount === 0 && debt.installment_amount && debt.installment_amount > 0 && debt.paid_amount > 0) {
    paidCount = Math.min(totalCount, Math.floor(debt.paid_amount / debt.installment_amount))
  }

  const remainingCount = Math.max(0, totalCount - paidCount)
  const currentInstallmentIndex = isFullyPaid ? totalCount : Math.min(totalCount, paidCount + 1)
  const progressPercent = Math.min(100, Math.round((paidCount / totalCount) * 100))

  const remainingDebt = Math.max(0, debt.amount - debt.paid_amount)
  const currentBillAmount = debt.current_bill_amount || debt.installment_amount || remainingDebt

  return {
    isInstallment: true,
    isFlexible: Boolean(debt.is_flexible_installment),
    totalCount,
    paidCount,
    remainingCount,
    currentInstallmentIndex,
    progressPercent,
    isFullyPaid,
    currentBillAmount,
  }
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
    group_name: data.group_name?.trim() || null,
    amount: data.amount,
    paid_amount: 0,
    due_date: data.due_date ?? null,
    status: 'unpaid',
    is_installment: data.is_installment ?? false,
    is_flexible_installment: data.is_flexible_installment ?? false,
    installment_count: data.installment_count ?? null,
    installment_paid_count: data.installment_paid_count ?? 0,
    installment_amount: data.installment_amount ?? null,
    current_bill_amount: data.current_bill_amount ?? null,
    installment_due_day: data.installment_due_day ?? null,
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
    ...(data.group_name !== undefined && { group_name: data.group_name?.trim() || null }),
    ...(data.amount !== undefined && { amount: data.amount }),
    ...(data.due_date !== undefined && { due_date: data.due_date ?? null }),
    ...(data.is_installment !== undefined && { is_installment: data.is_installment }),
    ...(data.is_flexible_installment !== undefined && {
      is_flexible_installment: data.is_flexible_installment,
    }),
    ...(data.installment_count !== undefined && {
      installment_count: data.installment_count ?? null,
    }),
    ...(data.installment_paid_count !== undefined && {
      installment_paid_count: data.installment_paid_count ?? null,
    }),
    ...(data.installment_amount !== undefined && {
      installment_amount: data.installment_amount ?? null,
    }),
    ...(data.current_bill_amount !== undefined && {
      current_bill_amount: data.current_bill_amount ?? null,
    }),
    ...(data.installment_due_day !== undefined && {
      installment_due_day: data.installment_due_day ?? null,
    }),
    ...(data.note !== undefined && { note: data.note ?? null }),
    status: newStatus,
  })
}

export async function payDebt(
  id: string,
  paymentAmount: number,
  incrementInstallment = true
): Promise<void> {
  const data = validate(payDebtSchema, { amount: paymentAmount, increment_installment: incrementInstallment })
  const debt = await debtRepo.getDebtById(id)
  if (!debt) throw new Error('Data utang/piutang tidak ditemukan.')

  const remaining = Math.max(0, debt.amount - debt.paid_amount)
  if (data.amount > remaining) {
    throw new Error('Nominal pembayaran melebihi sisa tagihan.')
  }

  const newPaidAmount = debt.paid_amount + data.amount
  const newStatus: DebtStatus = newPaidAmount >= debt.amount ? 'paid' : 'partially_paid'

  let newPaidCount = debt.installment_paid_count ?? 0
  if (debt.is_installment && debt.installment_count) {
    if (newStatus === 'paid') {
      newPaidCount = debt.installment_count
    } else if (incrementInstallment) {
      newPaidCount = Math.min(debt.installment_count, (debt.installment_paid_count ?? 0) + 1)
    }
  }

  return debtRepo.updateDebt(id, {
    paid_amount: newPaidAmount,
    status: newStatus,
    ...(debt.is_installment && { installment_paid_count: newPaidCount }),
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

/**
 * Group debts by their designated group_name (e.g. "Shopee Paylater", "Bank BCA", "Teman"),
 * or fallback to person_name if group_name is not provided.
 */
export function groupDebts(debts: Debt[]): DebtGroupSummary[] {
  const map = new Map<string, DebtGroupSummary>()

  for (const debt of debts) {
    const groupName = debt.group_name?.trim() || debt.person_name.trim() || 'Lainnya'
    const remaining = Math.max(0, debt.amount - debt.paid_amount)
    const isPaid = debt.status === 'paid'

    let current = map.get(groupName)
    if (!current) {
      current = {
        groupName,
        totalAmount: 0,
        totalPaid: 0,
        totalRemaining: 0,
        unpaidCount: 0,
        paidCount: 0,
        totalCount: 0,
        debtType: debt.type,
        items: [],
      }
      map.set(groupName, current)
    }

    current.totalAmount += debt.amount
    current.totalPaid += debt.paid_amount
    current.totalRemaining += remaining
    current.totalCount += 1
    if (isPaid) {
      current.paidCount += 1
    } else {
      current.unpaidCount += 1
    }

    if (current.debtType !== 'mixed' && current.debtType !== debt.type) {
      current.debtType = 'mixed'
    }

    current.items.push(debt)
  }

  // Convert map to array sorted by total remaining descending, then total amount descending
  return Array.from(map.values()).sort((a, b) => {
    if (b.totalRemaining !== a.totalRemaining) {
      return b.totalRemaining - a.totalRemaining
    }
    return b.totalAmount - a.totalAmount
  })
}
