import { describe, it, expect, vi, beforeEach } from 'vitest'
import * as reminderService from '@/features/todo/services/reminderService'

beforeEach(() => {
  vi.useFakeTimers()
  reminderService.clearAllReminders()
})

describe('reminderService', () => {
  describe('requestPermission', () => {
    it('should request permission only after user action', async () => {
      const mockRequestPermission = vi.fn().mockResolvedValue('granted')
      Object.defineProperty(globalThis, 'Notification', {
        value: {
          permission: 'default',
          requestPermission: mockRequestPermission,
        },
        writable: true,
        configurable: true,
      })

      const result = await reminderService.requestPermission()
      expect(mockRequestPermission).toHaveBeenCalled()
      expect(result).toBe('granted')
    })

    it('should return granted if already granted', async () => {
      Object.defineProperty(globalThis, 'Notification', {
        value: {
          permission: 'granted',
          requestPermission: vi.fn(),
        },
        writable: true,
        configurable: true,
      })

      const result = await reminderService.requestPermission()
      expect(result).toBe('granted')
    })

    it('should return denied if permission denied', async () => {
      Object.defineProperty(globalThis, 'Notification', {
        value: {
          permission: 'denied',
          requestPermission: vi.fn(),
        },
        writable: true,
        configurable: true,
      })

      const result = await reminderService.requestPermission()
      expect(result).toBe('denied')
    })
  })

  describe('getPermissionStatus', () => {
    it('should return current permission status', () => {
      Object.defineProperty(globalThis, 'Notification', {
        value: { permission: 'granted' },
        writable: true,
        configurable: true,
      })
      expect(reminderService.getPermissionStatus()).toBe('granted')
    })

    it('should return denied when Notification not available', () => {
      const original = window.Notification
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (window as any).Notification
      expect(reminderService.getPermissionStatus()).toBe('denied')
      window.Notification = original
    })
  })

  describe('isReminderDue', () => {
    it('should return true for past reminder', () => {
      expect(reminderService.isReminderDue('2020-01-01T00:00:00Z')).toBe(true)
    })

    it('should return false for future reminder', () => {
      expect(reminderService.isReminderDue('2099-01-01T00:00:00Z')).toBe(false)
    })
  })

  describe('scheduleReminder', () => {
    it('should fire notification when reminder is due', () => {
      const mockNotification = vi.fn()
      Object.defineProperty(globalThis, 'Notification', {
        value: mockNotification,
        writable: true,
        configurable: true,
      })

      // Set notification permission
      Object.defineProperty(globalThis, 'Notification', {
        value: Object.assign(mockNotification, { permission: 'granted' }),
        writable: true,
        configurable: true,
      })

      const futureTime = new Date(Date.now() + 5000).toISOString()
      reminderService.scheduleReminder('task-1', futureTime, 'Test Task')

      vi.advanceTimersByTime(5000)
      expect(mockNotification).toHaveBeenCalledWith('Pengingat Tugas', { body: 'Test Task' })
    })

    it('should not fire after clearReminder', () => {
      const mockNotification = vi.fn()
      Object.defineProperty(globalThis, 'Notification', {
        value: Object.assign(mockNotification, { permission: 'granted' }),
        writable: true,
        configurable: true,
      })

      const futureTime = new Date(Date.now() + 5000).toISOString()
      reminderService.scheduleReminder('task-1', futureTime, 'Test Task')
      reminderService.clearReminder('task-1')

      vi.advanceTimersByTime(5000)
      expect(mockNotification).not.toHaveBeenCalled()
    })

    it('should clear all reminders', () => {
      const mockNotification = vi.fn()
      Object.defineProperty(globalThis, 'Notification', {
        value: Object.assign(mockNotification, { permission: 'granted' }),
        writable: true,
        configurable: true,
      })

      const futureTime = new Date(Date.now() + 5000).toISOString()
      reminderService.scheduleReminder('task-1', futureTime, 'Task 1')
      reminderService.scheduleReminder('task-2', futureTime, 'Task 2')
      reminderService.clearAllReminders()

      vi.advanceTimersByTime(5000)
      expect(mockNotification).not.toHaveBeenCalled()
    })
  })
})
