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
  schedule?: number[] | null
}

/**
 * Calculates effective paid amount.
 * If debt is installment and has installment_paid_count > 0 but paid_amount is 0 (or was recorded before),
 * auto-computes paid portion based on schedule or installment_amount.
 */
export function getEffectivePaidAmount(debt: Debt): number {
  if (debt.paid_amount > 0) return debt.paid_amount

  if (debt.is_installment && (debt.installment_paid_count ?? 0) > 0) {
    const paidCount = debt.installment_paid_count!
    if (debt.installment_schedule && debt.installment_schedule.length > 0) {
      let sum = 0
      for (let i = 0; i < Math.min(paidCount, debt.installment_schedule.length); i++) {
        sum += debt.installment_schedule[i] || 0
      }
      return Math.min(debt.amount, sum)
    }
    if (debt.installment_amount && debt.installment_amount > 0) {
      return Math.min(debt.amount, paidCount * debt.installment_amount)
    }
    if (debt.installment_count && debt.installment_count > 0) {
      const perMonth = Math.round(debt.amount / debt.installment_count)
      return Math.min(debt.amount, paidCount * perMonth)
    }
  }

  return 0
}

export function getInstallmentProgress(debt: Debt): InstallmentProgress | null {
  if (!debt.is_installment) return null

  const totalCount = debt.installment_count || 1
  const isFullyPaid = debt.status === 'paid'

  const effectivePaid = getEffectivePaidAmount(debt)
  let paidCount = debt.installment_paid_count ?? 0
  if (isFullyPaid) {
    paidCount = totalCount
  } else if (paidCount === 0 && debt.installment_amount && debt.installment_amount > 0 && effectivePaid > 0) {
    paidCount = Math.min(totalCount, Math.floor(effectivePaid / debt.installment_amount))
  }

  const remainingCount = Math.max(0, totalCount - paidCount)
  const currentInstallmentIndex = isFullyPaid ? totalCount : Math.min(totalCount, paidCount + 1)
  const progressPercent = Math.min(100, Math.round((paidCount / totalCount) * 100))

  const remainingDebt = Math.max(0, debt.amount - effectivePaid)
  
  // If debt has a custom monthly schedule, pick the active month's nominal
  let scheduledBill: number | undefined
  if (debt.installment_schedule && debt.installment_schedule.length > 0) {
    const activeIdx = Math.max(0, currentInstallmentIndex - 1)
    if (activeIdx < debt.installment_schedule.length) {
      scheduledBill = debt.installment_schedule[activeIdx]
    }
  }

  const currentBillAmount = scheduledBill || debt.current_bill_amount || debt.installment_amount || remainingDebt

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
    schedule: debt.installment_schedule ?? null,
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

  // Auto-calculate initial paid_amount if user specifies installment_paid_count > 0
  let initialPaidAmount = 0
  const paidCount = data.installment_paid_count ?? 0
  if (data.is_installment && paidCount > 0) {
    if (data.installment_schedule && data.installment_schedule.length > 0) {
      for (let i = 0; i < Math.min(paidCount, data.installment_schedule.length); i++) {
        initialPaidAmount += data.installment_schedule[i] || 0
      }
    } else if (data.installment_amount && data.installment_amount > 0) {
      initialPaidAmount = Math.min(data.amount, paidCount * data.installment_amount)
    } else if (data.installment_count && data.installment_count > 0) {
      const perMonth = Math.round(data.amount / data.installment_count)
      initialPaidAmount = Math.min(data.amount, paidCount * perMonth)
    }
  }

  const initialStatus: DebtStatus =
    initialPaidAmount >= data.amount && data.amount > 0
      ? 'paid'
      : initialPaidAmount > 0
      ? 'partially_paid'
      : 'unpaid'

  return debtRepo.createDebt({
    user_id: userId,
    type: data.type,
    person_name: data.person_name,
    group_name: data.group_name?.trim() || null,
    amount: data.amount,
    paid_amount: initialPaidAmount,
    due_date: data.due_date ?? null,
    status: initialStatus,
    is_installment: data.is_installment ?? false,
    is_flexible_installment: data.is_flexible_installment ?? false,
    installment_count: data.installment_count ?? null,
    installment_paid_count: data.installment_paid_count ?? 0,
    installment_amount: data.installment_amount ?? null,
    installment_schedule: data.installment_schedule ?? null,
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

  // If installment_paid_count was updated or paid_amount was 0 with paid_count > 0, recalculate paid_amount
  let newPaidAmount = existing.paid_amount
  const paidCount = data.installment_paid_count !== undefined ? data.installment_paid_count : existing.installment_paid_count

  if (
    (data.installment_paid_count !== undefined && data.installment_paid_count !== existing.installment_paid_count) ||
    (existing.paid_amount === 0 && (paidCount ?? 0) > 0)
  ) {
    if (paidCount && paidCount > 0) {
      const sched = data.installment_schedule !== undefined ? data.installment_schedule : existing.installment_schedule
      if (sched && sched.length > 0) {
        let schedSum = 0
        for (let i = 0; i < Math.min(paidCount, sched.length); i++) {
          schedSum += sched[i] || 0
        }
        newPaidAmount = Math.min(newAmount, schedSum)
      } else {
        const instAmount = data.installment_amount !== undefined ? data.installment_amount : existing.installment_amount
        const instCount = data.installment_count !== undefined ? data.installment_count : existing.installment_count
        if (instAmount && instAmount > 0) {
          newPaidAmount = Math.min(newAmount, paidCount * instAmount)
        } else if (instCount && instCount > 0) {
          const perMonth = Math.round(newAmount / instCount)
          newPaidAmount = Math.min(newAmount, paidCount * perMonth)
        }
      }
    } else if (paidCount === 0) {
      newPaidAmount = 0
    }
  }

  // Recalculate status based on new amount and paid_amount
  let newStatus: DebtStatus = existing.status
  if (newPaidAmount >= newAmount && newAmount > 0) {
    newStatus = 'paid'
  } else if (newPaidAmount > 0) {
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
    ...(data.installment_schedule !== undefined && {
      installment_schedule: data.installment_schedule ?? null,
    }),
    ...(data.current_bill_amount !== undefined && {
      current_bill_amount: data.current_bill_amount ?? null,
    }),
    ...(data.installment_due_day !== undefined && {
      installment_due_day: data.installment_due_day ?? null,
    }),
    ...(data.note !== undefined && { note: data.note ?? null }),
    paid_amount: newPaidAmount,
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

  const effectiveCurrentPaid = getEffectivePaidAmount(debt)
  const remaining = Math.max(0, debt.amount - effectiveCurrentPaid)
  if (data.amount > remaining) {
    throw new Error('Nominal pembayaran melebihi sisa tagihan.')
  }

  const newPaidAmount = effectiveCurrentPaid + data.amount
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
    const effectivePaid = getEffectivePaidAmount(d)
    const remaining = Math.max(0, d.amount - effectivePaid)
    const isPaid = d.status === 'paid' || remaining === 0

    if (d.type === 'debt') {
      totalDebt += d.amount
      totalDebtRemaining += remaining
      if (!isPaid) {
        unpaidDebtCount++
      }
    } else {
      totalReceivable += d.amount
      totalReceivableRemaining += remaining
      if (!isPaid) {
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
    const effectivePaid = getEffectivePaidAmount(debt)
    const remaining = Math.max(0, debt.amount - effectivePaid)
    const isPaid = debt.status === 'paid' || remaining === 0

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
    current.totalPaid += effectivePaid
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
