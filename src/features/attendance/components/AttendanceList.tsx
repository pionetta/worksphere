import { AttendanceRow } from './AttendanceRow'
import { EmptyState } from '@/components/ui/EmptyState'
import { LoadingState } from '@/components/ui/LoadingState'
import { Button } from '@/components/ui/Button'
import { Users, Save } from 'lucide-react'
import type { Attendance, AttendanceStatus, Member } from '@/types'

interface AttendanceListProps {
  members: Member[]
  attendance: Attendance[]
  onStatusChange: (memberId: string, status: AttendanceStatus) => void
  onSave: () => void
  loading?: boolean
  saving?: boolean
  hasChanges?: boolean
}

export function AttendanceList({
  members,
  attendance,
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
      <div className="divide-y divide-gray-100 dark:divide-gray-700/50">
        {activeMembers.map(member => {
          const record = attendance.find(a => a.member_id === member.id)
          return (
            <AttendanceRow
              key={member.id}
              member={member}
              attendance={record}
              onStatusChange={status => onStatusChange(member.id, status)}
            />
          )
        })}
      </div>
      {hasChanges && (
        <div className="mt-4 flex justify-end">
          <Button onClick={onSave} loading={saving} icon={<Save className="w-4 h-4" />}>
            Simpan
          </Button>
        </div>
      )}
    </div>
  )
}
