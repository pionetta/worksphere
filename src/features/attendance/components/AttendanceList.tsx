import { AttendanceRow } from './AttendanceRow'
import { EmptyState } from '@/components/ui/EmptyState'
import { LoadingState } from '@/components/ui/LoadingState'
import { Button } from '@/components/ui/Button'
import { Users, Save } from 'lucide-react'
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

  return (
    <div>
      <div className="divide-y divide-gray-100 dark:divide-gray-800">
        {activeMembers.map(member => {
          const record = attendance.find(a => a.member_id === member.id)
          const currentStatus = pendingStatuses?.get(member.id) ?? record?.status ?? 'present'
          return (
            <AttendanceRow
              key={member.id}
              member={member}
              attendance={record}
              status={currentStatus}
              onStatusChange={status => onStatusChange(member.id, status)}
            />
          )
        })}
      </div>
      {hasChanges && (
        <div className="mt-4 pt-3.5 pb-2 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">
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
