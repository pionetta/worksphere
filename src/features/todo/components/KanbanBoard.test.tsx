import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { KanbanBoard } from './KanbanBoard'
import type { Task, Subtask } from '@/types'

const mockTasks: Task[] = [
  {
    id: 'task-1',
    user_id: 'user-1',
    title: 'Buat Desain Kanban',
    description: 'Desain layout 3 kolom',
    status: 'todo',
    priority: 'high',
    due_date: '2026-08-30',
    category: 'UI/UX',
    reminder_at: null,
    completed_at: null,
    deleted_at: null,
    created_at: '2026-08-20T00:00:00Z',
    updated_at: '2026-08-20T00:00:00Z',
  },
  {
    id: 'task-2',
    user_id: 'user-1',
    title: 'Koding Component Kanban',
    description: 'Implementasi drag & drop',
    status: 'in_progress',
    priority: 'medium',
    due_date: '2026-08-28',
    category: 'Frontend',
    reminder_at: null,
    completed_at: null,
    deleted_at: null,
    created_at: '2026-08-20T00:00:00Z',
    updated_at: '2026-08-20T00:00:00Z',
  },
  {
    id: 'task-3',
    user_id: 'user-1',
    title: 'Rilis Fitur Notifikasi',
    description: 'Selesai testing web push',
    status: 'completed',
    priority: 'low',
    due_date: '2026-08-25',
    category: 'Release',
    reminder_at: null,
    completed_at: '2026-08-25T00:00:00Z',
    deleted_at: null,
    created_at: '2026-08-20T00:00:00Z',
    updated_at: '2026-08-20T00:00:00Z',
  },
]

const mockSubtasksMap = new Map<string, Subtask[]>([
  [
    'task-1',
    [
      {
        id: 'sub-1',
        task_id: 'task-1',
        user_id: 'user-1',
        title: 'Sketsa wireframe',
        is_completed: true,
        position: 0,
        created_at: '2026-08-20T00:00:00Z',
        updated_at: '2026-08-20T00:00:00Z',
      },
      {
        id: 'sub-2',
        task_id: 'task-1',
        user_id: 'user-1',
        title: 'Warna dan tema',
        is_completed: false,
        position: 1,
        created_at: '2026-08-20T00:00:00Z',
        updated_at: '2026-08-20T00:00:00Z',
      },
    ],
  ],
])

describe('KanbanBoard component', () => {
  it('renders all 3 columns with tasks distributed correctly', () => {
    render(
      <KanbanBoard
        tasks={mockTasks}
        subtasksMap={mockSubtasksMap}
        onSelectTask={vi.fn()}
        onChangeStatus={vi.fn()}
      />
    )

    expect(screen.getByText('Belum Dimulai')).toBeDefined()
    expect(screen.getByText('Sedang Dikerjakan')).toBeDefined()
    expect(screen.getByText('Selesai')).toBeDefined()

    expect(screen.getByText('Buat Desain Kanban')).toBeDefined()
    expect(screen.getByText('Koding Component Kanban')).toBeDefined()
    expect(screen.getByText('Rilis Fitur Notifikasi')).toBeDefined()
  })

  it('triggers onSelectTask when a card is clicked', () => {
    const onSelectTask = vi.fn()
    render(
      <KanbanBoard
        tasks={mockTasks}
        subtasksMap={mockSubtasksMap}
        onSelectTask={onSelectTask}
        onChangeStatus={vi.fn()}
      />
    )

    fireEvent.click(screen.getByText('Buat Desain Kanban'))
    expect(onSelectTask).toHaveBeenCalledWith(mockTasks[0])
  })

  it('triggers onChangeStatus when quick move buttons are clicked', () => {
    const onChangeStatus = vi.fn()
    render(
      <KanbanBoard
        tasks={mockTasks}
        subtasksMap={mockSubtasksMap}
        onSelectTask={vi.fn()}
        onChangeStatus={onChangeStatus}
      />
    )

    const startWorkBtn = screen.getByLabelText('Mulai Kerjakan')
    fireEvent.click(startWorkBtn)
    expect(onChangeStatus).toHaveBeenCalledWith('task-1', 'in_progress')
  })

  it('renders subtask progress indicator on card', () => {
    render(
      <KanbanBoard
        tasks={mockTasks}
        subtasksMap={mockSubtasksMap}
        onSelectTask={vi.fn()}
        onChangeStatus={vi.fn()}
      />
    )

    expect(screen.getByText(/1\/2 \(50%\)/)).toBeDefined()
  })
})
