import { AttendanceRow } from './AttendanceRow'
import { EmptyState } from '@/components/ui/EmptyState'
import { LoadingState } from '@/components/ui/LoadingState'
import { Button } from '@/components/ui/Button'
import { Users, Save, CheckCheck, Moon } from 'lucide-react'
import type { Attendance, AttendanceStatus, Member } from '@/types'

interface AttendanceListProps {
  members: Member[]
  attendance: Attendance[]
  pendingStatuses?: Map<string, AttendanceStatus>
  onStatusChange: (memberId: string, status: AttendanceStatus) => void
  onSave: () => void
  loading?: boolean
  saving?: boolean
  hasChanges?: boolean
}

export function AttendanceList({
  members,
  attendance,
  pendingStatuses,
  onStatusChange,
  onSave,
  loading,
  saving,
  hasChanges,
}: AttendanceListProps) {
  if (loading) {
    return <LoadingState text="Memuat anggota..." />
  }

  const activeMembers = members.filter(m => m.is_active)

  if (activeMembers.length === 0) {
    return (
      <EmptyState
        icon={<Users className="w-6 h-6 text-gray-400" />}
        title="Belum ada anggota"
        description="Tambahkan anggota untuk mulai mencatat absensi."
      />
    )
  }

  const handleSetAll = (status: AttendanceStatus) => {
    activeMembers.forEach(m => {
      onStatusChange(m.id, status)
    })
  }

  return (
    <div className="space-y-3">
      {/* Quick Bulk Action Buttons */}
      <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-slate-200/60 dark:border-slate-800/60">
        <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          Aksi Cepat:
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleSetAll('present')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#F0F3F8] dark:bg-slate-800 border border-white/90 dark:border-white/10 shadow-[-2px_-2px_5px_rgba(255,255,255,0.9),2px_2px_5px_rgba(163,177,198,0.25)] text-emerald-600 dark:text-emerald-400 active:scale-95 transition-all cursor-pointer"
          >
            <CheckCheck className="w-3.5 h-3.5 stroke-[2.5]" />
            Semua Hadir
          </button>
          <button
            type="button"
            onClick={() => handleSetAll('holiday')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#F0F3F8] dark:bg-slate-800 border border-white/90 dark:border-white/10 shadow-[-2px_-2px_5px_rgba(255,255,255,0.9),2px_2px_5px_rgba(163,177,198,0.25)] text-amber-600 dark:text-amber-400 active:scale-95 transition-all cursor-pointer"
          >
            <Moon className="w-3.5 h-3.5 stroke-[2]" />
            Semua Libur
          </button>
        </div>
      </div>

      {/* Member Roster Rows */}
      <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
        {activeMembers.map((member, idx) => {
          const record = attendance.find(a => a.member_id === member.id)
          const currentStatus = pendingStatuses?.get(member.id) ?? record?.status
          return (
            <AttendanceRow
              key={member.id}
              member={member}
              index={idx}
              attendance={record}
              status={currentStatus}
              onStatusChange={status => onStatusChange(member.id, status)}
            />
          )
        })}
      </div>

      {/* Save Notification / Bar */}
      {hasChanges && (
        <div className="mt-3 pt-3 border-t border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between gap-3 bg-indigo-50/60 dark:bg-indigo-950/30 p-3 rounded-2xl border border-indigo-200/50 dark:border-indigo-900/40 shadow-xs">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 animate-ping" />
            <p className="text-xs text-indigo-700 dark:text-indigo-300 font-bold">
              Perubahan belum disimpan
            </p>
          </div>
          <Button onClick={onSave} loading={saving} icon={<Save className="w-4 h-4" />} size="sm">
            Simpan Absensi
          </Button>
        </div>
      )}
    </div>
  )
}
