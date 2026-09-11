import { useState, useEffect, useCallback, useMemo } from 'react'
import { useAuth } from '@/lib/auth'
import { useTasks } from '@/features/todo/hooks/useTasks'
import { useSubtasks } from '@/features/todo/hooks/useSubtasks'
import { useTaskFilters } from '@/features/todo/hooks/useTaskFilters'
import { useTaskReminder } from '@/features/todo/hooks/useTaskReminder'
import { useJournal } from '@/features/journal/hooks/useJournal'
import { useWishlist } from '@/features/finance/hooks/useWishlist'
import { useHabits } from '@/features/todo/hooks/useHabits'
import { useWorkspaces } from '@/features/workspace/hooks/useWorkspaces'
import { WorkspaceSwitcher } from '@/features/workspace/components/WorkspaceSwitcher'
import { WorkspaceManagerModal } from '@/features/workspace/components/WorkspaceManagerModal'
import { WorkspaceInvitationsBanner } from '@/features/workspace/components/WorkspaceInvitationsBanner'
import * as subtaskService from '@/features/todo/services/subtaskService'
import { TaskForm } from '@/features/todo/components/TaskForm'
import { TaskList } from '@/features/todo/components/TaskList'
import { KanbanBoard } from '@/features/todo/components/KanbanBoard'
import { TaskStatusSelector } from '@/features/todo/components/TaskStatusSelector'
import { SubtaskList } from '@/features/todo/components/SubtaskList'
import { TaskAnalyticsCard } from '@/features/todo/components/TaskAnalyticsCard'
import { JournalSection } from '@/features/journal/components/JournalSection'
import { WishlistCard } from '@/features/finance/components/WishlistCard'
import { WishlistForm } from '@/features/finance/components/WishlistForm'
import { HabitCard } from '@/features/todo/components/HabitCard'
import { HabitFormModal } from '@/features/todo/components/HabitFormModal'
import { HabitHeatmap } from '@/features/todo/components/HabitHeatmap'
import { Button } from '@/components/ui/Button'
import { LoadingState } from '@/components/ui/LoadingState'
import { BottomSheet } from '@/components/ui/BottomSheet'
import { EmptyState } from '@/components/ui/EmptyState'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import {
  Plus,
  ListTodo,
  LayoutGrid,
  List,
  Gift,
  BookOpen,
  Flame,
  Users,
  Search,
  Filter,
  ArrowUpDown,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { formatCurrency } from '@/utils/currency'
import type {
  Task,
  TaskStatus,
  TaskPriority,
  TaskTimeframe,
  Subtask,
  WishlistItem,
  WishlistPeriod,
  Habit,
} from '@/types'
import type { SortOption } from '@/features/todo/hooks/useTaskFilters'

const STATUS_TABS: { value: TaskStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'Semua' },
  { value: 'todo', label: 'Belum' },
  { value: 'in_progress', label: 'Dikerjakan' },
  { value: 'completed', label: 'Selesai' },
]

const TODO_VIEWS = [
  { id: 'list', label: 'Daftar Tugas', icon: List, iconColor: 'text-indigo-600 dark:text-indigo-400' },
  { id: 'kanban', label: 'Papan Kanban', icon: LayoutGrid, iconColor: 'text-indigo-600 dark:text-indigo-400' },
  { id: 'habits', label: 'Pelacak Habit', icon: Flame, iconColor: 'text-amber-500 fill-amber-500' },
  { id: 'wishlist', label: 'Wishlist', icon: Gift, iconColor: 'text-pink-500' },
  { id: 'journal', label: 'Catatan', icon: BookOpen, iconColor: 'text-amber-500' },
] as const

const TIMEFRAME_OPTIONS: Array<{ value: TaskTimeframe | 'all'; label: string }> = [
  { value: 'all', label: 'Semua Horizon' },
  { value: 'daily', label: '☀️ Harian' },
  { value: 'weekly', label: '📅 Mingguan' },
  { value: 'yearly', label: '🎯 Target / Tahunan' },
]

const PRIORITY_OPTIONS: Array<{ value: TaskPriority | 'all'; label: string }> = [
  { value: 'all', label: 'Semua prioritas' },
  { value: 'urgent', label: 'Mendesak' },
  { value: 'high', label: 'Tinggi' },
  { value: 'medium', label: 'Sedang' },
  { value: 'low', label: 'Rendah' },
]

const SORT_OPTIONS: Array<{ value: SortOption; label: string }> = [
  { value: 'deadline', label: 'Deadline terdekat' },
  { value: 'priority', label: 'Prioritas' },
  { value: 'created', label: 'Terbaru dibuat' },
  { value: 'updated', label: 'Terakhir diperbarui' },
]

