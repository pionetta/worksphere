import { useState, useEffect, useCallback } from 'react'
import * as walletService from '@/features/finance/services/walletService'
import type { WalletWithBalance, Wallet, WalletType } from '@/types'

export function useWallets(userId: string | null) {
  const [wallets, setWallets] = useState<WalletWithBalance[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(
    async (silent = false) => {
      if (!userId) return
      if (!silent) {
        setLoading(true)
      }
      setError(null)
      try {
        const data = await walletService.getWalletsWithBalance(userId)
        setWallets(data)
      } catch {
        setError('Gagal memuat data dompet. Silakan coba lagi.')
      } finally {
        setLoading(false)
      }
    },
    [userId]
  )

  useEffect(() => {
    refresh(false)

    const handleSync = (e: Event) => {
      const detail = (e as CustomEvent).detail
      if (!detail || !detail.table || detail.table === 'wallets' || detail.type === 'full-pull') {
        refresh(true)
      }
    }
    window.addEventListener('worksphere-data-synced', handleSync)
    return () => window.removeEventListener('worksphere-data-synced', handleSync)
  }, [refresh])

  const createWallet = useCallback(
    async (name: string, type: WalletType, initialBalance: number, note?: string) => {
      if (!userId) return
      await walletService.createWallet(userId, name, type, initialBalance, note)
      await refresh()
    },
    [userId, refresh]
  )

  const editWallet = useCallback(
    async (
      id: string,
      data: Partial<Pick<Wallet, 'name' | 'type' | 'initial_balance' | 'note' | 'is_active'>>
    ) => {
      await walletService.updateWallet(id, data)
      await refresh()
    },
    [refresh]
  )

  const deactivateWallet = useCallback(
    async (id: string) => {
      await walletService.deactivateWallet(id)
      await refresh()
    },
    [refresh]
  )

  const activateWallet = useCallback(
    async (id: string) => {
      await walletService.activateWallet(id)
      await refresh()
    },
    [refresh]
  )

  const removeWallet = useCallback(
    async (id: string) => {
      await walletService.removeWallet(id)
      await refresh()
    },
    [refresh]
  )

  return {
    wallets,
    loading,
    error,
    refresh,
    createWallet,
    editWallet,
    deactivateWallet,
    activateWallet,
    removeWallet,
  }
}
