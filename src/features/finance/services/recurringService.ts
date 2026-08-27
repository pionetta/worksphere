import * as recurringRepo from '../repositories/recurringRepository'
import * as transactionService from './transactionService'
import {
  createRecurringSchema,
  updateRecurringSchema,
  type CreateRecurringInput,
  type UpdateRecurringInput,
} from '../schemas/recurringSchema'
import { validate } from '@/lib/validation'
import type { RecurringTransaction, RecurringFrequency } from '@/types'
import { toISODate } from '@/utils/date'

/**
 * Calculates the next due date based on frequency and interval
 */
export function calculateNextDueDate(
  currentDateStr: string,
  frequency: RecurringFrequency,
  intervalCount: number = 1
): string {
  const [year, month, day] = currentDateStr.split('-').map(Number)
  const d = new Date(year, month - 1, day)

  if (frequency === 'daily') {
    d.setDate(d.getDate() + intervalCount)
  } else if (frequency === 'weekly') {
    d.setDate(d.getDate() + intervalCount * 7)
  } else if (frequency === 'monthly') {
    const targetMonth = d.getMonth() + intervalCount
    d.setMonth(targetMonth)
  } else if (frequency === 'yearly') {
    d.setFullYear(d.getFullYear() + intervalCount)
  }

  return toISODate(d)
}

export async function getAllRecurring(userId: string): Promise<RecurringTransaction[]> {
  return recurringRepo.listRecurringByUserId(userId)
}

export async function createRecurringTransaction(
  userId: string,
  input: CreateRecurringInput
): Promise<string> {
  const parsed = validate(createRecurringSchema, input)

  return recurringRepo.createRecurring({
    user_id: userId,
    wallet_id: parsed.wallet_id,
    category_id: parsed.category_id || null,
    type: parsed.type,
    amount: parsed.amount,
    frequency: parsed.frequency,
    interval_count: parsed.interval_count ?? 1,
    start_date: parsed.start_date,
    end_date: parsed.end_date || null,
    next_due_date: parsed.start_date,
    last_processed_date: null,
    is_active: true,
    auto_record: parsed.auto_record ?? true,
    note: parsed.note || null,
  })
}

export async function updateRecurringTransaction(
  id: string,
  input: UpdateRecurringInput
): Promise<void> {
  const parsed = validate(updateRecurringSchema, input)
  await recurringRepo.updateRecurring(id, parsed)
}

export async function toggleRecurringActive(id: string, isActive: boolean): Promise<void> {
  await recurringRepo.updateRecurring(id, { is_active: isActive })
}

export async function deleteRecurringTransaction(id: string): Promise<void> {
  await recurringRepo.deleteRecurring(id)
}

/**
 * Manually executes a recurring transaction now and advances its next due date
 */
export async function executeRecurringTransaction(
  id: string,
  executionDate?: string
): Promise<void> {
  const item = await recurringRepo.getRecurringById(id)
  if (!item) return

  const dateToUse = executionDate || toISODate(new Date())

  // 1. Record actual transaction
  const notePrefix = item.note ? `[Rutin] ${item.note}` : '[Rutin]'
  if (item.type === 'income') {
    await transactionService.createIncome(
      item.user_id,
      item.wallet_id,
      item.amount,
      item.category_id,
      dateToUse,
      notePrefix
    )
  } else {
    await transactionService.createExpense(
      item.user_id,
      item.wallet_id,
      item.amount,
      item.category_id,
      dateToUse,
      notePrefix
    )
  }

  // 2. Advance next due date
  const nextDue = calculateNextDueDate(item.next_due_date, item.frequency, item.interval_count)
  const isExpired = item.end_date ? nextDue > item.end_date : false

  await recurringRepo.updateRecurring(id, {
    last_processed_date: dateToUse,
    next_due_date: nextDue,
    is_active: isExpired ? false : item.is_active,
  })
}

/**
 * Automatically processes all due auto_record recurring transactions
 */
export async function processDueRecurringTransactions(
  userId: string,
  asOfDate?: string
): Promise<number> {
  const today = asOfDate || toISODate(new Date())
  const dueItems = await recurringRepo.listActiveRecurringDue(userId, today)

  let processedCount = 0

  for (const item of dueItems) {
    if (!item.auto_record) continue

    // Record transaction on its next_due_date
    const notePrefix = item.note ? `[Otomatis] ${item.note}` : '[Otomatis Rutin]'
    if (item.type === 'income') {
      await transactionService.createIncome(
        item.user_id,
        item.wallet_id,
        item.amount,
        item.category_id,
        item.next_due_date,
        notePrefix
      )
    } else {
      await transactionService.createExpense(
        item.user_id,
        item.wallet_id,
        item.amount,
        item.category_id,
        item.next_due_date,
        notePrefix
      )
    }

    const nextDue = calculateNextDueDate(item.next_due_date, item.frequency, item.interval_count)
    const isExpired = item.end_date ? nextDue > item.end_date : false

    await recurringRepo.updateRecurring(item.id, {
      last_processed_date: item.next_due_date,
      next_due_date: nextDue,
      is_active: isExpired ? false : item.is_active,
    })

    processedCount++
  }

  return processedCount
}
