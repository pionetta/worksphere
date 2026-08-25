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
import { AttendanceTrendChart } from '@/features/attendance/components/AttendanceTrendChart'
import { Button } from '@/components/ui/Button'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { FileDown, Users } from 'lucide-react'
import { toast } from 'sonner'
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
      toast.success('Data absensi berhasil disimpan!')
    } catch {
      toast.error('Gagal menyimpan data absensi.')
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
      toast.success('Laporan absensi PDF berhasil dibuat!')
    } catch {
      setExportError('Gagal export PDF. Silakan coba lagi.')
      toast.error('Gagal export PDF. Silakan coba lagi.')
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
      toast.success('Laporan absensi Excel berhasil dibuat!')
    } catch {
      setExportError('Gagal export Excel. Silakan coba lagi.')
      toast.error('Gagal export Excel. Silakan coba lagi.')
    } finally {
      setExportLoading(false)
    }
  }, [userId, weeklyHook.recap, membersHook.members])

  const handleDateChange = useCallback((newDate: Date) => {
    setDate(newDate)
    setPendingStatuses(new Map())
  }, [])

  const tabs: Array<{ key: Tab; label: string }> = [
    { key: 'daily', label: 'Absensi' },
    { key: 'members', label: 'Anggota' },
    { key: 'weekly', label: 'Rekap' },
  ]

  return (
    <div className="max-w-md mx-auto space-y-3.5 pb-8">
      {/* Tab Navigation */}
      <Tabs value={tab} onValueChange={val => setTab(val as Tab)}>
        <TabsList className="w-full h-11 p-1 rounded-2xl bg-white/75 dark:bg-gray-800/75 backdrop-blur-md border border-white/80 dark:border-gray-700/50 shadow-xs">
          {tabs.map(t => (
            <TabsTrigger
              key={t.key}
              value={t.key}
              className="flex-1 rounded-xl text-xs sm:text-sm font-bold data-[state=active]:bg-[#2563EB] data-[state=active]:text-white data-[state=active]:shadow-sm transition-all"
              role="button"
            >
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Daily Attendance Tab */}
      {tab === 'daily' && (
        <div className="space-y-3.5 animate-fade-in-up">
          {/* Date Picker Card */}
          <div className="rounded-[24px] bg-white/90 dark:bg-gray-800/90 border border-white/80 dark:border-gray-700/50 p-4 shadow-sm backdrop-blur-md">
            <AttendanceDatePicker date={date} onChange={handleDateChange} />
          </div>

          {/* 3-Stat Summary Cards */}
          {membersHook.members.some(m => m.is_active) && (
            <AttendanceSummary
              attendance={attendanceHook.attendance}
              members={membersHook.members}
              pendingStatuses={pendingStatuses}
            />
          )}

          {/* Member Roster List Card */}
          <div className="rounded-[26px] bg-white/90 dark:bg-gray-800/90 border border-white/80 dark:border-gray-700/50 p-4 sm:p-5 shadow-sm backdrop-blur-md space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-[#2563EB] dark:text-blue-400" />
                <h3 className="text-xs sm:text-sm font-extrabold text-gray-900 dark:text-gray-100">
                  Daftar Anggota Tim
                </h3>
              </div>
              <span className="text-[11px] font-semibold text-gray-500 dark:text-gray-400">
                {membersHook.members.filter(m => m.is_active).length} Aktif
              </span>
            </div>

            <AttendanceList
              members={membersHook.members}
              attendance={attendanceHook.attendance}
              pendingStatuses={pendingStatuses}
              onStatusChange={handleStatusChange}
              onSave={handleSave}
              loading={membersHook.loading || attendanceHook.loading}
              saving={saving}
              hasChanges={hasChanges}
            />
          </div>
        </div>
      )}

      {/* Members Tab */}
      {tab === 'members' && (
        <div className="rounded-[26px] bg-white/90 dark:bg-gray-800/90 border border-white/80 dark:border-gray-700/50 p-4 sm:p-5 shadow-sm backdrop-blur-md animate-fade-in-up">
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
                await membersHook.activateMember(id)
                toast.success('Anggota berhasil diaktifkan kembali')
              }
            }}
          />
        </div>
      )}

      {/* Weekly Recap Tab */}
      {tab === 'weekly' && (
        <div className="space-y-3.5 animate-fade-in-up">
          <div className="rounded-[24px] bg-white/90 dark:bg-gray-800/90 border border-white/80 dark:border-gray-700/50 p-4 shadow-sm backdrop-blur-md">
            <WeekNavigation
              currentDate={weeklyHook.currentDate}
              onNext={weeklyHook.goNext}
              onPrev={weeklyHook.goPrev}
              onToday={weeklyHook.goToday}
              isToday={isSameDay(weeklyHook.currentDate, new Date())}
            />
          </div>

          {/* Attendance Trend Chart */}
          <AttendanceTrendChart
            recap={weeklyHook.recap}
            attendance={weeklyHook.attendance}
          />

          <div className="rounded-[26px] bg-white/90 dark:bg-gray-800/90 border border-white/80 dark:border-gray-700/50 p-4 sm:p-5 shadow-sm backdrop-blur-md space-y-3">
            <div className="flex items-center justify-between gap-2 pb-2 border-b border-gray-100 dark:border-gray-800">
              <h3 className="text-xs sm:text-sm font-extrabold text-gray-900 dark:text-gray-100">
                Tabel Rekap Kehadiran
              </h3>
              <div className="flex items-center gap-1.5">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleExportPdf}
                  loading={exportLoading}
                  icon={<FileDown className="w-3.5 h-3.5" />}
                >
                  PDF
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleExportExcel}
                  loading={exportLoading}
                  icon={<FileDown className="w-3.5 h-3.5" />}
                >
                  Excel
                </Button>
              </div>
            </div>

            {exportError && <p className="text-xs text-rose-600 dark:text-rose-400 font-semibold">{exportError}</p>}

            <WeeklyAttendanceTable
              recap={weeklyHook.recap}
              attendance={weeklyHook.attendance}
              loading={weeklyHook.loading}
              hasMembers={membersHook.members.length > 0}
            />
          </div>
        </div>
      )}

      {/* Member Deactivate Confirmation */}
      <ConfirmDialog
        open={memberToggleConfirm !== null}
        onClose={() => setMemberToggleConfirm(null)}
        onConfirm={async () => {
          if (memberToggleConfirm) {
            await membersHook.deactivateMember(memberToggleConfirm.id)
            toast.info(`Anggota "${memberToggleConfirm.name}" dinonaktifkan`)
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
