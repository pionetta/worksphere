import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { TodoPage } from '@/pages/TodoPage'

// Mock useAuth
vi.mock('@/lib/auth', () => ({
  useAuth: () => ({
    user: { id: 'user-123', email: 'user@example.com' },
    isAuthenticated: true,
  }),
}))

// Mock useTasks
const mockTasks: any[] = []
vi.mock('@/features/todo/hooks/useTasks', () => ({
  useTasks: () => ({
    tasks: mockTasks,
    loading: false,
    addTask: vi.fn(),
    editTask: vi.fn(),
    removeTask: vi.fn(),
    changeStatus: vi.fn(),
  }),
}))

// Mock useWorkspaces
vi.mock('@/features/workspace/hooks/useWorkspaces', () => ({
  useWorkspaces: () => ({
    workspaces: [],
    activeWorkspace: null,
    activeWorkspaceId: null,
    pendingInvitations: [],
    members: [],
    setActiveWorkspaceId: vi.fn(),
    respondToInvitation: vi.fn(),
  }),
}))

// Mock useSubtasks
vi.mock('@/features/todo/hooks/useSubtasks', () => ({
  useSubtasks: () => ({
    subtasks: [],
    refresh: vi.fn(),
    addSubtask: vi.fn(),
    toggleSubtask: vi.fn(),
    removeSubtask: vi.fn(),
    editSubtask: vi.fn(),
  }),
}))

// Mock subtaskService
vi.mock('@/features/todo/services/subtaskService', () => ({
  listSubtasksByTask: vi.fn().mockResolvedValue([]),
}))

// Mock useTaskReminder
vi.mock('@/features/todo/hooks/useTaskReminder', () => ({
  useTaskReminder: () => ({
    checkAndRequestPermission: vi.fn(),
    scheduleAllReminders: vi.fn(),
  }),
}))

// Mock useJournal
vi.mock('@/features/journal/hooks/useJournal', () => ({
  useJournal: () => ({
    entries: [],
    loading: false,
    addEntry: vi.fn(),
    updateEntry: vi.fn(),
    deleteEntry: vi.fn(),
  }),
}))

// Mock useWishlist
vi.mock('@/features/finance/hooks/useWishlist', () => ({
  useWishlist: () => ({
    items: [],
    loading: false,
    addItem: vi.fn(),
    updateItem: vi.fn(),
    deleteItem: vi.fn(),
  }),
}))

// Mock useHabits
vi.mock('@/features/todo/hooks/useHabits', () => ({
  useHabits: () => ({
    habits: [],
    logs: [],
    totalHabits: 0,
    totalCompletedToday: 0,
    loading: false,
    addHabit: vi.fn(),
    updateHabit: vi.fn(),
    deleteHabit: vi.fn(),
  }),
}))

