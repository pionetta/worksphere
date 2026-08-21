import { describe, it, expect, beforeEach } from 'vitest'
import { db } from '@/lib/db'
import * as categoryService from '@/features/finance/services/categoryService'

const userId = 'test-user-category-service'

beforeEach(async () => {
  await db.categories.clear()
  await db.sync_queue.clear()
})

describe('categoryService', () => {
  describe('createCategory', () => {
    it('should create an expense category', async () => {
      const id = await categoryService.createCategory(userId, 'Makanan', 'expense')
      expect(id).toBeTruthy()
      const category = await db.categories.get(id)
      expect(category).toBeDefined()
      expect(category!.name).toBe('Makanan')
      expect(category!.type).toBe('expense')
      expect(category!.is_active).toBe(true)
    })

    it('should create an income category', async () => {
      const id = await categoryService.createCategory(userId, 'Gaji', 'income')
      const category = await db.categories.get(id)
      expect(category!.type).toBe('income')
    })

    it('should queue sync', async () => {
      await categoryService.createCategory(userId, 'Transport', 'expense')
      const queue = await db.sync_queue.where('entity').equals('category').toArray()
      expect(queue).toHaveLength(1)
      expect(queue[0].operation).toBe('create')
    })

    it('should reject empty name', async () => {
      await expect(categoryService.createCategory(userId, '', 'expense')).rejects.toThrow()
    })
  })

  describe('getCategoriesByType', () => {
    it('should return only expense categories', async () => {
      await categoryService.createCategory(userId, 'Makanan', 'expense')
      await categoryService.createCategory(userId, 'Transport', 'expense')
      await categoryService.createCategory(userId, 'Gaji', 'income')
      const expenses = await categoryService.getCategoriesByType(userId, 'expense')
      expect(expenses).toHaveLength(2)
      expenses.forEach(c => expect(c.type).toBe('expense'))
    })
  })

  describe('removeCategory', () => {
    it('should delete a category', async () => {
      const id = await categoryService.createCategory(userId, 'ToDelete', 'expense')
      await categoryService.removeCategory(id)
      const cat = await db.categories.get(id)
      expect(cat).toBeUndefined()
    })
  })

  describe('user isolation', () => {
    it('should not return categories from other users', async () => {
      await categoryService.createCategory(userId, 'My Category', 'expense')
      await categoryService.createCategory('other-user', 'Other Category', 'expense')
      const cats = await categoryService.getAllCategories(userId)
      expect(cats).toHaveLength(1)
    })
  })
})
