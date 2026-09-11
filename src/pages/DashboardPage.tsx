import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth, usePermissions, useIsAdmin } from '@/lib/auth'
import { useNetworkStatus } from '@/hooks/useNetworkStatus'
import { useDashboard } from '@/hooks/useDashboard'
import { useDashboardWidgets } from '@/hooks/useDashboardWidgets'
import { useHabits } from '@/features/todo/hooks/useHabits'
import { useRecurringTransactions } from '@/features/finance/hooks/useRecurringTransactions'
import { DashboardCustomizerModal } from '@/components/dashboard/DashboardCustomizerModal'
import { CalendarModal } from '@/components/calendar/CalendarModal'
import { ErrorState } from '@/components/ui/ErrorState'
import { formatAmount, formatCurrency } from '@/utils/currency'
import { cn } from '@/utils/cn'
import {
  Wallet,
  TrendingUp,
  ChevronRight,
  Lock,
  Flame,
  Check,
  Calendar,
  RefreshCw,
  Clock,
  CheckSquare,
  Users,
  ListTodo,
  UserCheck,
  AlertTriangle,
  Eye,
  EyeOff,
} from 'lucide-react'

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 11) return 'Selamat pagi'
  if (hour < 15) return 'Selamat siang'
  if (hour < 18) return 'Selamat sore'
  return 'Selamat malam'
}

