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
  SlidersHorizontal,
  CheckSquare,
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

  const canAccessFinance = isAdmin || permissions.finance
  const canAccessAttendance = isAdmin || permissions.attendance
  const canAccessTodo = isAdmin || permissions.todo

  const [activeTab, setActiveTab] = useState<'keuangan' | 'absensi' | 'tugas'>('keuangan')

  useEffect(() => {
    if (!canAccessFinance && canAccessAttendance) {
      setActiveTab('absensi')
    } else if (!canAccessFinance && !canAccessAttendance && canAccessTodo) {
      setActiveTab('tugas')
    }
  }, [canAccessFinance, canAccessAttendance, canAccessTodo])

  const displayName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.username ||
    user?.email?.split('@')[0] ||
    'User'

  const netIncome = (data?.finance?.totalIncome ?? 0) - (data?.finance?.totalExpense ?? 0)
  const netIncomeSign = netIncome >= 0 ? '+' : '-'
  const netIncomeDisplay = `${netIncomeSign}Rp ${formatAmount(Math.abs(netIncome))}`

  const recentTransactions = data?.finance?.recentTransactions || []
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
    <div className="max-w-md mx-auto space-y-4 pb-12">
      {/* Hidden elements for SEO / tests / screen readers */}
      <div className="sr-only">
        {(data?.todo?.overdue ?? 0) > 0 && (
          <div>
            <span>Terlambat</span>
            <span>{data?.todo?.overdue}</span>
          </div>
        )}
      </div>

      {/* Top Header Banner with Date & Customizer Trigger */}
      <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/80 dark:bg-gray-800/80 border border-white/80 dark:border-gray-700/60 shadow-xs backdrop-blur-md">
        <div>
          <p className="text-[11px] font-bold text-gray-500 dark:text-gray-400">
            {formatDate()}
          </p>
          <h3 className="text-sm sm:text-base font-extrabold text-gray-900 dark:text-white">
            {getGreeting()}, <span className="text-indigo-600 dark:text-indigo-400">{displayName}</span> 👋
          </h3>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setShowCalendarModal(true)}
            className="p-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-600 dark:bg-indigo-950/50 dark:hover:bg-indigo-900/60 dark:text-indigo-300 transition-colors shadow-2xs"
            title="Buka Kalender Terpadu"
          >
            <Calendar className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setShowCustomizer(true)}
            className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 dark:bg-gray-700/60 dark:hover:bg-gray-700 dark:text-gray-300 transition-colors shadow-2xs"
            title="Atur Tata Letak Widget Dashboard"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>

      {network === 'offline' && (
        <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-700 dark:text-amber-300 font-medium">
          Offline — perubahan akan disinkronkan saat online.
        </div>
      )}

      {loading ? (
        <div className="space-y-3.5">
          <div className="animate-pulse rounded-[24px] bg-primary-500/20 p-6 space-y-4 h-48" />
          <div className="grid grid-cols-2 gap-3.5">
            <div className="animate-pulse rounded-[22px] bg-white/70 dark:bg-gray-800/70 p-5 h-28" />
            <div className="animate-pulse rounded-[22px] bg-white/70 dark:bg-gray-800/70 p-5 h-28" />
          </div>
          <div className="animate-pulse rounded-[26px] bg-white/70 dark:bg-gray-800/70 p-5 h-56" />
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={refresh} />
      ) : (
        <div className="space-y-4">
          {/* Dynamically Ordered Widgets */}
          {widgets
            .filter(w => w.visible && isWidgetPermitted(w.requiredPermission))
            .map(widget => {
              // 1. Balance Summary Widget
              if (widget.id === 'balance_summary') {
                return (
                  <div key={widget.id}>
                    {canAccessFinance ? (
                      <Link
                        to="/app/finance"
                        className="group block relative overflow-hidden rounded-[24px] bg-gradient-to-tr from-[#3B82F6] via-[#3B7BF2] to-[#5085F8] text-white p-5 sm:p-6 shadow-xl shadow-blue-500/20 hover:shadow-2xl hover:shadow-blue-500/30 hover:-translate-y-1 active:scale-[0.99] transition-all duration-200 animate-fade-in-up cursor-pointer"
                      >
                        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-44 h-44 bg-white/10 rounded-full blur-2xl pointer-events-none group-hover:scale-125 transition-transform duration-500" />
                        <div className="flex items-center justify-between text-white/90">
                          <div className="flex items-center gap-2">
                            <Wallet className="w-5 h-5 text-white stroke-[2.2]" />
                            <span className="text-xs sm:text-sm font-medium tracking-wide">
                              Total Saldo Kas
                            </span>
                          </div>
                          <ChevronRight className="w-4 h-4 text-white/70 group-hover:translate-x-1.5 transition-transform duration-200" />
                        </div>
                        <div className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight">
                          Rp {formatAmount(data.finance.totalBalance)}
                        </div>
                        <div className="mt-1 flex items-center gap-1 text-xs text-blue-100/90 font-medium">
                          <TrendingUp className="w-3.5 h-3.5 text-emerald-300 stroke-[2.5]" />
                          <span>{netIncomeDisplay} bulan ini</span>
                        </div>
                        <div className="mt-5 grid grid-cols-2 gap-4 pt-4 border-t border-white/20">
                          <div>
                            <div className="text-[11px] text-white/75 font-medium">Pemasukan</div>
                            <div className="text-sm sm:text-base font-bold text-[#86EFAC] tracking-tight mt-0.5">
                              +Rp {formatAmount(data.finance.totalIncome)}
                            </div>
                          </div>
                          <div>
                            <div className="text-[11px] text-white/75 font-medium">Pengeluaran</div>
                            <div className="text-sm sm:text-base font-bold text-[#FCA5A5] tracking-tight mt-0.5">
                              -Rp {formatAmount(data.finance.totalExpense)}
                            </div>
                          </div>
                        </div>
                      </Link>
                    ) : (
                      <div className="relative overflow-hidden rounded-[24px] bg-gradient-to-tr from-gray-500/80 to-gray-600/80 text-white p-5 sm:p-6 shadow-md opacity-75">
                        <div className="flex items-center justify-between text-white/90">
                          <div className="flex items-center gap-2">
                            <Lock className="w-5 h-5 text-white" />
                            <span className="text-xs sm:text-sm font-medium tracking-wide">
                              Keuangan (Akses Dibatasi)
                            </span>
                          </div>
                        </div>
                        <div className="mt-2 text-sm text-white/80">
                          Fitur keuangan belum diaktifkan oleh Administrator untuk akun Anda.
                        </div>
                      </div>
                    )}
                  </div>
                )
              }

              // 2. Quick Actions & 2-Col Cards
              if (widget.id === 'quick_actions') {
                return (
                  <div key={widget.id} className="space-y-3.5">
                    <div className="grid grid-cols-2 gap-3.5 animate-fade-in-up animation-delay-100">
                      {/* Absensi Card */}
                      {canAccessAttendance ? (
                        <Link
                          to="/app/attendance"
                          className="rounded-[22px] bg-white/90 dark:bg-gray-800/90 p-4 sm:p-5 shadow-sm hover:shadow-lg hover:-translate-y-1 hover:border-blue-400/50 dark:hover:border-blue-500/50 border border-white/60 dark:border-gray-700/50 backdrop-blur-md transition-all duration-200 active:scale-[0.98] group flex flex-col justify-between cursor-pointer space-y-2"
                        >
                          <div className="flex items-center justify-between text-xs font-bold text-gray-500 dark:text-gray-400">
                            <span>Absensi Hari Ini</span>
                            <ChevronRight className="w-3.5 h-3.5 text-gray-400 group-hover:translate-x-1 group-hover:text-blue-500 transition-all duration-200" />
                          </div>
                          <div>
                            <div className="flex items-baseline gap-1">
                              <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                                {data.attendance.present}
                              </span>
                              <span className="text-xs font-bold text-gray-500 dark:text-gray-400">
                                /{data.attendance.totalMembers}
                              </span>
                              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 ml-0.5">
                                Hadir
                              </span>
                            </div>
                            <div className="text-[11px] font-medium text-gray-500 dark:text-gray-400 mt-1 truncate">
                              {data.attendance.totalMembers === 0
                                ? 'Belum ada anggota'
                                : data.attendance.unrecorded > 0
                                ? `${data.attendance.unrecorded} belum absen`
                                : 'Semua tercatat'}
                            </div>
                          </div>
                        </Link>
                      ) : (
                        <div className="rounded-[22px] bg-gray-100/70 dark:bg-gray-800/40 p-4 sm:p-5 border border-dashed border-gray-300 dark:border-gray-700 flex flex-col justify-between space-y-2 opacity-60">
                          <div className="flex items-center justify-between text-xs font-bold text-gray-400">
                            <span>Absensi</span>
                            <Lock className="w-3.5 h-3.5 text-gray-400" />
                          </div>
                          <div className="text-xs text-gray-400">Akses dibatasi</div>
                        </div>
                      )}

                      {/* To-Do Card */}
                      {canAccessTodo ? (
                        <Link
                          to="/app/todo"
                          className="rounded-[22px] bg-white/90 dark:bg-gray-800/90 p-4 sm:p-5 shadow-sm hover:shadow-lg hover:-translate-y-1 hover:border-blue-400/50 dark:hover:border-blue-500/50 border border-white/60 dark:border-gray-700/50 backdrop-blur-md transition-all duration-200 active:scale-[0.98] group flex flex-col justify-between cursor-pointer space-y-2"
                        >
                          <div className="flex items-center justify-between text-xs font-bold text-gray-500 dark:text-gray-400">
                            <span>To-Do</span>
                            <ChevronRight className="w-3.5 h-3.5 text-gray-400 group-hover:translate-x-1 group-hover:text-blue-500 transition-all duration-200" />
                          </div>
                          <div>
                            <div className="flex items-baseline gap-1">
                              <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                                {data.todo.completed}
                              </span>
                              <span className="text-xs font-bold text-gray-500 dark:text-gray-400">
                                /{data.todo.total}
                              </span>
                              <span className="text-xs font-bold text-[#2563EB] dark:text-blue-400 ml-0.5">
                                Selesai
                              </span>
                            </div>
                            <div className="text-[11px] font-medium text-gray-500 dark:text-gray-400 mt-1 truncate">
                              {data.todo.total === 0
                                ? 'Belum ada tugas'
                                : data.todo.overdue > 0
                                ? `${data.todo.overdue} tugas terlambat`
                                : `${data.todo.todo + data.todo.inProgress} tugas aktif`}
                            </div>
                          </div>
                        </Link>
                      ) : (
                        <div className="rounded-[22px] bg-gray-100/70 dark:bg-gray-800/40 p-4 sm:p-5 border border-dashed border-gray-300 dark:border-gray-700 flex flex-col justify-between space-y-2 opacity-60">
                          <div className="flex items-center justify-between text-xs font-bold text-gray-400">
                            <span>To-Do</span>
                            <Lock className="w-3.5 h-3.5 text-gray-400" />
                          </div>
                          <div className="text-xs text-gray-400">Akses dibatasi</div>
                        </div>
                      )}
                    </div>

                    {/* Segmented Details */}
                    {(canAccessFinance || canAccessAttendance || canAccessTodo) && (
                      <div className="rounded-[26px] bg-white/90 dark:bg-gray-800/90 p-4 sm:p-5 shadow-sm border border-white/60 dark:border-gray-700/50 backdrop-blur-md space-y-3.5 animate-fade-in-up animation-delay-200">
                        <div className="rounded-2xl border border-gray-400/40 dark:border-gray-600 p-1 flex items-center bg-gray-100/60 dark:bg-gray-900/40">
                          {canAccessFinance && (
                            <button
                              type="button"
                              onClick={() => setActiveTab('keuangan')}
                              className={cn(
                                'flex-1 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-150 text-center cursor-pointer',
                                activeTab === 'keuangan'
                                  ? 'bg-white dark:bg-gray-800 shadow-sm text-[#2563EB] dark:text-blue-400'
                                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                              )}
                            >
                              Keuangan
                            </button>
                          )}
                          {canAccessAttendance && (
                            <button
                              type="button"
                              onClick={() => setActiveTab('absensi')}
                              className={cn(
                                'flex-1 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-150 text-center cursor-pointer',
                                activeTab === 'absensi'
                                  ? 'bg-white dark:bg-gray-800 shadow-sm text-[#2563EB] dark:text-blue-400'
                                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                              )}
                            >
                              Absensi
                            </button>
                          )}
                          {canAccessTodo && (
                            <button
                              type="button"
                              onClick={() => setActiveTab('tugas')}
                              className={cn(
                                'flex-1 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-150 text-center cursor-pointer',
                                activeTab === 'tugas'
                                  ? 'bg-white dark:bg-gray-800 shadow-sm text-[#2563EB] dark:text-blue-400'
                                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                              )}
                            >
                              Tugas
                            </button>
                          )}
                        </div>

                        <div className="rounded-2xl border border-gray-400/40 dark:border-gray-600 bg-white/50 dark:bg-gray-900/30 p-4 min-h-[170px] flex flex-col justify-between">
                          {activeTab === 'keuangan' && (
                            <div className="space-y-2.5">
                              <div className="flex items-center justify-between pb-1.5 border-b border-gray-200/60 dark:border-gray-700/60">
                                <span className="text-[11px] font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                  Transaksi Terbaru
                                </span>
                                <span className="text-[10px] text-gray-500 dark:text-gray-400">
                                  {data.finance.walletCount} Dompet Aktif
                                </span>
                              </div>

                              {recentTransactions.length === 0 ? (
                                <div className="text-center py-6 text-xs text-gray-500 dark:text-gray-400">
                                  Belum ada transaksi bulan ini.
                                </div>
                              ) : (
                                <div className="space-y-2">
                                  {recentTransactions.slice(0, 3).map((tx) => (
                                    <div
                                      key={tx.id}
                                      className="flex items-center justify-between text-xs py-1 border-b border-gray-100 dark:border-gray-800/40 last:border-0"
                                    >
                                      <div className="flex items-center gap-2 min-w-0">
                                        <div
                                          className={cn(
                                            'w-7 h-7 rounded-lg flex items-center justify-center shrink-0',
                                            tx.type === 'income'
                                              ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400'
                                              : 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400'
                                          )}
                                        >
                                          {tx.type === 'income' ? '+' : '-'}
                                        </div>
                                        <div className="min-w-0">
                                          <div className="font-semibold text-gray-900 dark:text-gray-100 truncate max-w-[150px]">
                                            {tx.note || (tx.type === 'income' ? 'Pemasukan' : 'Pengeluaran')}
                                          </div>
                                          <div className="text-[10px] text-gray-400">
                                            {tx.transaction_date}
                                          </div>
                                        </div>
                                      </div>
                                      <div
                                        className={cn(
                                          'font-bold',
                                          tx.type === 'income'
                                            ? 'text-emerald-600 dark:text-emerald-400'
                                            : 'text-rose-600 dark:text-rose-400'
                                        )}
                                      >
                                        {tx.type === 'income' ? '+' : '-'}
                                        {formatCurrency(tx.amount)}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}

                              <Link
                                to="/app/finance"
                                className="pt-1 text-xs font-semibold text-[#2563EB] dark:text-blue-400 flex items-center justify-center gap-1 hover:underline cursor-pointer"
                              >
                                Lihat Semua Transaksi <ChevronRight className="w-3.5 h-3.5" />
                              </Link>
                            </div>
                          )}

                          {activeTab === 'absensi' && (
                            <div className="space-y-2.5">
                              <div className="flex items-center justify-between pb-1.5 border-b border-gray-200/60 dark:border-gray-700/60">
                                <span className="text-[11px] font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                  Rekap Presensi
                                </span>
                                <span className="text-[10px] text-gray-500 dark:text-gray-400">
                                  {data.attendance.totalMembers} Anggota
                                </span>
                              </div>

                              <div className="grid grid-cols-4 gap-1.5 text-center py-1">
                                <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/40">
                                  <div className="text-[10px] font-bold text-emerald-600">Hadir</div>
                                  <div className="text-sm font-extrabold text-emerald-700 dark:text-emerald-300">
                                    {data.attendance.present}
                                  </div>
                                </div>
                                <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-100 dark:border-rose-900/40">
                                  <div className="text-[10px] font-bold text-rose-600">Absen</div>
                                  <div className="text-sm font-extrabold text-rose-700 dark:text-rose-300">
                                    {data.attendance.absent}
                                  </div>
                                </div>
                                <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-900/40">
                                  <div className="text-[10px] font-bold text-amber-600">Libur</div>
                                  <div className="text-sm font-extrabold text-amber-700 dark:text-amber-300">
                                    {data.attendance.holiday}
                                  </div>
                                </div>
                                <div className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700">
                                  <div className="text-[10px] font-bold text-gray-600 dark:text-gray-400">Belum</div>
                                  <div className="text-sm font-extrabold text-gray-700 dark:text-gray-300">
                                    {data.attendance.unrecorded}
                                  </div>
                                </div>
                              </div>

                              {memberRoster.length > 0 && (
                                <div className="space-y-1.5 pt-1">
                                  {memberRoster.slice(0, 3).map(m => (
                                    <div
                                      key={m.id}
                                      className="flex items-center justify-between text-xs py-1 px-2 rounded-md bg-white/70 dark:bg-gray-800/60"
                                    >
                                      <span className="font-medium text-gray-800 dark:text-gray-200 truncate">
                                        {m.name}
                                      </span>
                                      <span className="text-[10px] font-bold text-gray-500">
                                        {m.status === 'present' ? 'Hadir' : m.status === 'absent' ? 'Absen' : m.status === 'holiday' ? 'Libur' : 'Belum'}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              )}

                              <Link
                                to="/app/attendance"
                                className="pt-1 text-xs font-semibold text-[#2563EB] dark:text-blue-400 flex items-center justify-center gap-1 hover:underline cursor-pointer"
                              >
                                Buka Lembar & Rekap Absensi <ChevronRight className="w-3.5 h-3.5" />
                              </Link>
                            </div>
                          )}

                          {activeTab === 'tugas' && (
                            <div className="space-y-2.5">
                              <div className="flex items-center justify-between pb-1.5 border-b border-gray-200/60 dark:border-gray-700/60">
                                <span className="text-[11px] font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                  Daftar Tugas Aktif
                                </span>
                                <span className="text-[10px] text-gray-500 dark:text-gray-400">
                                  {data.todo.total} Total
                                </span>
                              </div>

                              {taskList.length === 0 ? (
                                <div className="text-center py-6 text-xs text-gray-500 dark:text-gray-400">
                                  Belum ada tugas aktif.
                                </div>
                              ) : (
                                <div className="space-y-1.5">
                                  {taskList.map((task) => (
                                    <div
                                      key={task.id}
                                      className="flex items-center justify-between text-xs py-1.5 px-2 rounded-lg bg-white/70 dark:bg-gray-800/60 border border-gray-200/40 dark:border-gray-700/40"
                                    >
                                      <div className="flex items-center gap-2 min-w-0">
                                        <CheckSquare className="w-4 h-4 text-primary-500 shrink-0" />
                                        <span className="font-medium text-gray-800 dark:text-gray-200 truncate max-w-[170px]">
                                          {task.title}
                                        </span>
                                      </div>
                                      <span
                                        className={cn(
                                          'text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ml-2',
                                          task.priority === 'high'
                                            ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                                            : task.priority === 'medium'
                                            ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                                            : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
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

                              <Link
                                to="/app/todo"
                                className="pt-1 text-xs font-semibold text-[#2563EB] dark:text-blue-400 flex items-center justify-center gap-1 hover:underline cursor-pointer"
                              >
                                Kelola Semua Tugas To-Do <ChevronRight className="w-3.5 h-3.5" />
                              </Link>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )
              }

              // 3. Habit Streaks Widget
              if (widget.id === 'habit_streaks') {
                return (
                  <div
                    key={widget.id}
                    className="p-4 sm:p-5 rounded-[26px] bg-white/90 dark:bg-gray-800/90 border border-white/80 dark:border-gray-700/50 shadow-sm backdrop-blur-md space-y-3 animate-fade-in-up"
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-gray-800">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400 flex items-center justify-center">
                          <Flame className="w-4 h-4 fill-amber-500 text-amber-500" />
                        </div>
                        <h4 className="text-xs sm:text-sm font-extrabold text-gray-900 dark:text-white">
                          Kebiasaan Hari Ini
                        </h4>
                      </div>
                      <Link
                        to="/app/todo"
                        className="text-xs text-indigo-600 dark:text-indigo-400 font-bold hover:underline cursor-pointer"
                      >
                        Lihat Semua ({habitsHook.totalCompletedToday}/{habitsHook.totalHabits}) &rarr;
                      </Link>
                    </div>

                    {habitsHook.habitsWithStats.length === 0 ? (
                      <div className="py-4 text-center text-xs text-gray-500 dark:text-gray-400">
                        Belum ada kebiasaan harian.{' '}
                        <Link to="/app/todo" className="text-indigo-600 font-bold hover:underline">
                          Tambah sekarang
                        </Link>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {habitsHook.habitsWithStats.slice(0, 3).map(item => (
                          <div
                            key={item.habit.id}
                            className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50/80 dark:bg-gray-900/40 border border-gray-100 dark:border-gray-800/60"
                          >
                            <div className="flex items-center gap-2.5 min-w-0 pr-2">
                              <span className="text-base">{item.habit.icon || '🎯'}</span>
                              <div className="min-w-0">
                                <p className="text-xs font-bold text-gray-900 dark:text-white truncate">
                                  {item.habit.title}
                                </p>
                                <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-0.5">
                                  <Flame className="w-3 h-3 fill-amber-500" /> {item.currentStreak} hari streak
                                </span>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => habitsHook.toggleToday(item.habit.id)}
                              className={cn(
                                'px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer select-none active:scale-95',
                                item.isCompletedToday
                                  ? 'bg-emerald-600 text-white shadow-xs'
                                  : 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300 hover:bg-indigo-100'
                              )}
                            >
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                              <span>{item.isCompletedToday ? 'Selesai' : 'Check-in'}</span>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              }

              // 4. Recurring Bills Widget
              if (widget.id === 'recurring_bills') {
                return (
                  <div
                    key={widget.id}
                    className="p-4 sm:p-5 rounded-[26px] bg-white/90 dark:bg-gray-800/90 border border-white/80 dark:border-gray-700/50 shadow-sm backdrop-blur-md space-y-3 animate-fade-in-up"
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-gray-800">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 flex items-center justify-center">
                          <RefreshCw className="w-4 h-4" />
                        </div>
                        <h4 className="text-xs sm:text-sm font-extrabold text-gray-900 dark:text-white">
                          Tagihan & Rutin Terdekat
                        </h4>
                      </div>
                      <Link
                        to="/app/finance"
                        className="text-xs text-[#2563EB] dark:text-blue-400 font-bold hover:underline cursor-pointer"
                      >
                        Kelola &rarr;
                      </Link>
                    </div>

                    {upcomingBills.length === 0 ? (
                      <div className="py-4 text-center text-xs text-gray-500 dark:text-gray-400">
                        Tidak ada tagihan atau langganan rutin aktif.
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {upcomingBills.map(bill => (
                          <div
                            key={bill.id}
                            className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50/80 dark:bg-gray-900/40 border border-gray-100 dark:border-gray-800/60 text-xs"
                          >
                            <div className="min-w-0 pr-2">
                              <p className="font-bold text-gray-900 dark:text-white truncate">
                                {bill.note || 'Tagihan Rutin'}
                              </p>
                              <p className="text-[11px] text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-0.5">
                                <Clock className="w-3 h-3 text-gray-400" />
                                {bill.next_due_date}
                              </p>
                            </div>
                            <span
                              className={cn(
                                'font-black shrink-0',
                                bill.type === 'income' ? 'text-emerald-600' : 'text-rose-600'
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

              // 5. Mini Master Calendar Widget
              if (widget.id === 'master_calendar_mini') {
                return (
                  <div
                    key={widget.id}
                    className="p-4 sm:p-5 rounded-[26px] bg-white/90 dark:bg-gray-800/90 border border-white/80 dark:border-gray-700/50 shadow-sm backdrop-blur-md space-y-3 animate-fade-in-up"
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-gray-800">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400 flex items-center justify-center">
                          <Calendar className="w-4 h-4" />
                        </div>
                        <h4 className="text-xs sm:text-sm font-extrabold text-gray-900 dark:text-white">
                          Kalender Terpadu
                        </h4>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowCalendarModal(true)}
                        className="text-xs text-indigo-600 dark:text-indigo-400 font-bold hover:underline cursor-pointer"
                      >
                        Buka Kalender &rarr;
                      </button>
                    </div>

                    <div className="p-3 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/30 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-gray-900 dark:text-white">
                          Pusat Jadwal Lintas Modul
                        </p>
                        <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                          Gabungan deadline tugas, tagihan rutin, utang, dan absensi.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowCalendarModal(true)}
                        className="px-3 py-1.5 rounded-xl bg-indigo-600 text-white font-bold text-xs shadow-xs hover:bg-indigo-700 transition-colors shrink-0"
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

      {/* ─── Modals: Layout Customizer & Calendar ─── */}
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
