import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/lib/auth'
import { useTasks } from '@/features/todo/hooks/useTasks'
import { useSubtasks } from '@/features/todo/hooks/useSubtasks'
import { useTaskFilters } from '@/features/todo/hooks/useTaskFilters'
import { useTaskReminder } from '@/features/todo/hooks/useTaskReminder'
import { useJournal } from '@/features/journal/hooks/useJournal'
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
import { Button } from '@/components/ui/Button'
import { LoadingState } from '@/components/ui/LoadingState'
import { BottomSheet } from '@/components/ui/BottomSheet'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Plus,
  ListTodo,
  LayoutGrid,
  List,
  BookOpen,
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import type { Task, TaskStatus, TaskPriority, TaskTimeframe, Subtask } from '@/types'

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

  const [showForm, setShowForm] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [showDetail, setShowDetail] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [viewMode, setViewMode] = useState<'list' | 'kanban' | 'journal'>('list')

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
          <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-[#2563EB] dark:text-blue-400 flex items-center justify-center">
            <ListTodo className="w-5 h-5" />
          </div>
          <h1 className="text-base sm:text-lg font-black text-gray-900 dark:text-gray-100">
            Daftar Tugas & Jurnal
          </h1>
        </div>

        {viewMode !== 'journal' && (
          <Button
            size="sm"
            onClick={() => setShowForm(!showForm)}
            icon={<Plus className="w-4 h-4" />}
            className="font-bold"
          >
            {showForm ? 'Tutup' : 'Tugas Baru'}
          </Button>
        )}
      </div>

      {/* Analytics Card (for Tasks) */}
      {viewMode !== 'journal' && (
        <TaskAnalyticsCard tasks={tasks} />
      )}

      {/* Task Creation Form Inline (if open) */}
      {showForm && viewMode !== 'journal' && (
        <div className="animate-fade-in-up">
          <TaskForm
            categories={categories}
            onSubmit={handleCreateTask}
            onCancel={() => setShowForm(false)}
            submitLabel="Buat Tugas"
          />
        </div>
      )}

      {/* View Mode Segmented Switcher (Daftar | Kanban | Catatan & Jurnal) */}
      <div className="flex items-center justify-between p-1 rounded-2xl bg-white/75 dark:bg-gray-800/75 backdrop-blur-md border border-white/80 dark:border-gray-700/50 shadow-xs">
        <button
          type="button"
          onClick={() => setViewMode('list')}
          className={cn(
            'flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer',
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
            'flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer',
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
          onClick={() => setViewMode('journal')}
          className={cn(
            'flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer',
            viewMode === 'journal'
              ? 'bg-amber-500 text-white shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
          )}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Catatan & Win</span>
        </button>
      </div>

      {/* Journal View */}
      {viewMode === 'journal' ? (
        <JournalSection
          entries={journalHook.entries}
          loading={journalHook.loading}
          onAdd={journalHook.addEntry}
          onEdit={journalHook.updateEntry}
          onDelete={journalHook.deleteEntry}
        />
      ) : (
        /* Tasks List & Kanban View */
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