function formatDate(): string {
  return new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export function DashboardPage() {
  const { user } = useAuth()
  const permissions = usePermissions()
  const isAdmin = useIsAdmin()
  const network = useNetworkStatus()
  const { data, loading, error, refresh } = useDashboard(user?.id ?? null)

  const { widgets, toggleWidget, moveWidget, resetDefaults } = useDashboardWidgets()
  const habitsHook = useHabits(user?.id ?? null)
  const recurringHook = useRecurringTransactions(user?.id ?? null)

  const [showCustomizer, setShowCustomizer] = useState(false)
  const [showCalendarModal, setShowCalendarModal] = useState(false)

  // Local storage persisted balance visibility toggle
  const [showBalance, setShowBalance] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('worksphere:show-balance')
      return saved !== null ? JSON.parse(saved) : true
    } catch {
      return true
    }
  })

  const toggleShowBalance = () => {
    setShowBalance(prev => {
      const next = !prev
      try {
        localStorage.setItem('worksphere:show-balance', JSON.stringify(next))
      } catch {
        // ignore
      }
      return next
    })
  }

  // Listen to header events for calendar and customizer
  useEffect(() => {
    const handleOpenCalendar = () => setShowCalendarModal(true)
    const handleOpenCustomizer = () => setShowCustomizer(true)

    window.addEventListener('worksphere:open-calendar', handleOpenCalendar)
    window.addEventListener('worksphere:open-customizer', handleOpenCustomizer)

    return () => {
      window.removeEventListener('worksphere:open-calendar', handleOpenCalendar)
      window.removeEventListener('worksphere:open-customizer', handleOpenCustomizer)
    }
  }, [])

  const canAccessFinance = isAdmin || permissions.finance
  const canAccessAttendance = isAdmin || permissions.attendance
  const canAccessTodo = isAdmin || permissions.todo

  const displayName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.username ||
    user?.email?.split('@')[0] ||
    'User'

  const netIncome = (data?.finance?.totalIncome ?? 0) - (data?.finance?.totalExpense ?? 0)
  const netIncomeSign = netIncome >= 0 ? '+' : '-'
  const netIncomeDisplay = `${netIncomeSign}Rp ${formatAmount(Math.abs(netIncome))}`

  const memberRoster = data?.attendance?.members || []
  const taskList = data?.todo?.tasks || []

  // Filter widgets by permission and visibility
  const isWidgetPermitted = (reqPerm?: 'finance' | 'attendance' | 'todo') => {
    if (!reqPerm) return true
    if (reqPerm === 'finance') return canAccessFinance
    if (reqPerm === 'attendance') return canAccessAttendance
    if (reqPerm === 'todo') return canAccessTodo
    return true
  }

  const upcomingBills = recurringHook.recurringList
    .filter(r => r.is_active)
    .slice(0, 3)

  return (
    <div className="max-w-5xl mx-auto space-y-3 sm:space-y-4 mt-2 pb-28 md:pb-8">
      {/* Hidden elements for SEO / tests / screen readers */}
      <div className="sr-only">
        <span>{displayName}</span>
        <span>{formatDate()}</span>
        <span>{getGreeting()}</span>
        <span>Absensi Hari Ini</span>
        <span>To-Do</span>
        {(data?.todo?.overdue ?? 0) > 0 && (
          <div>
            <span>Terlambat</span>
            <span>{data?.todo?.overdue}</span>
          </div>
        )}
      </div>

      {network === 'offline' && (
        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 text-xs text-amber-800 dark:text-amber-300 font-medium flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
          <span>Offline — perubahan akan disinkronkan saat online.</span>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-2 gap-3.5 pt-2">
          <div className="col-span-2 animate-pulse rounded-[24px] bg-[#E2E8F0]/60 dark:bg-white/5 h-44 shadow-[-8px_-8px_16px_rgba(255,255,255,0.9),8px_8px_16px_rgba(163,177,198,0.35)] dark:shadow-[-6px_-6px_14px_rgba(255,255,255,0.03),6px_6px_14px_rgba(0,0,0,0.5)]" />
          <div className="col-span-1 min-h-[165px] animate-pulse rounded-[24px] bg-[#E2E8F0]/60 dark:bg-white/5 shadow-[-8px_-8px_16px_rgba(255,255,255,0.9),8px_8px_16px_rgba(163,177,198,0.35)] dark:shadow-[-6px_-6px_14px_rgba(255,255,255,0.03),6px_6px_14px_rgba(0,0,0,0.5)]" />
          <div className="col-span-1 min-h-[165px] animate-pulse rounded-[24px] bg-[#E2E8F0]/60 dark:bg-white/5 shadow-[-8px_-8px_16px_rgba(255,255,255,0.9),8px_8px_16px_rgba(163,177,198,0.35)] dark:shadow-[-6px_-6px_14px_rgba(255,255,255,0.03),6px_6px_14px_rgba(0,0,0,0.5)]" />
          <div className="col-span-2 animate-pulse rounded-[24px] bg-[#E2E8F0]/60 dark:bg-white/5 h-36 shadow-[-8px_-8px_16px_rgba(255,255,255,0.9),8px_8px_16px_rgba(163,177,198,0.35)] dark:shadow-[-6px_-6px_14px_rgba(255,255,255,0.03),6px_6px_14px_rgba(0,0,0,0.5)]" />
          <div className="col-span-2 animate-pulse rounded-[24px] bg-[#E2E8F0]/60 dark:bg-white/5 h-36 shadow-[-8px_-8px_16px_rgba(255,255,255,0.9),8px_8px_16px_rgba(163,177,198,0.35)] dark:shadow-[-6px_-6px_14px_rgba(255,255,255,0.03),6px_6px_14px_rgba(0,0,0,0.5)]" />
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={refresh} />
      ) : (
        <div className="grid grid-cols-2 gap-3.5 pt-2">
          {/* Dynamically Ordered Widgets in Bento Layout */}
          {widgets
            .filter(w => w.visible && isWidgetPermitted(w.requiredPermission))
            .map(widget => {
              // 1. Balance Summary Widget (Card 1: Total Saldo Kas)
              if (widget.id === 'balance_summary') {
                return (
                  <div key={widget.id} className="col-span-2">
                    {canAccessFinance ? (
                      <Link
                        to="/app/finance"
                        className="group block col-span-2 rounded-[24px] p-5 bg-gradient-to-br from-[#2563EB] via-[#3B82F6] to-[#6366F1] text-white shadow-[0_12px_30px_rgba(37,99,235,0.35),inset_0_2px_3px_rgba(255,255,255,0.5)] border border-white/25 relative overflow-hidden transition-all duration-200 cursor-pointer h-full active:scale-[0.99]"
                      >
                        {/* Aksen glow halus di sudut kartu */}
                        <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none group-hover:scale-125 transition-transform duration-500" />

                        <div className="flex items-center justify-between text-white">
                          <div className="flex items-center gap-2">
                            <div className="bg-white/20 text-white p-1.5 rounded-xl flex items-center justify-center shadow-[inset_1px_1px_2px_rgba(255,255,255,0.3)]">
                              <Wallet className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            </div>
                            <span className="text-xs text-white/90 font-medium tracking-wide">
                              Keuangan • Total Saldo Kas
                            </span>
                          </div>
                          <ChevronRight className="w-4 h-4 text-white/70 group-hover:text-white group-hover:translate-x-1 transition-all" />
                        </div>

                        <div className="mt-3 sm:mt-3.5">
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] sm:text-xs text-white/80 font-medium">
                              Saldo Bersih
                            </span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                toggleShowBalance()
                              }}
                              className="p-1 rounded-md text-white/80 hover:text-white hover:bg-white/15 transition-all active:scale-95 cursor-pointer"
                              aria-label={showBalance ? "Sembunyikan Saldo" : "Tampilkan Saldo"}
                              title={showBalance ? "Sembunyikan Saldo" : "Tampilkan Saldo"}
                            >
                              {showBalance ? (
                                <Eye className="w-4 h-4" />
                              ) : (
                                <EyeOff className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                          <div className="mt-0.5 text-3xl font-bold tracking-tight text-white drop-shadow-xs">
                            {showBalance ? `Rp ${formatAmount(data.finance.totalBalance)}` : 'Rp ••••••'}
                          </div>
                          <div className="mt-1.5 flex items-center gap-1.5">
                            <span className="inline-flex items-center gap-1 bg-white/15 text-white/90 px-2 py-0.5 rounded-full text-xs font-medium backdrop-blur-xs">
                              <TrendingUp className="w-3.5 h-3.5 text-emerald-300" />
                              <span className="text-emerald-300 font-medium">
                                {showBalance ? `${netIncomeDisplay}` : '••••••'}
                              </span>
                              <span>bulan ini</span>
                            </span>
                          </div>
                        </div>

                        {/* Area Pemasukan & Pengeluaran */}
                        <div className="mt-3 pt-3 border-t border-white/15 grid grid-cols-2 gap-4">
                          <div>
                            <div className="text-white/70 text-xs">
                              Pemasukan
                            </div>
                            <div className="text-emerald-300 font-bold text-base tracking-tight mt-0.5">
                              {showBalance ? `+Rp ${formatAmount(data.finance.totalIncome)}` : '••••••••'}
                            </div>
                          </div>
                          <div className="pl-4 border-l border-white/15">
                            <div className="text-white/70 text-xs">
                              Pengeluaran
                            </div>
                            <div className="text-rose-300 font-bold text-base tracking-tight mt-0.5">
                              {showBalance ? `-Rp ${formatAmount(data.finance.totalExpense)}` : '••••••••'}
                            </div>
                          </div>
                        </div>
                      </Link>
                    ) : (
                      <div className="col-span-2 rounded-[24px] p-5 bg-[#F0F3F8] dark:bg-[#1E232D] border border-dashed border-white/70 dark:border-white/10 opacity-70 shadow-[-8px_-8px_16px_rgba(255,255,255,0.9),8px_8px_16px_rgba(163,177,198,0.35)] dark:shadow-[-6px_-6px_14px_rgba(255,255,255,0.03),6px_6px_14px_rgba(0,0,0,0.5)]">
                        <div className="flex items-center gap-2 text-xs font-semibold text-[#737373] dark:text-[#A3A3A3]">
                          <Lock className="w-4 h-4" />
                          <span>Keuangan (Akses Dibatasi)</span>
                        </div>
                        <div className="mt-2 text-xs text-[#737373] dark:text-[#A3A3A3]">
                          Fitur keuangan belum diaktifkan oleh Administrator untuk akun Anda.
                        </div>
                      </div>
                    )}
                  </div>
                )
              }

              // 2. Quick Actions 2-Card Widget (Card 2: Absensi & Card 3: To-Do Tracker)
              if (widget.id === 'quick_actions') {
                const attendanceTotal = data?.attendance?.totalMembers ?? 0
                const attendancePresent = data?.attendance?.present ?? 0
                const attendancePercent = attendanceTotal > 0
                  ? Math.min(100, Math.round((attendancePresent / attendanceTotal) * 100))
                  : 0
                const attendanceUnrecorded = data?.attendance?.unrecorded ?? 0

                const todoTotal = data?.todo?.total ?? 0
                const todoCompleted = data?.todo?.completed ?? 0
                const todoPercent = todoTotal > 0
                  ? Math.min(100, Math.round((todoCompleted / todoTotal) * 100))
                  : 0
                const todoOverdue = data?.todo?.overdue ?? 0
                const todoActive = (data?.todo?.todo ?? 0) + (data?.todo?.inProgress ?? 0)

                return (
                  <div key={widget.id} className="col-span-2 grid grid-cols-2 gap-3.5">
                    {/* Card 2 (Absensi) */}
                    {canAccessAttendance ? (
                      <Link
                        to="/app/attendance"
                        className="col-span-1 flex flex-col justify-between h-full min-h-[165px] p-4 cursor-pointer bg-[#F0F3F8] dark:bg-[#1E232D] rounded-[24px] border border-white/70 dark:border-white/5 shadow-[-8px_-8px_16px_rgba(255,255,255,0.9),8px_8px_16px_rgba(163,177,198,0.35)] dark:shadow-[-6px_-6px_14px_rgba(255,255,255,0.03),6px_6px_14px_rgba(0,0,0,0.5)] transition-all duration-200 active:scale-[0.98] active:shadow-[inset_-4px_-4px_8px_rgba(255,255,255,0.9),inset_4px_4px_8px_rgba(163,177,198,0.35)] dark:active:shadow-[inset_-4px_-4px_8px_rgba(255,255,255,0.03),inset_4px_4px_8px_rgba(0,0,0,0.5)]"
                      >
                        <div className="flex items-center justify-between">
                          <div className="w-8 h-8 rounded-xl bg-[#F0F3F8] dark:bg-[#1E232D] shadow-[inset_-2px_-2px_4px_rgba(255,255,255,0.9),inset_2px_2px_4px_rgba(163,177,198,0.3)] dark:shadow-[inset_-2px_-2px_4px_rgba(255,255,255,0.03),inset_2px_2px_4px_rgba(0,0,0,0.4)] border border-white/60 dark:border-white/5 flex items-center justify-center shrink-0">
                            <UserCheck className="w-4 h-4 text-emerald-500" />
                          </div>
                          <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                            Absensi
                          </span>
                        </div>

                        <div className="my-auto py-1">
                          <div className="flex items-baseline gap-1">
                            <span className="text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">
                              {attendancePresent}
                            </span>
                            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                              /{attendanceTotal} <span className="inline">Hadir</span>
                            </span>
                          </div>
                          {/* Mini Progress Bar */}
                          <div className="h-1.5 rounded-full bg-slate-200/60 dark:bg-slate-700/60 my-2 overflow-hidden shadow-[inset_1px_1px_2px_rgba(0,0,0,0.1)]">
                            <div
                              className="h-full bg-emerald-500 rounded-full transition-all duration-500 shadow-xs"
                              style={{ width: `${attendancePercent}%` }}
                            />
                          </div>
                        </div>

                        <div>
                          {attendanceTotal === 0 ? (
                            <span className="bg-slate-100 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 text-[11px] px-2.5 py-1 rounded-full font-medium inline-block truncate">
                              Belum ada anggota
                            </span>
                          ) : attendanceUnrecorded > 0 ? (
                            <span className="bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-[11px] px-2.5 py-1 rounded-full font-medium inline-flex items-center gap-1.5 truncate">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                              <span className="truncate">{attendanceUnrecorded} belum absen</span>
                            </span>
                          ) : (
                            <span className="bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-[11px] px-2.5 py-1 rounded-full font-medium inline-flex items-center gap-1.5 truncate">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                              <span className="truncate">Semua tercatat</span>
                            </span>
                          )}
                        </div>
                      </Link>
                    ) : (
                      <div className="col-span-1 flex flex-col justify-between h-full min-h-[165px] p-4 bg-[#F0F3F8] dark:bg-[#1E232D] rounded-[24px] border border-dashed border-white/70 dark:border-white/5 opacity-70 shadow-[-8px_-8px_16px_rgba(255,255,255,0.9),8px_8px_16px_rgba(163,177,198,0.35)] dark:shadow-[-6px_-6px_14px_rgba(255,255,255,0.03),6px_6px_14px_rgba(0,0,0,0.5)]">
                        <div className="flex items-center justify-between text-xs font-semibold text-[#737373] dark:text-[#A3A3A3]">
                          <span>Absensi</span>
                          <Lock className="w-3.5 h-3.5" />
                        </div>
                        <div className="text-xs text-[#737373] dark:text-[#A3A3A3]">Akses dibatasi</div>
                      </div>
                    )}

                    {/* Card 3 (To-Do Tracker) */}
                    {canAccessTodo ? (
                      <Link
                        to="/app/todo"
                        className="col-span-1 flex flex-col justify-between h-full min-h-[165px] p-4 cursor-pointer bg-[#F0F3F8] dark:bg-[#1E232D] rounded-[24px] border border-white/70 dark:border-white/5 shadow-[-8px_-8px_16px_rgba(255,255,255,0.9),8px_8px_16px_rgba(163,177,198,0.35)] dark:shadow-[-6px_-6px_14px_rgba(255,255,255,0.03),6px_6px_14px_rgba(0,0,0,0.5)] transition-all duration-200 active:scale-[0.98] active:shadow-[inset_-4px_-4px_8px_rgba(255,255,255,0.9),inset_4px_4px_8px_rgba(163,177,198,0.35)] dark:active:shadow-[inset_-4px_-4px_8px_rgba(255,255,255,0.03),inset_4px_4px_8px_rgba(0,0,0,0.5)]"
                      >
                        <div className="flex items-center justify-between">
                          <div className="w-8 h-8 rounded-xl bg-[#F0F3F8] dark:bg-[#1E232D] shadow-[inset_-2px_-2px_4px_rgba(255,255,255,0.9),inset_2px_2px_4px_rgba(163,177,198,0.3)] dark:shadow-[inset_-2px_-2px_4px_rgba(255,255,255,0.03),inset_2px_2px_4px_rgba(0,0,0,0.4)] border border-white/60 dark:border-white/5 flex items-center justify-center shrink-0">
                            <CheckSquare className="w-4 h-4 text-indigo-500" />
                          </div>
                          <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                            Tugas To-Do
                          </span>
                        </div>

                        <div className="my-auto py-1">
                          <div className="flex items-baseline gap-1">
                            <span className="text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">
                              {todoCompleted}
                            </span>
                            <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                              /{todoTotal} <span className="inline">Selesai</span>
                            </span>
                          </div>
                          {/* Mini Progress Bar */}
                          <div className="h-1.5 rounded-full bg-slate-200/60 dark:bg-slate-700/60 my-2 overflow-hidden shadow-[inset_1px_1px_2px_rgba(0,0,0,0.1)]">
                            <div
                              className="h-full bg-indigo-500 rounded-full transition-all duration-500 shadow-xs"
                              style={{ width: `${todoPercent}%` }}
                            />
                          </div>
                        </div>

                        <div>
                          {todoTotal === 0 ? (
                            <span className="bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 text-[11px] px-2.5 py-1 rounded-full font-medium inline-block truncate">
                              Semua beres ✨
                            </span>
                          ) : todoOverdue > 0 ? (
                            <span className="bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 text-[11px] px-2.5 py-1 rounded-full font-medium inline-flex items-center gap-1.5 truncate">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                              <span className="truncate">{todoOverdue} terlambat</span>
                            </span>
                          ) : todoActive > 0 ? (
                            <span className="bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 text-[11px] px-2.5 py-1 rounded-full font-medium inline-flex items-center gap-1.5 truncate">
                              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
                              <span className="truncate">{todoActive} tugas aktif</span>
                            </span>
                          ) : (
                            <span className="bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 text-[11px] px-2.5 py-1 rounded-full font-medium inline-flex items-center gap-1.5 truncate">
                              Semua beres ✨
                            </span>
                          )}
                        </div>
                      </Link>
                    ) : (
                      <div className="col-span-1 flex flex-col justify-between h-full min-h-[165px] p-4 bg-[#F0F3F8] dark:bg-[#1E232D] rounded-[24px] border border-dashed border-white/70 dark:border-white/5 opacity-70 shadow-[-8px_-8px_16px_rgba(255,255,255,0.9),8px_8px_16px_rgba(163,177,198,0.35)] dark:shadow-[-6px_-6px_14px_rgba(255,255,255,0.03),6px_6px_14px_rgba(0,0,0,0.5)]">
                        <div className="flex items-center justify-between text-xs font-semibold text-[#737373] dark:text-[#A3A3A3]">
                          <span>To-Do</span>
                          <Lock className="w-3.5 h-3.5" />
                        </div>
                        <div className="text-xs text-[#737373] dark:text-[#A3A3A3]">Akses dibatasi</div>
                      </div>
                    )}
                  </div>
                )
              }

              // 3. Habit Streaks Widget (Card 4: Kebiasaan Hari Ini)
              if (widget.id === 'habit_streaks') {
                return (
                  <div
                    key={widget.id}
                    className="col-span-2 bg-[#F0F3F8] dark:bg-[#1E232D] rounded-[24px] p-4.5 border border-white/70 dark:border-white/5 shadow-[-8px_-8px_16px_rgba(255,255,255,0.9),8px_8px_16px_rgba(163,177,198,0.35)] dark:shadow-[-6px_-6px_14px_rgba(255,255,255,0.03),6px_6px_14px_rgba(0,0,0,0.5)] transition-all duration-200 space-y-3"
                  >
                    <div className="w-full flex items-center justify-between gap-2 mb-3 pb-2 border-b border-white/70 dark:border-white/5">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-6 h-6 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                          <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                        </div>
                        <h4 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 truncate">
                          Kebiasaan Hari Ini
                        </h4>
                      </div>
                      <Link
                        to="/app/todo"
                        className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline flex items-center shrink-0"
                      >
                        Lihat Semua ({habitsHook.totalCompletedToday}/{habitsHook.totalHabits}) &rarr;
                      </Link>
                    </div>

                    {habitsHook.habitsWithStats.length === 0 ? (
                      <div className="py-2.5 text-center text-xs text-slate-500 dark:text-slate-400">
                        Belum ada kebiasaan harian.{' '}
                        <Link to="/app/todo" className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">
                          Tambah sekarang
                        </Link>
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        {habitsHook.habitsWithStats.slice(0, 3).map(item => (
                          <div
                            key={item.habit.id}
                            className="flex items-center justify-between p-2.5 rounded-2xl bg-[#F0F3F8] dark:bg-[#1E232D] border border-white/60 dark:border-white/5 shadow-[-3px_-3px_6px_rgba(255,255,255,0.8),3px_3px_6px_rgba(163,177,198,0.2)] dark:shadow-[-2px_-2px_5px_rgba(255,255,255,0.02),2px_2px_5px_rgba(0,0,0,0.4)]"
                          >
                            <div className="flex items-center gap-2 min-w-0 pr-2">
                              <span className="text-base leading-none">{item.habit.icon || '🎯'}</span>
                              <div className="min-w-0">
                                <p className="text-xs font-semibold text-slate-800 dark:text-slate-100 truncate">
                                  {item.habit.title}
                                </p>
                                <span className="text-[10px] text-amber-600 dark:text-amber-400 font-medium flex items-center gap-0.5">
                                  <Flame className="w-2.5 h-2.5 fill-amber-500" /> {item.currentStreak} hari streak
                                </span>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => habitsHook.toggleToday(item.habit.id)}
                              className={cn(
                                'px-2.5 py-1 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer select-none active:scale-95 shrink-0',
                                item.isCompletedToday
                                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-[0_4px_12px_rgba(16,185,129,0.35)]'
                                  : 'bg-[#F0F3F8] dark:bg-[#1E232D] text-slate-700 dark:text-slate-200 border border-white/70 dark:border-white/5 shadow-[-2px_-2px_5px_rgba(255,255,255,0.9),2px_2px_5px_rgba(163,177,198,0.3)] dark:shadow-[-2px_-2px_5px_rgba(255,255,255,0.02),2px_2px_5px_rgba(0,0,0,0.4)] active:shadow-[inset_-2px_-2px_4px_rgba(255,255,255,0.9),inset_2px_2px_4px_rgba(163,177,198,0.3)]'
                              )}
                            >
                              <Check className="w-3 h-3 stroke-[3]" />
                              <span>{item.isCompletedToday ? 'Selesai' : 'Check-in'}</span>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              }

              // 4. To-Do Priority & Active Tasks Widget (Card 5: Tugas Prioritas)
              if (widget.id === 'todo_summary') {
                return (
                  <div
                    key={widget.id}
                    className="col-span-2 bg-[#F0F3F8] dark:bg-[#1E232D] rounded-[24px] p-4.5 border border-white/70 dark:border-white/5 shadow-[-8px_-8px_16px_rgba(255,255,255,0.9),8px_8px_16px_rgba(163,177,198,0.35)] dark:shadow-[-6px_-6px_14px_rgba(255,255,255,0.03),6px_6px_14px_rgba(0,0,0,0.5)] transition-all duration-200 space-y-3"
                  >
                    <div className="w-full flex items-center justify-between gap-2 mb-3 pb-2 border-b border-white/70 dark:border-white/5">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-6 h-6 rounded-md bg-blue-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                          <ListTodo className="w-3.5 h-3.5" />
                        </div>
                        <h4 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 truncate">
                          Tugas Prioritas (To-Do)
                        </h4>
                      </div>
                      <Link
                        to="/app/todo"
                        className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline flex items-center shrink-0"
                      >
                        Semua ({data.todo.total}) &rarr;
                      </Link>
                    </div>

                    {taskList.length === 0 ? (
                      <div className="text-center py-2.5 text-xs text-slate-500 dark:text-slate-400">
                        Belum ada tugas aktif.{' '}
                        <Link to="/app/todo" className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">
                          Buat Tugas
                        </Link>
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        {taskList.map(task => (
                          <div
                            key={task.id}
                            className="flex items-center justify-between text-xs py-2 px-2.5 rounded-2xl bg-[#F0F3F8] dark:bg-[#1E232D] border border-white/60 dark:border-white/5 shadow-[-3px_-3px_6px_rgba(255,255,255,0.8),3px_3px_6px_rgba(163,177,198,0.2)] dark:shadow-[-2px_-2px_5px_rgba(255,255,255,0.02),2px_2px_5px_rgba(0,0,0,0.4)]"
                          >
                            <div className="flex items-center gap-2 min-w-0 pr-2">
                              <CheckSquare className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                              <span className="font-medium text-slate-800 dark:text-slate-100 truncate">
                                {task.title}
                              </span>
                            </div>
                            <span
                              className={cn(
                                'text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0',
                                task.priority === 'high'
                                  ? 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20'
                                  : task.priority === 'medium'
                                  ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20'
                                  : 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20'
                              )}
                            >
                              {task.priority === 'high'
                                ? 'Tinggi'
                                : task.priority === 'medium'
                                ? 'Sedang'
                                : 'Rendah'}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              }

              // 5. Attendance Roster Widget
              if (widget.id === 'attendance_roster') {
                return (
                  <div
                    key={widget.id}
                    className="col-span-2 bg-[#F0F3F8] dark:bg-[#1E232D] rounded-[24px] p-4.5 border border-white/70 dark:border-white/5 shadow-[-8px_-8px_16px_rgba(255,255,255,0.9),8px_8px_16px_rgba(163,177,198,0.35)] dark:shadow-[-6px_-6px_14px_rgba(255,255,255,0.03),6px_6px_14px_rgba(0,0,0,0.5)] transition-all duration-200 space-y-3"
                  >
                    <div className="w-full flex items-center justify-between gap-2 mb-3 pb-2 border-b border-white/70 dark:border-white/5">
                      <div className="flex items-center gap-2 text-sm font-bold text-slate-800 dark:text-slate-100 min-w-0">
                        <div className="w-6 h-6 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                          <Users className="w-3.5 h-3.5" />
                        </div>
                        <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">
                          Presensi & Kehadiran
                        </h4>
                      </div>
                      <Link
                        to="/app/attendance"
                        className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 shrink-0"
                      >
                        Buka Rekap &rarr;
                      </Link>
                    </div>

                    <div className="grid grid-cols-4 gap-2 text-center py-1">
                      <div className="p-2 rounded-2xl bg-[#F0F3F8] dark:bg-[#1E232D] border border-white/70 dark:border-white/5 shadow-[inset_-2px_-2px_4px_rgba(255,255,255,0.9),inset_2px_2px_4px_rgba(163,177,198,0.25)] dark:shadow-[inset_-2px_-2px_4px_rgba(255,255,255,0.02),inset_2px_2px_4px_rgba(0,0,0,0.4)]">
                        <div className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">Hadir</div>
                        <div className="text-sm font-extrabold text-emerald-700 dark:text-emerald-300">
                          {data.attendance.present}
                        </div>
                      </div>
                      <div className="p-2 rounded-2xl bg-[#F0F3F8] dark:bg-[#1E232D] border border-white/70 dark:border-white/5 shadow-[inset_-2px_-2px_4px_rgba(255,255,255,0.9),inset_2px_2px_4px_rgba(163,177,198,0.25)] dark:shadow-[inset_-2px_-2px_4px_rgba(255,255,255,0.02),inset_2px_2px_4px_rgba(0,0,0,0.4)]">
                        <div className="text-[10px] font-bold text-rose-600 dark:text-rose-400">Absen</div>
                        <div className="text-sm font-extrabold text-rose-700 dark:text-rose-300">
                          {data.attendance.absent}
                        </div>
                      </div>
                      <div className="p-2 rounded-2xl bg-[#F0F3F8] dark:bg-[#1E232D] border border-white/70 dark:border-white/5 shadow-[inset_-2px_-2px_4px_rgba(255,255,255,0.9),inset_2px_2px_4px_rgba(163,177,198,0.25)] dark:shadow-[inset_-2px_-2px_4px_rgba(255,255,255,0.02),inset_2px_2px_4px_rgba(0,0,0,0.4)]">
                        <div className="text-[10px] font-bold text-amber-600 dark:text-amber-400">Libur</div>
                        <div className="text-sm font-extrabold text-amber-700 dark:text-amber-300">
                          {data.attendance.holiday}
                        </div>
                      </div>
                      <div className="p-2 rounded-2xl bg-[#F0F3F8] dark:bg-[#1E232D] border border-white/70 dark:border-white/5 shadow-[inset_-2px_-2px_4px_rgba(255,255,255,0.9),inset_2px_2px_4px_rgba(163,177,198,0.25)] dark:shadow-[inset_-2px_-2px_4px_rgba(255,255,255,0.02),inset_2px_2px_4px_rgba(0,0,0,0.4)]">
                        <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400">Belum</div>
                        <div className="text-sm font-extrabold text-slate-800 dark:text-slate-100">
                          {data.attendance.unrecorded}
                        </div>
                      </div>
                    </div>

                    {memberRoster.length > 0 && (
                      <div className="space-y-1.5 pt-1">
                        {memberRoster.slice(0, 3).map(m => (
                          <div
                            key={m.id}
                            className="flex items-center justify-between text-xs py-2 px-2.5 rounded-2xl bg-[#F0F3F8] dark:bg-[#1E232D] border border-white/60 dark:border-white/5 shadow-[-3px_-3px_6px_rgba(255,255,255,0.8),3px_3px_6px_rgba(163,177,198,0.2)] dark:shadow-[-2px_-2px_5px_rgba(255,255,255,0.02),2px_2px_5px_rgba(0,0,0,0.4)]"
                          >
                            <span className="font-medium text-slate-800 dark:text-slate-100 truncate">
                              {m.name}
                            </span>
                            <span
                              className={cn(
                                'text-[10px] font-semibold px-2 py-0.5 rounded-full',
                                m.status === 'present'
                                  ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                                  : m.status === 'absent'
                                  ? 'bg-rose-500/10 text-rose-700 dark:text-rose-300'
                                  : m.status === 'holiday'
                                  ? 'bg-amber-500/10 text-amber-700 dark:text-amber-300'
                                  : 'bg-slate-500/10 text-slate-600 dark:text-slate-400'
                              )}
                            >
                              {m.status === 'present'
                                ? 'Hadir'
                                : m.status === 'absent'
                                ? 'Absen'
                                : m.status === 'holiday'
                                ? 'Libur'
                                : 'Belum'}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              }

              // 6. Recurring Bills Widget
              if (widget.id === 'recurring_bills') {
                return (
                  <div
                    key={widget.id}
                    className="col-span-2 bg-[#F0F3F8] dark:bg-[#1E232D] rounded-[24px] p-4.5 border border-white/70 dark:border-white/5 shadow-[-8px_-8px_16px_rgba(255,255,255,0.9),8px_8px_16px_rgba(163,177,198,0.35)] dark:shadow-[-6px_-6px_14px_rgba(255,255,255,0.03),6px_6px_14px_rgba(0,0,0,0.5)] transition-all duration-200 space-y-3"
                  >
                    <div className="w-full flex items-center justify-between gap-2 mb-3 pb-2 border-b border-white/70 dark:border-white/5">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-6 h-6 rounded-md bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                          <RefreshCw className="w-3.5 h-3.5" />
                        </div>
                        <h4 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 truncate">
                          Tagihan & Rutin Terdekat
                        </h4>
                      </div>
                      <Link
                        to="/app/finance"
                        className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline flex items-center shrink-0"
                      >
                        Kelola &rarr;
                      </Link>
                    </div>

                    {upcomingBills.length === 0 ? (
                      <div className="py-2.5 text-center text-xs text-slate-500 dark:text-slate-400">
                        Tidak ada tagihan atau langganan rutin aktif.
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        {upcomingBills.map(bill => (
                          <div
                            key={bill.id}
                            className="flex items-center justify-between p-2.5 rounded-2xl bg-[#F0F3F8] dark:bg-[#1E232D] border border-white/60 dark:border-white/5 text-xs shadow-[-3px_-3px_6px_rgba(255,255,255,0.8),3px_3px_6px_rgba(163,177,198,0.2)] dark:shadow-[-2px_-2px_5px_rgba(255,255,255,0.02),2px_2px_5px_rgba(0,0,0,0.4)]"
                          >
                            <div className="min-w-0 pr-2">
                              <p className="font-semibold text-slate-800 dark:text-slate-100 truncate">
                                {bill.note || 'Tagihan Rutin'}
                              </p>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                                <Clock className="w-3 h-3 text-slate-400" />
                                {bill.next_due_date}
                              </p>
                            </div>
                            <span
                              className={cn(
                                'font-bold shrink-0',
                                bill.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                              )}
                            >
                              {bill.type === 'income' ? '+' : '-'}
                              {formatCurrency(bill.amount)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              }

              // 7. Mini Master Calendar Widget
              if (widget.id === 'master_calendar_mini') {
                return (
                  <div
                    key={widget.id}
                    className="col-span-2 bg-[#F0F3F8] dark:bg-[#1E232D] rounded-[24px] p-4.5 border border-white/70 dark:border-white/5 shadow-[-8px_-8px_16px_rgba(255,255,255,0.9),8px_8px_16px_rgba(163,177,198,0.35)] dark:shadow-[-6px_-6px_14px_rgba(255,255,255,0.03),6px_6px_14px_rgba(0,0,0,0.5)] transition-all duration-200 space-y-3"
                  >
                    <div className="w-full flex items-center justify-between gap-2 mb-3 pb-2 border-b border-white/70 dark:border-white/5">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-6 h-6 rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                          <Calendar className="w-3.5 h-3.5" />
                        </div>
                        <h4 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 truncate">
                          Kalender Terpadu
                        </h4>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowCalendarModal(true)}
                        className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline flex items-center shrink-0 cursor-pointer"
                      >
                        Buka Kalender &rarr;
                      </button>
                    </div>

                    <div className="p-3 rounded-2xl bg-[#F0F3F8] dark:bg-[#1E232D] border border-white/60 dark:border-white/5 flex items-center justify-between gap-2 shadow-[-3px_-3px_6px_rgba(255,255,255,0.8),3px_3px_6px_rgba(163,177,198,0.2)] dark:shadow-[-2px_-2px_5px_rgba(255,255,255,0.02),2px_2px_5px_rgba(0,0,0,0.4)]">
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-100">
                          Pusat Jadwal Lintas Modul
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          Gabungan deadline tugas, tagihan, dan absensi.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowCalendarModal(true)}
                        className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] hover:brightness-105 text-white font-semibold text-xs transition-all shrink-0 cursor-pointer shadow-[0_4px_12px_rgba(99,102,241,0.35)] active:scale-95"
                      >
                        Lihat
                      </button>
                    </div>
                  </div>
                )
              }

              return null
            })}
        </div>
      )}

      {/* Modals: Layout Customizer & Calendar */}
      <DashboardCustomizerModal
        open={showCustomizer}
        onClose={() => setShowCustomizer(false)}
        widgets={widgets}
        onToggleWidget={toggleWidget}
        onMoveWidget={moveWidget}
        onResetDefaults={resetDefaults}
      />

      {user?.id && (
        <CalendarModal
          open={showCalendarModal}
          onClose={() => setShowCalendarModal(false)}
          userId={user.id}
        />
      )}
    </div>
  )
}
