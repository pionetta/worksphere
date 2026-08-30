import { useState, useEffect, useCallback, useMemo } from 'react'
import { useAuth } from '@/lib/auth'
import { useTasks } from '@/features/todo/hooks/useTasks'
import { useSubtasks } from '@/features/todo/hooks/useSubtasks'
import { useTaskFilters } from '@/features/todo/hooks/useTaskFilters'
import { useTaskReminder } from '@/features/todo/hooks/useTaskReminder'
import { useJournal } from '@/features/journal/hooks/useJournal'
import { useWishlist } from '@/features/finance/hooks/useWishlist'
import { useHabits } from '@/features/todo/hooks/useHabits'
import * as subtaskService from '@/features/todo/services/subtaskService'
import { TaskForm } from '@/features/todo/components/TaskForm'
import { TaskList } from '@/features/todo/components/TaskList'
import { KanbanBoard } from '@/features/todo/components/KanbanBoard'
import { TaskSearch } from '@/features/todo/components/TaskSearch'
import { TaskFiltersComponent } from '@/features/todo/components/TaskFilters'
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
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Plus,
  ListTodo,
  LayoutGrid,
  List,
  Gift,
  BookOpen,
  Flame,
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

const STATUS_TABS: { value: TaskStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'Semua' },
  { value: 'todo', label: 'Belum' },
  { value: 'in_progress', label: 'Dikerjakan' },
  { value: 'completed', label: 'Selesai' },
]

