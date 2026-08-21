import { useCallback } from 'react'
import * as reminderService from '@/features/todo/services/reminderService'
import type { Task } from '@/types'

export function useTaskReminder() {
  const checkAndRequestPermission = useCallback(async (): Promise<boolean> => {
    const status = reminderService.getPermissionStatus()
    if (status === 'granted') return true
    if (status === 'denied') return false
    const result = await reminderService.requestPermission()
    return result === 'granted'
  }, [])

  const scheduleReminder = useCallback((task: Task) => {
    if (!task.reminder_at) return
    reminderService.scheduleReminder(task.id, task.reminder_at, task.title)
  }, [])

  const clearReminder = useCallback((taskId: string) => {
    reminderService.clearReminder(taskId)
  }, [])

  const scheduleAllReminders = useCallback((tasks: Task[]) => {
    tasks.forEach(task => {
      if (task.reminder_at && task.status !== 'completed' && task.status !== 'cancelled') {
        reminderService.scheduleReminder(task.id, task.reminder_at, task.title)
      }
    })
  }, [])

  return {
    permissionStatus: reminderService.getPermissionStatus(),
    checkAndRequestPermission,
    scheduleReminder,
    clearReminder,
    scheduleAllReminders,
  }
}
