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
      <div className="flex items-center justify-between gap-2 pb-2 border-b border-gray-100 dark:border-gray-800">
        <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          Aksi Cepat:
        </span>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => handleSetAll('present')}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 hover:bg-emerald-100 border border-emerald-200 dark:border-emerald-800/60 cursor-pointer transition-all"
          >
            <CheckCheck className="w-3 h-3" />
            Semua Hadir
          </button>
          <button
            type="button"
            onClick={() => handleSetAll('holiday')}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 hover:bg-amber-100 border border-amber-200 dark:border-amber-800/60 cursor-pointer transition-all"
          >
            <Moon className="w-3 h-3" />
            Semua Libur
          </button>
        </div>
      </div>

      {/* Member Roster Rows */}
      <div className="divide-y divide-gray-100 dark:divide-gray-800/80">
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
        <div className="mt-3 pt-3 border-t border-gray-200/80 dark:border-gray-700/80 flex items-center justify-between gap-3 bg-blue-50/60 dark:bg-blue-950/30 p-3 rounded-2xl border border-blue-200/50 dark:border-blue-900/40">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-ping" />
            <p className="text-xs text-blue-700 dark:text-blue-300 font-bold">
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