describe('TodoPage Layout Overhaul', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders clean header with full title "Tugas & To-Do" on the left and Personal workspace switcher on the right', () => {
    render(
      <MemoryRouter>
        <TodoPage />
      </MemoryRouter>
    )

    // Full title "Tugas & To-Do" without truncation
    const title = screen.getByText('Tugas & To-Do')
    expect(title).toBeInTheDocument()
    expect(title.className).toContain('text-lg font-bold')

    // Header container with space-between
    const headerContainer = title.closest('.flex.items-center.justify-between')
    expect(headerContainer).toBeInTheDocument()
    expect(headerContainer?.className).toContain('w-full')
    expect(headerContainer?.className).toContain('my-3')
    expect(headerContainer?.className).toContain('px-1')

    // Compact workspace pill ("Personal") on the right
    const personalPill = screen.getByText('Personal')
    expect(personalPill).toBeInTheDocument()

    // Right side button removed from header (no duplicate "+ + Tugas")
    expect(screen.queryByRole('button', { name: /\+ \+ Tugas/i })).not.toBeInTheDocument()
  })

  it('renders Carousel Pager sub-navigation matching FinancePage with navigation arrows and view titles', () => {
    render(
      <MemoryRouter>
        <TodoPage />
      </MemoryRouter>
    )

    // Active view in pager
    expect(screen.getAllByText('Daftar Tugas').length).toBeGreaterThan(0)
    expect(screen.getByTitle('Tampilan sebelumnya')).toBeInTheDocument()
    expect(screen.getByTitle('Tampilan berikutnya')).toBeInTheDocument()

    // Clicking next switches to Papan Kanban
    fireEvent.click(screen.getByTitle('Tampilan berikutnya'))
    expect(screen.getAllByText('Papan Kanban').length).toBeGreaterThan(0)

    // Clicking next switches to Pelacak Habit
    fireEvent.click(screen.getByTitle('Tampilan berikutnya'))
    expect(screen.getAllByText('Pelacak Habit').length).toBeGreaterThan(0)
  })

  it('renders unified single row with Search Input, Filter Button, and Sort Button', () => {
    render(
      <MemoryRouter>
        <TodoPage />
      </MemoryRouter>
    )

    // Search input
    expect(screen.getByPlaceholderText('Cari tugas...')).toBeInTheDocument()

    // Filter button
    expect(screen.getByTitle('Filter & Horizon Tugas')).toBeInTheDocument()

    // Sort button
    expect(screen.getByTitle(/Urutkan:/i)).toBeInTheDocument()
  })

  it('opens Filter & Horizon BottomSheet modal containing Time Horizon, Priority, and Sort options', () => {
    render(
      <MemoryRouter>
        <TodoPage />
      </MemoryRouter>
    )

    const filterBtn = screen.getByTitle('Filter & Horizon Tugas')
    fireEvent.click(filterBtn)

    // Modal title
    expect(screen.getByText('Filter & Horizon Tugas')).toBeInTheDocument()

    // Horizon Waktu options moved into modal
    expect(screen.getByText('Horizon Waktu')).toBeInTheDocument()
    expect(screen.getByText('Semua Horizon')).toBeInTheDocument()
    expect(screen.getByText(/☀️ Harian/i)).toBeInTheDocument()
    expect(screen.getByText(/📅 Mingguan/i)).toBeInTheDocument()
    expect(screen.getByText(/🎯 Target \/ Tahunan/i)).toBeInTheDocument()

    // Priority & Sort options inside modal
    expect(screen.getAllByText('Prioritas').length).toBeGreaterThan(0)
    expect(screen.getByText('Urutkan Berdasarkan')).toBeInTheDocument()
    expect(screen.getByText(/Hanya tampilkan tugas yang terlambat/i)).toBeInTheDocument()
    expect(screen.getByText('Reset Filter')).toBeInTheDocument()
    expect(screen.getByText('Terapkan')).toBeInTheDocument()
  })

  it('renders slender horizontal status filter chips with count badges (Semua, Belum, Dikerjakan, Selesai)', () => {
    render(
      <MemoryRouter>
        <TodoPage />
      </MemoryRouter>
    )

    expect(screen.getByRole('button', { name: /^Semua/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^Belum/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^Dikerjakan/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^Selesai/i })).toBeInTheDocument()
  })

  it('renders soft-neumorphic embossed empty state with "Belum ada tugas" and action button', () => {
    render(
      <MemoryRouter>
        <TodoPage />
      </MemoryRouter>
    )

    expect(screen.getByText('Belum ada tugas')).toBeInTheDocument()
    expect(
      screen.getByText('Tambahkan tugas untuk mulai mengatur pekerjaan Anda.')
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Buat Tugas Baru/i })).toBeInTheDocument()
  })

  it('applies pb-36 bottom safe area padding to prevent bottom navigation overlap', () => {
    const { container } = render(
      <MemoryRouter>
        <TodoPage />
      </MemoryRouter>
    )

    const mainWrapper = container.querySelector('.max-w-5xl')
    expect(mainWrapper).toHaveClass('pb-36')
  })
})
