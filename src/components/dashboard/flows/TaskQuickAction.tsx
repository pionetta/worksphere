import * as taskService from '@/features/todo/services/taskService'
import { TaskForm } from '@/features/todo/components/TaskForm'

interface TaskQuickActionProps {
  userId: string
  onSuccess: () => void
  onCancel: () => void
}

export function TaskQuickAction({ userId, onSuccess, onCancel }: TaskQuickActionProps) {
  return (
    <TaskForm
      onSubmit={async data => {
        await taskService.createTask(userId, data.title, {
          description: data.description,
          priority: data.priority,
          category: data.category,
          dueDate: data.dueDate,
          reminderAt: data.reminderAt,
        })
        onSuccess()
      }}
      onCancel={onCancel}
      submitLabel="Tambah Task"
    />
  )
}
