import * as transactionRepo from '@/features/finance/repositories/transactionRepository'
import * as walletBalanceService from './walletBalanceService'

export interface FinanceSummary {
  totalBalance: number
  totalIncome: number
  totalExpense: number
  netIncome: number
  transactionCount: number
}

export async function getFinanceSummary(userId: string): Promise<FinanceSummary> {
  const totalBalance = await walletBalanceService.getTotalBalance(userId)
  const transactions = await transactionRepo.listTransactions(userId)

  let totalIncome = 0
  let totalExpense = 0

  for (const t of transactions) {
    if (t.type === 'income') totalIncome += t.amount
    if (t.type === 'expense') totalExpense += t.amount
  }

  return {
    totalBalance,
    totalIncome,
    totalExpense,
    netIncome: totalIncome - totalExpense,
    transactionCount: transactions.length,
  }
}

export async function getFinanceSummaryByMonth(
  userId: string,
  month: number,
  year: number
): Promise<FinanceSummary> {
  const startDate = `${year}-${String(month).padStart(2, '0')}-01`
  const lastDay = new Date(year, month, 0).getDate()
  const endDate = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`

  const totalBalance = await walletBalanceService.getTotalBalance(userId)
  const transactions = await transactionRepo.listTransactionsByDateRange(userId, startDate, endDate)

  let totalIncome = 0
  let totalExpense = 0

  for (const t of transactions) {
    if (t.type === 'income') totalIncome += t.amount
    if (t.type === 'expense') totalExpense += t.amount
  }

  return {
    totalBalance,
    totalIncome,
    totalExpense,
    netIncome: totalIncome - totalExpense,
    transactionCount: transactions.length,
  }
}
