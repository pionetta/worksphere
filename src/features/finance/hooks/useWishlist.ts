import { useState, useEffect, useCallback } from 'react'
import * as wishlistService from '../services/wishlistService'
import type { WishlistItem, WishlistPeriod, WishlistPriority, WishlistStatus } from '@/types'

export function useWishlist(userId: string | null) {
  const [items, setItems] = useState<WishlistItem[]>([])
  const [summary, setSummary] = useState<wishlistService.WishlistSummary>({
    totalEstimated: 0,
    totalAchieved: 0,
    pendingCount: 0,
    achievedCount: 0,
    weeklyTotal: 0,
    monthlyTotal: 0,
    yearlyTotal: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    if (!userId) {
      setItems([])
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const [list, sum] = await Promise.all([
        wishlistService.getAllWishlists(userId),
        wishlistService.getWishlistSummary(userId),
      ])
      setItems(list)
      setSummary(sum)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memuat wishlist')
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    refresh()

    const handleSync = (e: Event) => {
      const detail = (e as CustomEvent).detail
      if (!detail || !detail.table || detail.table === 'wishlists' || detail.type === 'full-pull') {
        refresh()
      }
    }
    window.addEventListener('worksphere-data-synced', handleSync)
    return () => window.removeEventListener('worksphere-data-synced', handleSync)
  }, [refresh])

  const addItem = useCallback(
    async (data: {
      title: string
      estimated_price: number
      period: WishlistPeriod
      priority?: WishlistPriority
      target_date?: string | null
      url?: string | null
      note?: string | null
    }) => {
      if (!userId) return
      const res = await wishlistService.addWishlist(userId, data)
      await refresh()
      return res
    },
    [userId, refresh]
  )

  const updateItem = useCallback(
    async (
      id: string,
      data: Partial<
        Pick<
          WishlistItem,
          'title' | 'estimated_price' | 'period' | 'priority' | 'target_date' | 'url' | 'note' | 'status'
        >
      >
    ) => {
      await wishlistService.updateWishlist(id, data)
      await refresh()
    },
    [refresh]
  )

  const toggleAchieved = useCallback(
    async (id: string, currentStatus: WishlistStatus) => {
      await wishlistService.toggleWishlistAchieved(id, currentStatus)
      await refresh()
    },
    [refresh]
  )

  const deleteItem = useCallback(
    async (id: string) => {
      await wishlistService.deleteWishlist(id)
      await refresh()
    },
    [refresh]
  )

  return {
    items,
    summary,
    loading,
    error,
    refresh,
    addItem,
    updateItem,
    toggleAchieved,
    deleteItem,
  }
}
