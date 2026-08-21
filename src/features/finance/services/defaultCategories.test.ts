import { describe, it, expect, beforeEach } from 'vitest'
import { db } from '@/lib/db'
import * as categoryService from '@/features/finance/services/categoryService'

const userId = 'test-user-default-categories'

beforeEach(async () => {
  await db.categories.clear()
  await db.sync_queue.clear()
})

describe('Default Categories', () => {
  describe('initializeDefaultCategories', () => {
    it('should create default income categories', async () => {
      await categoryService.initializeDefaultCategories(userId)
      const cats = await categoryService.getCategoriesByType(userId, 'income')
      expect(cats.length).toBeGreaterThanOrEqual(5)
      const names = cats.map(c => c.name)
      expect(names).toContain('Gaji')
      expect(names).toContain('Bonus')
      expect(names).toContain('Freelance')
      expect(names).toContain('Hadiah')
      expect(names).toContain('Lainnya')
    })

    it('should create default expense categories', async () => {
      await categoryService.initializeDefaultCategories(userId)
      const cats = await categoryService.getCategoriesByType(userId, 'expense')
      expect(cats.length).toBeGreaterThanOrEqual(8)
      const names = cats.map(c => c.name)
      expect(names).toContain('Makanan')
      expect(names).toContain('Transportasi')
      expect(names).toContain('Belanja')
      expect(names).toContain('Tagihan')
      expect(names).toContain('Hiburan')
      expect(names).toContain('Kesehatan')
      expect(names).toContain('Pendidikan')
      expect(names).toContain('Lainnya')
    })

    it('should be idempotent — calling twice does not create duplicates', async () => {
      await categoryService.initializeDefaultCategories(userId)
      const countBefore = (await categoryService.getAllCategories(userId)).length
      await categoryService.initializeDefaultCategories(userId)
      const countAfter = (await categoryService.getAllCategories(userId)).length
      expect(countAfter).toBe(countBefore)
    })

    it('should not overwrite existing categories with same name', async () => {
      await categoryService.createCategory(userId, 'Gaji', 'income')
      await categoryService.initializeDefaultCategories(userId)
      const cats = await categoryService.getCategoriesByType(userId, 'income')
      const gajiCats = cats.filter(c => c.name === 'Gaji')
      expect(gajiCats).toHaveLength(1)
    })

    it('should create categories for offline use (IndexedDB)', async () => {
      await categoryService.initializeDefaultCategories(userId)
      const cats = await db.categories.where('user_id').equals(userId).toArray()
      expect(cats.length).toBeGreaterThanOrEqual(13)
      cats.forEach(c => {
        expect(c.is_active).toBe(true)
        expect(c.user_id).toBe(userId)
      })
    })

    it('should queue sync for each created category', async () => {
      await categoryService.initializeDefaultCategories(userId)
      const queue = await db.sync_queue.where('entity').equals('category').toArray()
      expect(queue.length).toBeGreaterThanOrEqual(13)
      queue.forEach(item => {
        expect(item.operation).toBe('create')
        expect(item.status).toBe('pending')
      })
    })

    it('should initialize for different users independently', async () => {
      await categoryService.initializeDefaultCategories(userId)
      await categoryService.initializeDefaultCategories('other-user')
      const userCats = await categoryService.getAllCategories(userId)
      const otherCats = await categoryService.getAllCategories('other-user')
      expect(userCats.length).toBeGreaterThanOrEqual(13)
      expect(otherCats.length).toBeGreaterThanOrEqual(13)
    })
  })

  describe('hasDefaultCategories', () => {
    it('should return false when no categories exist', async () => {
      const result = await categoryService.hasDefaultCategories(userId)
      expect(result).toBe(false)
    })

    it('should return true after initialization', async () => {
      await categoryService.initializeDefaultCategories(userId)
      const result = await categoryService.hasDefaultCategories(userId)
      expect(result).toBe(true)
    })
  })
})
