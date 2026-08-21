import * as walletRepo from '@/features/finance/repositories/walletRepository'
import * as transactionRepo from '@/features/finance/repositories/transactionRepository'
import type { Wallet, WalletWithBalance } from '@/types'

export async function calculateWalletBalance(wallet: Wallet): Promise<number> {
  const transactions = await transactionRepo.listTransactionsByWallet(wallet.id)

  let balance = wallet.initial_balance
  for (const t of transactions) {
    switch (t.type) {
      case 'income':
        balance += t.amount
        break
      case 'expense':
        balance -= t.amount
        break
      case 'transfer_in':
        balance += t.amount
        break
      case 'transfer_out':
        balance -= t.amount
        break
      case 'adjustment':
        balance += t.amount
        break
    }
  }

  return balance
}

export async function getWalletBalance(walletId: string): Promise<number> {
  const wallet = await walletRepo.getWalletById(walletId)
  if (!wallet) return 0
  return calculateWalletBalance(wallet)
}

export async function getAllWalletBalances(userId: string): Promise<WalletWithBalance[]> {
  const wallets = await walletRepo.listActiveWallets(userId)
  const result: WalletWithBalance[] = []

  for (const wallet of wallets) {
    const balance = await calculateWalletBalance(wallet)
    result.push({ ...wallet, balance })
  }

  return result
}

export async function getTotalBalance(userId: string): Promise<number> {
  const wallets = await getAllWalletBalances(userId)
  return wallets.reduce((sum, w) => sum + w.balance, 0)
}