export function TodoPage() {
  const { user } = useAuth()
  const userId = user?.id ?? ''
  const { tasks, loading, addTask, editTask, removeTask, changeStatus } = useTasks(userId)
  const workspaceHook = useWorkspaces(userId || null, user?.email)

  const [showWorkspaceManager, setShowWorkspaceManager] = useState(false)
  const [isCreatingWorkspace, setIsCreatingWorkspace] = useState(false)
  const [workspaceAssigneeFilter, setWorkspaceAssigneeFilter] = useState<'all' | 'my_tasks'>('all')

  // Filter tasks by active workspace and team assignee filter
  const workspaceTasks = useMemo(() => {
    return tasks.filter(task => {
      if (workspaceHook.activeWorkspaceId === null) {
        return !task.workspace_id
      }
      if (task.workspace_id !== workspaceHook.activeWorkspaceId) {
        return false
      }
      if (workspaceAssigneeFilter === 'my_tasks') {
        return task.assignee_id === userId || task.user_id === userId
      }
      return true
    })
  }, [tasks, workspaceHook.activeWorkspaceId, workspaceAssigneeFilter, userId])

  const memberNameMap = useMemo(() => {
    const map = new Map<string, string>()
    workspaceHook.members.forEach(m => {
      const name = m.invited_email ? m.invited_email.split('@')[0] : 'Member'
      if (m.user_id) map.set(m.user_id, name)
      map.set(m.id, name)
    })
    return map
  }, [workspaceHook.members])

  const {
    filters,
    filteredTasks,
    categories,
    activeFilterCount,
    setSearch,
    setStatus,
    setPriority,
    setTimeframe,
    setCategory,
    setOverdueOnly,
    setSort,
    resetFilters,
  } = useTaskFilters(workspaceTasks)
  const { checkAndRequestPermission, scheduleAllReminders } = useTaskReminder()
  const journalHook = useJournal(userId || null)
  const wishlistHook = useWishlist(userId || null)

  const [showForm, setShowForm] = useState(false)
  const [showFilterModal, setShowFilterModal] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [showDetail, setShowDetail] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [viewMode, setViewMode] = useState<'list' | 'kanban' | 'habits' | 'wishlist' | 'journal'>('list')

  // Count tasks by status for status filter chips (e.g. Semua (0))
  const statusCounts = useMemo<Record<TaskStatus | 'all', number>>(() => {
    const total = workspaceTasks.length
    const todo = workspaceTasks.filter(t => t.status === 'todo').length
    const inProgress = workspaceTasks.filter(t => t.status === 'in_progress').length
    const completed = workspaceTasks.filter(t => t.status === 'completed').length
    const cancelled = workspaceTasks.filter(t => t.status === 'cancelled').length
    return { all: total, todo, in_progress: inProgress, completed, cancelled }
  }, [workspaceTasks])

  // Carousel Pager navigation handlers
  const activeViewIndex = useMemo(() => {
    const idx = TODO_VIEWS.findIndex(v => v.id === viewMode)
    return idx >= 0 ? idx : 0
  }, [viewMode])

  const handlePrevView = () => {
    const prevIdx = (activeViewIndex - 1 + TODO_VIEWS.length) % TODO_VIEWS.length
    setViewMode(TODO_VIEWS[prevIdx].id)
  }

  const handleNextView = () => {
    const nextIdx = (activeViewIndex + 1) % TODO_VIEWS.length
    setViewMode(TODO_VIEWS[nextIdx].id)
  }

  const [touchStartX, setTouchStartX] = useState<number | null>(null)
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX)
  }
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return
    const diff = touchStartX - e.changedTouches[0].clientX
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        handleNextView()
      } else {
        handlePrevView()
      }
    }
    setTouchStartX(null)
  }

  // Habit states
  const habitsHook = useHabits(userId || null)
  const [showHabitForm, setShowHabitForm] = useState(false)
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null)

  // Wishlist states
  const [showWishlistForm, setShowWishlistForm] = useState(false)
  const [editingWishlist, setEditingWishlist] = useState<WishlistItem | null>(null)
  const [wishlistPeriodFilter, setWishlistPeriodFilter] = useState<WishlistPeriod | 'all'>('all')
  const [pendingDeleteWishlistId, setPendingDeleteWishlistId] = useState<string | null>(null)

  const filteredWishlists = useMemo(() => {
    return wishlistHook.items.filter(item => {
      if (wishlistPeriodFilter === 'all') return true
      return item.period === wishlistPeriodFilter
    })
  }, [wishlistHook.items, wishlistPeriodFilter])

  const {
    subtasks,
    refresh: refreshSubtasks,
    addSubtask,
    toggleSubtask,
    removeSubtask,
    editSubtask,
  } = useSubtasks(selectedTask?.id ?? '')

  // Map subtasks for all tasks
  const [subtasksMap, setSubtasksMap] = useState<Map<string, Subtask[]>>(new Map())

  const loadSubtasksMap = useCallback(async () => {
    if (!userId || tasks.length === 0) return
    const map = new Map<string, Subtask[]>()
    for (const task of tasks) {
      const items = await subtaskService.listSubtasksByTask(task.id)
      map.set(task.id, items)
    }
    setSubtasksMap(map)
  }, [userId, tasks])

  useEffect(() => {
    loadSubtasksMap()
  }, [loadSubtasksMap])

  // Schedule reminders on mount
  useEffect(() => {
    if (tasks.length > 0) {
      scheduleAllReminders(tasks)
    }
  }, [tasks, scheduleAllReminders])

  // Refresh subtasks when task selection changes
  useEffect(() => {
    if (selectedTask) {
      refreshSubtasks()
    }
  }, [selectedTask, refreshSubtasks])

  const handleCreateTask = async (data: {
    title: string
    description?: string
    priority: TaskPriority
    timeframe?: TaskTimeframe
    category?: string
    dueDate?: string
    reminderAt?: string
    assigneeId?: string | null
  }) => {
    try {
      if (data.reminderAt) {
        await checkAndRequestPermission()
      }
      await addTask(data.title, {
        description: data.description,
        priority: data.priority,
        timeframe: data.timeframe ?? 'daily',
        category: data.category,
        dueDate: data.dueDate,
        reminderAt: data.reminderAt,
        workspaceId: workspaceHook.activeWorkspaceId,
        assigneeId: data.assigneeId,
      })
      toast.success(`Tugas "${data.title}" berhasil dibuat!`)
      setShowForm(false)
    } catch {
      toast.error('Gagal membuat tugas')
    }
  }

  const handleUpdateTask = async (data: {
    title: string
    description?: string
    priority: TaskPriority
    timeframe?: TaskTimeframe
    category?: string
    dueDate?: string
    reminderAt?: string
    assigneeId?: string | null
  }) => {
    if (!selectedTask) return
    try {
      await editTask(selectedTask.id, {
        title: data.title,
        description: data.description,
        priority: data.priority,
        timeframe: data.timeframe,
        category: data.category,
        dueDate: data.dueDate,
        reminderAt: data.reminderAt,
        assigneeId: data.assigneeId,
      })
      toast.success('Tugas berhasil diperbarui!')
      handleCloseDetail()
    } catch {
      toast.error('Gagal memperbarui tugas')
    }
  }

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task)
    setShowDetail(true)
  }

  const handleCloseDetail = () => {
    setSelectedTask(null)
    setShowDetail(false)
  }

  const handleStatusChange = async (taskId: string, status: TaskStatus) => {
    try {
      await changeStatus(taskId, status)
      toast.info('Status tugas diperbarui')
    } catch {
      toast.error('Gagal mengubah status tugas')
    }
  }

  const handleDeleteTask = async () => {
    if (!selectedTask) return
    try {
      await removeTask(selectedTask.id)
      toast.success('Tugas berhasil dihapus')
      setShowDeleteConfirm(false)
      handleCloseDetail()
    } catch {
      toast.error('Gagal menghapus tugas')
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-4 sm:space-y-5 pb-36">
      {/* ─── Pending Workspace Invitations Banner ─── */}
      <WorkspaceInvitationsBanner
        invitations={workspaceHook.pendingInvitations}
        onRespond={workspaceHook.respondToInvitation}
      />

      {/* ─── Header: Flexbox Space-Between (Kiri: Ikon & Judul, Kanan: Dropdown Workspace "Personal") ─── */}
      <div className="w-full flex items-center justify-between my-3 px-1">
        {/* Sisi Kiri: Ikon & Judul */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-sm shrink-0">
            <ListTodo className="w-5 h-5" />
          </div>
          <h1 className="text-lg font-bold text-slate-800 dark:text-slate-100 tracking-tight whitespace-nowrap">
            Tugas & To-Do
          </h1>
        </div>

        {/* Sisi Kanan: Dropdown "Personal" */}
        {(viewMode === 'list' || viewMode === 'kanban') && (
          <div className="shrink-0">
            <WorkspaceSwitcher
              workspaces={workspaceHook.workspaces}
              activeWorkspace={workspaceHook.activeWorkspace}
              onSelectWorkspace={workspaceHook.setActiveWorkspaceId}
              onOpenManager={() => {
                setIsCreatingWorkspace(false)
                setShowWorkspaceManager(true)
              }}
              onCreateNew={() => {
                setIsCreatingWorkspace(true)
                setShowWorkspaceManager(true)
              }}
              compact
              align="right"
            />
          </div>
        )}
      </div>

      {/* Team Workspace Sub-filter Bar (if in team workspace) */}
      {workspaceHook.activeWorkspace && (viewMode === 'list' || viewMode === 'kanban') && (
        <div className="flex items-center justify-between p-1.5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-800/60 shadow-xs">
          <div className="flex items-center gap-1.5 px-2 min-w-0">
            <Users className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
            <span className="text-xs font-bold text-indigo-950 dark:text-indigo-200 truncate">
              {workspaceHook.activeWorkspace.name}
            </span>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => setWorkspaceAssigneeFilter('all')}
              className={cn(
                'px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer',
                workspaceAssigneeFilter === 'all'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
              )}
            >
              Semua Tim
            </button>
            <button
              type="button"
              onClick={() => setWorkspaceAssigneeFilter('my_tasks')}
              className={cn(
                'px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer',
                workspaceAssigneeFilter === 'my_tasks'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
              )}
            >
              Tugas Saya
            </button>
          </div>
        </div>
      )}

      {/* Analytics Card (Always visible across all tabs) */}
      <TaskAnalyticsCard tasks={workspaceTasks} />

      {/* Sub-Navigasi: Carousel Pager Terpusat (Samakan dengan Halaman Keuangan) */}
      <div
        className="flex flex-col items-center justify-center w-full px-1 my-1 touch-pan-y"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className="w-full flex items-center justify-between px-4 py-2.5 bg-white/80 dark:bg-slate-800/80 rounded-2xl border border-slate-200/70 dark:border-white/10 shadow-sm my-2">
          <button
            type="button"
            onClick={handlePrevView}
            className="p-1.5 rounded-xl text-slate-500 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all cursor-pointer"
            title="Tampilan sebelumnya"
            aria-label="Tampilan sebelumnya"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div
            key={TODO_VIEWS[activeViewIndex]?.id}
            className="flex items-center justify-center gap-2 flex-1 select-none animate-fade-in"
          >
            {(() => {
              const CurrentIcon = TODO_VIEWS[activeViewIndex]?.icon || List
              return (
                <CurrentIcon
                  className={cn('w-4 h-4', TODO_VIEWS[activeViewIndex]?.iconColor)}
                />
              )
            })()}
            <span className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-100 tracking-wide text-center">
              {TODO_VIEWS[activeViewIndex]?.label}
            </span>
          </div>

          <button
            type="button"
            onClick={handleNextView}
            className="p-1.5 rounded-xl text-slate-500 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all cursor-pointer"
            title="Tampilan berikutnya"
            aria-label="Tampilan berikutnya"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Titik Indikator (Pagination Dots) */}
        <div className="flex items-center justify-center gap-1.5 mt-0.5 mb-1.5">
          {TODO_VIEWS.map((v, idx) => (
            <button
              key={v.id}
              type="button"
              onClick={() => setViewMode(v.id)}
              aria-label={`Buka ${v.label}`}
              className={cn(
                'cursor-pointer transition-all duration-300',
                activeViewIndex === idx
                  ? 'w-5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400'
                  : 'w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700 hover:bg-slate-400'
              )}
            />
          ))}
        </div>

        {/* Accessible fallback buttons for test compatibility and screen readers */}
        <div className="sr-only">
          {TODO_VIEWS.map(v => (
            <button
              key={v.id}
              type="button"
              onClick={() => setViewMode(v.id)}
            >
              {v.label}
            </button>
          ))}
        </div>
      </div>

      {/* ─── 0. Habit Tracker View ─── */}
      {viewMode === 'habits' ? (
        <div className="space-y-4 animate-fade-in-up">
          {/* Summary Stat Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            <div className="p-3.5 rounded-2xl bg-white dark:bg-[#121212] border border-[#E6E6E3] dark:border-[#272727] shadow-xs">
              <p className="text-[11px] font-semibold text-[#737373] dark:text-[#A3A3A3] mb-0.5">
                Total Kebiasaan
              </p>
              <p className="text-lg sm:text-xl font-extrabold text-[#171717] dark:text-[#F5F5F5]">
                {habitsHook.totalHabits}
              </p>
              <span className="text-[10px] text-[#A3A3A3] font-medium">Aktif dipantau</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-white dark:bg-[#121212] border border-[#E6E6E3] dark:border-[#272727] shadow-xs">
              <p className="text-[11px] font-semibold text-[#737373] dark:text-[#A3A3A3] mb-0.5">
                Selesai Hari Ini
              </p>
              <p className="text-lg sm:text-xl font-extrabold text-emerald-600 dark:text-emerald-400">
                {habitsHook.totalCompletedToday} / {habitsHook.totalHabits}
              </p>
              <span className="text-[10px] text-[#A3A3A3] font-medium">
                {habitsHook.totalHabits > 0
                  ? `${Math.round((habitsHook.totalCompletedToday / habitsHook.totalHabits) * 100)}% tercapai`
                  : '0%'}
              </span>
            </div>

            <div className="col-span-2 sm:col-span-1 p-3.5 rounded-2xl bg-white dark:bg-[#121212] border border-[#E6E6E3] dark:border-[#272727] shadow-xs flex flex-col justify-between">
              <p className="text-[11px] font-semibold text-[#737373] dark:text-[#A3A3A3] mb-0.5">
                Total Check-in
              </p>
              <p className="text-lg sm:text-xl font-extrabold text-[#2563EB] dark:text-[#3B82F6]">
                {habitsHook.logs.length}
              </p>
              <span className="text-[10px] text-[#A3A3A3] font-medium">Log tercatat</span>
            </div>
          </div>

          {/* Consistency Heatmap */}
          {habitsHook.logs.length > 0 && (
            <HabitHeatmap logs={habitsHook.logs} daysCount={49} />
          )}

          {habitsHook.loading ? (
            <LoadingState text="Memuat kebiasaan..." />
          ) : habitsHook.habits.length === 0 ? (
            <EmptyState
              icon={<Flame className="w-8 h-8 text-amber-500" />}
              title="Belum Ada Kebiasaan"
              description="Mulai bangun kebiasaan positif harian seperti olahraga, membaca, atau minum air putih dan raih streak terbaikmu!"
              action={
                <Button
                  size="sm"
                  onClick={() => {
                    setEditingHabit(null)
                    setShowHabitForm(true)
                  }}
                  icon={<Plus className="w-4 h-4" />}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
                >
                  Buat Kebiasaan Baru
                </Button>
              }
            />
          ) : (
            <div className="space-y-3">
              {habitsHook.habitsWithStats.map(item => (
                <HabitCard
                  key={item.habit.id}
                  item={item}
                  onToggle={async (habitId, dateStr) => {
                    await habitsHook.toggleToday(habitId, dateStr)
                  }}
                  onEdit={habit => {
                    setEditingHabit(habit)
                    setShowHabitForm(true)
                  }}
                  onDelete={async habitId => {
                    await habitsHook.removeHabit(habitId)
                    toast.success('Kebiasaan berhasil dihapus')
                  }}
                />
              ))}
            </div>
          )}

          {/* Habit Form Modal */}
          <HabitFormModal
            open={showHabitForm}
            onClose={() => {
              setShowHabitForm(false)
              setEditingHabit(null)
            }}
            initialData={editingHabit}
            onSubmit={async data => {
              await habitsHook.addHabit(data)
              toast.success('Kebiasaan baru berhasil dibuat! 🎯')
            }}
            onUpdate={async (id, data) => {
              await habitsHook.editHabit(id, data)
              toast.success('Kebiasaan berhasil diperbarui!')
            }}
          />
        </div>
      ) : viewMode === 'wishlist' ? (
        <div className="space-y-4 animate-fade-in-up">
          {/* Wishlist Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            <div className="p-3.5 rounded-2xl bg-white dark:bg-[#121212] border border-[#E6E6E3] dark:border-[#272727] shadow-xs">
              <p className="text-[11px] font-semibold text-[#737373] dark:text-[#A3A3A3] mb-0.5">
                Estimasi Dibutuhkan
              </p>
              <p className="text-sm sm:text-base font-extrabold text-rose-600 dark:text-rose-400 truncate">
                {formatCurrency(wishlistHook.summary.totalEstimated)}
              </p>
              <span className="text-[10px] text-[#A3A3A3] font-medium">
                {wishlistHook.summary.pendingCount} impian direncanakan
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-white dark:bg-[#121212] border border-[#E6E6E3] dark:border-[#272727] shadow-xs">
              <p className="text-[11px] font-semibold text-[#737373] dark:text-[#A3A3A3] mb-0.5">
                Sudah Terbeli / Tercapai
              </p>
              <p className="text-sm sm:text-base font-extrabold text-emerald-600 dark:text-emerald-400 truncate">
                {formatCurrency(wishlistHook.summary.totalAchieved)}
              </p>
              <span className="text-[10px] text-[#A3A3A3] font-medium">
                {wishlistHook.summary.achievedCount} impian terwujud
              </span>
            </div>

            <div className="col-span-2 sm:col-span-1 p-3.5 rounded-2xl bg-white dark:bg-[#121212] border border-[#E6E6E3] dark:border-[#272727] shadow-xs flex flex-col justify-between">
              <p className="text-[11px] font-semibold text-[#737373] dark:text-[#A3A3A3] mb-0.5">
                Breakdown Horizon
              </p>
              <div className="flex items-center justify-between text-[11px] text-[#737373] dark:text-[#A3A3A3] font-bold">
                <span>M: {formatCurrency(wishlistHook.summary.weeklyTotal)}</span>
                <span>B: {formatCurrency(wishlistHook.summary.monthlyTotal)}</span>
                <span>T: {formatCurrency(wishlistHook.summary.yearlyTotal)}</span>
              </div>
            </div>
          </div>

          {/* Period Filter Selector */}
          <div className="overflow-x-auto pb-1 no-scrollbar">
            <div className="inline-flex gap-1.5 p-1 rounded-2xl bg-white dark:bg-[#121212] border border-[#E6E6E3] dark:border-[#272727] shadow-xs min-w-full sm:min-w-0">
              {(
                [
                  { id: 'all', label: 'Semua Periode' },
                  { id: 'weekly', label: '📦 Mingguan' },
                  { id: 'monthly', label: '🛍️ Bulanan' },
                  { id: 'yearly', label: '🎯 Tahunan' },
                ] as const
              ).map(tab => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setWishlistPeriodFilter(tab.id)}
                  className={cn(
                    'py-1.5 px-3 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer whitespace-nowrap',
                    wishlistPeriodFilter === tab.id
                      ? 'bg-[#171717] text-white dark:bg-[#F5F5F5] dark:text-[#171717] shadow-xs'
                      : 'text-[#737373] dark:text-[#A3A3A3] hover:text-[#171717] dark:hover:text-[#F5F5F5]'
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Wishlist List Feed */}
          {wishlistHook.loading ? (
            <div className="space-y-3 animate-pulse">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-28 rounded-2xl bg-white/60 dark:bg-gray-800/60 border border-white/60 dark:border-gray-700/40" />
              ))}
            </div>
          ) : filteredWishlists.length === 0 ? (
            <EmptyState
              icon={<Gift className="w-8 h-8 text-gray-400" />}
              title="Belum ada wishlist"
              description="Catat impian atau barang yang ingin dibeli dalam horizon mingguan, bulanan, atau tahunan."
              action={
                <Button
                  size="sm"
                  onClick={() => {
                    setEditingWishlist(null)
                    setShowWishlistForm(true)
                  }}
                  icon={<Plus className="w-4 h-4" />}
                >
                  Tambah Wishlist Pertama
                </Button>
              }
            />
          ) : (
            <div className="space-y-3">
              {filteredWishlists.map(item => (
                <WishlistCard
                  key={item.id}
                  item={item}
                  onToggleAchieved={async (id, currentStatus) => {
                    await wishlistHook.toggleAchieved(id, currentStatus)
                    toast.success(
                      currentStatus === 'pending'
                        ? 'Wishlist ditandai tercapai! 🎉'
                        : 'Status wishlist dikembalikan ke direncanakan'
                    )
                  }}
                  onEdit={targetItem => {
                    setEditingWishlist(targetItem)
                    setShowWishlistForm(true)
                  }}
                  onDelete={id => {
                    setPendingDeleteWishlistId(id)
                  }}
                />
              ))}
            </div>
          )}

          {/* Wishlist BottomSheet Modal */}
          <BottomSheet
            open={showWishlistForm}
            onClose={() => {
              setShowWishlistForm(false)
              setEditingWishlist(null)
            }}
            title={editingWishlist ? 'Edit Wishlist' : 'Tambah Wishlist Baru'}
          >
            <div className="pb-4">
              <WishlistForm
                initialData={editingWishlist ?? undefined}
                onSubmit={async data => {
                  if (editingWishlist) {
                    await wishlistHook.updateItem(editingWishlist.id, data)
                    toast.success('Wishlist berhasil diperbarui!')
                  } else {
                    await wishlistHook.addItem(data)
                    toast.success('Wishlist baru berhasil disimpan! ✨')
                  }
                  setShowWishlistForm(false)
                  setEditingWishlist(null)
                }}
                onCancel={() => {
                  setShowWishlistForm(false)
                  setEditingWishlist(null)
                }}
                submitLabel={editingWishlist ? 'Perbarui' : 'Simpan Wishlist'}
              />
            </div>
          </BottomSheet>

          {/* Wishlist Delete Confirmation */}
          <ConfirmDialog
            open={pendingDeleteWishlistId !== null}
            onClose={() => setPendingDeleteWishlistId(null)}
            onConfirm={async () => {
              if (pendingDeleteWishlistId) {
                await wishlistHook.deleteItem(pendingDeleteWishlistId)
                toast.success('Wishlist berhasil dihapus')
                setPendingDeleteWishlistId(null)
              }
            }}
            title="Hapus Wishlist"
            message="Apakah Anda yakin ingin menghapus wishlist ini?"
            confirmLabel="Hapus"
          />
        </div>
      ) : viewMode === 'journal' ? (
        /* ─── 2. Journal & Wins View ─── */
        <JournalSection
          entries={journalHook.entries}
          loading={journalHook.loading}
          onAdd={journalHook.addEntry}
          onEdit={journalHook.updateEntry}
          onDelete={journalHook.deleteEntry}
        />
      ) : (
        /* ─── 3. Tasks List & Kanban View ─── */
        <div className="space-y-2.5">
          {/* Unified Bar: Search, Filter, Sort */}
          <div className="flex items-center gap-2">
            {/* Flexible Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                value={filters.search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Cari tugas..."
                className="w-full bg-white/80 dark:bg-slate-800/80 rounded-2xl border border-slate-200/70 dark:border-white/10 pl-9 pr-8 py-2 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-inner"
              />
              {filters.search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  aria-label="Hapus pencarian"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Filter Button */}
            <button
              type="button"
              onClick={() => setShowFilterModal(true)}
              className={cn(
                'w-9 h-9 rounded-2xl bg-[#F0F3F8] dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 border border-white/80 dark:border-white/10 shadow-sm active:scale-95 relative transition-all cursor-pointer shrink-0',
                (activeFilterCount > 0 || filters.timeframe !== 'all') &&
                  'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200 dark:border-indigo-800'
              )}
              title="Filter & Horizon Tugas"
            >
              <Filter className="w-4 h-4" />
              {(activeFilterCount > 0 || filters.timeframe !== 'all') && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-indigo-600 text-white text-[9px] font-bold flex items-center justify-center shadow-sm">
                  {activeFilterCount + (filters.timeframe !== 'all' ? 1 : 0)}
                </span>
              )}
            </button>

            {/* Sort Button */}
            <button
              type="button"
              onClick={() => {
                const currentIdx = SORT_OPTIONS.findIndex(s => s.value === filters.sort)
                const nextIdx = (currentIdx + 1) % SORT_OPTIONS.length
                setSort(SORT_OPTIONS[nextIdx].value)
                toast.info(`Urutan: ${SORT_OPTIONS[nextIdx].label}`)
              }}
              className="w-9 h-9 rounded-2xl bg-[#F0F3F8] dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 border border-white/80 dark:border-white/10 shadow-sm active:scale-95 transition-all cursor-pointer shrink-0"
              title={`Urutkan: ${SORT_OPTIONS.find(s => s.value === filters.sort)?.label}`}
            >
              <ArrowUpDown className="w-4 h-4" />
            </button>
          </div>

          {/* Status Filter Chips (Semua, Belum, Dikerjakan, Selesai) */}
          {viewMode === 'list' && (
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 my-1">
              {STATUS_TABS.map(tab => {
                const isActive = filters.status === tab.value
                const count = statusCounts[tab.value] ?? 0
                return (
                  <button
                    key={tab.value}
                    type="button"
                    onClick={() => setStatus(tab.value)}
                    className={cn(
                      'transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5',
                      isActive
                        ? 'bg-indigo-600 text-white font-semibold text-xs px-3.5 py-1.5 rounded-xl shadow-sm active:scale-95'
                        : 'bg-slate-100 hover:bg-slate-200/70 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 text-xs font-medium px-3.5 py-1.5 rounded-xl'
                    )}
                  >
                    <span>{tab.label}</span>
                    <span
                      className={cn(
                        'text-[10px] px-1.5 py-0.5 rounded-md font-bold',
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-slate-200/80 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                      )}
                    >
                      {count}
                    </span>
                  </button>
                )
              })}
            </div>
          )}

          {/* Task Content: List or Kanban */}
          {loading ? (
            <LoadingState text="Memuat tugas..." />
          ) : viewMode === 'kanban' ? (
            <KanbanBoard
              tasks={filteredTasks}
              subtasksMap={subtasksMap}
              assigneeMap={memberNameMap}
              onSelectTask={handleTaskClick}
              onChangeStatus={handleStatusChange}
              onAddTask={() => setShowForm(true)}
            />
          ) : (
            <TaskList
              tasks={filteredTasks}
              subtasksMap={subtasksMap}
              assigneeMap={memberNameMap}
              onTaskClick={handleTaskClick}
              onStatusChange={handleStatusChange}
              onAddTask={() => setShowForm(true)}
              emptyTitle={
                filters.search || activeFilterCount > 0 || filters.timeframe !== 'all'
                  ? 'Tidak ada tugas yang sesuai.'
                  : 'Belum ada tugas'
              }
              emptyDescription={
                filters.search || activeFilterCount > 0 || filters.timeframe !== 'all'
                  ? 'Coba ubah filter atau kata kunci pencarian.'
                  : 'Tambahkan tugas untuk mulai mengatur pekerjaan Anda.'
              }
            />
          )}
        </div>
      )}

      {/* Task Detail Modal */}
      <BottomSheet
        open={showDetail && !!selectedTask}
        onClose={handleCloseDetail}
        title="Detail Tugas"
        onDelete={() => setShowDeleteConfirm(true)}
        deleteLabel="Hapus Tugas"
      >
        {selectedTask && (
          <div className="space-y-4 pb-2">
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Status</p>
              <TaskStatusSelector
                value={selectedTask.status}
                onChange={async status => {
                  await handleStatusChange(selectedTask.id, status)
                  setSelectedTask({ ...selectedTask, status })
                }}
                size="sm"
              />
            </div>

            <TaskForm
              key={selectedTask.id}
              initialTitle={selectedTask.title}
              initialDescription={selectedTask.description ?? ''}
              initialPriority={selectedTask.priority}
              initialTimeframe={selectedTask.timeframe ?? 'daily'}
              initialCategory={selectedTask.category ?? ''}
              initialDueDate={selectedTask.due_date?.slice(0, 16) ?? ''}
              initialReminderAt={selectedTask.reminder_at?.slice(0, 16) ?? ''}
              initialAssigneeId={selectedTask.assignee_id}
              workspaceMembers={workspaceHook.members}
              categories={categories}
              onSubmit={handleUpdateTask}
              submitLabel="Simpan Perubahan"
            />

            <div className="rounded-2xl p-4 bg-gray-50/70 dark:bg-gray-800/70 border border-gray-200/80 dark:border-gray-700/80">
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">Subtask</p>
              <SubtaskList
                subtasks={subtasks}
                userId={userId}
                onAdd={async (uid, title) => {
                  await addSubtask(uid, title)
                  await refreshSubtasks()
                  await loadSubtasksMap()
                }}
                onToggle={async id => {
                  await toggleSubtask(id)
                  await refreshSubtasks()
                  await loadSubtasksMap()
                }}
                onDelete={async id => {
                  await removeSubtask(id)
                  await refreshSubtasks()
                  await loadSubtasksMap()
                }}
                onEdit={async (id, data) => {
                  await editSubtask(id, data)
                  await refreshSubtasks()
                  await loadSubtasksMap()
                }}
              />
            </div>
          </div>
        )}
      </BottomSheet>

      {/* ─── Filter & Horizon Modal ─── */}
      <BottomSheet
        open={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        title="Filter & Horizon Tugas"
      >
        <div className="space-y-4 pb-4">
          {/* Horizon Waktu */}
          <div>
            <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
              Horizon Waktu
            </p>
            <div className="grid grid-cols-2 gap-1.5">
              {TIMEFRAME_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setTimeframe(opt.value)}
                  className={cn(
                    'px-3 py-2 text-xs font-medium rounded-xl border transition-all cursor-pointer text-left flex items-center justify-between',
                    filters.timeframe === opt.value
                      ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800 font-semibold shadow-xs'
                      : 'border-slate-200/80 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                  )}
                >
                  <span>{opt.label}</span>
                  {filters.timeframe === opt.value && (
                    <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Prioritas */}
          <div>
            <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
              Prioritas
            </p>
            <div className="flex flex-wrap gap-1.5">
              {PRIORITY_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setPriority(opt.value)}
                  className={cn(
                    'px-3 py-1.5 text-xs rounded-full border transition-all cursor-pointer',
                    filters.priority === opt.value
                      ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800 font-semibold shadow-xs'
                      : 'border-slate-200/80 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Urutkan Berdasarkan */}
          <div>
            <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
              Urutkan Berdasarkan
            </p>
            <div className="grid grid-cols-2 gap-1.5">
              {SORT_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setSort(opt.value)}
                  className={cn(
                    'px-3 py-2 text-xs font-medium rounded-xl border transition-all cursor-pointer text-left flex items-center justify-between',
                    filters.sort === opt.value
                      ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800 font-semibold shadow-xs'
                      : 'border-slate-200/80 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                  )}
                >
                  <span>{opt.label}</span>
                  {filters.sort === opt.value && (
                    <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Kategori (jika ada) */}
          {categories.length > 0 && (
            <div>
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                Kategori
              </p>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => setCategory('all')}
                  className={cn(
                    'px-3 py-1.5 text-xs rounded-full border transition-all cursor-pointer',
                    filters.category === 'all'
                      ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800 font-semibold shadow-xs'
                      : 'border-slate-200/80 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                  )}
                >
                  Semua
                </button>
                {categories.map(cat => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={cn(
                      'px-3 py-1.5 text-xs rounded-full border transition-all cursor-pointer',
                      filters.category === cat
                        ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800 font-semibold shadow-xs'
                        : 'border-slate-200/80 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                    )}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Hanya Terlambat */}
          <div className="pt-1">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={filters.overdueOnly}
                onChange={e => setOverdueOnly(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                Hanya tampilkan tugas yang terlambat
              </span>
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 pt-3 border-t border-slate-200/60 dark:border-slate-800">
            <button
              type="button"
              onClick={() => {
                resetFilters()
                toast.success('Filter telah direset')
              }}
              className="flex-1 py-2 px-3 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-all cursor-pointer text-center"
            >
              Reset Filter
            </button>
            <button
              type="button"
              onClick={() => setShowFilterModal(false)}
              className="flex-1 py-2 px-3 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-all cursor-pointer text-center"
            >
              Terapkan
            </button>
          </div>
        </div>
      </BottomSheet>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeleteTask}
        title="Hapus Tugas"
        message={`Apakah Anda yakin ingin menghapus "${selectedTask?.title}"?`}
        confirmLabel="Hapus"
      />

      {/* Workspace Manager & Creator Modal */}
      <WorkspaceManagerModal
        open={showWorkspaceManager}
        onClose={() => setShowWorkspaceManager(false)}
        workspace={workspaceHook.activeWorkspace}
        members={workspaceHook.members}
        isCreating={isCreatingWorkspace}
        onCreateWorkspace={async (name, desc) => {
          await workspaceHook.addWorkspace({ name, description: desc })
        }}
        onUpdateWorkspace={async (name, desc) => {
          if (!workspaceHook.activeWorkspace) return
          await workspaceHook.editWorkspace(workspaceHook.activeWorkspace.id, {
            name,
            description: desc,
          })
        }}
        onDeleteWorkspace={async () => {
          if (!workspaceHook.activeWorkspace) return
          await workspaceHook.removeWorkspace(workspaceHook.activeWorkspace.id)
        }}
        onInviteMember={async (email, role) => {
          await workspaceHook.inviteMember(email, role)
        }}
        onUpdateRole={async (memberId, role) => {
          await workspaceHook.updateRole(memberId, role)
        }}
        onRemoveMember={async memberId => {
          await workspaceHook.removeMember(memberId)
        }}
      />

      {/* ─── Popup: Form Buat Tugas Baru ─── */}
      <BottomSheet
        open={showForm}
        onClose={() => setShowForm(false)}
        title="Buat Tugas Baru"
      >
        <div className="pb-4">
          <TaskForm
            categories={categories}
            workspaceMembers={workspaceHook.members}
            onSubmit={handleCreateTask}
            onCancel={() => setShowForm(false)}
            submitLabel="Buat Tugas"
          />
        </div>
      </BottomSheet>
    </div>
  )
}
