import type { Task } from '@/types'
import { isOverdue } from '@/features/todo/services/taskService'
import { BarChart3, AlertCircle, CheckCircle2 } from 'lucide-react'

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
    <div className="rounded-2xl bg-white dark:bg-[#121212] border border-[#E6E6E3] dark:border-[#272727] p-4 sm:p-5 shadow-xs space-y-3.5">
      <div className="flex items-center justify-between pb-2 border-b border-[#E6E6E3] dark:border-[#222222]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-[#2563EB] dark:text-[#3B82F6] flex items-center justify-center">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-[#171717] dark:text-[#F5F5F5]">
              Analisis Beban Tugas
            </h3>
            <p className="text-[10px] text-[#737373] dark:text-[#A3A3A3]">
              Distribusi prioritas & status pekerjaan
            </p>
          </div>
        </div>

        {overdueCount > 0 ? (
          <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-400 text-[10px] font-semibold">
            <AlertCircle className="w-3 h-3" />
            <span>{overdueCount} Terlambat</span>
          </div>
        ) : (
          <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-[10px] font-semibold">
            <CheckCircle2 className="w-3 h-3" />
            <span>Tepat Waktu</span>
          </div>
        )}
      </div>

      {/* Priority Metrics Grid */}
      <div className="grid grid-cols-3 gap-2.5 pt-1">
        <div className="p-2.5 sm:p-3 rounded-xl bg-[#F7F7F5] dark:bg-[#181818] border border-[#E6E6E3] dark:border-[#222222] text-center space-y-0.5">
          <span className="text-[10px] font-semibold text-rose-600 dark:text-rose-400 uppercase tracking-wider">
            Tinggi
          </span>
          <p className="text-lg font-bold text-[#171717] dark:text-[#F5F5F5]">
            {highPriority}
          </p>
        </div>

        <div className="p-2.5 sm:p-3 rounded-xl bg-[#F7F7F5] dark:bg-[#181818] border border-[#E6E6E3] dark:border-[#222222] text-center space-y-0.5">
          <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
            Sedang
          </span>
          <p className="text-lg font-bold text-[#171717] dark:text-[#F5F5F5]">
            {mediumPriority}
          </p>
        </div>

        <div className="p-2.5 sm:p-3 rounded-xl bg-[#F7F7F5] dark:bg-[#181818] border border-[#E6E6E3] dark:border-[#222222] text-center space-y-0.5">
          <span className="text-[10px] font-semibold text-[#2563EB] dark:text-[#3B82F6] uppercase tracking-wider">
            Rendah
          </span>
          <p className="text-lg font-bold text-[#171717] dark:text-[#F5F5F5]">
            {lowPriority}
          </p>
        </div>
      </div>

      {/* Status Breakdown Bar */}
      <div className="space-y-1.5 pt-1">
        <div className="flex justify-between text-[11px] font-semibold text-[#737373] dark:text-[#A3A3A3]">
          <span>{completed} Selesai</span>
          <span>{inProgress} Dikerjakan</span>
          <span>{todo} Belum</span>
        </div>
        <div className="w-full h-2 rounded-full bg-[#E6E6E3] dark:bg-[#222222] flex overflow-hidden">
          {completed > 0 && (
            <div
              className="bg-emerald-500 h-full"
              style={{ width: `${(completed / total) * 100}%` }}
              title={`Selesai: ${completed}`}
            />
          )}
          {inProgress > 0 && (
            <div
              className="bg-[#2563EB] h-full"
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
