import { describe, it, expect, beforeEach } from 'vitest'
import { db } from '@/lib/db'
import * as wishlistService from './wishlistService'

describe('wishlistService', () => {
  const userId = 'user-wishlist-test-1'

  beforeEach(async () => {
    await db.wishlists.clear()
  })

  it('should add wishlist item and retrieve it', async () => {
    const item = await wishlistService.addWishlist(userId, {
      title: 'Buku Pemrograman',
      estimated_price: 150000,
      period: 'weekly',
      priority: 'high',
      note: 'Buku TypeScript Pro',
    })

    expect(item.id).toBeDefined()
    expect(item.title).toBe('Buku Pemrograman')
    expect(item.status).toBe('pending')

    const all = await wishlistService.getAllWishlists(userId)
    expect(all).toHaveLength(1)
    expect(all[0].title).toBe('Buku Pemrograman')
  })

  it('should filter wishlist by period', async () => {
    await wishlistService.addWishlist(userId, {
      title: 'Headphone',
      estimated_price: 500000,
      period: 'monthly',
    })
    await wishlistService.addWishlist(userId, {
      title: 'MacBook M3',
      estimated_price: 20000000,
      period: 'yearly',
    })

    const monthly = await wishlistService.getWishlistsByPeriod(userId, 'monthly')
    expect(monthly).toHaveLength(1)
    expect(monthly[0].title).toBe('Headphone')

    const yearly = await wishlistService.getWishlistsByPeriod(userId, 'yearly')
    expect(yearly).toHaveLength(1)
    expect(yearly[0].title).toBe('MacBook M3')
  })

  it('should toggle achieved status', async () => {
    const item = await wishlistService.addWishlist(userId, {
      title: 'Monitor 4K',
      estimated_price: 4000000,
      period: 'monthly',
    })

    await wishlistService.toggleWishlistAchieved(item.id, 'pending')
    let all = await wishlistService.getAllWishlists(userId)
    expect(all[0].status).toBe('achieved')
    expect(all[0].achieved_at).toBeDefined()

    await wishlistService.toggleWishlistAchieved(item.id, 'achieved')
    all = await wishlistService.getAllWishlists(userId)
    expect(all[0].status).toBe('pending')
    expect(all[0].achieved_at).toBeNull()
  })

  it('should calculate summary correctly', async () => {
    await wishlistService.addWishlist(userId, {
      title: 'Mouse',
      estimated_price: 200000,
      period: 'weekly',
    })
    await wishlistService.addWishlist(userId, {
      title: 'Keyboard',
      estimated_price: 800000,
      period: 'monthly',
    })
    const yearly = await wishlistService.addWishlist(userId, {
      title: 'Laptop',
      estimated_price: 15000000,
      period: 'yearly',
    })

    await wishlistService.toggleWishlistAchieved(yearly.id, 'pending')

    const summary = await wishlistService.getWishlistSummary(userId)
    expect(summary.pendingCount).toBe(2)
    expect(summary.achievedCount).toBe(1)
    expect(summary.totalEstimated).toBe(1000000) // 200k + 800k
    expect(summary.totalAchieved).toBe(15000000)
    expect(summary.weeklyTotal).toBe(200000)
    expect(summary.monthlyTotal).toBe(800000)
  })
})
