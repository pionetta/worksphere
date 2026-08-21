export type NotificationPermission = 'granted' | 'denied' | 'default'

export async function requestPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) return 'denied'
  if (Notification.permission === 'granted') return 'granted'
  if (Notification.permission === 'denied') return 'denied'
  const result = await Notification.requestPermission()
  return result
}

export function getPermissionStatus(): NotificationPermission {
  if (!('Notification' in window)) return 'denied'
  return Notification.permission
}

export function showNotification(title: string, options?: NotificationOptions): void {
  if (!('Notification' in window)) return
  if (Notification.permission !== 'granted') return
  new Notification(title, options)
}

export function isReminderDue(reminderAt: string): boolean {
  return new Date(reminderAt) <= new Date()
}

const activeTimers = new Map<string, ReturnType<typeof setTimeout>>()

export function scheduleReminder(taskId: string, reminderAt: string, taskTitle: string): void {
  clearReminder(taskId)

  const delay = new Date(reminderAt).getTime() - Date.now()
  if (delay <= 0) {
    showNotification('Pengingat Tugas', { body: taskTitle })
    return
  }

  const timer = setTimeout(() => {
    showNotification('Pengingat Tugas', { body: taskTitle })
    activeTimers.delete(taskId)
  }, delay)

  activeTimers.set(taskId, timer)
}

export function clearReminder(taskId: string): void {
  const timer = activeTimers.get(taskId)
  if (timer) {
    clearTimeout(timer)
    activeTimers.delete(taskId)
  }
}

export function clearAllReminders(): void {
  activeTimers.forEach(timer => clearTimeout(timer))
  activeTimers.clear()
}
