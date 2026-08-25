import type { Task } from '@/types'
import { isOverdue } from '@/features/todo/services/taskService'
import { BarChart3, AlertCircle, CheckCircle2, Clock } from 'lucide-react'

interface TaskAnalyticsCardProps {
  tasks: Task[]
}

export function TaskAnalyticsCard({ tasks }: TaskAnalyticsCardProps) {
  const total = tasks.length
  if (total === 0) return null

  const highPriority = tasks.filter(t => t.priority === 'high').length
  const mediumPriority = tasks.filter(t => t.priority === 'medium').length
  const lowPriority = tasks.filter(t => t.priority === 'low').length

  const completed = tasks.filter(t => t.status === 'completed').length
  const inProgress = tasks.filter(t => t.status === 'in_progress').length
  const todo = tasks.filter(t => t.status === 'todo').length
  const overdueCount = tasks.filter(t => isOverdue(t)).length

  return (
    <div className="rounded-[26px] bg-white/90 dark:bg-gray-800/90 border border-white/80 dark:border-gray-700/50 p-4 sm:p-5 shadow-sm backdrop-blur-md space-y-3.5">
      <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-extrabold text-gray-900 dark:text-gray-100">
              Analisis Beban Tugas
            </h3>
            <p className="text-[10px] text-gray-500 dark:text-gray-400">
              Distribusi prioritas & status pekerjaan
            </p>
          </div>
        </div>

        {overdueCount > 0 ? (
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/50 text-rose-700 dark:text-rose-300 text-[10px] font-bold">
            <AlertCircle className="w-3 h-3" />
            <span>{overdueCount} Terlambat</span>
          </div>
        ) : (
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold">
            <CheckCircle2 className="w-3 h-3" />
            <span>Tepat Waktu</span>
          </div>
        )}
      </div>

      {/* Priority Metrics Grid */}
      <div className="grid grid-cols-3 gap-2.5 pt-1">
        <div className="p-3 rounded-2xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/30 text-center space-y-0.5">
          <span className="text-[10px] font-bold text-rose-700 dark:text-rose-400 uppercase tracking-wider">
            Tinggi
          </span>
          <p className="text-lg font-black text-rose-600 dark:text-rose-300">
            {highPriority}
          </p>
        </div>

        <div className="p-3 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/30 text-center space-y-0.5">
          <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">
            Sedang
          </span>
          <p className="text-lg font-black text-amber-600 dark:text-amber-300">
            {mediumPriority}
          </p>
        </div>

        <div className="p-3 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/30 text-center space-y-0.5">
          <span className="text-[10px] font-bold text-[#2563EB] dark:text-blue-400 uppercase tracking-wider">
            Rendah
          </span>
          <p className="text-lg font-black text-blue-600 dark:text-blue-300">
            {lowPriority}
          </p>
        </div>
      </div>

      {/* Status Breakdown Bar */}
      <div className="space-y-1.5 pt-1">
        <div className="flex justify-between text-[11px] font-semibold text-gray-500 dark:text-gray-400">
          <span>{completed} Selesai</span>
          <span>{inProgress} Dikerjakan</span>
          <span>{todo} Belum</span>
        </div>
        <div className="w-full h-2 rounded-full bg-gray-100 dark:bg-gray-700 flex overflow-hidden">
          {completed > 0 && (
            <div
              className="bg-emerald-500 h-full"
              style={{ width: `${(completed / total) * 100}%` }}
              title={`Selesai: ${completed}`}
            />
          )}
          {inProgress > 0 && (
            <div
              className="bg-blue-500 h-full"
              style={{ width: `${(inProgress / total) * 100}%` }}
              title={`Dikerjakan: ${inProgress}`}
            />
          )}
          {todo > 0 && (
            <div
              className="bg-amber-400 h-full"
              style={{ width: `${(todo / total) * 100}%` }}
              title={`Belum: ${todo}`}
            />
          )}
        </div>
      </div>
    </div>
  )
}
