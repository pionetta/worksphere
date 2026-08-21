import { useState, useEffect, useCallback } from 'react'
import * as subtaskService from '@/features/todo/services/subtaskService'
import type { Subtask } from '@/types'

export function useSubtasks(taskId: string | null) {
  const [subtasks, setSubtasks] = useState<Subtask[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    if (!taskId) {
      setSubtasks([])
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const data = await subtaskService.listSubtasksByTask(taskId)
      setSubtasks(data.sort((a, b) => a.position - b.position))
    } finally {
      setLoading(false)
    }
  }, [taskId])

  useEffect(() => {
    refresh()
  }, [refresh])

  const addSubtask = useCallback(
    async (userId: string, title: string, position?: number) => {
      if (!taskId) return
      await subtaskService.createSubtask(userId, taskId, title, position)
      await refresh()
    },
    [taskId, refresh]
  )

  const editSubtask = useCallback(
    async (id: string, data: { title?: string; is_completed?: boolean; position?: number }) => {
      await subtaskService.updateSubtask(id, data)
      await refresh()
    },
    [refresh]
  )

  const toggleSubtask = useCallback(
    async (id: string) => {
      await subtaskService.toggleSubtask(id)
      await refresh()
    },
    [refresh]
  )

  const removeSubtask = useCallback(
    async (id: string) => {
      await subtaskService.deleteSubtask(id)
      await refresh()
    },
    [refresh]
  )

  const progress = subtaskService.getSubtaskProgress(subtasks)

  return {
    subtasks,
    loading,
    refresh,
    addSubtask,
    editSubtask,
    toggleSubtask,
    removeSubtask,
    progress,
  }
}
