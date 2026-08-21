import * as walletRepo from '@/features/finance/repositories/walletRepository'
import * as transactionRepo from '@/features/finance/repositories/transactionRepository'
import { createWalletSchema, updateWalletSchema } from '@/features/finance/schemas/walletSchema'
import { validate } from '@/lib/validation'
import type { Wallet, WalletWithBalance } from '@/types'

export async function getWalletsWithBalance(userId: string): Promise<WalletWithBalance[]> {
  const wallets = await walletRepo.listActiveWallets(userId)
  const result: WalletWithBalance[] = []

  for (const wallet of wallets) {
    const balance = await calculateBalance(wallet)
    result.push({ ...wallet, balance })
  }

  return result
}

export async function getAllWalletsWithBalance(userId: string): Promise<WalletWithBalance[]> {
  const wallets = await walletRepo.listWallets(userId)
  const result: WalletWithBalance[] = []

  for (const wallet of wallets) {
    const balance = await calculateBalance(wallet)
    result.push({ ...wallet, balance })
  }

  return result
}

export async function getWalletById(id: string): Promise<Wallet | undefined> {
  return walletRepo.getWalletById(id)
}

export async function getWalletWithBalance(id: string): Promise<WalletWithBalance | undefined> {
  const wallet = await walletRepo.getWalletById(id)
  if (!wallet) return undefined
  const balance = await calculateBalance(wallet)
  return { ...wallet, balance }
}

export async function createWallet(
  userId: string,
  name: string,
  type: string,
  initialBalance: number,
  note?: string
): Promise<string> {
  const data = validate(createWalletSchema, { name, type, initial_balance: initialBalance, note })

  return walletRepo.createWallet({
    user_id: userId,
    name: data.name,
    type: data.type,
    initial_balance: data.initial_balance,
    note: data.note ?? null,
    is_active: true,
  })
}

export async function updateWallet(
  id: string,
  data: Partial<Pick<Wallet, 'name' | 'type' | 'initial_balance' | 'note' | 'is_active'>>
): Promise<void> {
  const parsed = validate(updateWalletSchema, {
    name: data.name,
    type: data.type,
    initial_balance: data.initial_balance,
    note: data.note ?? undefined,
  })

  const updateData: Partial<
    Pick<Wallet, 'name' | 'type' | 'initial_balance' | 'note' | 'is_active'>
  > = {}
  if (parsed.name !== undefined) updateData.name = parsed.name
  if (parsed.type !== undefined) updateData.type = parsed.type
  if (parsed.initial_balance !== undefined) updateData.initial_balance = parsed.initial_balance
  if (data.note !== undefined) updateData.note = parsed.note ?? null
  if (data.is_active !== undefined) updateData.is_active = data.is_active

  return walletRepo.updateWallet(id, updateData)
}

export async function deactivateWallet(id: string): Promise<void> {
  return walletRepo.updateWallet(id, { is_active: false })
}

export async function activateWallet(id: string): Promise<void> {
  return walletRepo.updateWallet(id, { is_active: true })
}

export async function removeWallet(id: string): Promise<void> {
  const wallet = await walletRepo.getWalletById(id)
  if (!wallet) return

  const transactions = await transactionRepo.listTransactionsByWallet(id)
  const hasNonTransfer = transactions.some(
    t => t.type !== 'transfer_in' && t.type !== 'transfer_out'
  )
  if (hasNonTransfer) {
    throw new Error('Dompet memiliki riwayat transaksi dan tidak dapat dihapus.')
  }

  return walletRepo.deleteWallet(id)
}

export async function calculateBalance(wallet: Wallet): Promise<number> {
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

export async function getTotalBalance(userId: string): Promise<number> {
  const wallets = await getWalletsWithBalance(userId)
  return wallets.reduce((sum, w) => sum + w.balance, 0)
}
