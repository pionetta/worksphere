import * as transactionRepo from '@/features/finance/repositories/transactionRepository'
import * as categoryRepo from '@/features/finance/repositories/categoryRepository'
import {
  createIncomeSchema,
  createExpenseSchema,
  createAdjustmentSchema,
  updateTransactionNoteSchema,
  updateIncomeSchema,
  updateExpenseSchema,
} from '@/features/finance/schemas/transactionSchema'
import { validate } from '@/lib/validation'
import type { Transaction, TransactionType } from '@/types'

export async function getTransactionById(id: string): Promise<Transaction | undefined> {
  return transactionRepo.getTransactionById(id)
}

export async function getTransactions(userId: string): Promise<Transaction[]> {
  return transactionRepo.listTransactions(userId)
}

export async function getTransactionsByDateRange(
  userId: string,
  startDate: string,
  endDate: string
): Promise<Transaction[]> {
  return transactionRepo.listTransactionsByDateRange(userId, startDate, endDate)
}

export async function getTransactionsByType(
  userId: string,
  type: TransactionType
): Promise<Transaction[]> {
  return transactionRepo.listTransactionsByType(userId, type)
}

export async function createIncome(
  userId: string,
  walletId: string,
  amount: number,
  categoryId: string | null,
  transactionDate: string,
  note?: string
): Promise<string> {
  const data = validate(createIncomeSchema, {
    wallet_id: walletId,
    category_id: categoryId,
    amount,
    transaction_date: transactionDate,
    note,
  })

  if (data.category_id) {
    const category = await categoryRepo.getCategoryById(data.category_id)
    if (!category) throw new Error('Kategori tidak ditemukan.')
  }

  return transactionRepo.createTransaction({
    user_id: userId,
    wallet_id: data.wallet_id,
    type: 'income',
    amount: data.amount,
    category_id: data.category_id ?? null,
    transaction_date: data.transaction_date,
    note: data.note ?? null,
    transfer_group_id: null,
    deleted_at: null,
  })
}

export async function createExpense(
  userId: string,
  walletId: string,
  amount: number,
  categoryId: string | null,
  transactionDate: string,
  note?: string
): Promise<string> {
  const data = validate(createExpenseSchema, {
    wallet_id: walletId,
    category_id: categoryId,
    amount,
    transaction_date: transactionDate,
    note,
  })

  if (data.category_id) {
    const category = await categoryRepo.getCategoryById(data.category_id)
    if (!category) throw new Error('Kategori tidak ditemukan.')
  }

  return transactionRepo.createTransaction({
    user_id: userId,
    wallet_id: data.wallet_id,
    type: 'expense',
    amount: data.amount,
    category_id: data.category_id ?? null,
    transaction_date: data.transaction_date,
    note: data.note ?? null,
    transfer_group_id: null,
    deleted_at: null,
  })
}

export async function createAdjustment(
  userId: string,
  walletId: string,
  amount: number,
  transactionDate: string,
  note?: string
): Promise<string> {
  const data = validate(createAdjustmentSchema, {
    wallet_id: walletId,
    amount,
    transaction_date: transactionDate,
    note,
  })

  return transactionRepo.createTransaction({
    user_id: userId,
    wallet_id: data.wallet_id,
    type: 'adjustment',
    amount: data.amount,
    category_id: null,
    transaction_date: data.transaction_date,
    note: data.note ?? null,
    transfer_group_id: null,
    deleted_at: null,
  })
}

export async function removeTransaction(id: string): Promise<void> {
  return transactionRepo.softDeleteTransaction(id)
}

export async function updateTransactionNote(id: string, note: string): Promise<void> {
  const data = validate(updateTransactionNoteSchema, { note })
  return transactionRepo.updateTransaction(id, { note: data.note })
}

export async function updateIncome(
  id: string,
  walletId: string,
  amount: number,
  categoryId: string | null,
  transactionDate: string,
  note?: string
): Promise<void> {
  const existing = await transactionRepo.getTransactionById(id)
  if (!existing) throw new Error('Transaksi tidak ditemukan.')
  if (existing.type !== 'income') throw new Error('Transaksi ini bukan pemasukan.')

  const data = validate(updateIncomeSchema, {
    wallet_id: walletId,
    category_id: categoryId,
    amount,
    transaction_date: transactionDate,
    note,
  })

  if (data.category_id) {
    const category = await categoryRepo.getCategoryById(data.category_id)
    if (!category) throw new Error('Kategori tidak ditemukan.')
  }

  await transactionRepo.updateTransaction(id, {
    wallet_id: data.wallet_id,
    amount: data.amount,
    category_id: data.category_id ?? null,
    transaction_date: data.transaction_date,
    note: data.note ?? null,
  })
}

export async function updateExpense(
  id: string,
  walletId: string,
  amount: number,
  categoryId: string | null,
  transactionDate: string,
  note?: string
): Promise<void> {
  const existing = await transactionRepo.getTransactionById(id)
  if (!existing) throw new Error('Transaksi tidak ditemukan.')
  if (existing.type !== 'expense') throw new Error('Transaksi ini bukan pengeluaran.')

  const data = validate(updateExpenseSchema, {
    wallet_id: walletId,
    category_id: categoryId,
    amount,
    transaction_date: transactionDate,
    note,
  })

  if (data.category_id) {
    const category = await categoryRepo.getCategoryById(data.category_id)
    if (!category) throw new Error('Kategori tidak ditemukan.')
  }

  await transactionRepo.updateTransaction(id, {
    wallet_id: data.wallet_id,
    amount: data.amount,
    category_id: data.category_id ?? null,
    transaction_date: data.transaction_date,
    note: data.note ?? null,
  })
}
