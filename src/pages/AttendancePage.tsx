import { useState, useCallback } from 'react'
import { useAuth } from '@/lib/auth'
import { useMembers } from '@/features/attendance/hooks/useMembers'
import { useAttendance } from '@/features/attendance/hooks/useAttendance'
import { useWeeklyAttendance } from '@/features/attendance/hooks/useWeeklyAttendance'
import { AttendanceDatePicker } from '@/features/attendance/components/AttendanceDatePicker'
import { AttendanceList } from '@/features/attendance/components/AttendanceList'
import { AttendanceSummary } from '@/features/attendance/components/AttendanceSummary'
import { MemberList } from '@/features/attendance/components/MemberList'
import { WeekNavigation } from '@/features/attendance/components/WeekNavigation'
import { WeeklyAttendanceTable } from '@/features/attendance/components/WeeklyAttendanceTable'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { FileDown } from 'lucide-react'
import type { AttendanceStatus } from '@/types'
import { isSameDay } from 'date-fns'
import * as attendanceService from '@/features/attendance/services/attendanceService'

type Tab = 'daily' | 'members' | 'weekly'

export function AttendancePage() {
  const { user } = useAuth()
  const userId = user?.id ?? ''
  const [tab, setTab] = useState<Tab>('daily')
  const [date, setDate] = useState<Date>(new Date())

  const membersHook = useMembers(userId || null)
  const attendanceHook = useAttendance(userId || null, date)
  const weeklyHook = useWeeklyAttendance(userId || null, membersHook.members)

  const [pendingStatuses, setPendingStatuses] = useState<Map<string, AttendanceStatus>>(new Map())
  const [saving, setSaving] = useState(false)
  const [exportLoading, setExportLoading] = useState(false)
  const [exportError, setExportError] = useState<string | null>(null)
  const [memberToggleConfirm, setMemberToggleConfirm] = useState<{
    id: string
    name: string
    isActive: boolean
  } | null>(null)

  const hasChanges = pendingStatuses.size > 0

  const handleStatusChange = useCallback((memberId: string, status: AttendanceStatus) => {
    setPendingStatuses(prev => {
      const next = new Map(prev)
      next.set(memberId, status)
      return next
    })
  }, [])

  const handleSave = useCallback(async () => {
    setSaving(true)
    try {
      const entries = Array.from(pendingStatuses.entries()).map(([memberId, status]) => ({
        memberId,
        status,
      }))
      await attendanceHook.saveBulk(entries)
      setPendingStatuses(new Map())
    } finally {
      setSaving(false)
    }
  }, [pendingStatuses, attendanceHook])

  const handleExportPdf = useCallback(async () => {
    setExportLoading(true)
    setExportError(null)
    try {
      const [{ exportAttendancePdf }, recap, allAttendance] = await Promise.all([
        import('@/features/attendance/utils/exportPdf'),
        Promise.resolve(weeklyHook.recap),
        attendanceService.getAttendanceForDateRange(
          userId,
          weeklyHook.recap.startDate,
          weeklyHook.recap.endDate
        ),
      ])
      exportAttendancePdf(membersHook.members, allAttendance, recap.startDate, recap.endDate)
    } catch {
      setExportError('Gagal export PDF. Silakan coba lagi.')
    } finally {
      setExportLoading(false)
    }
  }, [userId, weeklyHook.recap, membersHook.members])

  const handleExportExcel = useCallback(async () => {
    setExportLoading(true)
    setExportError(null)
    try {
      const [{ exportAttendanceExcel }, recap, allAttendance] = await Promise.all([
        import('@/features/attendance/utils/exportExcel'),
        Promise.resolve(weeklyHook.recap),
        attendanceService.getAttendanceForDateRange(
          userId,
          weeklyHook.recap.startDate,
          weeklyHook.recap.endDate
        ),
      ])
      await exportAttendanceExcel(
        membersHook.members,
        allAttendance,
        recap.startDate,
        recap.endDate
      )
    } catch {
      setExportError('Gagal export Excel. Silakan coba lagi.')
    } finally {
      setExportLoading(false)
    }
  }, [userId, weeklyHook.recap, membersHook.members])

  const tabs: Array<{ key: Tab; label: string }> = [
    { key: 'daily', label: 'Absensi' },
    { key: 'members', label: 'Anggota' },
    { key: 'weekly', label: 'Rekap' },
  ]

  return (
    <div className="space-y-4">
      {/* Tab Navigation */}
      <div className="flex gap-1 p-1 rounded-xl bg-gray-100 dark:bg-gray-800">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
              tab === t.key
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Daily Attendance Tab */}
      {tab === 'daily' && (
        <div className="space-y-4">
          <Card>
            <AttendanceDatePicker date={date} onChange={setDate} />
          </Card>

          <Card>
            <AttendanceSummary
              attendance={attendanceHook.attendance}
              members={membersHook.members}
            />
          </Card>

          <Card padding="none">
            <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700/50">
              <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                Daftar Anggota
              </h3>
            </div>
            <div className="px-4">
              <AttendanceList
                members={membersHook.members}
                attendance={attendanceHook.attendance}
                onStatusChange={handleStatusChange}
                onSave={handleSave}
                loading={membersHook.loading || attendanceHook.loading}
                saving={saving}
                hasChanges={hasChanges}
              />
            </div>
          </Card>
        </div>
      )}

      {/* Members Tab */}
      {tab === 'members' && (
        <Card>
          <MemberList
            members={membersHook.members}
            loading={membersHook.loading}
            onAdd={membersHook.addMember}
            onEdit={membersHook.editMember}
            onToggleActive={async (id, isActive) => {
              if (isActive) {
                const member = membersHook.members.find(m => m.id === id)
                setMemberToggleConfirm({
                  id,
                  name: member?.name ?? 'anggota ini',
                  isActive,
                })
              } else {
                membersHook.activateMember(id)
              }
            }}
          />
        </Card>
      )}

      {/* Weekly Recap Tab */}
      {tab === 'weekly' && (
        <div className="space-y-4">
          <Card>
            <WeekNavigation
              currentDate={weeklyHook.currentDate}
              onNext={weeklyHook.goNext}
              onPrev={weeklyHook.goPrev}
              onToday={weeklyHook.goToday}
              isToday={isSameDay(weeklyHook.currentDate, new Date())}
            />
          </Card>

          <Card>
            <div className="flex justify-end gap-2 mb-3">
              <Button
                variant="secondary"
                size="sm"
                onClick={handleExportPdf}
                loading={exportLoading}
                icon={<FileDown className="w-4 h-4" />}
              >
                PDF
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleExportExcel}
                loading={exportLoading}
                icon={<FileDown className="w-4 h-4" />}
              >
                Excel
              </Button>
            </div>
            {exportError && <p className="text-xs text-danger mb-3">{exportError}</p>}
            <WeeklyAttendanceTable
              recap={weeklyHook.recap}
              attendance={weeklyHook.attendance}
              loading={weeklyHook.loading}
              hasMembers={membersHook.members.length > 0}
            />
          </Card>
        </div>
      )}
      {/* Member Deactivate Confirmation */}
      <ConfirmDialog
        open={memberToggleConfirm !== null}
        onClose={() => setMemberToggleConfirm(null)}
        onConfirm={() => {
          if (memberToggleConfirm) {
            membersHook.deactivateMember(memberToggleConfirm.id)
            setMemberToggleConfirm(null)
          }
        }}
        title="Nonaktifkan Anggota"
        message={`Apakah Anda yakin ingin menonaktifkan "${memberToggleConfirm?.name}"? Anggota ini tidak akan muncul di daftar absensi.`}
        confirmLabel="Nonaktifkan"
      />
    </div>
  )
}
