import { db } from '@/lib/db'
import type { WishlistItem, WishlistPeriod, WishlistPriority, WishlistStatus } from '@/types'

export async function getAllWishlists(userId: string): Promise<WishlistItem[]> {
  const items = await db.wishlists.where('user_id').equals(userId).toArray()
  return items.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
}

export async function getWishlistsByPeriod(
  userId: string,
  period: WishlistPeriod
): Promise<WishlistItem[]> {
  const items = await db.wishlists
    .where('user_id')
    .equals(userId)
    .and(item => item.period === period)
    .toArray()
  return items.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
}

export async function addWishlist(
  userId: string,
  data: {
    title: string
    estimated_price: number
    period: WishlistPeriod
    priority?: WishlistPriority
    target_date?: string | null
    url?: string | null
    note?: string | null
  }
): Promise<WishlistItem> {
  const now = new Date().toISOString()
  const item: WishlistItem = {
    id: crypto.randomUUID(),
    user_id: userId,
    title: data.title.trim(),
    estimated_price: Math.max(0, data.estimated_price),
    period: data.period,
    priority: data.priority ?? 'medium',
    target_date: data.target_date ?? null,
    url: data.url?.trim() || null,
    note: data.note?.trim() || null,
    status: 'pending',
    achieved_at: null,
    created_at: now,
    updated_at: now,
  }

  await db.wishlists.add(item)
  return item
}

export async function updateWishlist(
  id: string,
  data: Partial<
    Pick<
      WishlistItem,
      'title' | 'estimated_price' | 'period' | 'priority' | 'target_date' | 'url' | 'note' | 'status'
    >
  >
): Promise<void> {
  const now = new Date().toISOString()
  const updates: Partial<WishlistItem> = {
    ...data,
    updated_at: now,
  }

  if (data.status === 'achieved') {
    updates.achieved_at = now
  } else if (data.status === 'pending') {
    updates.achieved_at = null
  }

  await db.wishlists.update(id, updates)
}

export async function toggleWishlistAchieved(id: string, currentStatus: WishlistStatus): Promise<void> {
  const nextStatus: WishlistStatus = currentStatus === 'achieved' ? 'pending' : 'achieved'
  await updateWishlist(id, { status: nextStatus })
}

export async function deleteWishlist(id: string): Promise<void> {
  await db.wishlists.delete(id)
}

export interface WishlistSummary {
  totalEstimated: number
  totalAchieved: number
  pendingCount: number
  achievedCount: number
  weeklyTotal: number
  monthlyTotal: number
  yearlyTotal: number
}

export async function getWishlistSummary(userId: string): Promise<WishlistSummary> {
  const items = await getAllWishlists(userId)

  let totalEstimated = 0
  let totalAchieved = 0
  let pendingCount = 0
  let achievedCount = 0
  let weeklyTotal = 0
  let monthlyTotal = 0
  let yearlyTotal = 0

  for (const item of items) {
    if (item.status === 'achieved') {
      totalAchieved += item.estimated_price
      achievedCount++
    } else {
      totalEstimated += item.estimated_price
      pendingCount++

      if (item.period === 'weekly') weeklyTotal += item.estimated_price
      if (item.period === 'monthly') monthlyTotal += item.estimated_price
      if (item.period === 'yearly') yearlyTotal += item.estimated_price
    }
  }

  return {
    totalEstimated,
    totalAchieved,
    pendingCount,
    achievedCount,
    weeklyTotal,
    monthlyTotal,
    yearlyTotal,
  }
}
