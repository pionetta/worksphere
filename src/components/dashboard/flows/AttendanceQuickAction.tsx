import { useState, useEffect, useCallback } from 'react'
import * as memberService from '@/features/attendance/services/memberService'
import * as attendanceService from '@/features/attendance/services/attendanceService'
import { AttendanceStatusSelector } from '@/features/attendance/components/AttendanceStatusSelector'
import { Button } from '@/components/ui/Button'
import { LoadingState } from '@/components/ui/LoadingState'
import { EmptyState } from '@/components/ui/EmptyState'
import { toISODate } from '@/utils/date'
import type { Member, Attendance, AttendanceStatus } from '@/types'

interface AttendanceQuickActionProps {
  userId: string
  onSuccess: () => void
  onCancel: () => void
}

export function AttendanceQuickAction({ userId, onSuccess, onCancel }: AttendanceQuickActionProps) {
  const [members, setMembers] = useState<Member[]>([])
  const [existing, setExisting] = useState<Attendance[]>([])
  const [statuses, setStatuses] = useState<Map<string, AttendanceStatus>>(new Map())
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const today = toISODate(new Date())

  useEffect(() => {
    async function load() {
      setLoading(true)
      const [allMembers, todayAttendance] = await Promise.all([
        memberService.getAllMembers(userId),
        attendanceService.getAttendanceForDate(userId, today),
      ])
      setMembers(allMembers.filter(m => m.is_active))
      setExisting(todayAttendance)
      setLoading(false)
    }
    load()
  }, [userId, today])

  const getExistingStatus = useCallback(
    (memberId: string): AttendanceStatus | undefined => {
      const record = existing.find(a => a.member_id === memberId)
      return record?.status as AttendanceStatus | undefined
    },
    [existing]
  )

  const handleStatusChange = useCallback((memberId: string, status: AttendanceStatus) => {
    setStatuses(prev => {
      const next = new Map(prev)
      next.set(memberId, status)
      return next
    })
  }, [])

  const handleSave = useCallback(async () => {
    if (statuses.size === 0) return
    setSaving(true)
    try {
      const entries = Array.from(statuses.entries()).map(([memberId, status]) => ({
        memberId,
        status,
      }))
      await attendanceService.saveBulkAttendance(userId, today, entries)
      onSuccess()
    } finally {
      setSaving(false)
    }
  }, [userId, today, statuses, onSuccess])

  if (loading) return <LoadingState text="Memuat anggota..." />

  if (members.length === 0) {
    return (
      <EmptyState
        title="Belum ada anggota"
        description="Tambahkan anggota terlebih dahulu di halaman Absensi."
      />
    )
  }

  const hasChanges = statuses.size > 0

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500 dark:text-gray-400">
        {new Date().toLocaleDateString('id-ID', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        })}
      </p>
      <div className="space-y-3">
        {members.map(member => {
          const existingStatus = getExistingStatus(member.id)
          const currentStatus = statuses.get(member.id) ?? existingStatus
          return (
            <div
              key={member.id}
              className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800"
            >
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {member.name}
              </span>
              <AttendanceStatusSelector
                value={currentStatus}
                onChange={status => handleStatusChange(member.id, status)}
              />
            </div>
          )
        })}
      </div>
      <div className="flex gap-2 pt-2">
        <Button variant="ghost" onClick={onCancel} className="flex-1">
          Batal
        </Button>
        <Button onClick={handleSave} loading={saving} disabled={!hasChanges} className="flex-1">
          Simpan
        </Button>
      </div>
    </div>
  )
}
