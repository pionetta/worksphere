import { useState, useEffect } from 'react'
import * as walletService from '@/features/finance/services/walletService'
import * as transferService from '@/features/finance/services/transferService'
import { TransferForm } from '@/features/finance/components/TransferForm'
import { LoadingState } from '@/components/ui/LoadingState'
import { EmptyState } from '@/components/ui/EmptyState'
import type { WalletWithBalance } from '@/types'

interface TransferQuickActionProps {
  userId: string
  onSuccess: () => void
  onCancel: () => void
}

export function TransferQuickAction({ userId, onSuccess, onCancel }: TransferQuickActionProps) {
  const [wallets, setWallets] = useState<WalletWithBalance[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)
      const w = await walletService.getWalletsWithBalance(userId)
      setWallets(w)
      setLoading(false)
    }
    load()
  }, [userId])

  if (loading) return <LoadingState text="Memuat dompet..." />

  if (wallets.length < 2) {
    return (
      <EmptyState
        title="Minimal 2 dompet"
        description="Buat minimal 2 dompet untuk melakukan transfer."
      />
    )
  }

  return (
    <TransferForm
      wallets={wallets}
      onSubmit={async (sourceWalletId, targetWalletId, amount, date, note) => {
        await transferService.createTransfer(
          userId,
          sourceWalletId,
          targetWalletId,
          amount,
          date,
          note ?? undefined
        )
        onSuccess()
      }}
      onCancel={onCancel}
    />
  )
}
