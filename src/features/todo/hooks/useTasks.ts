import { useState, useEffect, useCallback } from 'react'
import * as taskService from '@/features/todo/services/taskService'
import type { Task, TaskStatus, TaskPriority } from '@/types'

export function useTasks(userId: string | null) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    if (!userId) return
    setLoading(true)
    try {
      const data = await taskService.listTasks(userId)
      setTasks(data)
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    refresh()

    const handleSync = (e: Event) => {
      const detail = (e as CustomEvent).detail
      if (!detail || !detail.table || detail.table === 'tasks' || detail.type === 'full-pull') {
        refresh()
      }
    }
    window.addEventListener('worksphere-data-synced', handleSync)
    return () => window.removeEventListener('worksphere-data-synced', handleSync)
  }, [refresh])

  const addTask = useCallback(
    async (
      title: string,
      options?: {
        description?: string
        priority?: TaskPriority
        timeframe?: Task['timeframe']
        category?: string
        dueDate?: string | null
        reminderAt?: string | null
        workspaceId?: string | null
        assigneeId?: string | null
      }
    ) => {
      if (!userId) return
      await taskService.createTask(userId, title, options)
      await refresh()
    },
    [userId, refresh]
  )

  const editTask = useCallback(
    async (id: string, data: Parameters<typeof taskService.updateTask>[1]) => {
      await taskService.updateTask(id, data)
      await refresh()
    },
    [refresh]
  )

  const removeTask = useCallback(
    async (id: string) => {
      await taskService.deleteTask(id)
      await refresh()
    },
    [refresh]
  )

  const changeStatus = useCallback(
    async (id: string, status: TaskStatus) => {
      await taskService.changeStatus(id, status)
      await refresh()
    },
    [refresh]
  )

  return {
    tasks,
    loading,
    refresh,
    addTask,
    editTask,
    removeTask,
    changeStatus,
  }
}
