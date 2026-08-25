/**
 * WorkSphere — Web Push Notifications & Integrated Alert Engine
 * Handles browser notification permissions, Service Worker showNotification,
 * instant test alerts, and scheduled reminders for attendance, finance, and tasks.
 */

export type NotificationPermissionStatus = 'granted' | 'denied' | 'default'

export interface PushNotificationOptions {
  body?: string
  icon?: string
  badge?: string
  tag?: string
  data?: Record<string, unknown>
  requireInteraction?: boolean
  silent?: boolean
}

/**
 * Check if the current browser environment supports the Notifications API.
 */
export function isNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window
}

/**
 * Get current browser notification permission status.
 */
export function getNotificationPermission(): NotificationPermissionStatus {
  if (!isNotificationSupported()) return 'denied'
  return Notification.permission as NotificationPermissionStatus
}

/**
 * Request notification permission from the user.
 */
export async function requestNotificationPermission(): Promise<NotificationPermissionStatus> {
  if (!isNotificationSupported()) return 'denied'

  if (Notification.permission === 'granted') {
    return 'granted'
  }

  try {
    const result = await Notification.requestPermission()
    return result as NotificationPermissionStatus
  } catch {
    return 'denied'
  }
}

/**
 * Send a web push notification via ServiceWorker (PWA) or standard Notification fallback.
 */
export async function sendPushNotification(
  title: string,
  options?: PushNotificationOptions
): Promise<boolean> {
  if (!isNotificationSupported()) return false

  if (Notification.permission !== 'granted') {
    const permission = await requestNotificationPermission()
    if (permission !== 'granted') return false
  }

  const notificationOptions: NotificationOptions = {
    body: options?.body ?? '',
    icon: options?.icon ?? '/pwa-192x192.png',
    badge: options?.badge ?? '/favicon.svg',
    tag: options?.tag ?? 'worksphere-alert',
    data: options?.data,
    requireInteraction: options?.requireInteraction ?? false,
    silent: options?.silent ?? false,
  }

  // 1. Try ServiceWorker registration showNotification (PWA background friendly)
  if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.getRegistration()
      if (registration && 'showNotification' in registration) {
        await registration.showNotification(title, notificationOptions)
        return true
      }
    } catch {
      // Fallback to Window Notification
    }
  }

  // 2. Window Notification fallback
  try {
    new Notification(title, notificationOptions)
    return true
  } catch {
    return false
  }
}

/**
 * Send a test push notification to verify browser permissions and alert display.
 */
export async function sendTestNotification(): Promise<boolean> {
  return sendPushNotification('🔔 WorkSphere Notifikasi Aktif', {
    body: 'Notifikasi pengingat absensi, tenggat keuangan, dan tugas to-do siap dikirim.',
    tag: 'worksphere-test',
  })
}

/**
 * Financial Alert: Send warning when budget threshold is reached (>80% or 100%).
 */
export async function sendBudgetAlert(categoryName: string, percentUsed: number): Promise<boolean> {
  if (percentUsed >= 100) {
    return sendPushNotification('⚠️ Peringatan Anggaran Terlampaui', {
      body: `Pengeluaran kategori "${categoryName}" telah melebihi batas anggaran (${percentUsed}%).`,
      tag: `budget-alert-${categoryName}`,
    })
  }
  if (percentUsed >= 80) {
    return sendPushNotification('📊 Peringatan Anggaran Menipis', {
      body: `Pengeluaran kategori "${categoryName}" telah mencapai ${percentUsed}% dari batas anggaran.`,
      tag: `budget-alert-${categoryName}`,
    })
  }
  return false
}

/**
 * Debt Due Date Alert: Send reminder for upcoming debt payment.
 */
export async function sendDebtDueAlert(
  personName: string,
  amountFormatted: string,
  daysRemaining: number
): Promise<boolean> {
  const timeText = daysRemaining === 0 ? 'hari ini' : `${daysRemaining} hari lagi`
  return sendPushNotification('💰 Pengingat Jatuh Tempo Utang/Piutang', {
    body: `Pembayaran sebesar ${amountFormatted} dengan ${personName} jatuh tempo ${timeText}.`,
    tag: `debt-alert-${personName}`,
  })
}

/**
 * Daily Morning Attendance Reminder
 */
export async function sendAttendanceMorningReminder(): Promise<boolean> {
  return sendPushNotification('⏰ Waktunya Presensi Harian', {
    body: 'Jangan lupa untuk mencatat absensi tim Anda hari ini di WorkSphere.',
    tag: 'attendance-morning-reminder',
  })
}
