import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  isNotificationSupported,
  getNotificationPermission,
  requestNotificationPermission,
  sendPushNotification,
  sendTestNotification,
  sendBudgetAlert,
  sendDebtDueAlert,
  sendAttendanceMorningReminder,
} from './notifications'

describe('notifications engine', () => {
  const originalNotification = globalThis.Notification

  beforeEach(() => {
    vi.restoreAllMocks()
  })

  afterEach(() => {
    globalThis.Notification = originalNotification
  })

  it('should detect if Notification API is supported', () => {
    globalThis.Notification = {
      permission: 'default',
      requestPermission: vi.fn(),
    } as any

    expect(isNotificationSupported()).toBe(true)
  })

  it('should return current permission status', () => {
    // Mock Notification
    globalThis.Notification = {
      permission: 'granted',
      requestPermission: vi.fn().mockResolvedValue('granted'),
    } as any

    expect(getNotificationPermission()).toBe('granted')
  })

  it('should request permission and return granted', async () => {
    const mockRequest = vi.fn().mockResolvedValue('granted')
    globalThis.Notification = {
      permission: 'default',
      requestPermission: mockRequest,
    } as any

    const res = await requestNotificationPermission()
    expect(res).toBe('granted')
  })

  it('should send push notification when permission is granted', async () => {
    const mockConstructor = vi.fn()
    globalThis.Notification = Object.assign(mockConstructor, {
      permission: 'granted',
      requestPermission: vi.fn().mockResolvedValue('granted'),
    }) as any

    const success = await sendPushNotification('Test Title', { body: 'Test Message' })
    expect(success).toBe(true)
    expect(mockConstructor).toHaveBeenCalledWith(
      'Test Title',
      expect.objectContaining({
        body: 'Test Message',
      })
    )
  })

  it('should trigger test notification', async () => {
    const mockConstructor = vi.fn()
    globalThis.Notification = Object.assign(mockConstructor, {
      permission: 'granted',
      requestPermission: vi.fn().mockResolvedValue('granted'),
    }) as any

    const success = await sendTestNotification()
    expect(success).toBe(true)
    expect(mockConstructor).toHaveBeenCalledWith(
      expect.stringContaining('WorkSphere'),
      expect.any(Object)
    )
  })

  it('should send budget alert when percentage is 80% or 100%', async () => {
    const mockConstructor = vi.fn()
    globalThis.Notification = Object.assign(mockConstructor, {
      permission: 'granted',
      requestPermission: vi.fn().mockResolvedValue('granted'),
    }) as any

    const res80 = await sendBudgetAlert('Makanan', 85)
    expect(res80).toBe(true)

    const res100 = await sendBudgetAlert('Makanan', 110)
    expect(res100).toBe(true)

    const resLow = await sendBudgetAlert('Makanan', 50)
    expect(resLow).toBe(false)
  })

  it('should send debt due alert with formatted text', async () => {
    const mockConstructor = vi.fn()
    globalThis.Notification = Object.assign(mockConstructor, {
      permission: 'granted',
      requestPermission: vi.fn().mockResolvedValue('granted'),
    }) as any

    const success = await sendDebtDueAlert('John Doe', 'Rp500.000', 3)
    expect(success).toBe(true)
  })

  it('should send attendance morning reminder', async () => {
    const mockConstructor = vi.fn()
    globalThis.Notification = Object.assign(mockConstructor, {
      permission: 'granted',
      requestPermission: vi.fn().mockResolvedValue('granted'),
    }) as any

    const success = await sendAttendanceMorningReminder()
    expect(success).toBe(true)
  })
})
