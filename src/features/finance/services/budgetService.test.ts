import { describe, it, expect, beforeEach } from 'vitest'
import { db } from '@/lib/db'
import * as categoryService from '@/features/finance/services/categoryService'
import * as budgetService from '@/features/finance/services/budgetService'

const userId = 'test-user-budget-service'
let expenseCategoryId: string
let incomeCategoryId: string

beforeEach(async () => {
  await db.categories.clear()
  await db.budgets.clear()
  await db.sync_queue.clear()

  expenseCategoryId = await categoryService.createCategory(userId, 'Makanan', 'expense')
  incomeCategoryId = await categoryService.createCategory(userId, 'Gaji', 'income')
})

describe('budgetService', () => {
  describe('createBudget', () => {
    it('should create a budget for expense category', async () => {
      const id = await budgetService.createBudget(userId, expenseCategoryId, 500000, 8, 2026)
      expect(id).toBeTruthy()
      const budget = await db.budgets.get(id)
      expect(budget).toBeDefined()
      expect(budget!.amount).toBe(500000)
      expect(budget!.month).toBe(8)
      expect(budget!.year).toBe(2026)
    })

    it('should queue sync', async () => {
      await budgetService.createBudget(userId, expenseCategoryId, 500000, 8, 2026)
      const queue = await db.sync_queue.where('entity').equals('budget').toArray()
      expect(queue).toHaveLength(1)
      expect(queue[0].operation).toBe('create')
    })

    it('should reject income category for budget', async () => {
      await expect(
        budgetService.createBudget(userId, incomeCategoryId, 500000, 8, 2026)
      ).rejects.toThrow()
    })

    it('should reject duplicate budget for same category and month', async () => {
      await budgetService.createBudget(userId, expenseCategoryId, 500000, 8, 2026)
      await expect(
        budgetService.createBudget(userId, expenseCategoryId, 300000, 8, 2026)
      ).rejects.toThrow()
    })

    it('should reject amount <= 0', async () => {
      await expect(
        budgetService.createBudget(userId, expenseCategoryId, 0, 8, 2026)
      ).rejects.toThrow()
    })

    it('should allow same category in different months', async () => {
      await budgetService.createBudget(userId, expenseCategoryId, 500000, 8, 2026)
      const id = await budgetService.createBudget(userId, expenseCategoryId, 300000, 9, 2026)
      expect(id).toBeTruthy()
    })
  })

  describe('updateBudget', () => {
    it('should update budget amount', async () => {
      const id = await budgetService.createBudget(userId, expenseCategoryId, 500000, 8, 2026)
      await budgetService.updateBudget(id, { amount: 600000 })
      const budget = await db.budgets.get(id)
      expect(budget!.amount).toBe(600000)
    })
  })

  describe('removeBudget', () => {
    it('should delete budget', async () => {
      const id = await budgetService.createBudget(userId, expenseCategoryId, 500000, 8, 2026)
      await budgetService.removeBudget(id)
      const budget = await db.budgets.get(id)
      expect(budget).toBeUndefined()
    })
  })

  describe('user isolation', () => {
    it('should not return budgets from other users', async () => {
      await budgetService.createBudget(userId, expenseCategoryId, 500000, 8, 2026)
      const otherCatId = await categoryService.createCategory('other-user', 'Makanan', 'expense')
      await budgetService.createBudget('other-user', otherCatId, 300000, 8, 2026)
      const budgets = await budgetService.getBudgetsByMonth(userId, 8, 2026)
      expect(budgets).toHaveLength(1)
    })
  })
})
