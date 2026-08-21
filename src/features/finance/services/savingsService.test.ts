import { describe, it, expect, beforeEach } from 'vitest'
import { db } from '@/lib/db'
import * as savingsService from '@/features/finance/services/savingsService'

const userId = 'test-user-savings-service'

beforeEach(async () => {
  await db.savings_goals.clear()
  await db.sync_queue.clear()
})

describe('savingsService', () => {
  describe('createSavingsGoal', () => {
    it('should create a savings goal', async () => {
      const id = await savingsService.createSavingsGoal(userId, 'Dana Darurat', 10000000)
      expect(id).toBeTruthy()
      const goal = await db.savings_goals.get(id)
      expect(goal).toBeDefined()
      expect(goal!.name).toBe('Dana Darurat')
      expect(goal!.target_amount).toBe(10000000)
      expect(goal!.current_amount).toBe(0)
    })

    it('should queue sync', async () => {
      await savingsService.createSavingsGoal(userId, 'Tabungan', 5000000)
      const queue = await db.sync_queue.where('entity').equals('savings_goal').toArray()
      expect(queue).toHaveLength(1)
      expect(queue[0].operation).toBe('create')
    })

    it('should reject empty name', async () => {
      await expect(savingsService.createSavingsGoal(userId, '', 10000000)).rejects.toThrow()
    })

    it('should reject target <= 0', async () => {
      await expect(savingsService.createSavingsGoal(userId, 'Goal', 0)).rejects.toThrow()
    })

    it('should store deadline', async () => {
      const id = await savingsService.createSavingsGoal(userId, 'Goal', 5000000, '2026-12-31')
      const goal = await db.savings_goals.get(id)
      expect(goal!.deadline).toBe('2026-12-31')
    })
  })

  describe('addToSavings', () => {
    it('should increase current amount', async () => {
      const id = await savingsService.createSavingsGoal(userId, 'Goal', 10000000)
      await savingsService.addToSavings(id, 1000000)
      const goal = await db.savings_goals.get(id)
      expect(goal!.current_amount).toBe(1000000)
    })

    it('should accumulate multiple additions', async () => {
      const id = await savingsService.createSavingsGoal(userId, 'Goal', 10000000)
      await savingsService.addToSavings(id, 500000)
      await savingsService.addToSavings(id, 300000)
      const goal = await db.savings_goals.get(id)
      expect(goal!.current_amount).toBe(800000)
    })

    it('should reject amount <= 0', async () => {
      const id = await savingsService.createSavingsGoal(userId, 'Goal', 10000000)
      await expect(savingsService.addToSavings(id, 0)).rejects.toThrow()
    })
  })

  describe('calculateProgress', () => {
    it('should calculate progress percentage', () => {
      expect(savingsService.calculateProgress(500000, 1000000)).toBe(50)
    })

    it('should cap at 100%', () => {
      expect(savingsService.calculateProgress(1500000, 1000000)).toBe(100)
    })

    it('should handle zero target', () => {
      expect(savingsService.calculateProgress(100, 0)).toBe(0)
    })

    it('should handle zero current', () => {
      expect(savingsService.calculateProgress(0, 1000000)).toBe(0)
    })
  })

  describe('user isolation', () => {
    it('should not return goals from other users', async () => {
      await savingsService.createSavingsGoal(userId, 'My Goal', 5000000)
      await savingsService.createSavingsGoal('other-user', 'Other Goal', 10000000)
      const goals = await savingsService.getSavingsGoals(userId)
      expect(goals).toHaveLength(1)
      expect(goals[0].name).toBe('My Goal')
    })
  })
})
