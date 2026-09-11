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
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { cn } from '@/lib/utils'
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
    <div className="max-w-5xl mx-auto space-y-4 sm:space-y-5 pb-32">
      {/* Tab Navigation: Segmented Pill Control */}
      <div className="bg-slate-200/50 dark:bg-slate-800/50 p-1.5 rounded-2xl flex items-center justify-between gap-1 border border-white/60 dark:border-white/5 shadow-inner">
        {tabs.map(t => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={cn(
              'py-2 flex-1 text-center text-xs sm:text-sm transition-all cursor-pointer select-none',
              tab === t.key
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 font-semibold shadow-sm rounded-xl'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 font-medium'
            )}
            role="tab"
            aria-selected={tab === t.key}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Daily Attendance Tab */}
      {tab === 'daily' && (
        <div className="space-y-3.5 animate-fade-in-up">
          {/* Date Picker Bar (Ramping & Neumorphic Mandiri) */}
          <AttendanceDatePicker date={date} onChange={handleDateChange} />

          {/* 4-Stat 2x2 Summary Cards */}
          {membersHook.members.some(m => m.is_active) && (
            <AttendanceSummary
              attendance={attendanceHook.attendance}
              members={membersHook.members}
              pendingStatuses={pendingStatuses}
            />
          )}

          {/* Member Roster List Card */}
          <div className="p-4 rounded-[26px] bg-[#F0F3F8] dark:bg-slate-800 border border-white/80 dark:border-white/10 shadow-[-5px_-5px_10px_rgba(255,255,255,0.85),5px_5px_10px_rgba(163,177,198,0.22)] my-3 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-white/70 dark:border-white/5">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100">
                  Daftar Anggota Tim
                </h3>
              </div>
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
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
        <div className="p-4 sm:p-5 rounded-[26px] bg-[#F0F3F8] dark:bg-slate-800 border border-white/80 dark:border-white/10 shadow-[-5px_-5px_10px_rgba(255,255,255,0.85),5px_5px_10px_rgba(163,177,198,0.22)] animate-fade-in-up">
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
          {/* Main Card: Rekap Kehadiran */}
          <div className="p-4 sm:p-5 rounded-[26px] bg-[#F0F3F8] dark:bg-slate-800 border border-white/80 dark:border-white/10 shadow-[-5px_-5px_10px_rgba(255,255,255,0.85),5px_5px_10px_rgba(163,177,198,0.22)] space-y-1">
            {/* 1. Header Rekap */}
            <div className="flex items-center justify-between gap-2 pb-2 border-b border-white/80 dark:border-white/5">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                Rekap Kehadiran
              </h3>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleExportPdf}
                  disabled={exportLoading}
                  className="px-2.5 py-1 rounded-xl text-xs font-semibold bg-[#F0F3F8] dark:bg-slate-800 border border-white/80 dark:border-white/10 shadow-[-2px_-2px_5px_rgba(255,255,255,0.9),2px_2px_5px_rgba(163,177,198,0.25)] flex items-center gap-1.5 active:scale-95 text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all cursor-pointer disabled:opacity-50"
                  aria-label="Export PDF"
                >
                  <FileDown className="w-3.5 h-3.5" />
                  <span>PDF</span>
                </button>
                <button
                  type="button"
                  onClick={handleExportExcel}
                  disabled={exportLoading}
                  className="px-2.5 py-1 rounded-xl text-xs font-semibold bg-[#F0F3F8] dark:bg-slate-800 border border-white/80 dark:border-white/10 shadow-[-2px_-2px_5px_rgba(255,255,255,0.9),2px_2px_5px_rgba(163,177,198,0.25)] flex items-center gap-1.5 active:scale-95 text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all cursor-pointer disabled:opacity-50"
                  aria-label="Export Excel"
                >
                  <FileDown className="w-3.5 h-3.5" />
                  <span>Excel</span>
                </button>
              </div>
            </div>

            {/* Selector Periode Minggu (Week Switcher) */}
            <WeekNavigation
              currentDate={weeklyHook.currentDate}
              onNext={weeklyHook.goNext}
              onPrev={weeklyHook.goPrev}
              onToday={weeklyHook.goToday}
              isToday={isSameDay(weeklyHook.currentDate, new Date())}
            />

            {exportError && (
              <p className="text-xs text-rose-600 dark:text-rose-400 font-semibold">{exportError}</p>
            )}

            {/* 2. & 3. Perbaikan Tabel Mobile (Anti-Cutoff) & Legenda */}
            <WeeklyAttendanceTable
              recap={weeklyHook.recap}
              attendance={weeklyHook.attendance}
              loading={weeklyHook.loading}
              hasMembers={membersHook.members.length > 0}
            />
          </div>

          {/* Attendance Trend Chart */}
          <AttendanceTrendChart
            recap={weeklyHook.recap}
            attendance={weeklyHook.attendance}
          />
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