export function TodoPage() {
  const { user } = useAuth()
  const userId = user?.id ?? ''
  const { tasks, loading, addTask, editTask, removeTask, changeStatus } = useTasks(userId)
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
  } = useTaskFilters(tasks)
  const { checkAndRequestPermission, scheduleAllReminders } = useTaskReminder()
  const journalHook = useJournal(userId || null)
  const wishlistHook = useWishlist(userId || null)

  const [showForm, setShowForm] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [showDetail, setShowDetail] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [viewMode, setViewMode] = useState<'list' | 'kanban' | 'habits' | 'wishlist' | 'journal'>('list')

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
      })
      toast.success(`Tugas "${data.title}" berhasil dibuat!`)
      setShowForm(false)
    } catch {
      toast.error('Gagal membuat tugas')
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

  const handleUpdateTask = async (data: {
    title: string
    description?: string
    priority: TaskPriority
    timeframe?: TaskTimeframe
    category?: string
    dueDate?: string
    reminderAt?: string
  }) => {
    if (!selectedTask) return
    try {
      await editTask(selectedTask.id, {
        title: data.title,
        description: data.description ?? null,
        status: selectedTask.status,
        priority: data.priority,
        timeframe: data.timeframe,
        category: data.category ?? null,
        dueDate: data.dueDate ?? null,
        reminderAt: data.reminderAt ?? null,
      })
      setSelectedTask({
        ...selectedTask,
        title: data.title,
        description: data.description ?? null,
        priority: data.priority,
        timeframe: data.timeframe,
        category: data.category ?? null,
        due_date: data.dueDate ?? null,
        reminder_at: data.reminderAt ?? null,
      })
      toast.success('Tugas berhasil diperbarui')
      handleCloseDetail()
    } catch {
      toast.error('Gagal memperbarui tugas')
    }
  }

  return (
    <div className="max-w-md mx-auto space-y-3.5 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <div
            className={cn(
              'w-8 h-8 rounded-xl flex items-center justify-center transition-colors',
              viewMode === 'habits'
                ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                : viewMode === 'wishlist'
                ? 'bg-pink-500/10 text-pink-600 dark:text-pink-400'
                : viewMode === 'journal'
                  ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                  : 'bg-blue-500/10 text-[#2563EB] dark:text-blue-400'
            )}
          >
            {viewMode === 'habits' ? (
              <Flame className="w-5 h-5 text-amber-500 fill-amber-500" />
            ) : viewMode === 'wishlist' ? (
              <Gift className="w-5 h-5" />
            ) : viewMode === 'journal' ? (
              <BookOpen className="w-5 h-5" />
            ) : (
              <ListTodo className="w-5 h-5" />
            )}
          </div>
          <h1 className="text-base sm:text-lg font-black text-gray-900 dark:text-gray-100">
            {viewMode === 'habits'
              ? 'Kebiasaan & Streak'
              : viewMode === 'wishlist'
              ? 'Wishlist Impian'
              : viewMode === 'journal'
                ? 'Catatan & Jurnal'
                : 'Daftar Tugas (To-Do)'}
          </h1>
        </div>

        {/* Dynamic Top Action Button */}
        {viewMode === 'habits' ? (
          <Button
            size="sm"
            onClick={() => {
              setEditingHabit(null)
              setShowHabitForm(true)
            }}
            icon={<Plus className="w-3.5 h-3.5" />}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs h-8 px-2.5 sm:px-3 whitespace-nowrap shrink-0"
          >
            Kebiasaan
          </Button>
        ) : viewMode === 'wishlist' ? (
          <Button
            size="sm"
            onClick={() => {
              setEditingWishlist(null)
              setShowWishlistForm(true)
            }}
            icon={<Plus className="w-3.5 h-3.5" />}
            className="bg-[#2563EB] hover:bg-blue-700 text-white font-bold text-xs h-8 px-2.5 sm:px-3 whitespace-nowrap shrink-0"
          >
            Wishlist
          </Button>
        ) : viewMode === 'list' || viewMode === 'kanban' ? (
          <Button
            size="sm"
            onClick={() => setShowForm(!showForm)}
            icon={<Plus className="w-3.5 h-3.5" />}
            className="font-bold text-xs h-8 px-2.5 sm:px-3 whitespace-nowrap shrink-0"
          >
            {showForm ? 'Tutup' : 'Tugas Baru'}
          </Button>
        ) : null}
      </div>

      {/* Analytics Card (Always visible across all tabs) */}
      <TaskAnalyticsCard tasks={tasks} />

      {/* Task Creation Form Inline (if open in task view) */}
      {showForm && (viewMode === 'list' || viewMode === 'kanban') && (
        <div className="animate-fade-in-up">
          <TaskForm
            categories={categories}
            onSubmit={handleCreateTask}
            onCancel={() => setShowForm(false)}
            submitLabel="Buat Tugas"
          />
        </div>
      )}

      {/* View Mode Segmented Switcher (Daftar | Kanban | Kebiasaan | Wishlist | Catatan) */}
      <div className="flex items-center justify-between p-1 rounded-2xl bg-white/75 dark:bg-gray-800/75 backdrop-blur-md border border-white/80 dark:border-gray-700/50 shadow-xs gap-1">
        <button
          type="button"
          onClick={() => setViewMode('list')}
          className={cn(
            'flex-1 flex items-center justify-center gap-1 py-2 px-1 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer',
            viewMode === 'list'
              ? 'bg-[#2563EB] text-white shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
          )}
        >
          <List className="w-3.5 h-3.5" />
          <span>Daftar</span>
        </button>

        <button
          type="button"
          onClick={() => setViewMode('kanban')}
          className={cn(
            'flex-1 flex items-center justify-center gap-1 py-2 px-1 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer',
            viewMode === 'kanban'
              ? 'bg-[#2563EB] text-white shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
          )}
        >
          <LayoutGrid className="w-3.5 h-3.5" />
          <span>Kanban</span>
        </button>

        <button
          type="button"
          onClick={() => setViewMode('habits')}
          className={cn(
            'flex-1 flex items-center justify-center gap-1 py-2 px-1 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer',
            viewMode === 'habits'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
          )}
        >
          <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
          <span>Habit</span>
        </button>

        <button
          type="button"
          onClick={() => setViewMode('wishlist')}
          className={cn(
            'flex-1 flex items-center justify-center gap-1 py-2 px-1 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer',
            viewMode === 'wishlist'
              ? 'bg-[#2563EB] text-white shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
          )}
        >
          <Gift className="w-3.5 h-3.5" />
          <span>Wishlist</span>
        </button>

        <button
          type="button"
          onClick={() => setViewMode('journal')}
          className={cn(
            'flex-1 flex items-center justify-center gap-1 py-2 px-1 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer',
            viewMode === 'journal'
              ? 'bg-amber-500 text-white shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
          )}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Catatan</span>
        </button>
      </div>

      {/* ─── 0. Habit Tracker View ─── */}
      {viewMode === 'habits' ? (
        <div className="space-y-4 animate-fade-in-up">
          {/* Summary Stat Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            <div className="p-3.5 rounded-2xl bg-white/80 dark:bg-gray-800/80 border border-white/80 dark:border-gray-700/50 shadow-xs">
              <p className="text-[11px] font-bold text-gray-500 dark:text-gray-400 mb-0.5">
                Total Kebiasaan
              </p>
              <p className="text-lg sm:text-xl font-black text-gray-900 dark:text-white">
                {habitsHook.totalHabits}
              </p>
              <span className="text-[10px] text-gray-400 font-medium">Aktif dipantau</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/80 dark:bg-gray-800/80 border border-white/80 dark:border-gray-700/50 shadow-xs">
              <p className="text-[11px] font-bold text-gray-500 dark:text-gray-400 mb-0.5">
                Selesai Hari Ini
              </p>
              <p className="text-lg sm:text-xl font-black text-emerald-600 dark:text-emerald-400">
                {habitsHook.totalCompletedToday} / {habitsHook.totalHabits}
              </p>
              <span className="text-[10px] text-gray-400 font-medium">
                {habitsHook.totalHabits > 0
                  ? `${Math.round((habitsHook.totalCompletedToday / habitsHook.totalHabits) * 100)}% tercapai`
                  : '0%'}
              </span>
            </div>

            <div className="col-span-2 sm:col-span-1 p-3.5 rounded-2xl bg-white/80 dark:bg-gray-800/80 border border-white/80 dark:border-gray-700/50 shadow-xs flex flex-col justify-between">
              <p className="text-[11px] font-bold text-gray-500 dark:text-gray-400 mb-0.5">
                Total Check-in
              </p>
              <p className="text-lg sm:text-xl font-black text-indigo-600 dark:text-indigo-400">
                {habitsHook.logs.length}
              </p>
              <span className="text-[10px] text-gray-400 font-medium">Log tercatat</span>
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
            <div className="p-3.5 rounded-2xl bg-white/80 dark:bg-gray-800/80 border border-white/80 dark:border-gray-700/50 shadow-xs">
              <p className="text-[11px] font-bold text-gray-500 dark:text-gray-400 mb-0.5">
                Estimasi Dibutuhkan
              </p>
              <p className="text-sm sm:text-base font-black text-rose-600 dark:text-rose-400 truncate">
                {formatCurrency(wishlistHook.summary.totalEstimated)}
              </p>
              <span className="text-[10px] text-gray-400 font-medium">
                {wishlistHook.summary.pendingCount} impian direncanakan
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/80 dark:bg-gray-800/80 border border-white/80 dark:border-gray-700/50 shadow-xs">
              <p className="text-[11px] font-bold text-gray-500 dark:text-gray-400 mb-0.5">
                Sudah Terbeli / Tercapai
              </p>
              <p className="text-sm sm:text-base font-black text-emerald-600 dark:text-emerald-400 truncate">
                {formatCurrency(wishlistHook.summary.totalAchieved)}
              </p>
              <span className="text-[10px] text-gray-400 font-medium">
                {wishlistHook.summary.achievedCount} impian terwujud
              </span>
            </div>

            <div className="col-span-2 sm:col-span-1 p-3.5 rounded-2xl bg-white/80 dark:bg-gray-800/80 border border-white/80 dark:border-gray-700/50 shadow-xs flex flex-col justify-between">
              <p className="text-[11px] font-bold text-gray-500 dark:text-gray-400 mb-0.5">
                Breakdown Horizon
              </p>
              <div className="flex items-center justify-between text-[11px] text-gray-600 dark:text-gray-300 font-bold">
                <span>M: {formatCurrency(wishlistHook.summary.weeklyTotal)}</span>
                <span>B: {formatCurrency(wishlistHook.summary.monthlyTotal)}</span>
                <span>T: {formatCurrency(wishlistHook.summary.yearlyTotal)}</span>
              </div>
            </div>
          </div>

          {/* Period Filter Selector */}
          <div className="overflow-x-auto pb-1 no-scrollbar">
            <div className="inline-flex gap-1.5 p-1 rounded-2xl bg-white/70 dark:bg-gray-800/70 border border-white/80 dark:border-gray-700/50 shadow-xs min-w-full sm:min-w-0">
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
                    'py-1.5 px-3 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer whitespace-nowrap',
                    wishlistPeriodFilter === tab.id
                      ? 'bg-[#2563EB] text-white shadow-xs'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
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
        <div className="space-y-3">
          {/* Time Horizon Filter Pills (Harian, Mingguan, Tahunan) */}
          <div className="overflow-x-auto pb-1 no-scrollbar">
            <div className="inline-flex gap-1.5 p-1 rounded-2xl bg-white/70 dark:bg-gray-800/70 border border-white/80 dark:border-gray-700/50 shadow-xs min-w-full sm:min-w-0">
              {(
                [
                  { id: 'all', label: 'Semua Horizon' },
                  { id: 'daily', label: '☀️ Harian' },
                  { id: 'weekly', label: '📅 Mingguan' },
                  { id: 'yearly', label: '🎯 Tahunan' },
                ] as const
              ).map(tab => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setTimeframe(tab.id)}
                  className={cn(
                    'py-1.5 px-3 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer whitespace-nowrap',
                    filters.timeframe === tab.id
                      ? 'bg-[#2563EB] text-white shadow-xs'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Search & Filters */}
          <div className="space-y-2">
            <TaskSearch value={filters.search} onChange={setSearch} />

            {viewMode === 'list' && (
              <div className="overflow-x-auto pb-1 no-scrollbar">
                <Tabs value={filters.status} onValueChange={val => setStatus(val as TaskStatus | 'all')}>
                  <TabsList className="min-w-max w-full h-11 p-1 rounded-2xl bg-white/75 dark:bg-gray-800/75 backdrop-blur-md border border-white/80 dark:border-gray-700/50 shadow-xs">
                    {STATUS_TABS.map(tab => (
                      <TabsTrigger
                        key={tab.value}
                        value={tab.value}
                        role="button"
                        className="flex-1 rounded-xl text-xs sm:text-sm font-bold data-[state=active]:bg-[#2563EB] data-[state=active]:text-white data-[state=active]:shadow-sm transition-all px-3"
                      >
                        {tab.label}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </Tabs>
              </div>
            )}

            <TaskFiltersComponent
              filters={filters}
              categories={categories}
              activeFilterCount={activeFilterCount}
              onSetStatus={setStatus}
              onSetPriority={setPriority}
              onSetCategory={setCategory}
              onSetOverdueOnly={setOverdueOnly}
              onSetSort={setSort}
              onReset={resetFilters}
            />
          </div>

          {/* Task Content: List or Kanban */}
          {loading ? (
            <LoadingState text="Memuat tugas..." />
          ) : viewMode === 'kanban' ? (
            <KanbanBoard
              tasks={filteredTasks}
              subtasksMap={subtasksMap}
              onSelectTask={handleTaskClick}
              onChangeStatus={handleStatusChange}
              onAddTask={() => setShowForm(true)}
            />
          ) : (
            <TaskList
              tasks={filteredTasks}
              subtasksMap={subtasksMap}
              onTaskClick={handleTaskClick}
              onStatusChange={handleStatusChange}
              emptyTitle={
                filters.search || activeFilterCount > 0
                  ? 'Tidak ada tugas yang sesuai.'
                  : 'Belum ada tugas'
              }
              emptyDescription={
                filters.search || activeFilterCount > 0
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

            <Button variant="danger" className="w-full" onClick={() => setShowDeleteConfirm(true)}>
              Hapus Tugas
            </Button>
          </div>
        )}
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
    </div>
  )
}
